"""
Cryptographic Action Token Generation and Verification.

Enables secure, no-login status updates for field officers via SMS or email links.
Tokens are signed with HMAC-SHA256 and verified against expiry and tamper attempts.
"""

from __future__ import annotations

import base64
import datetime
import hashlib
import hmac
import json
import logging
from typing import Any, Dict, Optional, Tuple
from django.conf import settings
from civic_connect.mongo import get_collection

logger = logging.getLogger(__name__)


def _get_secret_key() -> bytes:
    key = getattr(settings, "ACTION_TOKEN_SECRET", "civic-action-secret-token-default-2026")
    return key.encode("utf-8")


def generate_action_token(
    report_id: str,
    officer_email: str = "field.officer@civicconnect.gov",
    expiry_days: Optional[int] = None,
) -> str:
    """
    Generate a cryptographically signed, URL-safe action token.
    Saves metadata to MongoDB action_tokens collection for audit and revocation.
    """
    days = expiry_days or getattr(settings, "ACTION_TOKEN_EXPIRY_DAYS", 7)
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=days)

    payload = {
        "report_id": str(report_id),
        "officer_email": officer_email,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "exp_timestamp": int(expires_at.timestamp()),
    }

    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")

    signature = hmac.new(
        _get_secret_key(),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    token_string = f"{payload_b64}.{signature}"

    # Record in database for revocation tracking and TTL index cleanup
    try:
        col = get_collection("action_tokens")
        col.insert_one({
            "token": token_string,
            "report_id": str(report_id),
            "officer_email": officer_email,
            "created_at": now,
            "expires_at": expires_at,
            "is_revoked": False,
            "usage_count": 0,
        })
    except Exception as exc:
        logger.warning(f"Could not persist action token in database: {exc}")

    return token_string


def verify_action_token(token_string: str) -> Tuple[bool, Optional[Dict[str, Any]], str]:
    """
    Verify signature and expiration of an action token.

    Returns:
        Tuple of (is_valid: bool, payload_dict: Optional[dict], error_message: str)
    """
    if not token_string or "." not in token_string:
        return False, None, "Malformed action token format."

    parts = token_string.split(".")
    if len(parts) != 2:
        return False, None, "Invalid action token structure."

    payload_b64, signature = parts[0], parts[1]

    # 1. Verify cryptographic signature
    expected_sig = hmac.new(
        _get_secret_key(),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        return False, None, "Invalid token cryptographic signature."

    # 2. Decode payload
    try:
        # Add back base64 padding
        padding = "=" * (4 - (len(payload_b64) % 4))
        decoded_bytes = base64.urlsafe_b64decode(payload_b64 + padding)
        payload = json.loads(decoded_bytes.decode("utf-8"))
    except Exception as exc:
        return False, None, f"Failed to decode token payload: {exc}"

    # 3. Check expiration
    now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
    exp_ts = payload.get("exp_timestamp", 0)
    if now_ts > exp_ts:
        return False, payload, "Action token has expired."

    # 4. Check revocation in database
    try:
        col = get_collection("action_tokens")
        doc = col.find_one({"token": token_string})
        if doc and doc.get("is_revoked", False):
            return False, payload, "Action token has been revoked."
    except Exception as exc:
        logger.warning(f"Database error while checking token status: {exc}")

    return True, payload, ""


def record_token_usage(token_string: str) -> None:
    """Increment token usage counter for auditing."""
    try:
        col = get_collection("action_tokens")
        col.update_one(
            {"token": token_string},
            {
                "$inc": {"usage_count": 1},
                "$set": {"last_used_at": datetime.datetime.now(datetime.timezone.utc)},
            },
        )
    except Exception as exc:
        logger.warning(f"Failed to record token usage: {exc}")

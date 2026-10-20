"""
Cryptographic JWT Authentication and Role-Based Permissions for Civic Connect.

Provides:
- HMAC-SHA256 signed JWT generation and validation using Django SECRET_KEY.
- DRF JWTBearerAuthentication class to authenticate requests via Authorization: Bearer <token>.
- Role-based permissions: IsOfficerOrAdmin, IsAuthenticatedCivicUser.
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
from rest_framework import permissions
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import UserManager

logger = logging.getLogger(__name__)

JWT_DEFAULT_EXPIRY_DAYS = 30


def _get_signing_key() -> bytes:
    key = getattr(settings, "SECRET_KEY", "civic-connect-super-secret-key-change-in-production-2026")
    return key.encode("utf-8")


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def generate_jwt(user_payload: Dict[str, Any], expiry_days: int = JWT_DEFAULT_EXPIRY_DAYS) -> str:
    """
    Generate an HMAC-SHA256 signed JWT token for an authenticated user.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=expiry_days)

    header = {
        "alg": "HS256",
        "typ": "JWT",
    }
    payload = {
        "user_id": str(user_payload.get("user_id") or user_payload.get("id")),
        "phone": str(user_payload.get("phone", "")),
        "name": user_payload.get("name", "Citizen"),
        "role": user_payload.get("role", "citizen").lower(),
        "department": user_payload.get("department"),
        "designation": user_payload.get("designation"),
        "employee_id": user_payload.get("employee_id"),
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")

    signature = hmac.new(_get_signing_key(), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_jwt(token: str) -> Tuple[bool, Optional[Dict[str, Any]], str]:
    """
    Verify signature and expiration of an HMAC-SHA256 JWT.

    Returns:
        (is_valid, payload_dict, error_message)
    """
    if not token or "." not in token:
        return False, None, "Malformed token format."

    parts = token.split(".")
    if len(parts) != 3:
        return False, None, "Invalid token structure."

    header_b64, payload_b64, sig_b64 = parts[0], parts[1], parts[2]

    # Verify signature
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(_get_signing_key(), signing_input, hashlib.sha256).digest()
    expected_sig_b64 = _b64url_encode(expected_sig)

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        return False, None, "Invalid token signature."

    # Parse payload
    try:
        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return False, None, "Could not decode token payload."

    # Check expiration
    exp = payload.get("exp")
    if exp:
        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        if now_ts > exp:
            return False, None, "Token has expired."

    return True, payload, ""


class CivicUserPrincipal:
    """Represents an authenticated civic user principal in Django request context."""

    def __init__(self, payload: Dict[str, Any]):
        self.user_id = payload.get("user_id")
        self.phone = payload.get("phone", "")
        self.name = payload.get("name", "Citizen")
        self.role = payload.get("role", "citizen").lower()
        self.department = payload.get("department")
        self.designation = payload.get("designation")
        self.employee_id = payload.get("employee_id")
        self.is_authenticated = True
        self.is_anonymous = False

    @property
    def is_officer(self) -> bool:
        return self.role in ("officer", "admin")

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    def __str__(self) -> str:
        return f"CivicUser({self.user_id}, role={self.role})"


class JWTBearerAuthentication(BaseAuthentication):
    """
    DRF Authentication class that parses 'Authorization: Bearer <token>'.
    Validates cryptographic signature and sets request.user to CivicUserPrincipal.
    """

    def authenticate(self, request) -> Optional[Tuple[CivicUserPrincipal, Dict[str, Any]]]:
        auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        raw_token = parts[1].strip()
        is_valid, payload, err = verify_jwt(raw_token)
        if not is_valid or not payload:
            raise AuthenticationFailed(f"Invalid authentication token: {err}")

        user = CivicUserPrincipal(payload)
        return (user, payload)

    def authenticate_header(self, request) -> str:
        return "Bearer"


class IsOfficerOrAdmin(permissions.BasePermission):
    """
    Permission check: Request must be authenticated and have role 'officer' or 'admin'.
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return getattr(user, "role", "") in ("officer", "admin")


class IsAuthenticatedCivicUser(permissions.BasePermission):
    """
    Permission check: Request must have a valid authenticated user.
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_authenticated", False))

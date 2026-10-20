"""
OTP Service with 60-Second Rate Limiter & Verification.
Prevents duplicate users, abuse, and spam.
"""

from __future__ import annotations

import datetime
import hashlib
import random
import secrets
from typing import Any, Dict, Optional, Tuple
from civic_connect.mongo import get_collection


COOLDOWN_SECONDS = 60
EXPIRY_MINUTES = 5
MAX_ATTEMPTS = 3


def hash_otp(phone: str, otp: str, salt: str) -> str:
    """Hash OTP with phone and salt using SHA-256."""
    payload = f"{phone}:{otp}:{salt}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


class OTPManager:
    """Manages OTP generation, 60-second rate-limiting, and verification in MongoDB."""

    @staticmethod
    def get_collection():
        return get_collection("otp_requests")

    @classmethod
    def request_otp(
        cls,
        phone: str,
        role: str = "citizen",
        ip_address: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[int], Optional[str]]:
        """
        Request a 6-digit OTP for a phone number.
        Enforces a strict 60-second cooldown rate-limiter.

        Returns:
            (success, error_message, retry_after_seconds, dev_plain_otp)
        """
        phone = phone.strip()
        now = datetime.datetime.now(datetime.timezone.utc)
        col = cls.get_collection()

        # Check existing active OTP request for rate limiting
        existing = col.find_one({"phone": phone})
        if existing:
            resend_available_at = existing.get("resend_available_at")
            if resend_available_at:
                if resend_available_at.tzinfo is None:
                    resend_available_at = resend_available_at.replace(tzinfo=datetime.timezone.utc)
                if now < resend_available_at:
                    remaining_seconds = int((resend_available_at - now).total_seconds()) + 1
                    return (
                        False,
                        f"Please wait {remaining_seconds}s before requesting a new OTP.",
                        remaining_seconds,
                        None,
                    )

        # Generate cryptographically secure 6-digit OTP
        plain_otp = f"{secrets.randbelow(900000) + 100000}"
        salt = secrets.token_hex(16)
        otp_hash = hash_otp(phone, plain_otp, salt)

        expires_at = now + datetime.timedelta(minutes=EXPIRY_MINUTES)
        resend_available_at = now + datetime.timedelta(seconds=COOLDOWN_SECONDS)

        otp_doc = {
            "phone": phone,
            "otp_hash": otp_hash,
            "salt": salt,
            "role": role,
            "attempts": 0,
            "created_at": now,
            "expires_at": expires_at,
            "resend_available_at": resend_available_at,
            "ip_address": ip_address,
        }

        col.update_one({"phone": phone}, {"$set": otp_doc}, upsert=True)

        return True, None, COOLDOWN_SECONDS, plain_otp

    @classmethod
    def verify_otp(cls, phone: str, otp_code: str) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Verify the submitted 6-digit OTP.

        Returns:
            (is_valid, error_message, otp_record)
        """
        phone = phone.strip()
        otp_code = otp_code.strip()
        now = datetime.datetime.now(datetime.timezone.utc)
        col = cls.get_collection()

        record = col.find_one({"phone": phone})
        if not record:
            return False, "No active OTP request found. Please request an OTP first.", None

        expires_at = record.get("expires_at")
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
            if now > expires_at:
                col.delete_one({"_id": record["_id"]})
                return False, "OTP has expired. Please request a new code.", None

        attempts = record.get("attempts", 0)
        if attempts >= MAX_ATTEMPTS:
            col.delete_one({"_id": record["_id"]})
            return False, "Maximum verification attempts exceeded. Please request a new OTP.", None

        # Verify hash
        salt = record.get("salt", "")
        expected_hash = record.get("otp_hash", "")
        computed_hash = hash_otp(phone, otp_code, salt)

        if computed_hash != expected_hash:
            col.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
            remaining = MAX_ATTEMPTS - (attempts + 1)
            return False, f"Incorrect OTP code. {remaining} attempt(s) remaining.", None

        # Success - delete used OTP request to prevent replay attacks
        col.delete_one({"_id": record["_id"]})
        return True, None, record

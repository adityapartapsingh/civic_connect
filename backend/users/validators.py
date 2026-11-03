"""
Input validation utilities for Civic Connect.
Validates Indian mobile phone numbers and password complexity.
"""

from __future__ import annotations

import re
from typing import Optional, Tuple
from rest_framework import serializers

INDIAN_PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")
COMMON_WEAK_PASSWORDS = {
    "123456",
    "password",
    "12345678",
    "qwerty",
    "123456789",
    "12345",
    "1234",
    "admin123",
    "password123",
}


def normalize_phone_number(raw_phone: Optional[str]) -> str:
    """
    Standardize mobile phone numbers to a consistent 10-digit format for India.
    Removes whitespace, dashes, parens, country code (+91 / 91 prefix), and leading 0.
    """
    if not raw_phone:
        return ""
    phone_str = str(raw_phone).strip()
    digits = re.sub(r"\D", "", phone_str)

    # Strip country code 91 if followed by 10 digits
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    # Strip leading 0 if 11 digits
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    return digits


def validate_indian_phone(value: Optional[str]) -> str:
    """
    Validate that the phone number is a valid 10-digit Indian mobile number
    starting with 6, 7, 8, or 9.
    Raises serializers.ValidationError if invalid. Returns normalized 10-digit string.
    """
    if not value:
        raise serializers.ValidationError("Phone number is required.")

    cleaned = normalize_phone_number(str(value))
    if not cleaned or not INDIAN_PHONE_REGEX.match(cleaned):
        raise serializers.ValidationError(
            "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
        )

    return cleaned


def is_valid_indian_phone(value: Optional[str]) -> bool:
    """Return True if the given value is a valid Indian mobile number."""
    if not value:
        return False
    cleaned = normalize_phone_number(str(value))
    return bool(cleaned and INDIAN_PHONE_REGEX.match(cleaned))


def validate_password_strength(password: Optional[str]) -> str:
    """
    Validate password strength:
    - Minimum 6 characters (recommended for municipal/citizen access)
    - At least one letter (a-z, A-Z)
    - At least one numeric digit (0-9)
    - Not in known common weak passwords list
    Raises serializers.ValidationError if requirements not met.
    """
    if not password:
        raise serializers.ValidationError("Password cannot be blank.")

    pwd = str(password).strip()

    if len(pwd) < 6:
        raise serializers.ValidationError("Password must be at least 6 characters long.")

    if pwd.lower() in COMMON_WEAK_PASSWORDS:
        raise serializers.ValidationError("This password is too common. Please choose a more secure password.")

    has_letter = bool(re.search(r"[a-zA-Z]", pwd))
    has_digit = bool(re.search(r"\d", pwd))

    if not has_letter or not has_digit:
        raise serializers.ValidationError(
            "Password must contain both letters and at least one numeric digit."
        )

    return pwd


def check_password_strength(password: Optional[str]) -> Tuple[bool, str]:
    """
    Check password strength and return (is_valid, error_message).
    """
    try:
        validate_password_strength(password)
        return True, ""
    except serializers.ValidationError as err:
        return False, str(err.detail[0]) if err.detail else "Invalid password."

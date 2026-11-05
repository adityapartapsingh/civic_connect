import logging
import os
import requests
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

WHATSAPP_GATEWAY_URL = os.getenv("WHATSAPP_GATEWAY_URL", "http://127.0.0.1:5005/send-otp")
WHATSAPP_GATEWAY_TIMEOUT = float(os.getenv("WHATSAPP_GATEWAY_TIMEOUT", "4.0"))


def get_whatsapp_gateway_base_url() -> str:
    """
    Derives the base URL of the independent WhatsApp Gateway microservice.
    Examples:
      - 'http://127.0.0.1:5005/send-otp' -> 'http://127.0.0.1:5005'
      - 'https://my-gateway.onrender.com/send-otp' -> 'https://my-gateway.onrender.com'
    """
    raw = os.getenv("WHATSAPP_GATEWAY_URL", "http://127.0.0.1:5005/send-otp").strip()
    if raw.endswith("/send-otp"):
        return raw[:-len("/send-otp")].rstrip("/")
    return raw.rstrip("/")


def clean_indian_phone(phone: str) -> str:
    """Normalizes Indian phone numbers to 12 digits (91XXXXXXXXXX)."""
    digits = "".join(filter(str.isdigit, str(phone)))
    if len(digits) == 10:
        return f"91{digits}"
    elif digits.startswith("0") and len(digits) == 11:
        return f"91{digits[1:]}"
    return digits


def send_whatsapp_otp(phone: str, otp: str, name: str = "Citizen") -> bool:
    """
    Dispatches a 100% free one-time verification passcode to the user's WhatsApp
    via the independent hosted Baileys WhatsApp Gateway.

    Gracefully fails open: If gateway is offline or unpaired, returns False
    so the backend falls back to dev/SMS on-screen code without blocking the user.
    """
    if not phone or not otp:
        return False

    clean_phone = clean_indian_phone(phone)
    base_url = get_whatsapp_gateway_base_url()
    endpoint = f"{base_url}/send-otp"

    payload = {
        "phone": clean_phone,
        "otp": str(otp).strip(),
        "name": str(name).strip() if name else "Citizen",
        "app_name": "Civic Connect",
    }

    try:
        response = requests.post(
            endpoint,
            json=payload,
            timeout=WHATSAPP_GATEWAY_TIMEOUT,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                logger.info(f"[WhatsApp Gateway] Successfully delivered OTP to +{clean_phone}")
                return True

        logger.warning(
            f"[WhatsApp Gateway] Failed to deliver OTP (HTTP {response.status_code}): {response.text}"
        )
        return False
    except requests.exceptions.RequestException as exc:
        logger.info(
            f"[WhatsApp Gateway] Gateway offline or not responding ({str(exc)}). Continuing with fallback."
        )
        return False


def send_whatsapp_message(phone: str, message: str) -> bool:
    """
    Dispatches an arbitrary WhatsApp notification or ticket alert
    via the independent hosted Baileys WhatsApp Gateway.
    """
    if not phone or not message:
        return False

    clean_phone = clean_indian_phone(phone)
    base_url = get_whatsapp_gateway_base_url()
    endpoint = f"{base_url}/send-message"

    payload = {
        "phone": clean_phone,
        "message": str(message).strip(),
    }

    try:
        response = requests.post(
            endpoint,
            json=payload,
            timeout=WHATSAPP_GATEWAY_TIMEOUT,
            headers={"Content-Type": "application/json"},
        )
        return response.status_code == 200 and response.json().get("success", False)
    except requests.exceptions.RequestException as exc:
        logger.warning(f"[WhatsApp Gateway] Message dispatch failed: {exc}")
        return False


def get_whatsapp_gateway_status() -> Dict[str, Any]:
    """Queries the health and pairing status of the WhatsApp Gateway."""
    base_url = get_whatsapp_gateway_base_url()
    endpoint = f"{base_url}/status"

    try:
        res = requests.get(endpoint, timeout=3.0)
        if res.status_code == 200:
            data = res.json()
            return {
                "gateway_online": True,
                "connected": data.get("connected", False),
                "phone": data.get("phone"),
                "status": data.get("status", "unknown"),
                "has_qr": data.get("has_qr", False),
                "qr_image": data.get("qr_image"),
                "qr_url": f"{base_url}/qr",
                "base_url": base_url,
            }
    except requests.exceptions.RequestException:
        pass

    return {
        "gateway_online": False,
        "connected": False,
        "phone": None,
        "status": "gateway_offline",
        "has_qr": False,
        "qr_image": None,
        "qr_url": f"{base_url}/qr",
        "base_url": base_url,
        "message": f"WhatsApp Gateway at {base_url} is unreachable. Ensure the microservice is deployed and online.",
    }


def reset_whatsapp_gateway_session() -> Tuple[bool, Dict[str, Any]]:
    """Requests a session reset from the independent WhatsApp Gateway."""
    base_url = get_whatsapp_gateway_base_url()
    endpoint = f"{base_url}/reset"

    try:
        res = requests.post(endpoint, timeout=5.0)
        if res.status_code == 200:
            return True, res.json()
        return False, {"detail": f"Gateway returned HTTP {res.status_code}: {res.text}"}
    except requests.exceptions.RequestException as exc:
        return False, {"detail": f"Failed to reach WhatsApp Gateway at {base_url}: {str(exc)}"}

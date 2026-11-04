import logging
import requests
import os

logger = logging.getLogger(__name__)

WHATSAPP_GATEWAY_URL = os.getenv("WHATSAPP_GATEWAY_URL", "http://127.0.0.1:5005/send-otp")
WHATSAPP_GATEWAY_TIMEOUT = float(os.getenv("WHATSAPP_GATEWAY_TIMEOUT", "3.0"))


def send_whatsapp_otp(phone: str, otp: str, name: str = "Citizen") -> bool:
    """
    Dispatches a 100% free one-time verification passcode to the user's WhatsApp
    via the local self-hosted Baileys WhatsApp Gateway.

    Gracefully fails open: If gateway is offline or unpaired, returns False
    so the backend falls back to dev/SMS on-screen code without blocking the user.
    """
    if not phone or not otp:
        return False

    # Clean phone number
    clean_phone = "".join(filter(str.isdigit, str(phone)))
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"

    payload = {
        "phone": clean_phone,
        "otp": str(otp).strip(),
        "name": str(name).strip() if name else "Citizen",
    }

    try:
        response = requests.post(
            WHATSAPP_GATEWAY_URL,
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
            f"[WhatsApp Gateway] Local gateway offline or not responding ({str(exc)}). Continuing with fallback."
        )
        return False

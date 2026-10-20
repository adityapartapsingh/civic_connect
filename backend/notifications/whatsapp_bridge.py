"""
WhatsApp Protocol / Socket Bridge Service.
Bypasses paid Meta Cloud API by providing an automated socket bridge client
(compatible with Baileys, whatsapp-web.js, or local HTTP bridge gateways).
"""

from __future__ import annotations

import logging
import os
import requests
from typing import Any, Dict, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

# Modes: 'bridge' (custom automated socket bridge), 'meta' (official cloud api), 'console' (local log)
DISPATCH_MODE = os.environ.get("WHATSAPP_DISPATCH_MODE", "bridge")
BRIDGE_URL = os.environ.get("WHATSAPP_BRIDGE_WEBHOOK_URL", "http://localhost:3001/api/send-message")
BRIDGE_API_KEY = os.environ.get("WHATSAPP_BRIDGE_API_KEY", "local-civic-bridge-key")


class WhatsAppBridge:
    """Dispatches WhatsApp notifications via automated socket bridge without official per-message fees."""

    @classmethod
    def format_officer_ticket_notification(cls, ticket_id: str, title: str, ward: str, priority: str, token_url: str) -> str:
        return (
            f"*CIVIC CONNECT DISPATCH*\n\n"
            f"New Urgent Report: *{ticket_id}*\n"
            f"Title: {title}\n"
            f"Ward: {ward}\n"
            f"Priority: {priority}\n\n"
            f"Update ticket status without login:\n"
            f"{token_url}"
        )

    @classmethod
    def send_message(cls, recipient_phone: str, message_text: str) -> Dict[str, Any]:
        """
        Send text message to a WhatsApp number.
        Uses automated socket bridge gateway or local console fallback.
        """
        phone = recipient_phone.replace("+", "").replace("-", "").replace(" ", "").strip()
        if not phone.endswith("@s.whatsapp.net") and not phone.endswith("@c.us"):
            # Format to WhatsApp JID format
            recipient_jid = f"{phone}@c.us"
        else:
            recipient_jid = phone

        payload = {
            "to": recipient_jid,
            "phone": phone,
            "message": message_text,
        }

        # If in console or mock mode
        if DISPATCH_MODE == "console" or getattr(settings, "DEBUG", False) and not os.environ.get("WHATSAPP_BRIDGE_WEBHOOK_URL"):
            logger.info(f"[WHATSAPP BRIDGE SIMULATOR] Dispatching to {phone}:\n{message_text}")
            return {
                "success": True,
                "status": "simulated",
                "phone": phone,
                "mode": "console",
            }

        # Dispatch via socket bridge gateway
        try:
            headers = {
                "Authorization": f"Bearer {BRIDGE_API_KEY}",
                "Content-Type": "application/json",
            }
            res = requests.post(BRIDGE_URL, json=payload, headers=headers, timeout=5)
            if res.status_code in (200, 201, 202):
                return {"success": True, "status": "dispatched", "response": res.json()}
            else:
                logger.warning(f"WhatsApp bridge returned status {res.status_code}: {res.text}")
                return {"success": False, "status": "bridge_error", "code": res.status_code}
        except Exception as exc:
            logger.warning(f"Failed to connect to WhatsApp socket bridge: {exc}")
            # Non-blocking fallback
            return {"success": False, "status": "bridge_offline", "error": str(exc)}

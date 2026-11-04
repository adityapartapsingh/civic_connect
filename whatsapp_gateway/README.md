# Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway

A 100% free, self-hosted WhatsApp OTP Gateway built on top of **Baileys** (direct WhatsApp Web WebSocket protocol). It requires **zero third-party API fees**, **no Twilio/Meta charges**, and **no Chromium/Puppeteer**.

---

## Quick Start (How to Run)

### 1. Start the Gateway
From the project root:
```bash
cd whatsapp_gateway
npm start
```
The gateway will start on **port 5005**.

### 2. Pair with Your WhatsApp Number (One-Time Setup)
You can link any spare or official WhatsApp number:
1. Open **[http://localhost:5005/qr](http://localhost:5005/qr)** in your browser (or look at your terminal).
2. On your phone: Open **WhatsApp** > **Settings** (or 3 dots ⋮) > **Linked Devices** > **Link a Device**.
3. Scan the QR code on your screen.

Once linked:
- The session is saved locally in `whatsapp_gateway/auth_session/`.
- You **do not need to re-scan** the QR code every time you restart.

---

## API Reference

### Health / Status Check
```http
GET http://localhost:5005/status
```
Response:
```json
{
  "status": "connected",
  "connected": true,
  "phone": "919876543210@s.whatsapp.net"
}
```

### Send OTP
```http
POST http://localhost:5005/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "492015",
  "name": "Aman Singh"
}
```

Message delivered to user:
```text
🏛️ *CIVIC CONNECT — MUNICIPAL VERIFICATION*

Hello *Aman Singh*,

Your one-time login verification code is:
👉 *492015*

⏱️ Valid for 10 minutes.
🔒 Do not share this code with anyone.

_Municipal Corporation Citizen Services_
```

---

## Django Backend Integration
Civic Connect's Django backend ([`backend/users/whatsapp.py`](file:///d:/Project/civic%20connect/backend/users/whatsapp.py)) automatically sends OTPs via this gateway whenever a citizen requests a login/registration OTP.

If the gateway is offline or not yet paired, the backend gracefully falls back to the on-screen developer code (`dev_otp`) without disrupting the citizen.

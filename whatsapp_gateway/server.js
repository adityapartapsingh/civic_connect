import express from 'express';
import cors from 'cors';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5005;
const AUTH_DIR = path.join(__dirname, 'auth_session');

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());

let sock = null;
let qrCodeData = null;
let qrCodeDataUrl = null;
let isConnected = false;
let connectedUser = null;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Civic Connect', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeData = qr;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('Failed to generate QR data URL:', err);
      }

      console.log('\n======================================================');
      console.log('📲 SCAN THIS QR CODE WITH WHATSAPP TO ACTIVATE FREE OTP');
      console.log('   Open WhatsApp > Linked Devices > Link a Device');
      console.log(`   Or open http://localhost:${PORT}/qr in your browser`);
      console.log('======================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      isConnected = false;
      connectedUser = null;
      console.log(`⚠️ WhatsApp connection closed (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('🚪 Logged out from WhatsApp. Resetting session...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      setTimeout(startWhatsApp, 3000);
    } else if (connection === 'open') {
      isConnected = true;
      qrCodeData = null;
      qrCodeDataUrl = null;
      connectedUser = sock.user?.id || 'Connected User';
      console.log('\n======================================================');
      console.log('✅ WHATSAPP GATEWAY CONNECTED SUCCESSFULLY!');
      console.log(`   Phone JID: ${connectedUser}`);
      console.log(`   Civic Connect can now dispatch 100% free OTPs!`);
      console.log('======================================================\n');
    }
  });
}

// -------------------------------------------------------------
// HTTP API ENDPOINTS
// -------------------------------------------------------------

// 1. Health & Connection Status
app.get('/status', (req, res) => {
  res.json({
    status: isConnected ? 'connected' : 'waiting_for_qr',
    connected: isConnected,
    phone: connectedUser,
    has_qr: Boolean(qrCodeData),
    qr_url: isConnected ? null : `http://localhost:${PORT}/qr`,
  });
});

// 2. Interactive Browser QR Page for Easy Scanning
app.get('/qr', (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Civic Connect — WhatsApp Gateway Active</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; text-align: center; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid #334155; }
            .badge { background: #10b981; color: white; font-weight: bold; font-size: 12px; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
            h2 { margin-top: 1rem; margin-bottom: 0.5rem; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Connected & Active</span>
            <h2>WhatsApp Gateway Online</h2>
            <p>Civic Connect is paired with WhatsApp (<strong>${connectedUser}</strong>). All OTP requests are dispatched automatically for free.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!qrCodeDataUrl) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Civic Connect — Initializing</title>
          <meta http-equiv="refresh" content="2">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; text-align: center; max-width: 380px; }
            p { color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Initializing Gateway...</h2>
            <p>Generating new WhatsApp pairing QR code. Please wait a moment...</p>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Scan WhatsApp QR — Civic Connect Gateway</title>
        <meta http-equiv="refresh" content="10">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
          .card { background: white; padding: 2rem; border-radius: 10px; text-align: center; max-width: 420px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          h2 { margin-top: 0; font-size: 20px; font-weight: 700; }
          p { color: #475569; font-size: 13px; line-height: 1.5; margin-bottom: 1.5rem; }
          .qr-box { background: #f1f5f9; padding: 1rem; border-radius: 8px; display: inline-block; border: 1px solid #cbd5e1; }
          .qr-img { width: 260px; height: 260px; display: block; }
          .steps { text-align: left; background: #f8fafc; padding: 1rem; border-radius: 6px; margin-top: 1.5rem; font-size: 12px; color: #334155; border: 1px solid #e2e8f0; }
          .steps ol { margin: 0; padding-left: 1.2rem; }
          .steps li { margin-bottom: 4px; }
          .footer { margin-top: 1rem; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Pair WhatsApp for Free OTPs</h2>
          <p>Scan this QR code using WhatsApp on your mobile phone to enable instant OTP delivery.</p>
          <div class="qr-box">
            <img src="${qrCodeDataUrl}" alt="WhatsApp QR Code" class="qr-img" />
          </div>
          <div class="steps">
            <strong>How to link:</strong>
            <ol>
              <li>Open <strong>WhatsApp</strong> on your phone</li>
              <li>Tap <strong>Settings</strong> or <strong>Menu (⋮)</strong> &gt; <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong> and point your camera here</li>
            </ol>
          </div>
          <div class="footer">Page auto-refreshes every 10 seconds.</div>
        </div>
      </body>
    </html>
  `);
});

// 3. Dispatch OTP via WhatsApp
app.post('/send-otp', async (req, res) => {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PARAMETERS',
      message: 'Both "phone" and "otp" parameters are required.',
    });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      success: false,
      error: 'WHATSAPP_NOT_CONNECTED',
      message: 'WhatsApp gateway is not connected. Scan QR at /qr to link device.',
      qr_url: `http://localhost:${PORT}/qr`,
    });
  }

  try {
    // Standardize Indian phone number to 12 digits (91XXXXXXXXXX)
    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = `91${cleanPhone.slice(1)}`;
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;

    const messageText = 
`🏛️ *CIVIC CONNECT — MUNICIPAL VERIFICATION*

Hello *${name ? name.trim() : 'Citizen'}*,

Your one-time login verification code is:
👉 *${otp}*

⏱️ Valid for 10 minutes.
🔒 Do not share this code with anyone.

_Municipal Corporation Citizen Services_`;

    const result = await sock.sendMessage(jid, { text: messageText });

    console.log(`[WhatsApp Gateway] Successfully delivered OTP ${otp} to +${cleanPhone}`);

    return res.json({
      success: true,
      message: `OTP delivered to WhatsApp (+${cleanPhone})`,
      message_id: result?.key?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[WhatsApp Gateway] Delivery failed:', err);
    return res.status(500).json({
      success: false,
      error: 'DELIVERY_FAILED',
      message: err.message || 'Failed to dispatch WhatsApp message.',
    });
  }
});

// Start the server and WhatsApp connection
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Civic Connect WhatsApp Gateway listening on port ${PORT}`);
  console.log(`   Status: http://localhost:${PORT}/status`);
  console.log(`   QR Code UI: http://localhost:${PORT}/qr`);
  console.log(`======================================================\n`);
  startWhatsApp().catch((err) => console.error('Failed to start WhatsApp socket:', err));
});

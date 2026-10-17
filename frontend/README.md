# Civic Connect — Frontend PWA

Hyperlocal civic issue reporting progressive web application (PWA) built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Leaflet**.

## Key Architecture & Features

### 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`)
- Direct streaming from `navigator.mediaDevices.getUserMedia` into an HTML5 `<video>` element.
- Canvas capture for still photos with auto-stamped verification metadata.
- Continuous 3-second pan video recording via `MediaRecorder` API for spatial evidence.
- Zero `<input type="file">` elements to prevent gallery uploads and ensure live on-site integrity.

### 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`)
- Takes multiple GPS readings over time to compute jitter variance.
- Detects spoofed/simulated GPS coordinates.
- Reverse geocodes coordinates to street address and municipal ward using OpenStreetMap.

### 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`)
- Calculates Haversine distance from citizen's GPS coordinates.
- Warns users of nearby open reports prior to submission.
- Offers an *"I See This Too (+5 pts)"* upvote button to boost municipal priority without creating redundant tickets.

### 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`)
- Interactive Leaflet map with custom SVG status pins color-coded by municipal status:
  - 🔴 **Reported** (Open)
  - 🟣 **Acknowledged** (Assigned)
  - 🟡 **In Progress** (Field crew on-site)
  - 🟢 **Resolved** (Repairs finished)
  - 🟠 **Disputed** (Contested by citizen)
- Dynamic Hotspot Density cluster toggle.

### 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`)
- Color-coded SLA countdown badge on every ticket:
  - 🚨 **SLA Breached** (Pulsating red alert)
  - ⚠️ **Critical** (< 4 hours remaining)
  - 🕒 **Standard** (< 24 hours remaining)
  - ✅ **Met SLA on time**

### 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`)
- Side-by-side comparison of **Before** vs **After** photo proof.
- **Yes, Fixed! (+20 pts)**: Marks ticket closed and triggers celebratory confetti.
- **No, Still Broken (Dispute)**: Flags ticket back to ward supervisor with reason notes.

### 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`)
- Fast-track `/update/:token` link for field workers sent via SMS/WhatsApp.
- Update status, enter work notes, and attach photo proof with no password login required.

### 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`)
- Public ward ranking sorted by fastest resolution speed or highest resolution rate.
- Citizen profile badges, points counter, and level progression bar.

---

## Getting Started

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
npm run dev
```
Runs at `http://localhost:5173`. API requests to `/api/` proxy to Django backend at `http://localhost:8000`.

### Production Build & PWA Testing
```bash
npm run build
npm run preview
```
Pre-caches service worker (`dist/sw.js`) and manifests for offline support.

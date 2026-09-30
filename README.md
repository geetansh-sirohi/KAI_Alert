# 🌀 KAI Alert — Autonomous Cyclonic Civil Vulnerability Command Center
> **Project ChakraVyuha** • *Track 5: Disaster Management & Community Resilience*  
> *Built for "Build with AI: Code for Communities" Hackathon*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-Multimodal_AI-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-GIS_Satellite-green?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary & The Problem We Solve

During severe cyclonic disasters (e.g. Cyclone Dana, Cyclone Fani), national meteorological agencies provide accurate macro-level atmospheric forecasts (wind speeds, track coordinates, central pressure). **However, civil defense teams, municipal collectors, and emergency hospitals face a critical operational blind spot:**

- *Which hospital basement generator will flood first, cutting power to ventilators?*
- *Which coastal bridge will submerge, trapping ambulances and civilian evacuees?*
- *When the main power grid trips, how many hours will cellular towers survive on backup batteries before communications collapse?*

**KAI Alert** is an autonomous, hyper-local infrastructure vulnerability command center that transforms macro-level meteorological forecasts into **deterministic physical asset breach predictions and dynamic evacuation routes in real time.**

---

## ⚡ Key Architectural Capabilities

### 1. 🌊 Physics-Informed Infrastructure Vulnerability Scoring (IVS)
Unlike black-box AI estimations, KAI Alert calculates physical breach probabilities using verified coastal engineering equations:
- **Holland-B Atmospheric Pressure Profile:** Accurately models the radial pressure gradient $\Delta P(r)$ and cyclonic wind field decay.
- **SLOSH-Inspired Coastal Surge Decay:** Inundation height calculated as $S(d) = S_0 \cdot e^{-k \cdot d}$, comparing water depth against asset elevation relative to Mean Sea Level (MSL) and critical equipment vault thresholds (e.g., basement backup generators).
- **Three-Stage Telecom Battery Decay Model:** Tracks grid power cutoff $\rightarrow$ automated transition to 6-hour auxiliary battery reserve $\rightarrow$ total cellular blackout.

### 2. 🛣️ Spatio-Temporal Dynamic Evacuation Routing (A* / Dijkstra)
- Evaluates the coastal road topological network in real time.
- As coastal storm surge crosses road elevation thresholds, submerged segments (e.g., **Estuary Bridge `EDGE-ESTUARY-01`**) are pruned with infinite penalty weights ($W = 99,999$).
- Automatically generates real-time inland detours via **National Highway 5A Detour** to ensure safe, unflooded evacuation corridors.

### 3. 🚁 Google Gemini Multimodal Drone Damage Triage
- First responders and drone pilots can upload aerial reconnaissance photographs directly into the triage module.
- Powered by **Google Gemini Multimodal Vision API**, the system automatically detects:
  - Downed high-voltage transmission lines
  - Submerged roadway causeways
  - Structural breach severities with instant coordinate geo-tagging

### 4. 📻 Offline-First Vernacular Broadcast (BPP-128 Protocol)
- In the event of primary fiber/cellular network collapse, KAI Alert formats life-saving warnings into a ultra-compact **14-byte AFSK Bell 202 radio frame** with **CRC-16/CCITT-FALSE** error-check integrity.
- Provides emergency broadcasts translated into regional vernaculars (**Odia, Bengali, Hindi, English**) for immediate radio siren transmission and emergency SMS relay.

### 5. 🌍 Universal Live Telemetry & Dual-Tile Satellite GIS
- **Historical Benchmark Mode:** Pre-loaded with verified 100% authentic IMD trajectory and civil coordinates from **Severe Cyclone Dana (October 2024)** across Paradip, Kendrapara, and Puri coast.
- **Live Sentinel Search Mode:** Global location search bar with debounced OpenStreetMap Nominatim geocoding and real-time atmospheric telemetry via Open-Meteo API.
- **Dual Map Modes:** Smooth one-click toggle between crisp tactical street maps and high-resolution Esri World Imagery satellite tiles.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19, Server Components) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/), Apple Human Interface & Pilot Cockpit HUD |
| **Spatial & GIS Engine** | [Leaflet](https://leafletjs.com/), [@turf/turf](https://turfjs.org/), [RBush](https://github.com/mourner/rbush) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) (Synchronous pre-indexed timeline scrubber) |
| **Multimodal Vision & AI Copilot** | [Google Gemini 2.5 Flash / Pro](https://ai.google.dev/) via REST API |
| **Live Geocoding & Weather** | OpenStreetMap Nominatim API & Open-Meteo Real-time Forecast API |

---

## 📂 Directory Structure

```text
kai_alert/
├── public/
│   ├── data/
│   │   ├── cyclone_benchmark_dana.json      # Verified IMD Cyclone Dana trajectory
│   │   ├── evacuation_routes_odisha.json    # Coastal road topological network
│   │   └── odisha_critical_infra.json       # Hospitals, substations, and shelters
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts                # Gemini Tactical Copilot endpoint
│   │   │   └── triage/route.ts              # Gemini Multimodal Drone Triage endpoint
│   │   ├── globals.css                      # Tailwind v4 & Leaflet styling
│   │   ├── layout.tsx                       # Root layout & viewport metadata
│   │   └── page.tsx                         # Main command center interface
│   ├── components/
│   │   ├── common/                          # Reusable UI elements
│   │   ├── dashboard/
│   │   │   ├── AIChatDrawer.tsx             # Floating Tactical Copilot drawer
│   │   │   ├── CommandHeader.tsx            # View switcher & Nominatim search
│   │   │   ├── DroneTriageModal.tsx         # Multimodal drone image inspection
│   │   │   ├── EvacuationRouter.tsx         # Active corridor status & clearance time
│   │   │   ├── OverviewDashboard.tsx        # Executive briefing & metric cards
│   │   │   ├── TelemetryBar.tsx             # Live pressure, wind, and surge HUD
│   │   │   ├── ThreatRadar.tsx              # Compromised asset inspection list
│   │   │   ├── TimeScrubber.tsx             # 14-hour temporal scrub control
│   │   │   └── VernacularBroadcastModal.tsx # Multi-language siren transmitter
│   │   └── map/
│   │       ├── CycloneConesLayer.tsx        # Gale, storm, and hurricane wind radii
│   │       └── DisasterMap.tsx              # Interactive Leaflet satellite map
│   └── lib/
│       ├── geo/                             # Live weather & Nominatim geocoding
│       ├── physics/                         # Holland-B, SLOSH surge & IVS equations
│       ├── store/                           # Zustand disaster store
│       └── types/                           # TypeScript contract schemas
├── .env.example                             # Environment variable template
├── .gitignore                               # Production leak-proof gitignore
├── package.json                             # Dependencies & scripts
├── prd.md                                   # Master Product Requirements Document
└── README.md                                # Project Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.18+ or v20+
- npm, yarn, or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/<your-username>/kai-alert.git
cd kai-alert
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel (One-Click)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of KAI Alert Command Center"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kai-alert.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your `kai-alert` repository.
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = `your_actual_api_key`
5. Click **Deploy**. Your command center will be live with full SSL in ~60 seconds!

---

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---
**Team KAI Alert** • *Empowering Communities with Autonomous AI Disaster Resilience*

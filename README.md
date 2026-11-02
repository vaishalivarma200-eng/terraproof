# TerraProof | Satellite Evidence & Decision-Support Layer for Agricultural Revenue Administration

[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)](https://vitejs.dev/)
[![DPDP Act 2023](https://img.shields.io/badge/Privacy-DPDP%20Act%202023%20Aligned-emerald.svg)](https://www.meity.gov.in/)
[![Tests](https://img.shields.io/badge/Tests-65%20Passed-brightgreen.svg)](https://pytest.org/)

> **TerraProof** is an Earth observation evidence and decision-support layer designed for **revenue officials (Patwari / Kanungo / Tehsildar / District Administration)**, agricultural insurers (PMFBY), lending banks, and farmers. It pre-screens claims, prioritizes ground audits, drafts objective evidence packs, and maintains an immutable cryptographic audit ledger.

---

## 1. Quick Start & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: `http://127.0.0.1:8000` (Swagger docs at `/docs`)

### 2. Start the Vite React Frontend
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend Web Application will be live at: `http://127.0.0.1:5173`

---

## 2. Satellite Data Service & API Credentials

TerraProof supports a multi-tier fallback architecture:
1. **Local Precomputed Cache (`LocalCacheAdapter`)**: Default offline mode. Works with zero internet, zero API keys, and zero setup.
2. **Microsoft Planetary Computer STAC (`PlanetaryComputerSTACAdapter`)**: Free, public, keyless global satellite catalog for Sentinel-2 L2A optical and Sentinel-1 GRD SAR radar.
3. **Copernicus Data Space Ecosystem (`CopernicusSentinelHubAdapter`)**: Optional live European Space Agency (ESA) Copernicus processing.

### How to configure Copernicus CDSE Credentials (Optional)
1. Register for a free account at: [https://dataspace.copernicus.eu/](https://dataspace.copernicus.eu/)
2. Navigate to your user settings and create an OAuth Client ID and Secret under **Sentinel Hub API Credentials**.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Set your credentials in `.env`:
   ```ini
   CDSE_CLIENT_ID=your_actual_client_id
   CDSE_CLIENT_SECRET=your_actual_client_secret
   TERRAPROOF_MODE=real
   ```
*(Note: If left blank or in `TERRAPROOF_MODE=demo`, TerraProof automatically uses the verified local cache and Planetary Computer STAC without breaking).*

---

## 3. Judge & Reviewer 3-Minute Demonstration Script

Follow this exact click-path to experience the full end-to-end capabilities of TerraProof:

### Step 1: Open the App & Launch the Guided Tour
1. Navigate to `http://localhost:5173` in your browser.
2. Notice the persistent top banner: `DEMO MODE ACTIVE • SYNTHETIC DATA`.
3. Click **"Tour (3 min)"** on the banner to launch the 9-step executive walkthrough explaining the problem, satellite evidence, discrepancy detection, and auditability.

### Step 2: Regional Flood Event Comparison (Assam 2024 Flood)
1. On the top banner, click **"Assam Flood Demo"**.
2. **Interactive Swipe Slider:** Drag the before/after slider across the Brahmaputra basin (20 June pre-flood optical vs. 06 July peak flood SAR radar).
3. **Multi-layer overlays:** Toggle between *Newly Flooded Mask* (48,200 ha in Morigaon), *Submerged Cropland* (32,400 ha Sali paddy), *Settlement Enclaves*, and *Road Networks*.
4. **ASDMA Official Validation:** Review the side-by-side comparison with the Assam State Disaster Management Authority (ASDMA) 7 July 2024 flood bulletin (91% concordance rate).
5. Click **"Export CSV"** to download the district and revenue circle flood table.

### Step 3: What-If Inundation Scenario Simulator
1. Click **"Simulate Scenarios on this Basin"** (or click **"Simulator"** on the top banner).
2. Choose between:
   - **River Water Level Rise (+2.5 m)**: Shows low-lying floodplain inundation (+35,500 ha).
   - **Extreme Monsoon Downpour (180 mm)**: Computes SCS-CN surface runoff.
   - **Embankment Breach at Mayong (75 m)**: Models rapid polder water inrush.
   - **Proposed Dam / Full Reservoir Level (86.5 m)**: Evaluates contour backwater submergence.
   - **Urban Land Use Expansion (+25%)**: Calculates increased runoff discharge.
3. Review the **Sensitivity Range (±15% Bound)** card accounting for Copernicus DEM 30m vertical RMSE (~1.5m).
4. Review the mandatory scientific disclaimer.

### Step 4: Claim Triage & Rupee Discrepancy (C-002 Inflated Claim)
1. Click **"C-002"** on the quick-jump menu on the banner.
2. In claim C-002 (Baldev Singh, Rampur Kalan):
   - Claimed: **15.0 ha** complete loss (₹4,20,000 claimed).
   - Satellite-Observed: **6.2 ha** in the low-lying river corridor (DEM <84.5m). The upper 8.8 ha is dry.
   - Discrepancy: **58.7% divergence**.
   - **Protected Rupee Discrepancy:** ₹2,46,400 protected from premature disbursement.
3. Drag the field-level pre/post swipe slider on the map to see the standing water boundary.

### Step 5: Consult TerraGuide AI Assistant
1. Click the glowing **"TerraGuide AI"** button in the bottom-right corner.
2. Switch roles: **Judge**, **Farmer**, or **Patwari / Revenue Official**.
3. Toggle languages: **EN**, **हिंदी**, or **Hinglish**.
4. Click suggested question chips:
   - *"Why was C-002 flagged for area inflation?"*
   - *"Which districts were most affected in the Assam flood?"*
   - *"What changes if the proposed reservoir level is 5 m lower?"*
5. Notice that every response ends with **"Evidence used: ..."** listing the specific satellite data points, DEM topography, and knowledge base documents cited.
6. Test voice input / output using the **Mic** and **Speaker** buttons (Web Speech API).

---

## 4. Eight Canonical Demonstration Archetypes

TerraProof includes 8 deterministic evaluation scenarios (Kharif Flood, Vikrampur Demo District):

| Ref | Archetype | Triage | Claimed vs Observed | Key Discrepancy Signal | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C-001** | Genuine Flood Loss | `GREEN` | 5.0 ha claimed vs 4.6 ha obs (8% div) | 91 confidence, verified Jamabandi, photo EXIF inside parcel | Automated fast-track settlement (24h) |
| **C-002** | Inflated Acreage | `RED` | 15.0 ha claimed vs 6.2 ha obs (58.7% div) | Upland 8.8 ha dry per DEM topography; ₹2,46,400 gap | Mandatory physical revenue audit |
| **C-003** | Season Discrepancy | `AMBER` | 4.2 ha Wheat in July (100% div) | Wheat is a Rabi winter crop; DCS records field as Paddy/Fallow | Route to Patwari for crop declaration inquiry |
| **C-004** | Title Area Mismatch | `AMBER` | 7.9 ha boundary vs 3.2 ha Jamabandi | 147% boundary expansion; 71% fuzzy name match | Enforce 3.2 ha legal title ceiling |
| **C-005** | Cadastral Collision | `RED` | 8.5 ha parcel | 60% polygon overlap with C-002; duplicate document SHA-256 | Immediate freeze; Tehsildar adjudication |
| **C-006** | Sensor Confidence Bound | `AMBER` | 3.8 ha claimed vs 2.1 ha obs | 92% monsoon cloud cover; SAR noise; Confidence 42/100 | Scientific limit: physical verification mandated |
| **C-007** | Low-Damage Limit | `AMBER` | 40% loss claimed vs ~11% observed | Subtle damage <15% indistinguishable from normal canopy variation | PMFBY 33% rule: Joint crop-cutting inspection |
| **C-008** | Unauthorized Construction | `RED` | 3.0 ha agricultural plot | New 0.4 ha built-up footprint (+0.42 NDBI jump, SAR double-bounce) | Assign to Tehsildar for revenue code inspection |

---

## 5. Technical Architecture & Scientific Principles

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 TERRAPROOF EVIDENCE LAYER              │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                ┌─────────────────────────────┼────────────────────────────┐
                ▼                             ▼                            ▼
  ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
  │   MULTI-SENSOR SATELLITE  │ │    REVENUE GIS & TITLE    │ │  WHAT-IF SCENARIO ENGINE  │
  │ • Sentinel-2 L2A (10m)    │ │ • KML / Shapefile / GeoJSON│ │ • DEM Flood-Fill Model    │
  │ • Sentinel-1 SAR (Radar)  │ │ • 7/12, Khasra, Jamabandi │ │ • SCS-CN Runoff Simulator │
  │ • Open-Meteo Rainfall     │ │ • Cadastral Overlap Engine│ │ • Low/Nom/High Bands(±15%)│
  └─────────────┬─────────────┘ └─────────────┬─────────────┘ └─────────────┬─────────────┘
                │                             │                             │
                └─────────────────────────────┼─────────────────────────────┘
                                              ▼
                             ┌───────────────────────────────────┐
                             │    DECISION SUPPORT & TRIAGE      │
                             │  • Green (Fast-Track Settlement)  │
                             │  • Amber (Revenue Document Review)│
                             │  • Red (Targeted On-Site Audit)   │
                             └─────────────────┬─────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
      ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
      │     TERRAGUIDE AI ASSISTANT       │           │    CRYPTOGRAPHIC AUDIT CHAIN      │
      │ • Grounded Tool Calling Execution │           │ • SHA-256 Tamper-Evident Blocks   │
      │ • EN / हिंदी / Hinglish           │           │ • Signed PDF Evidence Dossiers    │
      │ • Browser Web Speech API Audio    │           │ • Public QR Citizen Verification  │
      └───────────────────────────────────┘           └───────────────────────────────────┘
```

---

## 6. Testing & Quality Verification

Run the full automated test suite (65 passing unit & integration tests):
```bash
cd backend
python -m pytest tests/ -v
```
To verify the new add-ons specifically:
```bash
python -m pytest tests/test_step1_satellite_service.py tests/test_step2_region_comparison.py tests/test_step4_scenario_simulator.py tests/test_step5_assistant_tools.py -v
```
To test frontend compilation:
```bash
cd frontend
npm run build
```

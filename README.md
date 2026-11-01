# TerraProof | Satellite Evidence & Decision-Support Layer for Agricultural Revenue Administration

[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)](https://vitejs.dev/)
[![DPDP Act 2023](https://img.shields.io/badge/Privacy-DPDP%20Act%202023%20Aligned-emerald.svg)](https://www.meity.gov.in/)
[![Tests](https://img.shields.io/badge/Tests-53%20Passed-brightgreen.svg)](https://pytest.org/)

> **TerraProof** is an Earth observation evidence and decision-support layer designed for **revenue officials (Patwari / Kanungo / Tehsildar / District Administration)**, agricultural insurers (PMFBY), lending banks, and farmers. It pre-screens claims, prioritizes ground audits, drafts objective evidence packs, and maintains an immutable cryptographic audit ledger.

---

## 1. Official Positioning & Guiding Principles

### 🏛️ Decision Support, NOT Replacement of Revenue Officials
**TerraProof does not replace patwaris, tehsildars, state land records, or human adjudicators.** 
Revenue officers and executive magistrates retain sole statutory and quasi-judicial authority under State Land Revenue Codes (e.g., MP Land Revenue Code, Punjab Land Revenue Act, Maharashtra Land Revenue Code). TerraProof serves as a **transparent, defensible pre-screening and evidence-drafting platform**.

### ⚖️ Never Auto-Reject & Procedural Justice
- Algorithms in TerraProof **never automatically dismiss or invalidate** a farmer's claim. Discrepancies generate explainable priority flags (`AMBER` / `RED`) for expedited physical inspection.
- **Low-Damage Technical Truthfulness:** Sentinel 10-meter pixels cannot reliably distinguish sub-15% damage from natural phenological or soil variance. TerraProof explicitly flags sub-15% estimates with: *"Satellite Resolution Insufficient — Mandatory Physical Ground Inspection Required"*.
- **Guaranteed Independent Appeals:** Farmers can contest preliminary findings via a statutory grievance flow routed independently to the **Tehsildar / Sub-Divisional Magistrate (SDM)** rather than the original inspecting officer.

### 🔒 Privacy-First Architecture (DPDP Act 2023 Aligned)
- **Zero Raw Aadhaar Storage:** 12-digit Aadhaar numbers are strictly barred from database tables, schemas, session states, and server logs. The system stores only a masked reference (`XXXX-XXXX-1098`) and a salted cryptographic hash.
- **Statutory Consent & Data Erasure:** Full implementation of Section 6 (Purpose-Specific Consent), Section 11 (Right to Access & Download Data), and Section 12 (Right to Erasure / "Forget Me").
- **Public Verification PII Redaction:** The public verification registry (`/verify/:id`) shields all personal identifiers, farmer names, phone numbers, and financial details pursuant to Section 8 of the DPDP Act 2023.

---

## 2. Real vs. Mocked Integrations Disclosure

In compliance with our truthfulness pledge, we clearly disclose which services query live external networks and which operate via production-ready stubs:

| Integration / Adapter | Execution Mode | Technical Provider / Protocol | API Key / Cost |
| :--- | :--- | :--- | :--- |
| **Sentinel-2 Optical Imagery** | **Live Network & Calibrated Fixture** | Microsoft Planetary Computer STAC Catalog (`/collections/sentinel-2-l2a`) | **Free / Keyless** |
| **Sentinel-1 SAR Radar (Monsoon)** | **Live Network & Calibrated Fixture** | Planetary Computer STAC (`/collections/sentinel-1-grd`, VH/VV backscatter) | **Free / Keyless** |
| **Historical Weather & Rainfall** | **Live Network** | Open-Meteo Historical Weather Archive (`archive-api.open-meteo.com`) | **Free / Keyless** |
| **Basemaps & Satellite Tiles** | **Live Network** | Esri World Imagery & Dark Gray Canvas (Watermark-free) | **Free / Keyless** |
| **Digital Crop Survey (AgriStack)** | **Production Stub / Adapter** | `AgriStackDCSAdapter` (Standardized JSON plot schema) | Government Intranet / Mock |
| **e-Girdawari Revenue Export** | **Production Adapter** | `EGirdawariAdapter` (State-compliant Khasra CSV/JSON export) | Local / State Format |
| **PMFBY / NCIP Insurance Unit** | **Production Adapter** | `PMFBYNCIPAdapter` (Standardized PMFBY claim evidence format) | Local / NCIP Format |
| **State Land Records (Bhulekh)** | **Production Parser** | Bilingual Hindi/English OCR extractor (Form 7/12, Khasra, Jamabandi) | Local / Open Source |
| **DigiLocker / Aadhaar e-KYC** | **Production Stub / Verifier** | `DigiLockerOAuthStub`, `AadhaarOfflineQRVerifier` (W3C XML Signature) | Mock for Demo |

---

## 3. Four Canonical Demonstration Archetypes (Phase 11 Seed Scenarios)

TerraProof comes preloaded with the four benchmark evaluation scenarios, which can be re-seeded at any time using the **"4 Archetypes"** button in the UI or via `POST /api/v1/demo/reset-scenarios`:

1. **Scenario 1: Genuine Flood Claim (Fast-Track Approved)**
   - **Claim Reference:** `CLM-2026-0891` | Farmer: Gurpreet Singh (Ludhiana, Punjab)
   - **Parcel & Crop:** 3.5 ha Kharif Rice | Khasra #142/2 (Owner)
   - **Satellite Evidence:** Severe inundation corroborated by Sentinel-2 NDWI (78% surface water) and Sentinel-1 SAR backscatter drop ($<-16\text{ dB}$).
   - **Triage Result:** Risk Score 14/100 (`LOW_RISK`, Green). Document area matches drawn boundary (3.5 ha). Fast-track recommended.

2. **Scenario 2: Inflated Area Claim (Flagged by Risk Engine)**
   - **Claim Reference:** `CLM-2026-1044` | Farmer: Vikramaditya Singh (Kota, Rajasthan)
   - **Parcel & Crop:** Claimed 14.5 ha loss | Kharif Soybean | Khasra #88/1
   - **Discrepancy:** Khasra title extract and satellite-derived boundary establish plot size is only **3.2 hectares** (a 353% area inflation!).
   - **Triage Result:** Risk Score 78/100 (`HIGH_RISK`, Red). Automated alert: *"Severe cadastral inflation detected; physical revenue inspection mandatory"*.

3. **Scenario 3: Land Document Tenancy Mismatch (Review Required)**
   - **Claim Reference:** `CLM-2026-0520` | Farmer: Devendra Meena (Karnal, Haryana)
   - **Parcel & Crop:** 4.0 ha Rabi Wheat | Khasra #203/4 (Filed as Tenant)
   - **Discrepancy:** Uploaded Jamabandi title is in the name of the original landowner; tenant lease agreement affidavit is missing.
   - **Triage Result:** Status `NEEDS_TENANCY_REVIEW`. In accordance with PMFBY Tenant Guidelines, tenant claims are protected from automated dismissal and routed for patwari lease validation.

4. **Scenario 4: Suspected Unauthorized Construction on Farmland (Land-Use Change)**
   - **Claim Reference:** `CLM-2026-0312` | Farmer: Rajeshwari Bai (Ujjain, Madhya Pradesh)
   - **Parcel & Crop:** 2.5 ha Kharif Cotton | Khasra #512/3
   - **Satellite Evidence:** Multi-temporal differencing detected a +0.38 NDBI (Normalized Difference Built-up Index) jump and strong Sentinel-1 SAR double-bounce consistent with a 0.45 ha concrete warehouse plinth erected on agricultural revenue land.
   - **Triage Result:** Flagged as `FLAGGED_UNAUTHORIZED_CONSTRUCTION` for Tehsildar revenue inspection under Section 172 (Diversion of Agricultural Land).

---

## 4. Key Architectural Modules

```
terraproof/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py             # System status & provider diagnostics
│   │   │   ├── claims.py             # PMFBY claim ingestion & triage
│   │   │   ├── analyses.py          # Multi-sensor fusion execution
│   │   │   ├── satellite.py         # STAC scene discovery & raw reflectance
│   │   │   ├── identity.py          # DPDP consent logs, export, erasure
│   │   │   ├── documents.py         # Bilingual land document OCR parser
│   │   │   ├── integrations.py      # AgriStack, e-Girdawari, PMFBY adapters
│   │   │   ├── risk.py              # Anti-fraud risk engine & land-use change
│   │   │   ├── official.py          # Revenue officer workload & inspection orders
│   │   │   ├── public_verify.py     # Public verification portal & audit ledger
│   │   │   ├── appeals.py           # Farmer grievance & independent review API
│   │   │   ├── fairness.py          # Algorithmic parity & smallholder monitoring
│   │   │   └── demo.py              # Demo scenario seed & reset endpoint
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic v2 settings
│   │   │   ├── database.py          # SQLite/PostgreSQL engine & auto-migration
│   │   │   ├── audit_chain.py       # Append-only SHA-256 cryptographic ledger
│   │   │   └── seed.py              # 4 canonical demonstration archetypes
│   │   ├── models/                  # SQLAlchemy ORM models (Audit, Appeal, Decision, Claim)
│   │   ├── geospatial/              # Geodesic ellipsoidal area, zoning, SAR backscatter
│   │   ├── satellite/               # STAC Planetary Computer & Open-Meteo clients
│   │   ├── analysis/                # Risk engine, peril classifier, land-use change
│   │   └── reports/                 # Certified dossier & statutory inspection PDF generators
│   └── tests/                       # 53 comprehensive unit and integration tests
├── frontend/
│   ├── src/
│   │   ├── components/              # OfficialWorkflowModal, FarmerAppealModal, FairnessModal...
│   │   ├── pages/                   # InsurancePage, PublicVerificationPage, Flood, Drought...
│   │   └── services/api.ts          # Fully typed API service client
```

---

## 5. Local Setup & Execution (Windows PowerShell)

### Step 1: Open PowerShell and Navigate to Workspace
```powershell
cd C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof
```

### Step 2: Configure Environment
```powershell
Copy-Item .env.example backend\.env
```
Default mode is `TERRAPROOF_MODE=demo` (zero keys needed, fully offline capable). Set `TERRAPROOF_MODE=real` to query live Microsoft Planetary Computer STAC and Open-Meteo APIs.

### Step 3: Start FastAPI Backend
```powershell
cd backend
$env:PYTHONPATH = "."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Root & Docs:** `http://127.0.0.1:8000/docs`
- **Audit Ledger Chain:** `http://127.0.0.1:8000/api/v1/audit/verify-chain`
- **Public Verification API:** `http://127.0.0.1:8000/api/v1/public/verify/CLM-2026-0891`

### Step 4: Start React + Vite Frontend
In a second PowerShell terminal:
```powershell
cd frontend
npm run dev
```
- **Web Portal:** `http://localhost:5173`
- **Official Revenue Claims Queue:** `http://localhost:5173/claims`
- **Public Verification Registry:** `http://localhost:5173/verify`

---

## 6. Automated Test Suite (53 Tests)

Execute the complete test suite verifying every component from mathematical geodesy to hash-chain tamper detection:

```powershell
cd backend
$env:PYTHONPATH = "."
python -m pytest tests -v
```

### Test Suite Summary:
```text
tests/test_api_endpoints.py (4 tests) .................. PASSED
tests/test_exif_and_compensation.py (4 tests) .......... PASSED
tests/test_geodesic_and_validation.py (4 tests) ........ PASSED
tests/test_phase7_identity_and_documents.py (15 tests) . PASSED
tests/test_phase8_risk_and_land_use.py (5 tests) ....... PASSED
tests/test_phase9_official_workflow.py (6 tests) ....... PASSED
tests/test_phase10_verification_and_appeals.py (4 tests) PASSED
tests/test_raster_and_indices.py (4 tests) ............. PASSED
tests/test_real_vs_demo_provenance.py (3 tests) ........ PASSED
tests/test_verification_upgrades.py (4 tests) .......... PASSED

======================== 53 passed in 4.85s ========================
```

---

## 7. Cryptographic Audit Ledger & Public Verification

TerraProof enforces mathematical immutability for administrative determinations:
- **Hash Pointer Chaining:** Every block contains $H_n = \text{SHA256}(n + \text{timestamp} + \text{event} + \text{record} + \text{actor} + \text{data\_hash} + H_{n-1})$.
- **Genesis Block:** Linked to $64$ zero-characters (`0000000000000000...`).
- **Integrity Audit:** Endpoint `/api/v1/audit/verify-chain` recalculates every digest across the entire chain to guarantee mathematical non-repudiation.
- **Citizen Privacy Shield:** The `/verify/:id` public portal displays official quasi-judicial determinations while redacting all PII (names, phone numbers, raw Aadhaar, and bank accounts) under the DPDP Act 2023.

---

## 8. Responsible Use & Disclaimers

> **STATUTORY NOTICE:** TerraProof is an Earth observation evidence-corroboration instrument. Satellite spectral reflectance indices and SAR backscatter measurements provide radiometric indicators of physical surface phenomena. In accordance with State Land Revenue Codes and PMFBY Operational Guidelines, official revenue decisions remain under the sole jurisdiction of designated revenue officials and appellate courts.

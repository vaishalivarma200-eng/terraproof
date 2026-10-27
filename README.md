# TerraProof | Satellite-Based Environmental Evidence & Claim Verification System

[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **TerraProof** is a satellite-based environmental monitoring and decision-support platform designed to corroborate agricultural loss claims, delineate flood inundation, evaluate vegetation desiccation, and quantify land-cover changes using open Earth observation data.

---

## 1. Executive Overview & Problem Context

Traditional agricultural insurance loss assessment relies heavily on manual field surveyors visiting isolated rural locations weeks after an extreme weather disaster. By that time:
- Inundation waters may have receded,
- Rotting crops may have been cleared, or
- Surviving vegetation may have partially recovered.

**TerraProof** bridges this information gap by pairing **Sentinel-2 optical surface reflectance** and **Sentinel-1 synthetic aperture radar (SAR)** with **high-resolution historical weather reanalysis**. 

### Critical Design Tenet: Decision Support, Not Automated Invalidation
TerraProof is engineered strictly as an **evidence-corroboration and decision-support instrument**. It produces objective spectral change indicators (such as NDVI drops and NDWI surface water masks) with explicit confidence rationales and limitation disclosures. It **never** automatically labels a farmer's claim as fraudulent or conclusively determines legal responsibility without an accredited human adjuster's review.

---

## 2. Key Capabilities & Modules

1. **Module A: Agricultural Insurance Claim Verification (Primary)**
   - Registers agricultural loss claims with cadastral field polygons.
   - Computes ellipsoidal geodesic area in hectares using WGS84 authalic sphere formulas.
   - Ingests pre- and post-incident satellite observations.
   - Calculates vegetation loss ($\Delta\text{NDVI}$) or standing water ($\text{NDWI}$).
   - Compares reported loss area against observed spectral damage.
   - Highlights potential inconsistencies (e.g., claiming 15 ha flood loss when rainfall was negligible).
   - Enables human adjusters to log structured review determinations (`APPROVED`, `PARTIAL`, `FIELD_INSPECTION`, `REJECTED`).
   - Exports certified PDF evidence dossiers.

2. **Module B: Flood Detection & Inundation Monitoring**
   - Applies McFeeters Normalized Difference Water Index ($\text{NDWI}$) and Sentinel-1 SAR backscatter thresholding ($<-16\text{ dB}$).
   - Generates interactive vector map overlays showing floodwater extent.
   - Discloses radar shadows, asphalt specular reflectance, and emergent canopy limitations.

3. **Module C: Drought & Crop-Stress Monitoring**
   - Tracks vegetative vigor ($\text{NDVI}$) and canopy moisture content.
   - Integrates local precipitation deficits and topsoil moisture ($0\text{--}7\text{ cm}$) from the Open-Meteo Historical Archive.
   - Accounts for normal crop harvest calendars to avoid false drought flags.

4. **Module D: Deforestation & Land-Cover Change Detection**
   - Bi-temporal optical differencing identifying abrupt canopy loss and exposed bare soil.
   - Notes distinctions between commercial timber harvesting, wildfires, and illegal clearance.

---

## 3. Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | High-performance, type-safe Earth observation user interface |
| **Interactive Maps** | Leaflet 1.9, React-Leaflet | Vector map rendering, multi-basemap layers, GeoJSON overlays |
| **Visualizations** | Recharts, Lucide React | Precipitation timelines, soil moisture graphs, interface icons |
| **Backend REST API** | Python 3.14, FastAPI, Pydantic V2 | Asynchronous RESTful API with automated OpenAPI / Swagger docs |
| **Database & ORM** | SQLite (local dev) / PostgreSQL + PostGIS, SQLAlchemy 2.0 | Spatial geometries, claim tracking, analysis results persistence |
| **Geospatial Engine** | Rasterio 1.5, NumPy 2.4, Shapely 2.2 | Multi-spectral indexing, NoData masking, polygonization, geodesic area |
| **Report Generation** | ReportLab 5.1 Platypus | Multi-page certified PDF evidence dossiers |
| **Testing** | Pytest 9.1 | Deterministic automated testing of algorithms and API endpoints |

---

## 4. Directory Structure

```
terraproof/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (health, claims, analyses, satellite)
│   │   ├── core/            # Config, database engine, sample database seeding
│   │   ├── models/          # SQLAlchemy ORM models (Claim, AnalysisJob, Observation)
│   │   ├── schemas/         # Pydantic request/response validation schemas
│   │   ├── geospatial/      # Geodesic area, geometry validation, raster indices (NDVI/NDWI)
│   │   ├── satellite/       # Provider abstractions (Planetary Computer STAC, Open-Meteo, Mock)
│   │   ├── analysis/        # Core analytical modules (Insurance, Flood, Drought, Deforestation)
│   │   └── reports/         # ReportLab PDF evidence dossier generator
│   └── tests/               # Pytest automated test suite (12 passed tests)
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, MapViewer (Leaflet), MetricCard, WeatherCard
│   │   ├── pages/           # Landing, Overview, Insurance, Flood, Drought, Deforestation, Detail, About
│   │   ├── services/        # Frontend API client communicating with FastAPI
│   │   └── types/           # TypeScript interfaces for claims, geometries, and analyses
│   ├── index.html
│   └── vite.config.ts
├── data/
│   ├── fixtures/            # Offline calibration fixtures
│   └── outputs/             # Generated PDF dossiers and analytical rasters
├── docs/
│   └── ARCHITECTURE.md      # Detailed technical architecture whitepaper
├── .env.example             # Configuration placeholders
├── .gitignore               # Strict exclusion of rasters, secrets, and SQLite databases
└── README.md                # Project documentation
```

---

## 5. Prerequisites & Installation (Windows PowerShell)

Ensure you have the following installed on your Windows machine:
- **Python 3.11+** (Python 3.14 verified)
- **Node.js 18+** (Node v24.14 verified) & **npm**
- **Git**

### Step 1: Open PowerShell and Navigate to the Project

```powershell
cd C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof
```

### Step 2: Configure Environment Variables

Copy the example environment template:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example backend\.env
```

The application defaults to `TERRAPROOF_MODE=demo`, which allows full end-to-end functionality offline without requiring external API keys.

---

## 6. How to Run TerraProof Locally

You will run the backend and frontend in two separate PowerShell windows.

### Terminal 1: Start the Backend (FastAPI)

```powershell
cd C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof\backend
$env:PYTHONPATH = "."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **System Health:** `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start the Frontend (Vite + React)

```powershell
cd C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof\frontend
npm run dev
```

- **Web Application:** `http://localhost:5173`

Open your web browser and navigate to `http://localhost:5173`.

---

## 7. Running the Automated Test Suite

TerraProof includes an automated test suite validating geodesic mathematical calculations, NDVI/NDWI indexing, geometry boundary bounds, and claim review endpoints.

Run tests using PowerShell:

```powershell
cd C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof\backend
$env:PYTHONPATH = "."
python -m pytest tests -v
```

### Test Results
```text
tests/test_api_endpoints.py::test_health_handler PASSED                  [  8%]
tests/test_api_endpoints.py::test_provider_status_handler PASSED         [ 16%]
tests/test_api_endpoints.py::test_submit_claim_and_review PASSED         [ 25%]
tests/test_api_endpoints.py::test_insurance_verification_workflow PASSED [ 33%]
tests/test_geodesic_and_validation.py::test_geodesic_polygon_area_positive PASSED [ 41%]
tests/test_geodesic_and_validation.py::test_validate_study_area_valid PASSED [ 50%]
tests/test_geodesic_and_validation.py::test_validate_study_area_invalid_coordinates PASSED [ 58%]
tests/test_geodesic_and_validation.py::test_validate_study_area_tiny_sliver PASSED [ 66%]
tests/test_raster_and_indices.py::test_ndvi_known_values PASSED          [ 75%]
tests/test_raster_and_indices.py::test_ndvi_with_nodata PASSED           [ 83%]
tests/test_raster_and_indices.py::test_ndwi_mcfeeters PASSED             [ 91%]
tests/test_raster_and_indices.py::test_quantify_affected_area PASSED     [100%]

============================= 12 passed in 1.16s ==============================
```

---

## 8. Satellite Data Provider Modes

TerraProof supports two cleanly separated modes configured in `.env`:

### Demonstration Mode (`TERRAPROOF_MODE=demo`) — Default
- Uses deterministic, calibrated synthetic satellite observations.
- Explicitly labeled in the UI and reports with disclaimer: `[DEMO MODE: Calibrated Fixture]`.
- Requires zero API keys or external network requests.
- Ideal for student presentations, offline development, and unit testing.

### Real Data Mode (`TERRAPROOF_MODE=real`)
- Queries the **Microsoft Planetary Computer STAC Catalog** (`https://planetarycomputer.microsoft.com/api/stac/v1`) for authentic Sentinel-2 MSI and Sentinel-1 SAR acquisition scenes.
- Queries **Open-Meteo Historical Weather Archive** for real millimeter-level rainfall and root-zone soil moisture.
- Preserves genuine ESA scene IDs, solar angles, and percentage cloud coverage.

---

## 9. Mathematical Formulations

### 1. Normalized Difference Vegetation Index (NDVI)
$$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED} + \epsilon}$$
- **NIR:** Sentinel-2 Band 8 ($842\text{ nm}$)
- **RED:** Sentinel-2 Band 4 ($665\text{ nm}$)

### 2. Normalized Difference Water Index (NDWI - McFeeters)
$$\text{NDWI} = \frac{\text{GREEN} - \text{NIR}}{\text{GREEN} + \text{NIR} + \epsilon}$$
- **GREEN:** Sentinel-2 Band 3 ($560\text{ nm}$)
- **NIR:** Sentinel-2 Band 8 ($842\text{ nm}$)

### 3. True Ellipsoidal Geodesic Area
$$\text{Area} = \frac{R^2}{2} \left| \sum_{i=1}^{n} \Delta \lambda_i (2 + \sin \phi_i + \sin \phi_{i+1}) \right|$$
- Computed directly on the WGS84 authalic sphere ($R \approx 6,371,007.2\text{ m}$) to avoid planar projection distortion.

---

## 10. Responsible Use & Disclaimers

> **LEGAL & FORENSIC DISCLAIMER:** TerraProof is a technical decision-support and evidence-gathering system. Satellite spectral indices provide indirect radiometric indicators of vegetation vigor and surface moisture. This application does not constitute a legally binding determination of fraud or guarantee of indemnity. Final claim approval remains the exclusive responsibility of accredited human insurance adjusters.


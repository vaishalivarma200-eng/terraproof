# TerraProof System Architecture & Engineering Specifications

## 1. High-Level Architectural Diagram

```
                                  +------------------------------------+
                                  |         Web Browser Client         |
                                  |  (React, Vite, TypeScript, Leaflet)|
                                  +-----------------+------------------+
                                                    |
                                          HTTP / REST Calls (JSON)
                                                    v
                                  +------------------------------------+
                                  |         FastAPI REST Engine        |
                                  |  Pydantic V2 Validation & Routers  |
                                  +--------+------------------+--------+
                                           |                  |
               +---------------------------+                  +---------------------------+
               |                                                                          |
               v                                                                          v
+------------------------------+                                            +------------------------------+
|   Data Storage & Artifacts   |                                            | Shared Geospatial Core Engine|
| - SQLite / PostgreSQL PostGIS|                                            | - Geodesic Ellipsoidal Area  |
| - GeoTIFFs & Cached Scenes   |                                            | - Multi-Band Raster Slicing  |
| - ReportLab PDF Dossiers     |                                            | - NDVI, NDWI, dNDVI Analytics|
+------------------------------+                                            | - Vector Mask Polygonizer    |
                                                                            +--------------+---------------+
                                                                                           |
                                               +-------------------------------------------+
                                               |
                                               v
                             +-----------------------------------+
                             |     Satellite & Weather Abstraction|
                             |  - Planetary Computer STAC (Live) |
                             |  - Copernicus CDSE (Optional)     |
                             |  - Open-Meteo Weather Archive     |
                             |  - Demonstration Mode Fixture     |
                             +-----------------------------------+
```

## 2. Component Breakdown

### 2.1 Frontend (`frontend/`)
- **React 18 + TypeScript + Vite**: Fast hot-module replacement and strict type-safety across geospatial geometries and analytical schemas.
- **Tailwind CSS**: Dark Earth-observation styling (`#080d1a`, `#0b132b`, `#1c2541`, `#10b981`).
- **React Leaflet & Leaflet 1.9**: Vector tile rendering with support for CartoDB Dark Matter, OpenStreetMap, and Esri World Imagery. Visualizes farm field boundaries and classified loss masks.
- **Recharts**: Meteorological bar and line graphs showing temporal precipitation and temperature trends.
- **Lucide React**: Clean, accessible iconography.

### 2.2 Backend (`backend/app/`)
- **FastAPI**: Asynchronous REST framework generating OpenAPI 3.1 Swagger documentation automatically.
- **SQLAlchemy 2.0**: Relational ORM supporting SQLite (for friction-free local college student development) and PostgreSQL with PostGIS geometry support.
- **Pydantic Settings**: Validates configuration, port bindings, and API URLs from `.env` files.

### 2.3 Shared Geospatial Processing Engine (`backend/app/geospatial/`)
- **`geodesic.py`**: Calculates true ellipsoidal surface area in hectares directly on the WGS84 ellipsoid ($a = 6378137.0\text{ m}$, $f = 1/298.257223563$). Avoids Euclidean planar distortion that corrupts degree-based approximations.
- **`validation.py`**: Validates GeoJSON structural schema, topological validity, coordinate ranges ($[-180..180], [-90..90]$), self-intersections, and boundary size limits ($0.01\text{ ha} \le \text{area} \le 100,000\text{ ha}$).
- **`raster.py`**: Synthetic reflectance band generation, GeoTIFF serialization via Rasterio, and polygonization of binary raster masks into GeoJSON FeatureCollections for web maps.
- **`indices.py`**: Numerical calculations for NDVI, NDWI (McFeeters and Gao), and bi-temporal delta differencing ($dIndex = pre - post$).

### 2.4 Satellite & Weather Provider Abstraction (`backend/app/satellite/`)
- **`stac_provider.py`**: Connects to the SpatioTemporal Asset Catalog (STAC) on Microsoft Planetary Computer (`https://planetarycomputer.microsoft.com/api/stac/v1`). Queries public Sentinel-2 Level-2A and Sentinel-1 GRD metadata with zero API key required.
- **`weather_provider.py`**: Queries Open-Meteo Historical Archive API (`https://archive-api.open-meteo.com/v1/archive`) for exact daily precipitation sums, peak daily rainfall, and topsoil moisture ($0\text{--}7\text{ cm}$).
- **`mock_provider.py`**: Calibrated Demonstration Mode provider providing deterministic, offline test scenes for zero-network testing and academic presentations.

### 2.5 Report Generation Engine (`backend/app/reports/`)
- **`pdf_generator.py`**: Builds certified multi-page PDF evidence dossiers using ReportLab Platypus. Features metadata audit tables, spectral divergence statistics, meteorological context, observation provenance, potential inconsistency alerts, and human reviewer signature blocks.


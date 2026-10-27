# TerraProof Data Directory

This directory stores satellite imagery assets, demonstration fixtures, and generated report artifacts.

## Subdirectories
- `fixtures/`: Deterministic test rasters and GeoJSON boundaries for testing and Demonstration Mode.
- `outputs/`: Generated analytical maps, clipped GeoTIFFs, PNG preview overlays, and compiled PDF evidence reports.
- `cache/`: Cached remote STAC items and meteorological query results to avoid redundant network requests.

## Data Governance & Privacy
- Never commit actual full-scene Sentinel-1/2 products (several gigabytes) to Git.
- Never commit raw claims containing personally identifiable farm owner data.
- The `.gitignore` at the repository root prevents local satellite rasters, SQLite databases, and PDFs from being tracked.

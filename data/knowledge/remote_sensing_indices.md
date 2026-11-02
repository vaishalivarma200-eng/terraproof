# Remote Sensing Spectral Indices & Radar Principles in Agriculture

## 1. Normalized Difference Vegetation Index (NDVI)
- **Formula:** `(NIR - Red) / (NIR + Red)` (Sentinel-2 Bands B8 and B4).
- **Physical Meaning:** Measures live green chlorophyll content and canopy vigour.
- **Interpretation Ranges:**
  - `0.60 to 0.85`: Dense, vigorous, healthy agricultural crop canopy.
  - `0.30 to 0.50`: Moderate crop cover, emerging seedling stage, or vegetative stress.
  - `0.10 to 0.25`: Severely damaged crop, lodging, waterlogged mud, or bare soil.
  - `< 0.05`: Standing open water, concrete, or submerged surface.

## 2. Normalized Difference Water Index (NDWI)
- **Formula:** `(Green - NIR) / (Green + NIR)` (Sentinel-2 Bands B3 and B8).
- **Physical Meaning:** Highlights open water bodies, ponding, and high leaf water content.
- **Interpretation Ranges:**
  - `> +0.20`: Standing water, severe flood inundation.
  - `-0.10 to +0.20`: Saturated soil, waterlogged field furrow.
  - `< -0.20`: Dry non-flooded surface or healthy canopy.

## 3. Normalized Difference Built-up Index (NDBI)
- **Formula:** `(SWIR - NIR) / (SWIR + NIR)` (Sentinel-2 Bands B11 and B8).
- **Physical Meaning:** Distinguishes impervious built-up surfaces, masonry, concrete plinths, and tin sheds from vegetative crop cover.
- A sudden temporal jump of `+0.35` or higher on an agricultural parcel indicates unauthorized non-agricultural construction.

## 4. Sentinel-1 C-Band Synthetic Aperture Radar (SAR)
- **Wavelength:** ~5.6 cm (C-band microwave).
- **All-Weather Capability:** Microwaves penetrate cloud cover, monsoon rain, haze, and smoke.
- **Specular Reflection on Water:** Calm standing floodwater acts as a specular mirror, scattering microwave pulses away from the antenna and creating very dark radar backscatter (`<-18 dB`).
- **Double-Bounce Reflection:** Vertical walls, concrete structures, or metal sheds produce intense corner reflector double-bounce signals (`>-5 dB`), enabling reliable detection of new structures even through clouds.

## 5. Digital Elevation Models (DEM) & Topography
- ISRO Cartosat-1 / Copernicus DEM 30m resolution.
- Gravity-driven flow dictates that floodwaters accumulate in topographic low-lying depressions (e.g. elevation `<84.5 m`). Upland ridges (`>89 m`) in the same cadastral revenue village do not get inundated by the same river stage.

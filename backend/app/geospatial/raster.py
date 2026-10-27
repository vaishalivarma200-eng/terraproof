import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from rasterio.features import shapes
from shapely.geometry import shape, mapping

def generate_synthetic_sentinel2_bands(
    bbox: Tuple[float, float, float, float],
    width: int = 60,
    height: int = 60,
    scenario: str = "healthy_crop"
) -> Dict[str, np.ndarray]:
    """
    Generates synthetic optical surface reflectance bands (B02-Blue, B03-Green, B04-Red, B08-NIR, B11-SWIR)
    specifically labeled for deterministic testing and Demonstration Mode.
    Values represent surface reflectance scaled 0.0 to 1.0 (float32).
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    np.random.seed(42)

    # Base noise
    noise = np.random.normal(0, 0.02, (height, width)).astype(np.float32)

    if scenario == "healthy_crop":
        # High NIR, low Red, moderate Green
        red = np.clip(0.04 + noise, 0.01, 0.15)
        green = np.clip(0.08 + noise, 0.02, 0.20)
        nir = np.clip(0.65 + noise, 0.40, 0.85)
        swir = np.clip(0.18 + noise, 0.08, 0.30)
    elif scenario == "flood_inundated":
        # Water: very low NIR, low Red, low SWIR
        red = np.clip(0.05 + noise, 0.01, 0.12)
        green = np.clip(0.07 + noise, 0.02, 0.14)
        nir = np.clip(0.03 + noise, 0.005, 0.08)
        swir = np.clip(0.01 + noise, 0.002, 0.05)
    elif scenario == "drought_stressed":
        # Stressed crop: decreased NIR, increased Red/SWIR due to cellular dehydration
        red = np.clip(0.18 + noise, 0.08, 0.35)
        green = np.clip(0.10 + noise, 0.04, 0.25)
        nir = np.clip(0.25 + noise, 0.15, 0.40)
        swir = np.clip(0.38 + noise, 0.20, 0.55)
    elif scenario == "deforested_bare_soil":
        # Bare soil: moderate Red and NIR, elevated SWIR
        red = np.clip(0.24 + noise, 0.12, 0.40)
        green = np.clip(0.15 + noise, 0.08, 0.28)
        nir = np.clip(0.22 + noise, 0.12, 0.38)
        swir = np.clip(0.42 + noise, 0.25, 0.60)
    else:
        # Default moderate vegetation
        red = np.clip(0.08 + noise, 0.02, 0.20)
        green = np.clip(0.10 + noise, 0.03, 0.25)
        nir = np.clip(0.45 + noise, 0.25, 0.65)
        swir = np.clip(0.22 + noise, 0.10, 0.40)

    # Add a spatial gradient to simulate realistic topography or localized damage
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    damage_pocket = np.exp(-((x_coords - width * 0.6) ** 2 + (y_coords - height * 0.4) ** 2) / (2 * (width * 0.25) ** 2))
    
    if scenario in ("flood_inundated", "drought_stressed", "deforested_bare_soil"):
        # Localize the damage in the study area
        nir = nir * (1.0 - 0.7 * damage_pocket)
        if scenario == "flood_inundated":
            red = red * (1.0 - 0.5 * damage_pocket)
        else:
            red = red + 0.15 * damage_pocket

    return {
        "B03": green.astype(np.float32),
        "B04": red.astype(np.float32),
        "B08": nir.astype(np.float32),
        "B11": swir.astype(np.float32)
    }

def save_raster_geotiff(
    data: np.ndarray,
    output_path: Path,
    bbox: Tuple[float, float, float, float],
    crs: str = "EPSG:4326",
    nodata_val: float = -9999.0
) -> str:
    """
    Saves a 2D NumPy array as a standard geospatial GeoTIFF raster.
    """
    height, width = data.shape
    min_lon, min_lat, max_lon, max_lat = bbox
    transform = from_bounds(min_lon, min_lat, max_lon, max_lat, width, height)

    with rasterio.open(
        output_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=1,
        dtype=data.dtype,
        crs=crs,
        transform=transform,
        nodata=nodata_val
    ) as dst:
        dst.write(data, 1)

    return str(output_path)

def polygonize_raster_mask(
    mask_binary: np.ndarray,
    bbox: Tuple[float, float, float, float],
    properties: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Converts a binary boolean raster mask into a GeoJSON FeatureCollection
    so it can be rendered dynamically in web map layers (Leaflet).
    """
    height, width = mask_binary.shape
    min_lon, min_lat, max_lon, max_lat = bbox
    transform = from_bounds(min_lon, min_lat, max_lon, max_lat, width, height)

    mask_uint8 = mask_binary.astype(np.uint8)
    features = []

    for geom, val in shapes(mask_uint8, mask=(mask_uint8 == 1), transform=transform):
        shapely_geom = shape(geom)
        # Filter tiny single-pixel noise polygons (< 0.000001 deg^2)
        if shapely_geom.area > 1e-7:
            features.append({
                "type": "Feature",
                "geometry": mapping(shapely_geom),
                "properties": properties or {"class": "detected_change", "value": int(val)}
            })

    # Keep largest coherent damage zones for high rendering performance
    features.sort(key=lambda f: shape(f["geometry"]).area, reverse=True)
    return {
        "type": "FeatureCollection",
        "features": features[:25]
    }

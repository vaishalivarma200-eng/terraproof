import numpy as np
from typing import Dict, Any, Tuple, Optional

EPSILON = 1e-6

def calculate_ndvi(
    nir_band: np.ndarray,
    red_band: np.ndarray,
    nodata_mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Computes Normalized Difference Vegetation Index (NDVI):
    NDVI = (NIR - RED) / (NIR + RED + epsilon)
    Range: [-1.0, 1.0]
    Vegetated canopies generally range between 0.3 and 0.85.
    Water, bare soil, and clouds yield values <= 0.15.
    """
    numerator = nir_band - red_band
    denominator = nir_band + red_band + EPSILON
    ndvi = np.divide(numerator, denominator, out=np.zeros_like(numerator, dtype=np.float32), where=denominator != 0)
    ndvi = np.clip(ndvi, -1.0, 1.0)
    
    if nodata_mask is not None:
        ndvi[nodata_mask] = np.nan
        
    return ndvi

def calculate_ndwi(
    green_or_nir: np.ndarray,
    nir_or_swir: np.ndarray,
    mode: str = "mcfeeters",
    nodata_mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Computes Normalized Difference Water Index (NDWI):
    - McFeeters (1996): (GREEN - NIR) / (GREEN + NIR + epsilon) -> Best for open water delineation.
    - Gao (1996): (NIR - SWIR) / (NIR + SWIR + epsilon) -> Sensitive to plant canopy liquid water content.
    """
    numerator = green_or_nir - nir_or_swir
    denominator = green_or_nir + nir_or_swir + EPSILON
    ndwi = np.divide(numerator, denominator, out=np.zeros_like(numerator, dtype=np.float32), where=denominator != 0)
    ndwi = np.clip(ndwi, -1.0, 1.0)

    if nodata_mask is not None:
        ndwi[nodata_mask] = np.nan

    return ndwi

def calculate_nbr(
    nir_band: np.ndarray,
    swir2_band: np.ndarray,
    nodata_mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Computes Normalized Burn Ratio (NBR):
    NBR = (NIR - SWIR2) / (NIR + SWIR2 + epsilon)
    Sensitive to burn severity and charcoal/soil exposure.
    """
    numerator = nir_band - swir2_band
    denominator = nir_band + swir2_band + EPSILON
    nbr = np.divide(numerator, denominator, out=np.zeros_like(numerator, dtype=np.float32), where=denominator != 0)
    nbr = np.clip(nbr, -1.0, 1.0)

    if nodata_mask is not None:
        nbr[nodata_mask] = np.nan

    return nbr

def calculate_difference(
    pre_index: np.ndarray,
    post_index: np.ndarray
) -> np.ndarray:
    """
    Computes difference (Delta = Pre - Post).
    A positive delta indicates loss of greenness/water/biomass.
    """
    return pre_index - post_index

def summarize_raster_statistics(raster: np.ndarray) -> Dict[str, float]:
    """
    Computes summary metrics ignoring NaN values.
    """
    valid = raster[~np.isnan(raster)]
    if len(valid) == 0:
        return {
            "mean": 0.0,
            "min": 0.0,
            "max": 0.0,
            "std": 0.0,
            "valid_pixel_count": 0
        }
    return {
        "mean": round(float(np.mean(valid)), 4),
        "min": round(float(np.min(valid)), 4),
        "max": round(float(np.max(valid)), 4),
        "std": round(float(np.std(valid)), 4),
        "valid_pixel_count": int(len(valid))
    }

def quantify_affected_area(
    mask_binary: np.ndarray,
    total_study_area_ha: float
) -> Tuple[float, float]:
    """
    Calculates estimated affected area in hectares and percentage of total study area.
    Returns (affected_area_ha, affected_area_percent).
    """
    total_pixels = mask_binary.size
    if total_pixels == 0:
        return (0.0, 0.0)

    affected_pixels = int(np.sum(mask_binary == 1))
    ratio = affected_pixels / float(total_pixels)
    affected_ha = round(ratio * total_study_area_ha, 3)
    percent = round(ratio * 100.0, 2)
    return (affected_ha, percent)


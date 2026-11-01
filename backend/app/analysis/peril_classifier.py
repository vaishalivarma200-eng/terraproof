"""
TerraProof Peril Classification Engine
Distinguishes between Flood, Waterlogging, Drought, Hail, Pest/Disease, and Normal Harvest.
Correlates multi-spectral indices (NDVI, NDWI), SAR backscatter, rainfall, and crop phenology.
"""

from typing import Dict, Any, Optional
from app.analysis.crop_calendar import assess_crop_season_context

def classify_damage_peril(
    claimed_peril: str,
    ndvi_baseline: float,
    ndvi_post: float,
    ndwi_post: float,
    rainfall_total_mm: Optional[float] = None,
    soil_moisture_avg: Optional[float] = None,
    sar_water_detected: bool = False,
    crop_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates spectral and meteorological evidence to classify the most probable peril.
    Verifies if observed damage aligns with claimed peril or suggests an alternative.
    """
    ndvi_drop = round(ndvi_baseline - ndvi_post, 3)
    rainfall = rainfall_total_mm if rainfall_total_mm is not None else 0.0
    soil_m = soil_moisture_avg if soil_moisture_avg is not None else 0.25

    # Check for Harvest false alarm first
    if crop_context and crop_context.get("is_harvest_window") and ndvi_drop > 0.25 and ndwi_post < -0.10 and rainfall < 15.0:
        return {
            "classified_peril": "NORMAL_HARVEST_SENESCENCE",
            "confidence": 0.85,
            "consistency_with_claim": "DISCORDANT",
            "spectral_signature": f"NDVI dropped by {ndvi_drop} with no standing water (NDWI: {ndwi_post:.2f}) and dry weather ({rainfall} mm).",
            "rationale": (
                "Spectral signature matches regular crop dry-down and harvest harvesting rather than catastrophic disaster. "
                "The timing directly coincides with the regional harvesting window."
            ),
            "recommended_action": "Verify with patwari / field surveyor whether crop was already harvested before the reported incident date."
        }

    # Flood: standing water + heavy precipitation or SAR specular attenuation
    if (ndwi_post > 0.0 or sar_water_detected) and rainfall >= 25.0:
        peril = "FLOOD"
        conf = 0.92 if (ndwi_post > 0.05 and rainfall > 40.0) else 0.82
        consistency = "CONSISTENT" if claimed_peril.lower() == "flood" else "DISCORDANT"
        rationale = f"Direct spectral water absorption (NDWI: {ndwi_post:.2f}) coupled with {rainfall} mm recorded precipitation."
        action = "Proceed with flood damage hectare quantification."

    # Waterlogging: standing or saturated soil post-event without flash-flood rainfall
    elif (ndwi_post > -0.05 or soil_m > 0.38) and ndvi_drop > 0.15:
        peril = "WATERLOGGING"
        conf = 0.80
        consistency = "CONSISTENT" if claimed_peril.lower() in ["flood", "waterlogging"] else "PARTIALLY_CONSISTENT"
        rationale = f"Elevated soil saturation (moisture: {soil_m:.2f} m³/m³) causing root hypoxia and chlorosis."
        action = "Assess drainage capacity and localized topographic depression."

    # Drought: acute greenness deficit with severe rainfall deficit
    elif ndvi_drop > 0.15 and rainfall < 15.0 and soil_m < 0.20:
        peril = "DROUGHT"
        conf = 0.84
        consistency = "CONSISTENT" if claimed_peril.lower() == "drought" else "DISCORDANT"
        rationale = f"Sustained canopy desiccation (-{ndvi_drop} NDVI) with severe rainfall deficit ({rainfall} mm recorded)."
        action = "Correlate with regional dry-spell index and neighboring block yields."

    # Hail: acute physical canopy shredding without standing water
    elif ndvi_drop > 0.30 and ndwi_post < -0.15 and rainfall >= 10.0:
        peril = "HAIL_DAMAGE_SUSPECTED"
        conf = 0.72
        consistency = "CONSISTENT" if claimed_peril.lower() in ["hail", "storm"] else "ALTERNATIVE_EXPLANATION"
        rationale = "Acute foliage biomass loss without standing water or soil inundation, typical of convective storm hail impact."
        action = "Review Doppler weather radar convective hail tracks and adjacent plot damage."

    # Pest / Disease: gradual vegetative stress with normal weather
    elif 0.12 <= ndvi_drop <= 0.25 and rainfall >= 20.0 and ndwi_post < 0.0:
        peril = "PEST_OR_PATHOGEN_SUSPECTED"
        conf = 0.68
        consistency = "DISCORDANT" if claimed_peril.lower() in ["flood", "drought"] else "POSSIBLE"
        rationale = "Localized canopy stress with normal rainfall and moisture conditions; not attributable to major weather shock."
        action = "Dispatch Krishi Vigyan Kendra (KVK) or ground scout for entomological/pathological inspection."

    else:
        peril = claimed_peril.upper() if claimed_peril else "INDETERMINATE"
        conf = 0.60
        consistency = "INCONCLUSIVE"
        rationale = f"Observed index change (-{ndvi_drop} NDVI) does not uniquely map to a single extreme weather peril."
        action = "Human adjuster review required."

    return {
        "classified_peril": peril,
        "confidence": conf,
        "consistency_with_claim": consistency,
        "spectral_signature": f"NDVI delta: -{ndvi_drop}, NDWI: {ndwi_post:.2f}, Rainfall: {rainfall} mm, Soil moisture: {soil_m:.2f}",
        "rationale": rationale,
        "recommended_action": action
    }


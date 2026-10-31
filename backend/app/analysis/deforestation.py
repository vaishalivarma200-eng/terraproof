import logging
from datetime import date
from typing import Dict, Any, List, Optional
import numpy as np
from app.core.config import settings
from app.geospatial.validation import validate_study_area
from app.geospatial.raster import generate_synthetic_sentinel2_bands, polygonize_raster_mask
from app.geospatial.indices import calculate_ndvi, summarize_raster_statistics, quantify_affected_area
from app.satellite.factory import get_satellite_provider

logger = logging.getLogger(__name__)

async def run_deforestation_analysis(
    boundary_geojson: Dict[str, Any],
    t1_date: date,
    t2_date: date,
    mode: Optional[str] = None
) -> Dict[str, Any]:
    """
    Module D: Deforestation and Land-Cover Change Monitoring.
    Measures canopy loss using multi-temporal bi-temporal optical differencing.
    In real mode (TERRAPROOF_MODE=real), streams real Sentinel-2 COG pixels.
    Never fabricates satellite data.
    """
    effective_mode = (mode or settings.TERRAPROOF_MODE).lower()

    validation = validate_study_area(boundary_geojson)
    if not validation.is_valid:
        raise ValueError(f"Study area validation failed: {validation.validation_message}")

    total_study_area_ha = validation.area_ha
    bbox = (validation.bbox.min_lon, validation.bbox.min_lat, validation.bbox.max_lon, validation.bbox.max_lat)

    provider = get_satellite_provider(override_mode=effective_mode)

    t1_scenes = await provider.search_scenes(bbox, t1_date, t1_date, max_cloud_cover=25.0)
    t2_scenes = await provider.search_scenes(bbox, t2_date, t2_date, max_cloud_cover=25.0)

    if effective_mode == "real":
        if not t1_scenes or not t2_scenes:
            missing = []
            if not t1_scenes: missing.append(f"T1 ({t1_date.isoformat()})")
            if not t2_scenes: missing.append(f"T2 ({t2_date.isoformat()})")
            return {
                "summary": f"Deforestation analysis inconclusive: No clear Sentinel-2 scenes available for {' and '.join(missing)}.",
                "verdict_recommendation": "INCONCLUSIVE_INSUFFICIENT_SATELLITE_DATA",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "estimated_affected_area_ha": 0.0,
                    "confidence_score": 0.0,
                    "confidence_rationale": "Missing clear satellite observations; no synthetic substitution in real mode.",
                    "weather_context": None
                },
                "observations_used": t1_scenes + t2_scenes,
                "limitations": ["Cloud cover or orbital gap prevented optical imagery acquisition."],
                "potential_inconsistencies": ["Satellite data unavailable for specified dates."],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: Planetary Computer STAC (No Clear Coverage)"
            }

        try:
            t1_stream = await provider.fetch_raster_bands(t1_scenes[0], bbox, ["B04", "B08"])
            t2_stream = await provider.fetch_raster_bands(t2_scenes[0], bbox, ["B04", "B08"])
            t1_bands = t1_stream["bands"]
            t2_bands = t2_stream["bands"]

            min_rows = min(t1_bands["B04"].shape[0], t2_bands["B04"].shape[0])
            min_cols = min(t1_bands["B04"].shape[1], t2_bands["B04"].shape[1])
            for k in list(t1_bands.keys()):
                t1_bands[k] = t1_bands[k][:min_rows, :min_cols]
            for k in list(t2_bands.keys()):
                t2_bands[k] = t2_bands[k][:min_rows, :min_cols]
            data_provenance = "REAL SATELLITE DATA: Microsoft Planetary Computer Sentinel-2 L2A (10m Surface Reflectance)"
        except Exception as e:
            logger.error(f"Failed to stream canopy bands: {str(e)}")
            return {
                "summary": f"Canopy change analysis failed: {str(e)}",
                "verdict_recommendation": "INCONCLUSIVE_DATA_RETRIEVAL_ERROR",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "estimated_affected_area_ha": 0.0,
                    "confidence_score": 0.0,
                    "confidence_rationale": str(e),
                    "weather_context": None
                },
                "observations_used": t1_scenes + t2_scenes,
                "limitations": [f"Raster streaming error: {str(e)}"],
                "potential_inconsistencies": [],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: COG Streaming Failed"
            }
    else:
        t1_bands = generate_synthetic_sentinel2_bands(bbox, scenario="healthy_crop")
        t2_bands = generate_synthetic_sentinel2_bands(bbox, scenario="deforested_bare_soil")
        data_provenance = "DEMO MODE: Synthetic observation fixture for testing"

    t1_ndvi = calculate_ndvi(t1_bands["B08"], t1_bands["B04"])
    t2_ndvi = calculate_ndvi(t2_bands["B08"], t2_bands["B04"])

    # Canopy loss: dramatic reduction in NDVI from forest (> 0.60) to bare ground (< 0.25)
    loss_delta = t1_ndvi - t2_ndvi
    deforestation_mask = (loss_delta > 0.35) & (t2_ndvi < 0.30)
    cleared_ha, cleared_pct = quantify_affected_area(deforestation_mask, total_study_area_ha)

    t1_stats = summarize_raster_statistics(t1_ndvi)
    t2_stats = summarize_raster_statistics(t2_ndvi)
    delta_stats = summarize_raster_statistics(loss_delta)

    overlay_geojson = polygonize_raster_mask(
        deforestation_mask,
        bbox,
        properties={"layer": "canopy_loss_detected", "severity": "high"}
    )

    if effective_mode == "real":
        c1 = t1_scenes[0].get("cloud_cover_percentage") or 10.0
        c2 = t2_scenes[0].get("cloud_cover_percentage") or 10.0
        confidence_score = round(max(0.40, min(0.95, 0.90 - (c1 + c2) / 200.0)), 2)
        confidence_rationale = f"Real Sentinel-2 pixels analyzed. T1 cloud: {c1:.1f}%, T2 cloud: {c2:.1f}%."
    else:
        confidence_score = 0.86
        confidence_rationale = "Distinct transition from high NIR reflectance (foliage) to elevated SWIR reflectance (bare soil)."

    return {
        "summary": (
            f"Detected approximately {cleared_ha} ha ({cleared_pct}% of area) exhibiting severe canopy loss "
            f"and conversion to exposed ground between {t1_date} and {t2_date}."
        ),
        "verdict_recommendation": "SIGNIFICANT_CANOPY_CLEARING_DETECTED" if cleared_ha > 0.5 else "STABLE_CANOPY_COVER",
        "metrics": {
            "baseline_index_mean": t1_stats["mean"],
            "post_event_index_mean": t2_stats["mean"],
            "index_delta_mean": delta_stats["mean"],
            "estimated_affected_area_ha": cleared_ha,
            "confidence_score": confidence_score,
            "confidence_rationale": confidence_rationale,
            "weather_context": None
        },
        "observations_used": t1_scenes + t2_scenes,
        "limitations": [
            "Cannot distinguish between licensed commercial forestry timber felling and illegal clearing without local cadastre data.",
            "Seasonal deciduous leaf-fall can mimic canopy loss if imagery is selected across disparate seasons.",
            "Prescribed burns or natural wildfires also produce abrupt spectral drops."
        ],
        "potential_inconsistencies": [],
        "overlays_geojson": overlay_geojson,
        "data_provenance": data_provenance
    }

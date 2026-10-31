import logging
from datetime import date
from typing import Dict, Any, List, Optional
import numpy as np
from app.core.config import settings
from app.geospatial.validation import validate_study_area
from app.geospatial.raster import generate_synthetic_sentinel2_bands, polygonize_raster_mask
from app.geospatial.indices import calculate_ndvi, summarize_raster_statistics, quantify_affected_area
from app.satellite.factory import get_satellite_provider, get_weather_provider

logger = logging.getLogger(__name__)

async def run_drought_analysis(
    boundary_geojson: Dict[str, Any],
    baseline_date: date,
    current_date: date,
    mode: Optional[str] = None
) -> Dict[str, Any]:
    """
    Module C: Drought and Crop-Stress Monitoring.
    Computes vegetation greenness index (NDVI) anomaly and rainfall deficit.
    In real mode (TERRAPROOF_MODE=real), streams real Sentinel-2 COG pixels and Open-Meteo precipitation.
    Never fabricates satellite data.
    """
    effective_mode = (mode or settings.TERRAPROOF_MODE).lower()

    validation = validate_study_area(boundary_geojson)
    if not validation.is_valid:
        raise ValueError(f"Study area validation failed: {validation.validation_message}")

    total_study_area_ha = validation.area_ha
    bbox = (validation.bbox.min_lon, validation.bbox.min_lat, validation.bbox.max_lon, validation.bbox.max_lat)

    provider = get_satellite_provider(override_mode=effective_mode)
    weather_provider = get_weather_provider()

    pre_scenes = await provider.search_scenes(bbox, baseline_date, baseline_date, max_cloud_cover=30.0)
    post_scenes = await provider.search_scenes(bbox, current_date, current_date, max_cloud_cover=30.0)

    weather_data = await weather_provider.get_historical_weather(
        latitude=validation.center_lat,
        longitude=validation.center_lon,
        start_date=baseline_date,
        end_date=current_date,
        mode=effective_mode
    )

    if effective_mode == "real":
        if not pre_scenes or not post_scenes:
            missing = []
            if not pre_scenes: missing.append(f"baseline ({baseline_date.isoformat()})")
            if not post_scenes: missing.append(f"current ({current_date.isoformat()})")
            return {
                "summary": f"Drought analysis inconclusive: No clear Sentinel-2 scenes available for {' and '.join(missing)}.",
                "verdict_recommendation": "INCONCLUSIVE_INSUFFICIENT_SATELLITE_DATA",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "estimated_affected_area_ha": 0.0,
                    "confidence_score": 0.0,
                    "confidence_rationale": "Missing clear satellite observations; no synthetic substitution in real mode.",
                    "weather_context": weather_data
                },
                "observations_used": pre_scenes + post_scenes,
                "limitations": ["Cloud cover or orbital gap prevented optical imagery acquisition."],
                "potential_inconsistencies": ["Satellite data unavailable for specified dates."],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: Planetary Computer STAC (No Clear Coverage)"
            }

        try:
            pre_stream = await provider.fetch_raster_bands(pre_scenes[0], bbox, ["B04", "B08"])
            post_stream = await provider.fetch_raster_bands(post_scenes[0], bbox, ["B04", "B08"])
            baseline_bands = pre_stream["bands"]
            current_bands = post_stream["bands"]

            min_rows = min(baseline_bands["B04"].shape[0], current_bands["B04"].shape[0])
            min_cols = min(baseline_bands["B04"].shape[1], current_bands["B04"].shape[1])
            for k in list(baseline_bands.keys()):
                baseline_bands[k] = baseline_bands[k][:min_rows, :min_cols]
            for k in list(current_bands.keys()):
                current_bands[k] = current_bands[k][:min_rows, :min_cols]
            data_provenance = "REAL SATELLITE DATA: Microsoft Planetary Computer Sentinel-2 L2A (10m Surface Reflectance)"
        except Exception as e:
            logger.error(f"Failed to stream drought bands: {str(e)}")
            return {
                "summary": f"Drought analysis failed: {str(e)}",
                "verdict_recommendation": "INCONCLUSIVE_DATA_RETRIEVAL_ERROR",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "estimated_affected_area_ha": 0.0,
                    "confidence_score": 0.0,
                    "confidence_rationale": str(e),
                    "weather_context": weather_data
                },
                "observations_used": pre_scenes + post_scenes,
                "limitations": [f"Raster streaming error: {str(e)}"],
                "potential_inconsistencies": [],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: COG Streaming Failed"
            }
    else:
        baseline_bands = generate_synthetic_sentinel2_bands(bbox, scenario="healthy_crop")
        current_bands = generate_synthetic_sentinel2_bands(bbox, scenario="drought_stressed")
        data_provenance = "DEMO MODE: Synthetic observation fixture for testing"

    baseline_ndvi = calculate_ndvi(baseline_bands["B08"], baseline_bands["B04"])
    current_ndvi = calculate_ndvi(current_bands["B08"], current_bands["B04"])

    # NDVI anomaly: baseline - current
    ndvi_drop = baseline_ndvi - current_ndvi
    # Stress threshold: drop > 0.18 and current NDVI < 0.40
    stress_mask = (ndvi_drop > 0.18) & (current_ndvi < 0.40)
    stressed_ha, stressed_pct = quantify_affected_area(stress_mask, total_study_area_ha)

    base_stats = summarize_raster_statistics(baseline_ndvi)
    curr_stats = summarize_raster_statistics(current_ndvi)
    drop_stats = summarize_raster_statistics(ndvi_drop)

    overlay_geojson = polygonize_raster_mask(
        stress_mask,
        bbox,
        properties={"layer": "crop_stress_anomaly", "severity": "moderate_to_severe"}
    )

    if effective_mode == "real":
        pre_c = pre_scenes[0].get("cloud_cover_percentage") or 10.0
        post_c = post_scenes[0].get("cloud_cover_percentage") or 10.0
        confidence_score = round(max(0.40, min(0.95, 0.90 - (pre_c + post_c) / 200.0)), 2)
        confidence_rationale = f"Real Sentinel-2 pixels analyzed. Baseline cloud: {pre_c:.1f}%, current cloud: {post_c:.1f}%."
    else:
        confidence_score = 0.79
        confidence_rationale = "Sustained canopy desiccation signature aligned with rainfall deficit."

    return {
        "summary": (
            f"Observed vegetation stress across {stressed_ha} ha ({stressed_pct}% of area). "
            f"Average NDVI decreased from {base_stats['mean']} to {curr_stats['mean']} (-{drop_stats['mean']})."
        ),
        "verdict_recommendation": "ELEVATED_VEGETATION_STRESS" if stressed_ha > 1.0 else "NORMAL_CANOPY_VARIABILITY",
        "metrics": {
            "baseline_index_mean": base_stats["mean"],
            "post_event_index_mean": curr_stats["mean"],
            "index_delta_mean": drop_stats["mean"],
            "estimated_affected_area_ha": stressed_ha,
            "confidence_score": confidence_score,
            "confidence_rationale": confidence_rationale,
            "weather_context": weather_data
        },
        "observations_used": pre_scenes + post_scenes,
        "limitations": [
            "NDVI is an optical measure of chlorophyll absorption, not a direct measurement of soil water content.",
            "Normal harvest schedules cause abrupt NDVI declines that must be cross-checked with planting calendars.",
            "Irrigated plots may display high greenness despite surrounding regional drought."
        ],
        "potential_inconsistencies": [],
        "overlays_geojson": overlay_geojson,
        "data_provenance": data_provenance
    }

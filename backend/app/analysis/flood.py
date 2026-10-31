import logging
from datetime import date
from typing import Dict, Any, List, Optional
import numpy as np
from app.core.config import settings
from app.geospatial.validation import validate_study_area
from app.geospatial.raster import generate_synthetic_sentinel2_bands, polygonize_raster_mask
from app.geospatial.indices import calculate_ndwi, summarize_raster_statistics, quantify_affected_area
from app.satellite.factory import get_satellite_provider, get_weather_provider

logger = logging.getLogger(__name__)

async def run_flood_analysis(
    boundary_geojson: Dict[str, Any],
    pre_event_date: date,
    post_event_date: date,
    mode: Optional[str] = None
) -> Dict[str, Any]:
    """
    Module B: Flood Detection and Surface Inundation Monitoring.
    Uses multi-spectral water delineation (McFeeters NDWI).
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

    pre_scenes = await provider.search_scenes(bbox, pre_event_date, pre_event_date, max_cloud_cover=30.0)
    post_scenes = await provider.search_scenes(bbox, post_event_date, post_event_date, max_cloud_cover=30.0)

    weather_data = await weather_provider.get_historical_weather(
        latitude=validation.center_lat,
        longitude=validation.center_lon,
        start_date=pre_event_date,
        end_date=post_event_date,
        mode=effective_mode
    )

    if effective_mode == "real":
        if not pre_scenes or not post_scenes:
            missing = []
            if not pre_scenes: missing.append(f"pre-event ({pre_event_date.isoformat()})")
            if not post_scenes: missing.append(f"post-event ({post_event_date.isoformat()})")
            return {
                "summary": f"Flood analysis inconclusive: No clear Sentinel-2 scenes available for {' and '.join(missing)}.",
                "verdict_recommendation": "INCONCLUSIVE_INSUFFICIENT_SATELLITE_DATA",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "estimated_affected_area_ha": 0.0,
                    "confidence_score": 0.0,
                    "confidence_rationale": "Missing clear satellite observations; no synthetic substitution permitted in real mode.",
                    "weather_context": weather_data
                },
                "observations_used": pre_scenes + post_scenes,
                "limitations": ["Cloud cover or orbital gap prevented optical imagery acquisition."],
                "potential_inconsistencies": ["Satellite data unavailable for specified dates."],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: Planetary Computer STAC (No Clear Coverage)"
            }

        try:
            pre_stream = await provider.fetch_raster_bands(pre_scenes[0], bbox, ["B03", "B08"])
            post_stream = await provider.fetch_raster_bands(post_scenes[0], bbox, ["B03", "B08"])
            pre_bands = pre_stream["bands"]
            post_bands = post_stream["bands"]

            min_rows = min(pre_bands["B03"].shape[0], post_bands["B03"].shape[0])
            min_cols = min(pre_bands["B03"].shape[1], post_bands["B03"].shape[1])
            for k in list(pre_bands.keys()):
                pre_bands[k] = pre_bands[k][:min_rows, :min_cols]
            for k in list(post_bands.keys()):
                post_bands[k] = post_bands[k][:min_rows, :min_cols]
            data_provenance = "REAL SATELLITE DATA: Microsoft Planetary Computer Sentinel-2 L2A (10m Surface Reflectance)"
        except Exception as e:
            logger.error(f"Failed to stream flood bands: {str(e)}")
            return {
                "summary": f"Flood analysis failed: {str(e)}",
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
        # Pre-event: dry/normal
        pre_bands = generate_synthetic_sentinel2_bands(bbox, scenario="healthy_crop")
        # Post-event: inundated
        post_bands = generate_synthetic_sentinel2_bands(bbox, scenario="flood_inundated")
        data_provenance = "DEMO MODE: Synthetic observation fixture for testing"

    pre_ndwi = calculate_ndwi(pre_bands["B03"], pre_bands["B08"], mode="mcfeeters")
    post_ndwi = calculate_ndwi(post_bands["B03"], post_bands["B08"], mode="mcfeeters")

    # Water threshold: McFeeters NDWI > 0.0, and change from baseline
    inundation_mask = (post_ndwi > 0.0) & (post_ndwi - pre_ndwi > 0.15)
    inundated_ha, inundated_pct = quantify_affected_area(inundation_mask, total_study_area_ha)

    pre_stats = summarize_raster_statistics(pre_ndwi)
    post_stats = summarize_raster_statistics(post_ndwi)

    overlay_geojson = polygonize_raster_mask(
        inundation_mask,
        bbox,
        properties={"layer": "flood_inundation", "confidence": "high"}
    )

    if effective_mode == "real":
        pre_c = pre_scenes[0].get("cloud_cover_percentage") or 10.0
        post_c = post_scenes[0].get("cloud_cover_percentage") or 10.0
        confidence_score = round(max(0.40, min(0.95, 0.90 - (pre_c + post_c) / 200.0)), 2)
        confidence_rationale = f"Real Sentinel-2 pixels analyzed. Pre-scene cloud: {pre_c:.1f}%, post-scene: {post_c:.1f}%."
    else:
        confidence_score = 0.85
        confidence_rationale = "High contrast between near-infrared absorption and green reflectance typical of standing water."

    return {
        "summary": (
            f"Detected {inundated_ha} ha ({inundated_pct}% of study area) showing active surface inundation "
            f"following the precipitation event."
        ),
        "verdict_recommendation": "SIGNIFICANT_INUNDATION_OBSERVED" if inundated_ha > 0.5 else "MINIMAL_INUNDATION_DETECTED",
        "metrics": {
            "baseline_index_mean": pre_stats["mean"],
            "post_event_index_mean": post_stats["mean"],
            "index_delta_mean": round(post_stats["mean"] - pre_stats["mean"], 4),
            "estimated_affected_area_ha": inundated_ha,
            "confidence_score": confidence_score,
            "confidence_rationale": confidence_rationale,
            "weather_context": weather_data
        },
        "observations_used": pre_scenes + post_scenes,
        "limitations": [
            "Dense vegetation canopies may mask standing water underneath (emergent vegetation limit).",
            "Smooth surfaces such as tarmac or flat rocks can produce low SAR backscatter similar to water.",
            "Cloud shadows can mimic water in single-date optical scenes; pre-post differencing mitigates this."
        ],
        "potential_inconsistencies": [],
        "overlays_geojson": overlay_geojson,
        "data_provenance": data_provenance
    }

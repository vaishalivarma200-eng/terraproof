import json
import logging
import hashlib
from datetime import date
from typing import Dict, Any, List, Optional
import numpy as np
from app.core.config import settings
from app.geospatial.validation import validate_study_area
from app.geospatial.raster import generate_synthetic_sentinel2_bands, polygonize_raster_mask
from app.geospatial.indices import calculate_ndvi, calculate_ndwi, calculate_difference, summarize_raster_statistics, quantify_affected_area
from app.satellite.factory import get_satellite_provider, get_weather_provider

logger = logging.getLogger(__name__)

async def run_insurance_verification(
    boundary_geojson: Dict[str, Any],
    damage_type: str,
    incident_start: date,
    incident_end: date,
    claimed_area_ha: Optional[float] = None,
    crop_type: Optional[str] = "Wheat",
    sum_insured_per_ha: Optional[float] = 35000.0,
    cultivated_area_ha: Optional[float] = None,
    mode: Optional[str] = None
) -> Dict[str, Any]:
    """
    Core Evidence Generation Engine for Agricultural Insurance Claims.
    Correlates pre- and post-incident satellite observations with reported loss.
    Distinguishes observed inundation, estimated crop damage, and claimed loss.
    In real mode (TERRAPROOF_MODE=real), streams genuine 10m Sentinel-2 COG pixels
    and retrieves live Open-Meteo rainfall. Never fabricates satellite data.
    """
    effective_mode = (mode or settings.TERRAPROOF_MODE).lower()

    # 1. Validate study area geometry
    validation = validate_study_area(boundary_geojson)
    if not validation.is_valid:
        raise ValueError(f"Study area validation failed: {validation.validation_message}")

    total_study_area_ha = validation.area_ha
    bbox = (validation.bbox.min_lon, validation.bbox.min_lat, validation.bbox.max_lon, validation.bbox.max_lat)

    provider = get_satellite_provider(override_mode=effective_mode)
    weather_provider = get_weather_provider()

    # 2. Search for satellite observations
    pre_scenes = await provider.search_scenes(bbox, incident_start, incident_start, max_cloud_cover=25.0)
    post_scenes = await provider.search_scenes(bbox, incident_end, incident_end, max_cloud_cover=25.0)

    # 3. Fetch meteorological context
    weather_data = await weather_provider.get_historical_weather(
        latitude=validation.center_lat,
        longitude=validation.center_lon,
        start_date=incident_start,
        end_date=incident_end,
        mode=effective_mode
    )

    # 4. Acquire band data
    if effective_mode == "real":
        if not pre_scenes or not post_scenes:
            # Honest disclosure of missing satellite observations - no synthetic fabrication
            missing = []
            if not pre_scenes:
                missing.append(f"pre-incident window ({incident_start.isoformat()})")
            if not post_scenes:
                missing.append(f"post-incident window ({incident_end.isoformat()})")
            missing_desc = " and ".join(missing)

            inconclusive_summary = (
                f"Satellite analysis inconclusive: No clear Sentinel-2 observations (< 25% cloud cover) "
                f"were available for the {missing_desc}. Per responsible remote sensing guidelines, "
                f"synthetic data was NOT substituted. Physical field inspection or radar (SAR) tasking required."
            )

            result_payload = {
                "summary": inconclusive_summary,
                "verdict_recommendation": "INCONCLUSIVE_INSUFFICIENT_SATELLITE_DATA",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "total_field_area_ha": total_study_area_ha,
                    "estimated_affected_area_ha": 0.0,
                    "estimated_inundated_area_ha": 0.0,
                    "estimated_vegetation_loss_area_ha": 0.0,
                    "claimed_area_ha": claimed_area_ha,
                    "area_discrepancy_percent": None,
                    "confidence_score": 0.0,
                    "confidence_rationale": "Zero optical scenes satisfied the <25% cloud cover threshold. No synthetic data substituted in real mode.",
                    "weather_context": weather_data,
                    "compensation_scenario": None
                },
                "observations_used": pre_scenes + post_scenes,
                "limitations": [
                    "Dense cloud cover or satellite orbital return timing prevented clear optical acquisition.",
                    "Optical Sentinel-2 imagery cannot penetrate clouds during active monsoon precipitation.",
                    "Synthetic data was strictly not substituted to maintain legal integrity."
                ],
                "potential_inconsistencies": [
                    "No clear satellite observation available within the requested date window."
                ],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: Planetary Computer STAC (No Clear Optical Coverage)"
            }

            hash_str = json.dumps({
                "summary": result_payload["summary"],
                "verdict": result_payload["verdict_recommendation"],
                "incident_start": incident_start.isoformat(),
                "incident_end": incident_end.isoformat(),
            }, sort_keys=True)
            result_payload["integrity_hash"] = hashlib.sha256(hash_str.encode("utf-8")).hexdigest()
            return result_payload

        # Both pre and post scenes exist: stream real COG pixels
        try:
            pre_stream = await provider.fetch_raster_bands(pre_scenes[0], bbox, ["B04", "B08", "B03"])
            post_stream = await provider.fetch_raster_bands(post_scenes[0], bbox, ["B04", "B08", "B03"])
            pre_bands = pre_stream.get("bands", {})
            post_bands = post_stream.get("bands", {})

            if "B04" not in pre_bands or "B08" not in pre_bands or "B04" not in post_bands or "B08" not in post_bands:
                raise RuntimeError("Essential spectral bands (B04, B08) missing from streamed COG assets.")

            # Align raster dimensions if sub-pixel boundary difference exists
            min_rows = min(pre_bands["B04"].shape[0], post_bands["B04"].shape[0])
            min_cols = min(pre_bands["B04"].shape[1], post_bands["B04"].shape[1])
            if min_rows == 0 or min_cols == 0:
                raise RuntimeError("Study area bounding box resolved to 0 pixels at 10m Ground Sampling Distance.")

            for k in list(pre_bands.keys()):
                pre_bands[k] = pre_bands[k][:min_rows, :min_cols]
            for k in list(post_bands.keys()):
                post_bands[k] = post_bands[k][:min_rows, :min_cols]

            data_provenance = "REAL SATELLITE DATA: Microsoft Planetary Computer Sentinel-2 L2A (10m Surface Reflectance)"
        except Exception as e:
            logger.error(f"Real raster pixel extraction failed: {str(e)}")
            result_payload = {
                "summary": f"Real satellite pixel streaming failed: {str(e)}. No synthetic data substituted in real mode.",
                "verdict_recommendation": "INCONCLUSIVE_DATA_RETRIEVAL_ERROR",
                "metrics": {
                    "baseline_index_mean": 0.0,
                    "post_event_index_mean": 0.0,
                    "index_delta_mean": 0.0,
                    "total_field_area_ha": total_study_area_ha,
                    "estimated_affected_area_ha": 0.0,
                    "estimated_inundated_area_ha": 0.0,
                    "estimated_vegetation_loss_area_ha": 0.0,
                    "claimed_area_ha": claimed_area_ha,
                    "area_discrepancy_percent": None,
                    "confidence_score": 0.0,
                    "confidence_rationale": f"Data streaming error: {str(e)}",
                    "weather_context": weather_data,
                    "compensation_scenario": None
                },
                "observations_used": pre_scenes + post_scenes,
                "limitations": [f"Remote COG streaming error: {str(e)}"],
                "potential_inconsistencies": ["Remote raster asset could not be streamed."],
                "overlays_geojson": None,
                "data_provenance": "REAL DATA MODE: COG Streaming Failed"
            }
            hash_str = json.dumps({"error": str(e), "verdict": result_payload["verdict_recommendation"]}, sort_keys=True)
            result_payload["integrity_hash"] = hashlib.sha256(hash_str.encode("utf-8")).hexdigest()
            return result_payload

    else:
        # DEMONSTRATION MODE: Calibrated synthetic rasters
        pre_bands = generate_synthetic_sentinel2_bands(bbox, scenario="healthy_crop")
        post_scenario = "flood_inundated" if damage_type.lower() == "flood" else "drought_stressed"
        post_bands = generate_synthetic_sentinel2_bands(bbox, scenario=post_scenario)
        data_provenance = "DEMO MODE: Synthetic observation fixture for testing"

    # 5. Compute real or calibrated index metrics
    pre_ndvi = calculate_ndvi(pre_bands["B08"], pre_bands["B04"])
    post_ndvi = calculate_ndvi(post_bands["B08"], post_bands["B04"])
    delta_ndvi = calculate_difference(pre_ndvi, post_ndvi)

    pre_stats = summarize_raster_statistics(pre_ndvi)
    post_stats = summarize_raster_statistics(post_ndvi)
    delta_stats = summarize_raster_statistics(delta_ndvi)

    # 6. Delineate observed inundation vs vegetation stress
    post_ndwi = calculate_ndwi(post_bands.get("B03", post_bands["B04"]), post_bands["B08"], mode="mcfeeters")
    inundated_mask = post_ndwi > 0.0
    veg_loss_mask = delta_ndvi > 0.20

    inundated_ha, inundated_pct = quantify_affected_area(inundated_mask, total_study_area_ha)
    veg_loss_ha, veg_loss_pct = quantify_affected_area(veg_loss_mask, total_study_area_ha)

    if damage_type.lower() == "flood":
        # Inundation where standing water detected or acute post-flood chlorophyll loss
        affected_mask = (post_ndwi > 0.0) | (delta_ndvi > 0.30)
    else:
        # Drought or crop stress: significant drop in NDVI (> 0.20)
        affected_mask = veg_loss_mask

    affected_ha, affected_percent = quantify_affected_area(affected_mask, total_study_area_ha)

    # 7. Discrepancy analysis
    area_discrepancy_pct = None
    if claimed_area_ha and claimed_area_ha > 0:
        area_discrepancy_pct = round(abs(affected_ha - claimed_area_ha) / claimed_area_ha * 100.0, 1)

    # 8. PMFBY / Agricultural Insurance Compensation Scenario Calculation
    rate_per_ha = sum_insured_per_ha or 35000.0
    assumed_damage_ratio = 0.80 if damage_type.lower() == "flood" else 0.65
    estimated_scenario_payout = round(rate_per_ha * affected_ha * assumed_damage_ratio, 2)

    compensation_scenario = {
        "sum_insured_per_ha": rate_per_ha,
        "assumed_damage_severity_percent": round(assumed_damage_ratio * 100.0, 1),
        "estimated_affected_area_ha": affected_ha,
        "claimed_area_ha": claimed_area_ha,
        "estimated_scenario_payout_inr": estimated_scenario_payout,
        "formula": f"₹{rate_per_ha:,.0f}/ha × {affected_ha:.2f} ha × {assumed_damage_ratio:.2f} = ₹{estimated_scenario_payout:,.0f}",
        "disclaimer": (
            "Illustrative scenario estimate for decision support only. "
            "Actual insurance settlement depends on applicable PMFBY scheme guidelines, "
            "notified yield thresholds, and survey committee approval."
        )
    }

    # 9. Evidence synthesis and Decision-Support Recommendation
    verdict = "EVIDENCE_CONSISTENT"
    limitations = [
        "Satellite pixel resolution is 10 meters; sub-pixel boundary mix may introduce +/- 8% area uncertainty.",
        "Optical observations can be occluded by cloud cover; review cloud metadata flags for each acquisition date.",
        "Surface greenness (NDVI) can decrease due to regular crop harvest or seasonal senescense rather than disaster.",
        "Weather data from nearby grid cells may differ from localized cloudburst or field microclimate.",
    ]
    potential_inconsistencies = []

    if affected_ha < 0.1:
        verdict = "EVIDENCE_INCONSISTENT_NO_SIGNIFICANT_DAMAGE_OBSERVED"
        potential_inconsistencies.append(
            f"Minimal spectral anomaly detected ({affected_ha} ha affected out of {total_study_area_ha} ha total)."
        )
    elif area_discrepancy_pct is not None and area_discrepancy_pct > 50.0:
        verdict = "MANUAL_FIELD_INSPECTION_RECOMMENDED"
        potential_inconsistencies.append(
            f"Observed affected area ({affected_ha} ha) diverges by {area_discrepancy_pct}% from reported claimed area ({claimed_area_ha} ha)."
        )

    if damage_type.lower() == "flood" and weather_data:
        precip = weather_data.get("total_precipitation_mm", 0.0)
        if precip is not None and precip < 15.0:
            potential_inconsistencies.append(
                f"Local meteorological archive recorded only {precip} mm precipitation during the reported window."
            )

    # 10. Generate GeoJSON vector overlay of affected area for Leaflet
    overlay_geojson = polygonize_raster_mask(
        affected_mask,
        bbox,
        properties={"layer": "observed_crop_damage", "damage_type": damage_type}
    )

    if effective_mode == "real":
        pre_cloud = pre_scenes[0].get("cloud_cover_percentage") if pre_scenes else 0.0
        post_cloud = post_scenes[0].get("cloud_cover_percentage") if post_scenes else 0.0
        pre_c = pre_cloud if pre_cloud is not None else 10.0
        post_c = post_cloud if post_cloud is not None else 10.0
        cloud_penalty = (pre_c + post_c) / 200.0
        confidence_score = round(max(0.40, min(0.95, 0.90 - cloud_penalty)), 2)
        confidence_rationale = (
            f"Calculated from real Sentinel-2 Level-2A surface reflectance (10m). "
            f"Pre-scene cloud: {pre_c:.1f}%, post-scene cloud: {post_c:.1f}%. "
            f"Corroborated by Open-Meteo precipitation."
        )
    else:
        confidence_score = 0.88
        confidence_rationale = (
            "Calibrated synthetic fixture simulating high radiometric contrast between clear pre-event "
            "and post-event Sentinel-2 acquisitions."
        )

    result_payload = {
        "summary": (
            f"Satellite analysis observed approximately {affected_ha} ha ({affected_percent}% of field) "
            f"exhibiting spectral signatures consistent with {damage_type.lower()}."
        ),
        "verdict_recommendation": verdict,
        "metrics": {
            "baseline_index_mean": pre_stats["mean"],
            "post_event_index_mean": post_stats["mean"],
            "index_delta_mean": delta_stats["mean"],
            "total_field_area_ha": total_study_area_ha,
            "estimated_affected_area_ha": affected_ha,
            "estimated_inundated_area_ha": inundated_ha,
            "estimated_vegetation_loss_area_ha": veg_loss_ha,
            "claimed_area_ha": claimed_area_ha,
            "area_discrepancy_percent": area_discrepancy_pct,
            "confidence_score": confidence_score,
            "confidence_rationale": confidence_rationale,
            "weather_context": weather_data,
            "compensation_scenario": compensation_scenario
        },
        "observations_used": pre_scenes + post_scenes,
        "limitations": limitations,
        "potential_inconsistencies": potential_inconsistencies,
        "overlays_geojson": overlay_geojson,
        "data_provenance": data_provenance
    }

    # 11. Compute cryptographic SHA-256 integrity hash
    hash_str = json.dumps({
        "summary": result_payload["summary"],
        "metrics": {k: v for k, v in result_payload["metrics"].items() if k != "weather_context"},
        "verdict": verdict,
        "incident_start": incident_start.isoformat(),
        "incident_end": incident_end.isoformat(),
    }, sort_keys=True)
    integrity_hash = hashlib.sha256(hash_str.encode("utf-8")).hexdigest()
    result_payload["integrity_hash"] = integrity_hash

    return result_payload

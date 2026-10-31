import asyncio
from datetime import date
from app.analysis.crop_calendar import assess_crop_season_context
from app.analysis.confidence_scorer import compute_confidence_breakdown
from app.analysis.peril_classifier import classify_damage_peril
from app.analysis.insurance import run_insurance_verification

def test_crop_calendar_phenology_and_harvest_risk():
    # Wheat in North India is harvested late March / April
    harvest_wheat = assess_crop_season_context("Wheat", date(2024, 4, 10))
    assert harvest_wheat["is_harvest_window"] is True
    assert harvest_wheat["harvest_false_alarm_risk"] == "HIGH"
    assert "HARVEST" in harvest_wheat["phenology_stage"]

    # Wheat in mid January is peak vegetative
    peak_wheat = assess_crop_season_context("Wheat", date(2024, 1, 25))
    assert peak_wheat["is_harvest_window"] is False
    assert peak_wheat["harvest_false_alarm_risk"] == "NEGLIGIBLE"
    assert peak_wheat["phenology_stage"] == "PEAK_VEGETATIVE_CANOPY"

    # Soybean in August is peak vegetative
    peak_soy = assess_crop_season_context("Soybean", date(2024, 8, 15))
    assert peak_soy["is_harvest_window"] is False
    assert peak_soy["current_season"] == "Kharif"

def test_confidence_scorer_five_pillars():
    # Large field, clear imagery, rapid observation
    conf_high = compute_confidence_breakdown(
        field_area_ha=8.5,
        pre_cloud_cover_pct=2.0,
        post_cloud_cover_pct=4.0,
        temporal_delta_days=2,
        weather_corroboration=True,
        has_exif_gps_match=True,
        damage_type="Flood",
        rainfall_mm=65.0
    )
    assert conf_high["total_score"] >= 80
    assert conf_high["grade"] == "HIGH_CONFIDENCE"
    assert "pillars" in conf_high
    assert conf_high["pillars"]["spatial_suitability"]["score"] == 20
    assert conf_high["pillars"]["spectral_quality"]["score"] == 25

    # Tiny parcel (< 0.5 ha), cloudy, delayed satellite pass
    conf_low = compute_confidence_breakdown(
        field_area_ha=0.35,
        pre_cloud_cover_pct=28.0,
        post_cloud_cover_pct=32.0,
        temporal_delta_days=15,
        weather_corroboration=False,
        has_exif_gps_match=False
    )
    assert conf_low["total_score"] < 50
    assert len(conf_low["limitations_disclosed"]) >= 3
    # Discloses resolution and temporal limits
    assert any("Small field" in lim or "Very small parcel" in lim for lim in conf_low["limitations_disclosed"])

def test_peril_classifier():
    # Flood: standing water + heavy rainfall
    flood = classify_damage_peril(
        claimed_peril="Flood",
        ndvi_baseline=0.72,
        ndvi_post=0.22,
        ndwi_post=0.12,
        rainfall_total_mm=55.0,
        soil_moisture_avg=0.42
    )
    assert flood["classified_peril"] == "FLOOD"
    assert flood["consistency_with_claim"] == "CONSISTENT"

    # Drought: acute greenness loss + severe rain deficit
    drought = classify_damage_peril(
        claimed_peril="Drought",
        ndvi_baseline=0.68,
        ndvi_post=0.32,
        ndwi_post=-0.22,
        rainfall_total_mm=4.0,
        soil_moisture_avg=0.12
    )
    assert drought["classified_peril"] == "DROUGHT"
    assert drought["consistency_with_claim"] == "CONSISTENT"

    # False alarm harvest test: drop during harvest calendar with dry weather
    crop_ctx = {"is_harvest_window": True}
    harvest = classify_damage_peril(
        claimed_peril="Flood",
        ndvi_baseline=0.75,
        ndvi_post=0.20,
        ndwi_post=-0.18,
        rainfall_total_mm=2.0,
        crop_context=crop_ctx
    )
    assert harvest["classified_peril"] == "NORMAL_HARVEST_SENESCENCE"
    assert harvest["consistency_with_claim"] == "DISCORDANT"

def test_insurance_verification_phase2_upgrades():
    boundary = {
        "type": "Polygon",
        "coordinates": [[
            [76.20, 27.10],
            [76.22, 27.10],
            [76.22, 27.12],
            [76.20, 27.12],
            [76.20, 27.10]
        ]]
    }

    result = asyncio.run(run_insurance_verification(
        boundary_geojson=boundary,
        damage_type="Flood",
        incident_start=date(2026, 7, 10),
        incident_end=date(2026, 7, 15),
        claimed_area_ha=8.4,
        crop_type="Soybean",
        crop_season="Kharif",
        state="Rajasthan",
        mode="demo"
    ))

    # 1. Zoned damage
    assert "zoned_damage" in result["metrics"]
    zd = result["metrics"]["zoned_damage"]
    assert "severe_damage_ha" in zd
    assert "moderate_damage_ha" in zd
    assert "mild_stress_ha" in zd
    assert "healthy_canopy_ha" in zd

    # 2. Confidence 0-100 breakdown
    assert "confidence_score_100" in result["metrics"]
    assert 0 <= result["metrics"]["confidence_score_100"] <= 100
    assert "confidence_breakdown" in result["metrics"]
    assert "pillars" in result["metrics"]["confidence_breakdown"]

    # 3. Peril classification
    assert "peril_classification" in result["metrics"]
    assert result["metrics"]["peril_classification"]["classified_peril"] == "FLOOD"

    # 4. Crop phenology context
    assert "crop_season_context" in result["metrics"]
    assert result["metrics"]["crop_season_context"]["crop_type"] == "Soybean"

    # 5. Payout range
    comp = result["metrics"]["compensation_scenario"]
    assert "min_payout_inr" in comp
    assert "max_payout_inr" in comp
    assert "payout_range_formatted" in comp
    assert comp["min_payout_inr"] <= comp["estimated_scenario_payout_inr"] <= comp["max_payout_inr"]

    # 6. Multi-tier zoned GeoJSON overlay
    assert "overlays_geojson" in result
    assert result["overlays_geojson"]["type"] == "FeatureCollection"
    assert len(result["overlays_geojson"]["features"]) > 0
    first_feat = result["overlays_geojson"]["features"][0]
    assert "severity_label" in first_feat["properties"]
    assert "color" in first_feat["properties"]

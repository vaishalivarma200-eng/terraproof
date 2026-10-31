import asyncio
from datetime import date
from app.satellite.factory import get_satellite_provider, get_weather_provider
from app.satellite.stac_provider import PlanetaryComputerSTACProvider
from app.satellite.mock_provider import DemonstrationSatelliteProvider
from app.analysis.insurance import run_insurance_verification

def test_demo_and_real_mode_separation():
    demo_provider = get_satellite_provider(override_mode="demo")
    assert isinstance(demo_provider, DemonstrationSatelliteProvider)
    assert demo_provider.get_provider_metadata()["mode"] == "demo"

    real_provider = get_satellite_provider(override_mode="real")
    assert isinstance(real_provider, PlanetaryComputerSTACProvider)
    assert real_provider.get_provider_metadata()["mode"] == "real"

def test_weather_provider_live_vs_demo():
    weather_provider = get_weather_provider()

    # Demo mode test
    demo_weather = asyncio.run(weather_provider.get_historical_weather(
        latitude=27.15,
        longitude=76.21,
        start_date=date(2023, 7, 10),
        end_date=date(2023, 7, 15),
        mode="demo"
    ))
    assert demo_weather is not None
    assert "DEMO MODE" in demo_weather.get("provenance", "")

    # Real mode test (queries live Open-Meteo API)
    real_weather = asyncio.run(weather_provider.get_historical_weather(
        latitude=27.15,
        longitude=76.21,
        start_date=date(2023, 7, 10),
        end_date=date(2023, 7, 15),
        mode="real"
    ))
    assert real_weather is not None
    assert real_weather.get("status") != "error"
    assert "REAL DATA" in real_weather.get("provenance", "")
    assert "total_precipitation_mm" in real_weather
    assert isinstance(real_weather["total_precipitation_mm"], float)

def test_insurance_verification_real_mode_truthful_non_fabrication():
    # Polygon in Alwar, Rajasthan
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

    # In real mode, if scenes are missing or occluded by monsoon clouds,
    # the system must NEVER substitute synthetic data.
    result = asyncio.run(run_insurance_verification(
        boundary_geojson=boundary,
        damage_type="Flood",
        incident_start=date(2023, 7, 12),
        incident_end=date(2023, 7, 13),
        claimed_area_ha=15.0,
        mode="real"
    ))

    assert "verdict_recommendation" in result
    assert "metrics" in result
    assert "data_provenance" in result
    assert "REAL" in result["data_provenance"]

    if result["verdict_recommendation"] == "INCONCLUSIVE_INSUFFICIENT_SATELLITE_DATA":
        assert result["metrics"]["confidence_score"] == 0.0
        assert result["metrics"]["estimated_affected_area_ha"] == 0.0
        assert "Never substituting synthetic rasters in real analysis mode" in result["summary"]
    else:
        assert result["metrics"]["confidence_score"] > 0.0
        assert "Sentinel-2" in result["data_provenance"]


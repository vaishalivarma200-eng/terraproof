"""
Unit tests for Step 4: What-If Scenario Simulator (River Rise, Rainfall, Breach, Reservoir, Land-Use).
"""

from app.analysis.scenario_simulator import (
    SimulationRequest,
    simulate_what_if_scenario,
    SIMULATION_DISCLAIMER
)

def test_river_stage_rise_simulation():
    req = SimulationRequest(
        scenario_type="RIVER_STAGE_RISE",
        water_level_rise_m=2.5
    )
    res = simulate_what_if_scenario(req)

    assert res.scenario_type == "RIVER_STAGE_RISE"
    assert res.baseline_water_ha == 12800.0
    assert res.simulated_water_ha > res.baseline_water_ha
    assert res.incremental_flooded_ha > 0.0
    assert res.cropland_affected_ha > 0.0

    # Sensitivity Range check (Low < Nominal < High)
    s_range = res.sensitivity_range
    assert s_range["low_estimate_ha"] < s_range["nominal_ha"] < s_range["high_estimate_ha"]
    assert s_range["confidence_band_pct"] == 15.0

    # Disclaimer check
    assert SIMULATION_DISCLAIMER in res.disclaimer

def test_proposed_reservoir_submergence_simulation():
    req = SimulationRequest(
        scenario_type="RESERVOIR_SUBMERGENCE",
        full_reservoir_level_m=86.5
    )
    res = simulate_what_if_scenario(req)

    assert res.scenario_type == "RESERVOIR_SUBMERGENCE"
    assert res.incremental_flooded_ha > 0.0
    assert len(res.comparison_table) >= 4
    assert res.inundation_geojson["type"] == "FeatureCollection"

def test_extreme_rainfall_runoff_simulation():
    req = SimulationRequest(
        scenario_type="EXTREME_RAINFALL",
        rainfall_mm=200.0
    )
    res = simulate_what_if_scenario(req)

    assert res.scenario_type == "EXTREME_RAINFALL"
    assert res.incremental_flooded_ha > 0.0
    assert any("SCS Curve Number" in a for a in res.assumptions)


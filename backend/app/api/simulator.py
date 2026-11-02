"""
What-If Scenario Simulator API Router.
Supports:
1. Indicative flood-fill simulations across water rise, rainfall, breach, reservoir, and land-use change.
2. Sensitivity range outputs (low, nominal, high).
3. Preset configurations for instant offline demonstration.
"""

from typing import Dict, Any, List
from fastapi import APIRouter
from app.analysis.scenario_simulator import (
    SimulationRequest,
    SimulationResponse,
    simulate_what_if_scenario,
    SIMULATION_DISCLAIMER
)

router = APIRouter(prefix="/simulator", tags=["What-If Scenario Simulator"])

@router.post("/run", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest):
    """Executes an indicative flood scenario simulation."""
    return simulate_what_if_scenario(req)

@router.get("/presets")
def get_simulation_presets():
    """Returns curated presets for demonstration."""
    return {
        "disclaimer": SIMULATION_DISCLAIMER,
        "presets": [
            {
                "id": "PRESET-RIVER-RISE-2M5",
                "label": "River Level Rise (+2.5 m)",
                "scenario_type": "RIVER_STAGE_RISE",
                "water_level_rise_m": 2.5,
                "description": "Simulates Brahmaputra river cresting +2.5m above danger level, flooding low-lying chars and floodplains."
            },
            {
                "id": "PRESET-RAINFALL-180MM",
                "label": "Extreme Monsoon Downpour (180 mm)",
                "scenario_type": "EXTREME_RAINFALL",
                "rainfall_mm": 180.0,
                "description": "24-hour intense cloudburst runoff across saturated agricultural soils (SCS-CN approximation)."
            },
            {
                "id": "PRESET-BREACH-MAYONG",
                "label": "Embankment Breach at Mayong (75 m)",
                "scenario_type": "EMBANKMENT_BREACH",
                "breach_width_m": 75.0,
                "breach_coordinate": [92.18, 26.31],
                "description": "Structural embankment rupture allowing rapid localized inundation into agricultural polder."
            },
            {
                "id": "PRESET-DAM-FRL-86M5",
                "label": "Proposed Reservoir Submergence (FRL 86.5 m)",
                "scenario_type": "RESERVOIR_SUBMERGENCE",
                "full_reservoir_level_m": 86.5,
                "dam_coordinate": [92.40, 26.35],
                "description": "Contour submergence evaluation for proposed irrigation/hydropower reservoir."
            },
            {
                "id": "PRESET-URBAN-EXPANSION",
                "label": "Peri-Urban Built-Up Expansion (+25%)",
                "scenario_type": "LAND_USE_CHANGE",
                "builtup_expansion_pct": 25.0,
                "description": "Evaluates increased runoff discharge caused by conversion of farmland to concrete/masonry."
            }
        ]
    }

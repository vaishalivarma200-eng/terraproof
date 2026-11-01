"""
TerraProof Crop Season & Phenological Calendar Intelligence
Provides agronomic phenology timelines for major Indian agro-ecological zones (Kharif, Rabi, Zaid).
Helps disambiguate real crop disaster damage from natural crop dry-down and regular harvesting senescence.
"""

from datetime import date
from typing import Dict, Any, Optional

CROP_CALENDARS: Dict[str, Dict[str, Any]] = {
    "wheat": {
        "seasons": ["Rabi"],
        "sowing_window": (10, 15, 12, 15),  # Oct 15 - Dec 15
        "peak_vegetative": (1, 15, 2, 28),   # Jan 15 - Feb 28
        "harvest_window": (3, 15, 4, 30),    # Mar 15 - Apr 30
        "expected_peak_ndvi": (0.65, 0.85),
        "post_harvest_ndvi": (0.15, 0.25),
        "primary_states": ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar"]
    },
    "soybean": {
        "seasons": ["Kharif"],
        "sowing_window": (6, 15, 7, 20),    # Jun 15 - Jul 20
        "peak_vegetative": (8, 1, 9, 15),    # Aug 1 - Sep 15
        "harvest_window": (9, 25, 11, 10),   # Sep 25 - Nov 10
        "expected_peak_ndvi": (0.60, 0.82),
        "post_harvest_ndvi": (0.15, 0.25),
        "primary_states": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka"]
    },
    "rice": {
        "seasons": ["Kharif", "Rabi"],
        "sowing_window": (6, 1, 7, 31),     # Kharif sowing
        "peak_vegetative": (8, 15, 10, 15),
        "harvest_window": (10, 20, 12, 10),  # Oct 20 - Dec 10
        "expected_peak_ndvi": (0.65, 0.88),
        "post_harvest_ndvi": (0.15, 0.28),
        "primary_states": ["Punjab", "West Bengal", "Uttar Pradesh", "Andhra Pradesh", "Odisha", "Bihar"]
    },
    "paddy": {
        "seasons": ["Kharif", "Rabi"],
        "sowing_window": (6, 1, 7, 31),
        "peak_vegetative": (8, 15, 10, 15),
        "harvest_window": (10, 20, 12, 10),
        "expected_peak_ndvi": (0.65, 0.88),
        "post_harvest_ndvi": (0.15, 0.28),
        "primary_states": ["Punjab", "West Bengal", "Uttar Pradesh", "Andhra Pradesh", "Odisha"]
    },
    "cotton": {
        "seasons": ["Kharif"],
        "sowing_window": (5, 1, 6, 30),
        "peak_vegetative": (7, 15, 10, 1),
        "harvest_window": (10, 15, 1, 15),   # Long picking window
        "expected_peak_ndvi": (0.55, 0.78),
        "post_harvest_ndvi": (0.20, 0.30),
        "primary_states": ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Haryana", "Punjab"]
    },
    "mustard": {
        "seasons": ["Rabi"],
        "sowing_window": (9, 25, 10, 31),
        "peak_vegetative": (12, 1, 1, 31),
        "harvest_window": (2, 15, 3, 31),    # Feb 15 - Mar 31
        "expected_peak_ndvi": (0.60, 0.80),
        "post_harvest_ndvi": (0.15, 0.22),
        "primary_states": ["Rajasthan", "Haryana", "Madhya Pradesh", "Uttar Pradesh"]
    },
    "maize": {
        "seasons": ["Kharif", "Rabi"],
        "sowing_window": (6, 15, 7, 15),
        "peak_vegetative": (7, 25, 9, 10),
        "harvest_window": (9, 20, 10, 31),
        "expected_peak_ndvi": (0.60, 0.82),
        "post_harvest_ndvi": (0.18, 0.25),
        "primary_states": ["Karnataka", "Madhya Pradesh", "Bihar", "Rajasthan", "Telangana"]
    },
    "gram": {
        "seasons": ["Rabi"],
        "sowing_window": (10, 1, 11, 15),
        "peak_vegetative": (12, 15, 2, 15),
        "harvest_window": (3, 1, 4, 15),
        "expected_peak_ndvi": (0.55, 0.75),
        "post_harvest_ndvi": (0.15, 0.22),
        "primary_states": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"]
    }
}

def _is_date_in_window(d: date, window: tuple) -> bool:
    """Checks if a date falls within (start_month, start_day, end_month, end_day)."""
    sm, sd, em, ed = window
    m, day = d.month, d.day
    if sm <= em:
        return (m > sm or (m == sm and day >= sd)) and (m < em or (m == em and day <= ed))
    else:
        # Crosses calendar year (e.g. Oct to Jan)
        return (m > sm or (m == sm and day >= sd)) or (m < em or (m == em and day <= ed))

def assess_crop_season_context(
    crop_type: Optional[str],
    observation_date: date,
    state: Optional[str] = None,
    season_tag: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates whether an observation falls in expected sowing, peak, or harvest windows.
    Detects whether an NDVI decline might simply be seasonal crop harvest rather than catastrophe.
    """
    crop_key = (crop_type or "").lower().strip()
    cal = CROP_CALENDARS.get(crop_key)

    if not cal:
        # Generic calendar estimate based on Indian agricultural seasons
        month = observation_date.month
        inferred_season = "Kharif" if 6 <= month <= 10 else ("Rabi" if (11 <= month or month <= 4) else "Zaid")
        return {
            "crop_type": crop_type or "Unknown",
            "calendar_available": False,
            "inferred_season": inferred_season,
            "phenology_stage": "GENERAL_GROWING_SEASON",
            "is_harvest_window": False,
            "harvest_false_alarm_risk": "LOW",
            "advisory_notes": "Generic agro-climatic assessment applied (crop-specific profile not in database)."
        }

    is_harvest = _is_date_in_window(observation_date, cal["harvest_window"])
    is_sowing = _is_date_in_window(observation_date, cal["sowing_window"])
    is_peak = _is_date_in_window(observation_date, cal["peak_vegetative"])

    stage = "VEGETATIVE_CYCLE"
    if is_harvest:
        stage = "MATURITY_AND_HARVEST"
    elif is_sowing:
        stage = "SOWING_AND_EMERGENCE"
    elif is_peak:
        stage = "PEAK_VEGETATIVE_CANOPY"

    # Harvest false alarm risk
    if is_harvest:
        risk = "HIGH"
        notes = (
            f"Observation date ({observation_date.isoformat()}) falls inside the typical harvesting window "
            f"for {crop_type.title()} in Northern/Central India. A sudden steep drop in NDVI during this period "
            f"is commonly caused by legitimate mechanical or manual harvest rather than natural disaster. "
            f"Physical ground auditor inspection is recommended before approving total crop loss."
        )
    elif is_sowing:
        risk = "LOW"
        notes = f"Crop is in early sowing/emergence stage. Low baseline greenness is normal and not indicative of damage."
    else:
        risk = "NEGLIGIBLE"
        notes = f"Crop should normally exhibit peak vegetative canopy. Significant spectral drops indicate actual physiological stress or event damage."

    return {
        "crop_type": crop_type.title(),
        "calendar_available": True,
        "standard_seasons": cal["seasons"],
        "current_season": season_tag or cal["seasons"][0],
        "phenology_stage": stage,
        "is_harvest_window": is_harvest,
        "is_sowing_window": is_sowing,
        "is_peak_window": is_peak,
        "expected_peak_ndvi_range": cal["expected_peak_ndvi"],
        "harvest_false_alarm_risk": risk,
        "advisory_notes": notes
    }


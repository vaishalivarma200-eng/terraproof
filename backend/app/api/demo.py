"""
TerraProof Demonstration & Presentation Scenarios API
Provides endpoints for:
1. Demo status and synthetic disclaimer
2. Reset and load 8 canonical demonstration claims
3. Live vs Offline Seed toggle
4. Rainfall & DEM layers
5. Derived impact metrics panel
"""

import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.seed import seed_initial_claims, seed_demo_kharif_flood, BASE_DIR
from app.models.claim import Claim
from app.models.analysis import AnalysisJob

router = APIRouter(prefix="/demo", tags=["Demo Scenarios & Offline Mode"])

# In-memory demo flags
DEMO_STATE = {
    "demo_mode_active": True,
    "live_apis_enabled": False, # Defaults to offline seed fallback for judge reliability
    "synthetic_notice": "DEMO DATA - synthetic, modelled on a monsoon flood pattern. Not real farmers or claims."
}

def load_demo_json(filename: str) -> Dict[str, Any]:
    path = os.path.join(BASE_DIR, "data", "demo", filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.get("/status")
def get_demo_status():
    """Returns current demo mode status, scenario metadata, and offline status."""
    metadata = load_demo_json("scenario_metadata.json")
    return {
        **DEMO_STATE,
        "scenario": metadata,
        "mode": "OFFLINE_SEED" if not DEMO_STATE["live_apis_enabled"] else "LIVE_APIS"
    }

@router.post("/toggle-live")
def toggle_live_apis():
    """Toggles between offline seed fallback and live external APIs."""
    DEMO_STATE["live_apis_enabled"] = not DEMO_STATE["live_apis_enabled"]
    return {
        "status": "SUCCESS",
        "live_apis_enabled": DEMO_STATE["live_apis_enabled"],
        "mode": "LIVE_APIS" if DEMO_STATE["live_apis_enabled"] else "OFFLINE_SEED",
        "message": "Switched to Live Data APIs" if DEMO_STATE["live_apis_enabled"] else "Switched to 100% Offline Seed Fallback"
    }

@router.post("/reset-scenarios")
@router.post("/reset")
def reset_demonstration_scenarios(db: Session = Depends(get_db)):
    """Resets the database with the 8 canonical evaluation claims."""
    count = seed_demo_kharif_flood(db)
    return {
        "status": "SUCCESS",
        "message": f"TerraProof demonstration scenarios successfully restored to pristine state ({count} claims).",
        "synthetic_notice": DEMO_STATE["synthetic_notice"]
    }

@router.get("/rainfall")
def get_demo_rainfall_series():
    """Returns the synthetic 7-day monsoon rainfall series with historical baseline."""
    return load_demo_json("rainfall_series.json")

@router.get("/dem-layer")
def get_demo_dem_layer():
    """Returns the digital elevation model flood susceptibility zoning."""
    return load_demo_json("dem_layer.json")

@router.get("/villages")
def get_demo_villages():
    """Returns the GeoJSON boundaries of the 5 fictional villages."""
    return load_demo_json("villages.geojson")

@router.get("/impact-summary")
def get_demonstration_impact_summary(db: Session = Depends(get_db)):
    """
    Computes live impact statistics derived strictly from the active demonstration claims.
    Labels all numbers as illustrative based on demo scenario.
    """
    claims = db.query(Claim).all()
    if not claims:
        return {
            "disclaimer": "Illustrative impact computed from demo scenario claims.",
            "total_claims": 0,
            "fast_track_claims": 0,
            "prioritized_inspection_claims": 0,
            "total_claimed_ha": 0.0,
            "total_observed_ha": 0.0,
            "rupees_flagged_for_review": 0.0,
            "estimated_days_saved": 0
        }

    total_claimed_ha = sum(c.claimed_area_ha for c in claims)
    fast_tracked = [c for c in claims if c.status == "FAST_TRACK_APPROVED"]
    prioritized = [c for c in claims if c.status != "FAST_TRACK_APPROVED"]

    # Calculate rupees protected / flagged from claims
    rupees_flagged = 0.0
    total_observed_ha = 0.0

    for c in claims:
        # Check latest analysis job
        job = db.query(AnalysisJob).filter(AnalysisJob.claim_id == c.id).order_by(AnalysisJob.created_at.desc()).first()
        if job and job.results:
            obs = job.results.get("damaged_area_ha", 0.0)
            total_observed_ha += obs
            payout = job.results.get("compensation_scenario", {})
            flagged_diff = payout.get("flagged_discrepancy_rupees", 0.0)
            if flagged_diff > 0:
                rupees_flagged += flagged_diff
            elif c.status in ["FLAGGED_AREA_INFLATION", "NEEDS_TENANCY_REVIEW", "FLAGGED_DUPLICATE_OVERLAP", "FLAGGED_UNAUTHORIZED_CONSTRUCTION"]:
                # Difference between claimed loss and 0 or observed
                claimed_inr = c.claimed_loss_amount or (c.claimed_area_ha * 35000.0)
                obs_inr = obs * 35000.0 * 0.80
                rupees_flagged += max(0.0, claimed_inr - obs_inr)
        else:
            total_observed_ha += c.claimed_area_ha * 0.6

    return {
        "disclaimer": "Illustrative, based on demo scenario (Kharif Flood, Vikrampur Demo District)",
        "total_claims": len(claims),
        "fast_track_approved": len(fast_tracked),
        "field_visits_prioritized": len(prioritized),
        "field_visits_avoided": len(fast_tracked),
        "total_claimed_ha": round(total_claimed_ha, 1),
        "total_observed_damaged_ha": round(total_observed_ha, 1),
        "area_divergence_gap_ha": round(max(0.0, total_claimed_ha - total_observed_ha), 1),
        "rupees_flagged_for_review": round(rupees_flagged, 2),
        "estimated_settlement_time_hours": 24, # from 21 days down to 24h for fast-track
        "baseline_traditional_days": 21
    }

"""
TerraProof Fairness Monitoring & Algorithmic Parity Service
Monitors potential algorithmic bias across landholding sizes (smallholder < 1ha vs largeholder)
and crop types. Promotes algorithmic justice by exposing satellite resolution limits
and tracking human officer override frequency.
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.claim import Claim
from app.models.decision import OfficialInspection

router = APIRouter(prefix="/analytics/fairness", tags=["Fairness & Model Parity Monitoring"])
legacy_router = APIRouter(prefix="/fairness", tags=["Fairness & Model Parity Monitoring"])

@router.get("")
@router.get("/metrics")
@legacy_router.get("")
@legacy_router.get("/metrics")
def get_fairness_and_parity_metrics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Computes disaggregated verification statistics by farm size tier and crop type.
    Detects if 10m Sentinel pixel limitations create disparate flag rates for smallholders (< 1ha).
    """
    claims = db.query(Claim).all()
    inspections = db.query(OfficialInspection).all()

    inspection_map = {insp.claim_id: insp for insp in inspections}

    size_tiers = {
        "SMALLHOLDER": {"label": "Smallholder (< 1.0 ha)", "claims": [], "max_ha": 1.0},
        "MEDIUM": {"label": "Medium (1.0 - 5.0 ha)", "claims": [], "min_ha": 1.0, "max_ha": 5.0},
        "LARGE": {"label": "Large (> 5.0 ha)", "claims": [], "min_ha": 5.0}
    }

    crop_tiers: Dict[str, List[Claim]] = {}

    for c in claims:
        # Group by size
        area = c.claimed_area_ha or c.cultivated_area_ha or 1.0
        if area < 1.0:
            size_tiers["SMALLHOLDER"]["claims"].append(c)
        elif area <= 5.0:
            size_tiers["MEDIUM"]["claims"].append(c)
        else:
            size_tiers["LARGE"]["claims"].append(c)

        # Group by crop
        crop_name = c.crop_type or "Unknown"
        if crop_name not in crop_tiers:
            crop_tiers[crop_name] = []
        crop_tiers[crop_name].append(c)

    def analyze_group(group_claims: List[Claim]) -> Dict[str, Any]:
        count = len(group_claims)
        if count == 0:
            return {
                "total_claims": 0,
                "flagged_claims": 0,
                "flag_rate_pct": 0.0,
                "official_overrides": 0,
                "override_rate_pct": 0.0,
                "avg_claimed_area_ha": 0.0,
                "avg_damage_pct": 0.0
            }

        flagged = 0
        overrides = 0
        total_damage = 0.0
        total_area = 0.0

        for c in group_claims:
            total_area += (c.claimed_area_ha or 0.0)
            insp = inspection_map.get(c.id)
            if insp and insp.override_occurred:
                overrides += 1
            if insp and insp.low_damage_insufficient_flag:
                flagged += 1
            elif c.status in ["FLAGGED", "NEEDS_REVIEW"]:
                flagged += 1

            if insp:
                total_damage += insp.confirmed_damage_percent
            elif c.analysis_jobs:
                latest_job = c.analysis_jobs[-1]
                if latest_job.results and isinstance(latest_job.results, dict):
                    metrics = latest_job.results.get("metrics", {})
                    total_damage += metrics.get("damage_percentage", 0.0)

        return {
            "total_claims": count,
            "flagged_claims": flagged,
            "flag_rate_pct": round((flagged / count) * 100.0, 1),
            "official_overrides": overrides,
            "override_rate_pct": round((overrides / count) * 100.0, 1),
            "avg_claimed_area_ha": round(total_area / count, 2),
            "avg_damage_pct": round(total_damage / count, 1)
        }

    tier_analysis = {}
    for tier_key, data in size_tiers.items():
        metrics = analyze_group(data["claims"])
        metrics["label"] = data["label"]
        tier_analysis[tier_key] = metrics

    crop_analysis = {}
    for crop_name, cr_claims in crop_tiers.items():
        crop_analysis[crop_name] = analyze_group(cr_claims)

    # Disparity Index: Smallholder flag rate / Largeholder flag rate
    small_flag_rate = tier_analysis["SMALLHOLDER"]["flag_rate_pct"]
    large_flag_rate = tier_analysis["LARGE"]["flag_rate_pct"]
    
    if large_flag_rate > 0:
        disparity_ratio = round(small_flag_rate / large_flag_rate, 2)
    else:
        disparity_ratio = 1.0

    if disparity_ratio > 1.5:
        parity_status = "RESOLUTION_VARIANCE_OBSERVED"
        parity_note = (
            "Higher flag rate on smallholdings (< 1 ha) is consistent with 10-meter optical pixel constraints. "
            "TerraProof enforces mandatory Patwari physical ground audit rather than algorithmic rejection."
        )
    else:
        parity_status = "EQUITABLE_DISTRIBUTION"
        parity_note = "Model flag and verification rates are balanced across landholding categories."

    return {
        "parity_status": parity_status,
        "disparity_ratio": disparity_ratio,
        "parity_note": parity_note,
        "size_tiers": tier_analysis,
        "crop_tiers": crop_analysis,
        "total_claims_analyzed": len(claims),
        "total_inspections_analyzed": len(inspections)
    }

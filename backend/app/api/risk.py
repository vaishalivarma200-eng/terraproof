"""
TerraProof Risk & Land-Use Change API Routes
Provides endpoints for:
1. Multi-factor claim fraud & discrepancy scoring
2. Land-use change detection (unauthorized construction / clearing on farm parcels)
3. Cadastral boundary spatial overlap check
4. Village/District inspection triage priority ranking
"""

from typing import Dict, Any, List, Optional
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.claim import Claim
from app.models.analysis import AnalysisJob
from app.models.document import LandDocument
from app.analysis.risk_engine import compute_claim_risk_score, check_boundary_overlap
from app.analysis.land_use_change import detect_land_use_change
from app.adapters.agristack_dcs import AgriStackDCSAdapter

router = APIRouter(prefix="/risk", tags=["Risk Engine & Land-Use Change"])
agristack_adapter = AgriStackDCSAdapter()

class LandUseChangeRequest(BaseModel):
    claim_id: Optional[str] = None
    boundary_geojson: Optional[Dict[str, Any]] = None
    baseline_date: Optional[date] = None
    current_date: Optional[date] = None

class SpatialOverlapCheckRequest(BaseModel):
    boundary_geojson: Dict[str, Any]
    exclude_claim_id: Optional[str] = None

@router.get("/claim/{claim_id}")
async def evaluate_claim_risk(claim_id: str, db: Session = Depends(get_db)):
    """
    Evaluates 7-factor transparent risk score for a claim:
    Area divergence, crop mismatch, boundary overlap, claimant velocity,
    photo geotag, document integrity, and regional consistency.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    # 1. Fetch latest analysis job if available
    latest_job = db.query(AnalysisJob).filter(
        AnalysisJob.claim_id == claim_id,
        AnalysisJob.status == "COMPLETED"
    ).order_by(AnalysisJob.created_at.desc()).first()

    observed_ha = 0.0
    if latest_job and latest_job.result_metrics:
        observed_ha = latest_job.result_metrics.get("damaged_area_ha", 0.0)
    else:
        # Default estimation based on claimed area
        observed_ha = round(claim.claimed_area_ha * 0.7, 2)

    # 2. Fetch official crop from AgriStack DCS
    khasra = claim.khasra_no or "142/1"
    dcs_rec = await agristack_adapter.get_crop_sown_record(khasra_no=khasra, district=claim.district)
    survey_crop = dcs_rec.crop_name if dcs_rec else None

    # 3. Check boundary overlap against other claims in district
    other_claims = db.query(Claim).filter(
        Claim.id != claim_id,
        Claim.boundary_geojson.isnot(None)
    ).all()
    other_geometries = [c.boundary_geojson for c in other_claims if c.boundary_geojson]

    # 4. Check claimant velocity (claims by same farmer name or masked ref)
    prior_claims_count = db.query(Claim).filter(
        (Claim.farmer_name == claim.farmer_name) |
        (Claim.masked_aadhaar_ref == claim.masked_aadhaar_ref)
    ).count()

    # 5. Check photo verification status
    photo_status = "INSIDE"
    if claim.field_photos and len(claim.field_photos) > 0:
        p0 = claim.field_photos[0]
        photo_status = p0.get("status_label", "INSIDE")

    # 6. Check document verification report
    doc_report = None
    latest_doc = db.query(LandDocument).filter(LandDocument.claim_id == claim_id).first()
    if latest_doc and latest_doc.verification_report:
        doc_report = latest_doc.verification_report

    # Compute risk score
    risk_result = compute_claim_risk_score(
        claimed_area_ha=claim.claimed_area_ha,
        observed_damaged_area_ha=observed_ha,
        claimant_name=claim.farmer_name,
        crop_type=claim.crop_type,
        survey_crop_type=survey_crop,
        boundary_geojson=claim.boundary_geojson,
        other_claim_geometries=other_geometries,
        prior_claims_by_farmer=prior_claims_count,
        photo_verification_status=photo_status,
        document_verification_report=doc_report
    )

    # Persist score on claim
    claim.risk_score = float(risk_result["composite_risk_score"])
    claim.risk_tier = risk_result["risk_tier"]
    claim.risk_signals = risk_result
    db.commit()

    return {
        "claim_id": claim.id,
        "reference_no": claim.reference_no,
        "farmer_name": claim.farmer_name,
        **risk_result
    }

@router.post("/detect-land-use-change")
def detect_change_endpoint(req: LandUseChangeRequest, db: Session = Depends(get_db)):
    """
    Detects unauthorized non-agricultural construction, roads, or clearing
    on a farmland parcel over a multi-temporal baseline window.
    """
    geom = req.boundary_geojson
    khasra = "142/1"
    village = "Wadgaon"
    district = "Akola"

    claim = None
    if req.claim_id:
        claim = db.query(Claim).filter(Claim.id == req.claim_id).first()
        if claim:
            geom = claim.boundary_geojson
            khasra = claim.khasra_no or khasra
            district = claim.district or district

    if not geom:
        raise HTTPException(status_code=400, detail="Parcel boundary_geojson or valid claim_id is required.")

    # Defaults: 1 year baseline
    today = date.today()
    current_d = req.current_date or today
    baseline_d = req.baseline_date or (today - timedelta(days=365))

    change_res = detect_land_use_change(
        boundary_geojson=geom,
        baseline_date=baseline_d,
        current_date=current_d,
        parcel_khasra_no=khasra,
        village=village,
        district=district
    )

    # Save to claim if present
    if claim:
        claim.land_use_change_flags = change_res
        db.commit()

    return change_res

@router.post("/spatial-overlap-check")
def check_overlap_endpoint(req: SpatialOverlapCheckRequest, db: Session = Depends(get_db)):
    """
    Checks if a drawn field boundary geometrically intersects existing registered claims.
    """
    query = db.query(Claim).filter(Claim.boundary_geojson.isnot(None))
    if req.exclude_claim_id:
        query = query.filter(Claim.id != req.exclude_claim_id)

    existing = [c.boundary_geojson for c in query.all() if c.boundary_geojson]
    overlap_info = check_boundary_overlap(req.boundary_geojson, existing)
    return overlap_info

@router.get("/village-triage/{district}/{village}")
def get_village_triage_queue(district: str, village: str, db: Session = Depends(get_db)):
    """
    Pre-screens and prioritizes claims in a village by risk score and time sensitivity
    so Patwaris and Adjusters can prioritize which fields to inspect first.
    """
    claims = db.query(Claim).filter(
        Claim.district.ilike(f"%{district}%")
    ).all()

    queue = []
    for c in claims:
        r_score = c.risk_score if c.risk_score is not None else 25.0
        r_tier = c.risk_tier or "LOW_RISK"

        # Priority calculation: High risk + large claimed area = top priority
        inspection_priority = "ROUTINE"
        if r_score >= 65:
            inspection_priority = "URGENT_AUDIT"
        elif r_score >= 35 or c.claimed_area_ha > 10.0:
            inspection_priority = "RECOMMENDED"

        queue.append({
            "claim_id": c.id,
            "reference_no": c.reference_no,
            "farmer_name": c.farmer_name,
            "crop_type": c.crop_type,
            "claimed_area_ha": c.claimed_area_ha,
            "risk_score": r_score,
            "risk_tier": r_tier,
            "inspection_priority": inspection_priority,
            "khasra_no": c.khasra_no or "101/1",
            "status": c.status,
            "submitted_at": c.created_at
        })

    # Sort by risk score descending (highest risk first)
    queue.sort(key=lambda x: x["risk_score"], reverse=True)

    return {
        "district": district,
        "village": village,
        "total_claims": len(queue),
        "urgent_audits_count": len([q for q in queue if q["inspection_priority"] == "URGENT_AUDIT"]),
        "triage_queue": queue
    }


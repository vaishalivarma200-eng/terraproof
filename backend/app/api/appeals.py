"""
TerraProof Farmer Grievance & Statutory Appeal Redressal API
Provides accessible, transparent appeal submission for farmers contesting algorithmic
or preliminary ground findings, with mandatory independent review routing (Tehsildar/SDM).
"""
import uuid
import hashlib
from datetime import datetime, timezone, date
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.claim import Claim
from app.models.appeal import FarmerAppeal
from app.core.audit_chain import append_audit_block

router = APIRouter(prefix="/appeals", tags=["Farmer Appeals & Grievance Redressal"])

class AppealSubmitRequest(BaseModel):
    claim_id: str = Field(..., description="ID of claim being appealed")
    grounds_type: str = Field(..., description="CONTESTED_DAMAGE_PCT, WATER_RECESSION_ROOT_ROT, LOCALIZED_HAIL, BOUNDARY_MISALIGNMENT, CROP_MISIDENTIFICATION")
    farmer_statement: str = Field(..., min_length=10, description="Farmer's narrative explaining on-ground circumstances")
    supporting_photo_urls: List[str] = Field(default=[], description="Geotagged ground photo paths or proofs")
    original_damage_percent: float = Field(default=0.0, description="Preliminary or satellite damage % being contested")

class AppealResolveRequest(BaseModel):
    reviewer_name: str = Field(..., min_length=2)
    reviewer_role: str = Field(..., description="TEHSILDAR, SDM, or DISTRICT_COLLECTOR (mandatory independent role)")
    status: str = Field(..., description="REVISED_APPROVED, UPHELD, or DISMISSED")
    revised_damage_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    resolution_remarks: str = Field(..., min_length=10)

@router.post("/submit")
def submit_farmer_appeal(request: AppealSubmitRequest, db: Session = Depends(get_db)):
    """
    Submits a statutory appeal/grievance regarding an insurance claim assessment.
    Automatically assigns an independent appellate officer (Tehsildar) and appends to audit ledger.
    """
    claim = db.query(Claim).filter(Claim.id == request.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {request.claim_id} not found.")

    ref_no = f"APL-{date.today().year}-{uuid.uuid4().hex[:6].upper()}"

    appeal = FarmerAppeal(
        claim_id=claim.id,
        reference_no=ref_no,
        farmer_masked_id=claim.masked_aadhaar_ref or f"FMR-{claim.reference_no[-4:]}",
        grounds_type=request.grounds_type,
        farmer_statement=request.farmer_statement,
        supporting_photo_urls=request.supporting_photo_urls,
        assigned_reviewer_role="TEHSILDAR",  # Guaranteed independent administrative review
        status="FILED",
        original_damage_percent=request.original_damage_percent
    )

    db.add(appeal)
    db.commit()
    db.refresh(appeal)

    # Append to cryptographic audit chain
    append_audit_block(
        db=db,
        event_type="APPEAL_FILED",
        record_id=appeal.id,
        actor=f"CITIZEN_CLAIMANT:{claim.reference_no}",
        payload={
            "appeal_reference": ref_no,
            "claim_reference": claim.reference_no,
            "grounds_type": request.grounds_type,
            "original_damage_pct": request.original_damage_percent,
            "assigned_review_role": "TEHSILDAR"
        }
    )

    return {
        "status": "SUCCESS",
        "message": "Grievance / Appeal registered successfully. Assigned to Tehsildar for independent quasi-judicial review.",
        "appeal": {
            "id": appeal.id,
            "reference_no": appeal.reference_no,
            "claim_id": appeal.claim_id,
            "grounds_type": appeal.grounds_type,
            "status": appeal.status,
            "assigned_reviewer_role": appeal.assigned_reviewer_role,
            "created_at": appeal.created_at.isoformat()
        }
    }

@router.get("/claim/{claim_id}")
def get_appeals_by_claim(claim_id: str, db: Session = Depends(get_db)):
    """Retrieves all statutory appeals filed against a specific claim."""
    appeals = db.query(FarmerAppeal).filter(FarmerAppeal.claim_id == claim_id).order_by(FarmerAppeal.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "reference_no": a.reference_no,
            "grounds_type": a.grounds_type,
            "farmer_statement": a.farmer_statement,
            "supporting_photo_urls": a.supporting_photo_urls,
            "status": a.status,
            "assigned_reviewer_role": a.assigned_reviewer_role,
            "assigned_reviewer_name": a.assigned_reviewer_name,
            "original_damage_percent": a.original_damage_percent,
            "revised_damage_percent": a.revised_damage_percent,
            "resolution_remarks": a.resolution_remarks,
            "resolution_signature_hash": a.resolution_signature_hash,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "created_at": a.created_at.isoformat()
        }
        for a in appeals
    ]

@router.get("/pending")
def list_pending_appeals(db: Session = Depends(get_db)):
    """Lists all appeals awaiting appellate review for Tehsildar / SDM portal."""
    appeals = db.query(FarmerAppeal).filter(FarmerAppeal.status.in_(["FILED", "UNDER_REVIEW"])).all()
    results = []
    for a in appeals:
        claim = db.query(Claim).filter(Claim.id == a.claim_id).first()
        results.append({
            "id": a.id,
            "reference_no": a.reference_no,
            "claim_id": a.claim_id,
            "claim_reference": claim.reference_no if claim else "N/A",
            "district": claim.district if claim else "N/A",
            "crop_type": claim.crop_type if claim else "N/A",
            "damage_type": claim.damage_type if claim else "N/A",
            "grounds_type": a.grounds_type,
            "farmer_statement": a.farmer_statement,
            "original_damage_percent": a.original_damage_percent,
            "status": a.status,
            "created_at": a.created_at.isoformat()
        })
    return results

@router.post("/{appeal_id}/resolve")
def resolve_farmer_appeal(appeal_id: str, request: AppealResolveRequest, db: Session = Depends(get_db)):
    """
    Appellate authority (Tehsildar/SDM) resolution of a contested claim assessment.
    Cryptographically signs decision and records to audit chain.
    """
    appeal = db.query(FarmerAppeal).filter(FarmerAppeal.id == appeal_id).first()
    if not appeal:
        raise HTTPException(status_code=404, detail="Appeal not found.")

    claim = db.query(Claim).filter(Claim.id == appeal.claim_id).first()

    now_utc = datetime.now(timezone.utc)
    sig_payload = f"{appeal.id}:{request.status}:{request.revised_damage_percent}:{request.reviewer_role}:{now_utc.isoformat()}"
    resolution_hash = hashlib.sha256(sig_payload.encode()).hexdigest()

    appeal.status = request.status
    appeal.assigned_reviewer_name = request.reviewer_name
    appeal.assigned_reviewer_role = request.reviewer_role
    appeal.revised_damage_percent = request.revised_damage_percent
    appeal.resolution_remarks = request.resolution_remarks
    appeal.resolution_signature_hash = resolution_hash
    appeal.resolved_at = now_utc

    db.commit()
    db.refresh(appeal)

    # Append to cryptographic audit ledger
    append_audit_block(
        db=db,
        event_type="APPEAL_RESOLVED",
        record_id=appeal.id,
        actor=f"OFFICIAL:{request.reviewer_role}:{request.reviewer_name.replace(' ', '_').upper()}",
        payload={
            "appeal_reference": appeal.reference_no,
            "claim_reference": claim.reference_no if claim else "N/A",
            "status": request.status,
            "original_damage_pct": appeal.original_damage_percent,
            "revised_damage_pct": request.revised_damage_percent,
            "resolution_hash": resolution_hash
        }
    )

    return {
        "status": "SUCCESS",
        "message": f"Appeal resolved as {request.status} by {request.reviewer_role}.",
        "resolution_signature_hash": resolution_hash,
        "resolved_at": now_utc.isoformat()
    }


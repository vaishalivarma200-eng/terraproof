from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.claim import Claim
from app.schemas.claim import (
    ClaimCreate,
    ClaimResponse,
    ClaimReviewRequest,
    PhotoVerificationRequest,
    PhotoVerificationResponse,
    FieldInspectionCreate,
)
from app.geospatial.validation import validate_study_area
from app.geospatial.geodesic import compute_centroid

router = APIRouter(prefix="/claims", tags=["Agricultural Claims"])

@router.post("", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def submit_agricultural_claim(claim_in: ClaimCreate, db: Session = Depends(get_db)):
    """
    Submits and validates a new agricultural insurance claim.
    Validates study area polygon, prevents duplicate reference numbers, and saves records.
    """
    # Check duplicate reference number
    existing = db.query(Claim).filter(Claim.reference_no == claim_in.reference_no).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Claim with reference number '{claim_in.reference_no}' already exists."
        )

    # Validate boundary polygon
    geom_dict = claim_in.boundary_geojson.model_dump()
    validation = validate_study_area(geom_dict)
    if not validation.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Field boundary validation error: {validation.validation_message}"
        )

    # Validate date logic
    if claim_in.incident_date_end < claim_in.incident_date_start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Incident end date cannot precede incident start date."
        )

    center_lon, center_lat = compute_centroid(geom_dict)

    claim = Claim(
        reference_no=claim_in.reference_no,
        farmer_name=claim_in.farmer_name,
        crop_type=claim_in.crop_type,
        claimed_area_ha=claim_in.claimed_area_ha,
        damage_type=claim_in.damage_type,
        incident_date_start=claim_in.incident_date_start,
        incident_date_end=claim_in.incident_date_end,
        state=claim_in.state or "Punjab",
        district=claim_in.district,
        crop_season=claim_in.crop_season or "Kharif",
        cultivated_area_ha=claim_in.cultivated_area_ha or claim_in.claimed_area_ha,
        claimed_loss_amount=claim_in.claimed_loss_amount,
        sum_insured_per_ha=claim_in.sum_insured_per_ha or 35000.0,
        khasra_no=claim_in.khasra_no,
        khatauni_no=claim_in.khatauni_no,
        latitude=center_lat,
        longitude=center_lon,
        boundary_geojson=geom_dict,
        supporting_notes=claim_in.supporting_notes,
        field_photos=claim_in.field_photos or [],
        field_inspections=[],
        status="SUBMITTED"
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/verify-photo", response_model=PhotoVerificationResponse)
def verify_photo(photo_in: PhotoVerificationRequest):
    """
    Extracts EXIF GPS coordinates and capture timestamp from a photograph
    and compares its location against the declared field boundary polygon.
    """
    import base64
    from app.geospatial.exif_verifier import verify_photo_against_boundary

    image_bytes = None
    if photo_in.photo_base64:
        b64_str = photo_in.photo_base64
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        try:
            image_bytes = base64.b64decode(b64_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 encoding for photo.")

    result = verify_photo_against_boundary(
        image_bytes=image_bytes,
        boundary_geojson=photo_in.boundary_geojson,
        filename=photo_in.filename or "field_photo.jpg"
    )
    return result

@router.post("/{claim_id}/inspections", response_model=ClaimResponse)
def add_field_inspection(
    claim_id: str,
    inspection_in: FieldInspectionCreate,
    db: Session = Depends(get_db)
):
    """
    Records an on-ground adjuster field visit report.
    Logs ground crop conditions, photos, and flags discrepancies with satellite analysis.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")

    inspection_data = inspection_in.model_dump()
    inspection_data["recorded_at"] = datetime.now(timezone.utc).isoformat()

    current_inspections = list(claim.field_inspections or [])
    current_inspections.append(inspection_data)
    claim.field_inspections = current_inspections

    if claim.status != "REVIEWED":
        claim.status = "FIELD_INSPECTION_RECORDED"

    db.commit()
    db.refresh(claim)
    return claim



@router.get("", response_model=List[ClaimResponse])
def list_claims(
    skip: int = 0,
    limit: int = 50,
    damage_type: Optional[str] = None,
    claim_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves paginated insurance claims with optional filtering."""
    query = db.query(Claim)
    if damage_type:
        query = query.filter(Claim.damage_type == damage_type)
    if claim_status:
        query = query.filter(Claim.status == claim_status)
    return query.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    """Retrieves single claim with full field boundary GeoJSON."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")
    return claim

@router.patch("/{claim_id}/review", response_model=ClaimResponse)
def review_claim(
    claim_id: str,
    review_in: ClaimReviewRequest,
    db: Session = Depends(get_db)
):
    """
    Submits a final human auditor review decision (APPROVED, PARTIAL, REJECTED, FIELD_INSPECTION).
    Ensures ethical decision-support workflow with human oversight.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")

    claim.reviewer_decision = review_in.reviewer_decision
    claim.reviewer_notes = review_in.reviewer_notes
    claim.reviewed_at = datetime.now(timezone.utc)
    claim.status = "REVIEWED"

    db.commit()
    db.refresh(claim)
    return claim




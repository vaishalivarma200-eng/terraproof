"""
TerraProof Land Document Upload, OCR & Verification API Routes
Processes Form 7/12, Khasra/Khatauni, Jamabandi, and Lease Deeds.
Performs cross-checks against drawn boundaries, claimant identity, and tenancy rights.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.claim import Claim
from app.models.document import LandDocument
from app.documents.ocr_parser import parse_land_record_text, compute_document_hash
from app.documents.verifier import verify_land_document

router = APIRouter(prefix="/documents", tags=["Land Document Verification"])

class SampleDocumentVerificationRequest(BaseModel):
    document_text: str
    document_type: str = "KHASRA_KHATAUNI"
    claimant_name: str
    drawn_boundary_ha: float
    claimed_area_ha: float
    claim_district: Optional[str] = None
    tenancy_type: str = "OWNER"

class LandDocumentUploadJson(BaseModel):
    claim_id: str
    document_text: str
    document_type: str = Field("KHASRA_KHATAUNI", description="ROR_7_12, KHASRA_KHATAUNI, JAMABANDI, LEASE_AGREEMENT")
    filename: str = "land_record.txt"
    tenancy_type: str = Field("OWNER", description="OWNER, TENANT, SHARECROPPER")

@router.post("/verify-sample")
def verify_sample_document(req: SampleDocumentVerificationRequest):
    """
    Direct verification of land record text and metadata without requiring an existing claim.
    Useful for interactive testing, UI previews, and OCR validation.
    """
    extracted = parse_land_record_text(req.document_text, req.document_type)
    report = verify_land_document(
        extracted_data=extracted,
        claimant_name=req.claimant_name,
        drawn_boundary_ha=req.drawn_boundary_ha,
        claimed_area_ha=req.claimed_area_ha,
        claim_district=req.claim_district,
        tenancy_type=req.tenancy_type,
        is_duplicate_hash=False
    )
    return {
        "extracted_data": extracted,
        "verification_report": report,
        "verification_status": report["verification_status"]
    }

@router.post("/upload-text")
def upload_document_text(req: LandDocumentUploadJson, db: Session = Depends(get_db)):
    """
    Submits a land document via text/OCR content and links it to a claim.
    """
    claim = db.query(Claim).filter(Claim.id == req.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim with id '{req.claim_id}' not found.")

    file_bytes = req.document_text.encode("utf-8")
    doc_hash = compute_document_hash(file_bytes)

    # Check for duplicate document hash across all claims
    existing_dup = db.query(LandDocument).filter(
        LandDocument.file_hash == doc_hash,
        LandDocument.claim_id != req.claim_id
    ).first()
    is_duplicate = existing_dup is not None

    extracted = parse_land_record_text(req.document_text, req.document_type)

    # Approximate drawn boundary ha from claim
    boundary_ha = float(claim.claimed_area_ha or 2.0)
    report = verify_land_document(
        extracted_data=extracted,
        claimant_name=claim.farmer_name,
        drawn_boundary_ha=boundary_ha,
        claimed_area_ha=claim.claimed_area_ha,
        claim_district=claim.district,
        tenancy_type=req.tenancy_type,
        is_duplicate_hash=is_duplicate
    )

    doc_record = LandDocument(
        claim_id=claim.id,
        document_type=req.document_type,
        tenancy_type=req.tenancy_type,
        filename=req.filename,
        file_hash=doc_hash,
        extracted_data=extracted,
        verification_status=report["verification_status"],
        verification_report=report
    )
    db.add(doc_record)
    
    # Update claim tenancy_type
    claim.tenancy_type = req.tenancy_type
    db.commit()
    db.refresh(doc_record)

    return {
        "document_id": doc_record.id,
        "claim_id": claim.id,
        "document_type": doc_record.document_type,
        "tenancy_type": doc_record.tenancy_type,
        "file_hash": doc_hash,
        "is_duplicate_document": is_duplicate,
        "extracted_data": extracted,
        "verification_status": report["verification_status"],
        "verification_report": report
    }

@router.get("/claim/{claim_id}")
def get_claim_documents(claim_id: str, db: Session = Depends(get_db)):
    """Retrieves all uploaded land documents and verification reports for a claim."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found.")

    docs = db.query(LandDocument).filter(LandDocument.claim_id == claim_id).all()
    return [
        {
            "id": d.id,
            "document_type": d.document_type,
            "tenancy_type": d.tenancy_type,
            "filename": d.filename,
            "file_hash": d.file_hash,
            "extracted_data": d.extracted_data,
            "verification_status": d.verification_status,
            "verification_report": d.verification_report,
            "created_at": d.created_at
        }
        for d in docs
    ]

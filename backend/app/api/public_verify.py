"""
TerraProof Public Verification & Integrity API
Allows citizens, banks, insurers, and courts to verify the authenticity of
official inspection orders and satellite dossiers without login.
Strictly redacts personally identifiable information (PII) per DPDP Act 2023.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.claim import Claim
from app.models.decision import OfficialInspection
from app.core.audit_chain import verify_chain_integrity, get_recent_audit_blocks
import os

router = APIRouter(tags=["Public Verification"])

@router.get("/public/verify/{identifier}")
def verify_document_public(identifier: str, db: Session = Depends(get_db)):
    """
    Publicly verifies an inspection order or satellite evidence dossier.
    Matches by Inspection ID, digital signature SHA-256 hash, or Claim Reference Number.
    Strictly shields farmer identity pursuant to DPDP Act 2023.
    """
    clean_id = identifier.strip()

    # 1. Search Official Inspections by ID or signature_hash
    inspection = db.query(OfficialInspection).filter(
        (OfficialInspection.id == clean_id) |
        (OfficialInspection.signature_hash == clean_id) |
        (OfficialInspection.signature_hash.startswith(clean_id))
    ).first()

    claim = None
    if inspection:
        claim = db.query(Claim).filter(Claim.id == inspection.claim_id).first()
    else:
        # 2. Search Claim by reference_no or ID
        claim = db.query(Claim).filter(
            (Claim.reference_no == clean_id) |
            (Claim.id == clean_id)
        ).first()
        if claim:
            inspection = db.query(OfficialInspection).filter(
                OfficialInspection.claim_id == claim.id
            ).order_by(OfficialInspection.signed_at.desc()).first()

    if not claim and not inspection:
        return {
            "is_authentic": False,
            "verification_status": "RECORD_NOT_FOUND",
            "message": "No official inspection record or registered satellite dossier matches this reference or cryptographic hash."
        }

    # Structure redacted, authoritative response
    doc_type = "STATUTORY_REVENUE_INSPECTION_ORDER" if inspection else "SATELLITE_EVIDENCE_DOSSIER"
    
    return {
        "is_authentic": True,
        "verification_status": "AUTHENTIC_GOVERNMENT_RECORD",
        "document_type": doc_type,
        "reference_no": claim.reference_no if claim else "N/A",
        "inspection_id": inspection.id if inspection else None,
        "issuing_authority": (
            f"Office of {inspection.officer_role.title() if inspection else 'Revenue Administration'}, "
            f"Tehsil {inspection.jurisdiction_tehsil or 'Headquarters'}, "
            f"District {claim.district if claim else 'Administration'}, {claim.state if claim else 'India'}"
        ),
        "officer_designation": inspection.officer_role if inspection else "REVENUE_ADMINISTRATION",
        "decision_action": inspection.decision_action if inspection else "SATELLITE_ANALYSIS_REGISTERED",
        "confirmed_damage_percent": (
            inspection.confirmed_damage_percent if inspection 
            else (
                claim.analysis_jobs[-1].results.get("metrics", {}).get("damage_percentage", 0.0)
                if claim and claim.analysis_jobs and claim.analysis_jobs[-1].results and isinstance(claim.analysis_jobs[-1].results, dict)
                else 0.0
            )
        ),
        "incident_peril": claim.damage_type if claim else "Natural Calamity",
        "crop_type": claim.crop_type if claim else "Kharif Crop",
        "crop_season": claim.crop_season if claim else "Kharif",
        "khasra_no": claim.khasra_no if claim else "Survey Parcel",
        "district": claim.district if claim else "Revenue District",
        "state": claim.state if claim else "India",
        "digital_signature_hash": inspection.signature_hash if inspection else "SHA256:PRELIMINARY_EVIDENCE_STAMP",
        "signed_at": inspection.signed_at.isoformat() if inspection else claim.created_at.isoformat(),
        "pdf_download_available": bool(inspection and inspection.report_pdf_path and os.path.exists(inspection.report_pdf_path)),
        "pii_redacted": True,
        "privacy_notice": (
            "Farmer identity, contact details, and bank credentials are fully shielded in compliance with "
            "Section 8 of the Digital Personal Data Protection Act 2023. Only non-PII administrative determinations "
            "are verifiable on public ledgers."
        )
    }

@router.get("/public/verify/{identifier}/pdf")
def download_verified_inspection_pdf(identifier: str, db: Session = Depends(get_db)):
    """Public download for verified statutory inspection PDF if signed."""
    clean_id = identifier.strip()
    inspection = db.query(OfficialInspection).filter(
        (OfficialInspection.id == clean_id) |
        (OfficialInspection.signature_hash == clean_id) |
        (OfficialInspection.signature_hash.startswith(clean_id))
    ).first()

    if not inspection and "-" in clean_id:
        claim = db.query(Claim).filter(Claim.reference_no == clean_id).first()
        if claim:
            inspection = db.query(OfficialInspection).filter(
                OfficialInspection.claim_id == claim.id
            ).order_by(OfficialInspection.signed_at.desc()).first()

    if not inspection or not inspection.report_pdf_path or not os.path.exists(inspection.report_pdf_path):
        raise HTTPException(status_code=404, detail="Statutory inspection PDF report not found or not yet signed.")

    return FileResponse(
        path=inspection.report_pdf_path,
        media_type="application/pdf",
        filename=f"Verified_Inspection_Report_{inspection.id[:8]}.pdf"
    )

@router.get("/audit/verify-chain")
def verify_audit_ledger_chain(db: Session = Depends(get_db)):
    """Verifies the mathematical integrity of the append-only cryptographic ledger."""
    return verify_chain_integrity(db)

@router.get("/audit/blocks")
def list_recent_audit_blocks(limit: int = 25, db: Session = Depends(get_db)):
    """Lists chronological audit blocks on the cryptographic ledger."""
    return get_recent_audit_blocks(db, limit=limit)

"""
Unit Tests for Phase 10: Public Verification, Cryptographic Audit Ledger, Farmer Appeals, and Fairness Analytics.
"""
import pytest
from datetime import date
from app.core.database import SessionLocal, init_db
from app.models.claim import Claim
from app.models.decision import OfficialInspection
from app.models.appeal import FarmerAppeal
from app.core.audit_chain import append_audit_block, verify_chain_integrity, get_recent_audit_blocks, AuditBlock
from app.api.public_verify import verify_document_public
from app.api.appeals import submit_farmer_appeal, resolve_farmer_appeal, AppealSubmitRequest, AppealResolveRequest
from app.api.fairness import get_fairness_and_parity_metrics
from app.services.official_workflow import sign_official_inspection

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

def test_audit_chain_append_and_integrity():
    db = SessionLocal()
    try:
        # Clear previous blocks for clean test
        db.query(AuditBlock).delete()
        db.commit()

        # 1. Append Genesis / First Block
        b0 = append_audit_block(
            db=db,
            event_type="CLAIM_SUBMITTED",
            record_id="CLM-TEST-001",
            actor="SYSTEM_SEED",
            payload={"action": "test_genesis", "hectares": 3.5}
        )
        assert b0.block_index == 0
        assert b0.previous_hash == "0" * 64
        assert len(b0.block_hash) == 64

        # 2. Append Second Block
        b1 = append_audit_block(
            db=db,
            event_type="OFFICIAL_INSPECTED",
            record_id="INSP-TEST-001",
            actor="OFFICIAL:PATWARI:RAJESH",
            payload={"confirmed_damage": 45.0}
        )
        assert b1.block_index == 1
        assert b1.previous_hash == b0.block_hash

        # 3. Verify integrity
        audit = verify_chain_integrity(db)
        assert audit["is_valid"] is True
        assert audit["total_blocks"] == 2
        assert audit["status"] == "VERIFIED_TAMPER_FREE"

        # 4. Tamper Test: modify a block's data_hash manually and verify tamper detection
        b0.data_hash = "f" * 64
        db.commit()

        tampered_audit = verify_chain_integrity(db)
        assert tampered_audit["is_valid"] is False
        assert tampered_audit["status"] == "TAMPERED_BLOCK_DIGEST"
        assert tampered_audit["tampered_at_index"] == 0

        # Clean up
        db.query(AuditBlock).delete()
        db.commit()
    finally:
        db.close()

def test_public_verification_pii_redaction():
    import uuid
    test_ref = f"CLM-PUB-{uuid.uuid4().hex[:6].upper()}"
    db = SessionLocal()
    try:
        # Create test claim
        claim = Claim(
            reference_no=test_ref,
            farmer_name="Deepak Chawla",
            crop_type="Soybean",
            claimed_area_ha=5.0,
            damage_type="Flood",
            incident_date_start=date(2026, 7, 10),
            incident_date_end=date(2026, 7, 15),
            state="Madhya Pradesh",
            district="Indore",
            crop_season="Kharif",
            khasra_no="105/1",
            latitude=22.719,
            longitude=75.857,
            boundary_geojson={"type": "Polygon", "coordinates": [[[75.85, 22.71], [75.86, 22.71], [75.86, 22.72], [75.85, 22.72], [75.85, 22.71]]]},
            status="SUBMITTED"
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)

        # Sign an official inspection
        insp = sign_official_inspection(
            claim_id=claim.id,
            officer_name="Sunil Sharma",
            officer_role="PATWARI",
            confirmed_damage_pct=60.0,
            prefilled_damage_pct=58.0,
            override_reason=None,
            decision_action="CONFIRM_EVIDENCE",
            remarks="Verified extensive flood damage on ground.",
            checklist={"crop_present": True, "water_marks_observed": True, "structure_present": False, "boundary_matches": True},
            photos=[],
            db=db
        )

        # 1. Query public verification with inspection ID
        res = verify_document_public(identifier=insp.id, db=db)
        assert res["is_authentic"] is True
        assert res["verification_status"] == "AUTHENTIC_GOVERNMENT_RECORD"
        assert res["document_type"] == "STATUTORY_REVENUE_INSPECTION_ORDER"
        assert res["reference_no"] == test_ref
        assert res["confirmed_damage_percent"] == 60.0
        assert res["pii_redacted"] is True
        # Verify strict zero PII exposure
        assert "Deepak Chawla" not in str(res)
        assert "farmer_name" not in res
        assert "phone" not in res
        assert "aadhaar" not in str(res).lower()

        # 2. Query with non-existent ID
        missing_res = verify_document_public(identifier="NON_EXISTENT_XYZ", db=db)
        assert missing_res["is_authentic"] is False
        assert missing_res["verification_status"] == "RECORD_NOT_FOUND"

        # Cleanup
        db.query(OfficialInspection).filter(OfficialInspection.id == insp.id).delete()
        db.query(Claim).filter(Claim.id == claim.id).delete()
        db.commit()
    finally:
        db.close()

def test_farmer_appeal_workflow_and_independent_review():
    db = SessionLocal()
    try:
        # Create test claim
        claim = Claim(
            reference_no="CLM-TEST-APL-01",
            farmer_name="Sarla Devi",
            crop_type="Paddy",
            claimed_area_ha=2.0,
            damage_type="Waterlogging",
            incident_date_start=date(2026, 8, 1),
            incident_date_end=date(2026, 8, 10),
            state="Punjab",
            district="Patiala",
            latitude=30.339,
            longitude=76.386,
            boundary_geojson={"type": "Polygon", "coordinates": [[[76.38, 30.33], [76.39, 30.33], [76.39, 30.34], [76.38, 30.34], [76.38, 30.33]]]},
            status="REVIEWED"
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)

        # 1. Farmer files an appeal
        submit_req = AppealSubmitRequest(
            claim_id=claim.id,
            grounds_type="WATER_RECESSION_ROOT_ROT",
            farmer_statement="Water receded after 48 hours but entire root system decayed. Optical satellite missed subterranean root rot.",
            original_damage_percent=20.0
        )
        res = submit_farmer_appeal(request=submit_req, db=db)
        assert res["status"] == "SUCCESS"
        assert res["appeal"]["assigned_reviewer_role"] == "TEHSILDAR"  # Independent review
        appeal_id = res["appeal"]["id"]

        # 2. Appellate authority resolves appeal
        resolve_req = AppealResolveRequest(
            reviewer_name="Dr. Alok Verma",
            reviewer_role="TEHSILDAR",
            status="REVISED_APPROVED",
            revised_damage_percent=65.0,
            resolution_remarks="Physical inspection confirmed root rotting and collar rot as alleged by farmer. Damage revised to 65%."
        )
        resolve_res = resolve_farmer_appeal(appeal_id=appeal_id, request=resolve_req, db=db)
        assert resolve_res["status"] == "SUCCESS"
        assert len(resolve_res["resolution_signature_hash"]) == 64

        # Verify DB state
        appeal = db.query(FarmerAppeal).filter(FarmerAppeal.id == appeal_id).first()
        assert appeal.status == "REVISED_APPROVED"
        assert appeal.revised_damage_percent == 65.0

        # Cleanup
        db.query(FarmerAppeal).filter(FarmerAppeal.id == appeal_id).delete()
        db.query(Claim).filter(Claim.id == claim.id).delete()
        db.commit()
    finally:
        db.close()

def test_fairness_and_parity_monitoring():
    import uuid
    ref_small = f"CLM-FAIR-S-{uuid.uuid4().hex[:6].upper()}"
    ref_large = f"CLM-FAIR-L-{uuid.uuid4().hex[:6].upper()}"
    db = SessionLocal()
    try:
        # Create smallholder and largeholder test claims
        c_small = Claim(
            reference_no=ref_small,
            farmer_name="Smallholder Farmer",
            crop_type="Rice",
            claimed_area_ha=0.7,
            damage_type="Flood",
            incident_date_start=date(2026, 7, 10),
            incident_date_end=date(2026, 7, 15),
            state="Punjab",
            district="Ludhiana",
            latitude=30.900,
            longitude=75.850,
            boundary_geojson={"type": "Polygon", "coordinates": [[[75.85, 30.90], [75.86, 30.90], [75.86, 30.91], [75.85, 30.91], [75.85, 30.90]]]},
            status="NEEDS_REVIEW"
        )
        c_large = Claim(
            reference_no=ref_large,
            farmer_name="Largeholder Farmer",
            crop_type="Rice",
            claimed_area_ha=8.0,
            damage_type="Flood",
            incident_date_start=date(2026, 7, 10),
            incident_date_end=date(2026, 7, 15),
            state="Punjab",
            district="Ludhiana",
            latitude=30.910,
            longitude=75.860,
            boundary_geojson={"type": "Polygon", "coordinates": [[[75.86, 30.91], [75.87, 30.91], [75.87, 30.92], [75.86, 30.92], [75.86, 30.91]]]},
            status="SUBMITTED"
        )
        db.add_all([c_small, c_large])
        db.commit()

        metrics = get_fairness_and_parity_metrics(db=db)
        assert "size_tiers" in metrics
        assert "crop_tiers" in metrics
        assert "disparity_ratio" in metrics
        assert metrics["size_tiers"]["SMALLHOLDER"]["total_claims"] >= 1
        assert metrics["size_tiers"]["LARGE"]["total_claims"] >= 1

        # Cleanup
        db.query(Claim).filter(Claim.reference_no.in_([ref_small, ref_large])).delete()
        db.commit()
    finally:
        db.close()
        db.close()

"""
Unit & Integration Tests for Phase 9:
- Official Decision-Support Workflow & Prioritization
- SLA & Aging Tracking with "Why Prioritized"
- Low-Damage (<15%) Threshold & Explicit Satellite Insufficiency Disclosure
- Ground Inspection Signing, Override Detection, & Digital Signatures
- Official Inspection Report PDF Generation
"""

import pytest
from datetime import datetime, date, timedelta, timezone
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.claim import Claim
from app.models.decision import OfficialInspection
from app.services.official_workflow import (
    calculate_priority_rank,
    generate_draft_evidence_pack,
    sign_official_inspection
)
from app.reports.inspection_report import generate_official_inspection_pdf

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# ----------------- 1. Priority Ranking & SLA Tracking -----------------

def test_priority_ranking_urgent():
    # Submitted 6 days ago (near SLA of 7 days), high risk (80), high damage (75%)
    sub_date = datetime.now(timezone.utc) - timedelta(days=6)
    rank = calculate_priority_rank(risk_score=80.0, damage_pct=75.0, submitted_date=sub_date)

    assert rank["priority_score"] >= 75.0
    assert rank["sla_status"] == "NEARING_SLA"
    assert rank["age_days"] == 6
    assert "High anti-fraud risk score" in rank["why_prioritized"]
    assert "Severe vegetative loss" in rank["why_prioritized"]

def test_priority_ranking_overdue():
    # Submitted 10 days ago (overdue)
    sub_date = datetime.now(timezone.utc) - timedelta(days=10)
    rank = calculate_priority_rank(risk_score=50.0, damage_pct=40.0, submitted_date=sub_date)

    assert rank["sla_status"] == "OVERDUE"
    assert "Exceeded statutory SLA" in rank["why_prioritized"]

# ----------------- 2. Draft Evidence Pack & Low-Damage Threshold -----------------

def test_draft_evidence_pack_standard_flood(test_db):
    claim = Claim(
        reference_no="CLM-TEST-OFFICIAL-01",
        farmer_name="Gurpreet Singh",
        crop_type="Wheat",
        crop_season="Rabi",
        claimed_area_ha=5.0,
        damage_type="Flood",
        incident_date_start=date(2024, 7, 10),
        incident_date_end=date(2024, 7, 15),
        latitude=30.9,
        longitude=75.8,
        boundary_geojson={"type": "Polygon", "coordinates": [[[75.8, 30.9], [75.81, 30.9], [75.81, 30.91], [75.8, 30.91], [75.8, 30.9]]]}
    )
    test_db.add(claim)
    test_db.commit()

    pack = generate_draft_evidence_pack(claim)
    assert pack["prefilled_crop"] == "Wheat"
    assert pack["prefilled_season"] == "Rabi"
    assert pack["suggested_damage_percent"] == 65.0
    assert pack["is_low_damage_insufficient"] is False
    assert pack["low_damage_notice"] is None

def test_draft_evidence_pack_low_damage_sub15():
    # Mock analysis job with 11% damage
    class MockJob:
        result_metrics = {
            "damaged_area_ha": 0.55,
            "damage_percentage": 11.0,
            "overall_confidence_score": 75,
            "peril_classification": "Mild Canopy Stress"
        }

    claim = Claim(
        reference_no="CLM-TEST-OFFICIAL-LOW",
        farmer_name="Ram Lal",
        crop_type="Soybean",
        crop_season="Kharif",
        claimed_area_ha=5.0,
        damage_type="Drought",
        incident_date_start=date(2024, 7, 1),
        incident_date_end=date(2024, 7, 20),
        latitude=20.5,
        longitude=77.0,
        boundary_geojson={"type": "Polygon", "coordinates": [[[77.0, 20.5], [77.01, 20.5], [77.01, 20.51], [77.0, 20.51], [77.0, 20.5]]]}
    )

    pack = generate_draft_evidence_pack(claim, latest_job=MockJob())
    assert pack["suggested_damage_percent"] == 11.0
    assert pack["is_low_damage_insufficient"] is True
    assert "SATELLITE INSUFFICIENT" in pack["low_damage_notice"]
    assert "Mandatory physical ground inspection required" in pack["low_damage_notice"]

# ----------------- 3. Official Inspection Signing & Override Detection -----------------

def test_sign_official_inspection_with_override(test_db):
    claim = Claim(
        reference_no="CLM-TEST-OFFICIAL-02",
        farmer_name="Sunita Devi",
        crop_type="Soybean",
        claimed_area_ha=4.0,
        damage_type="Flood",
        incident_date_start=date(2024, 7, 10),
        incident_date_end=date(2024, 7, 15),
        latitude=20.5,
        longitude=77.0,
        boundary_geojson={"type": "Polygon", "coordinates": [[[77.0, 20.5], [77.01, 20.5], [77.01, 20.51], [77.0, 20.51], [77.0, 20.5]]]},
        status="SUBMITTED"
    )
    test_db.add(claim)
    test_db.commit()

    # Patwari inspected on-ground: satellite was 65%, Patwari found 85% due to submerged roots
    insp = sign_official_inspection(
        claim_id=claim.id,
        officer_name="Rajinder Kumar",
        officer_role="PATWARI",
        confirmed_damage_pct=85.0,
        prefilled_damage_pct=65.0,
        override_reason="Severe root decay and unharvestable siltation observed on ground.",
        decision_action="CONFIRM_EVIDENCE",
        remarks="Field fully verified. Crop lodging confirmed.",
        checklist={"crop_present": True, "water_marks_observed": True, "boundary_matches": True},
        photos=[{"url": "https://storage.terraproof.org/field_photo.jpg", "lat": 20.505, "lon": 77.005}],
        db=test_db
    )

    assert insp.override_occurred is True
    assert insp.confirmed_damage_percent == 85.0
    assert len(insp.signature_hash) == 64
    assert insp.officer_role == "PATWARI"

    # Check that claim status was updated to REVIEWED
    updated_claim = test_db.query(Claim).filter(Claim.id == claim.id).first()
    assert updated_claim.status == "REVIEWED"
    assert updated_claim.reviewer_decision == "APPROVED"

# ----------------- 4. Official Inspection PDF Dossier Generation -----------------

def test_generate_official_inspection_pdf(tmp_path):
    insp_data = {
        "id": "INSP-TEST-99214",
        "officer_name": "Rajinder Kumar",
        "officer_role": "PATWARI",
        "inspection_date": date(2024, 7, 18),
        "checklist_crop_present": True,
        "checklist_water_marks_observed": True,
        "checklist_structure_present": False,
        "checklist_boundary_matches": True,
        "prefilled_satellite_damage_percent": 65.0,
        "confirmed_damage_percent": 80.0,
        "override_occurred": True,
        "override_reason": "Ground watermarks show full quadrant inundation.",
        "decision_action": "CONFIRM_EVIDENCE",
        "decision_remarks": "Inspection complete. Recommended for PMFBY compensation.",
        "signature_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "signed_at": datetime.now(timezone.utc).isoformat()
    }

    claim_data = {
        "reference_no": "CLM-PB-LDH-001",
        "farmer_name": "Gurpreet Singh",
        "khasra_no": "88/2",
        "khatauni_no": "14",
        "crop_type": "Wheat",
        "crop_season": "Rabi",
        "claimed_area_ha": 5.0,
        "district": "Ludhiana",
        "state": "Punjab",
        "tenancy_type": "Owner-Cultivator"
    }

    pdf_file = generate_official_inspection_pdf(insp_data, claim_data, output_dir=tmp_path)
    assert Path(pdf_file).exists()
    assert Path(pdf_file).stat().st_size > 1000  # More than 1 KB

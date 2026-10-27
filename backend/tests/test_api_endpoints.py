import uuid
import asyncio
import pytest
from datetime import date
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.schemas.claim import ClaimCreate, ClaimReviewRequest
from app.schemas.geospatial import GeoJSONGeometry
from app.api.health import get_system_health, get_provider_status
from app.api.claims import submit_agricultural_claim, get_claim, review_claim
from app.analysis.insurance import run_insurance_verification
from app.reports.pdf_generator import generate_evidence_pdf
from pathlib import Path

@pytest.fixture(scope="module")
def db_session():
    init_db()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_health_handler(db_session: Session):
    result = get_system_health(db=db_session)
    assert result["status"] == "healthy"
    assert result["service"] == "TerraProof"
    assert result["database"]["status"] == "healthy"

def test_provider_status_handler():
    result = get_provider_status()
    assert "satellite_provider" in result
    assert "weather_provider" in result
    assert result["satellite_provider"]["is_operational"] is True

def test_submit_claim_and_review(db_session: Session):
    unique_ref = f"TEST-REF-{uuid.uuid4().hex[:6].upper()}"
    claim_in = ClaimCreate(
        reference_no=unique_ref,
        farmer_name="Sunita Devi",
        crop_type="Soybean",
        claimed_area_ha=8.4,
        damage_type="Flood",
        incident_date_start=date(2026, 7, 10),
        incident_date_end=date(2026, 7, 15),
        boundary_geojson=GeoJSONGeometry(
            type="Polygon",
            coordinates=[[
                [76.20, 27.10],
                [76.22, 27.10],
                [76.22, 27.12],
                [76.20, 27.12],
                [76.20, 27.10]
            ]]
        ),
        supporting_notes="Severe monsoon overflow"
    )

    created = submit_agricultural_claim(claim_in=claim_in, db=db_session)
    assert created.id is not None
    assert created.reference_no == unique_ref
    assert created.status == "SUBMITTED"

    # Retrieve
    retrieved = get_claim(claim_id=created.id, db=db_session)
    assert retrieved.farmer_name == "Sunita Devi"

    # Review
    review_req = ClaimReviewRequest(
        reviewer_decision="APPROVED",
        reviewer_notes="Satellite imagery corroborates localized flooding damage."
    )
    reviewed = review_claim(claim_id=created.id, review_in=review_req, db=db_session)
    assert reviewed.status == "REVIEWED"
    assert reviewed.reviewer_decision == "APPROVED"

def test_insurance_verification_workflow():
    boundary = {
        "type": "Polygon",
        "coordinates": [[
            [76.20, 27.10],
            [76.22, 27.10],
            [76.22, 27.12],
            [76.20, 27.12],
            [76.20, 27.10]
        ]]
    }

    result = asyncio.run(run_insurance_verification(
        boundary_geojson=boundary,
        damage_type="Flood",
        incident_start=date(2026, 7, 10),
        incident_end=date(2026, 7, 15),
        claimed_area_ha=8.4,
        mode="demo"
    ))

    assert "summary" in result
    assert "verdict_recommendation" in result
    assert "metrics" in result
    assert result["metrics"]["estimated_affected_area_ha"] > 0
    assert "overlays_geojson" in result
    assert result["overlays_geojson"]["type"] == "FeatureCollection"

    # Test PDF generation
    pdf_path = generate_evidence_pdf(
        analysis_id="test-job-uuid-12345",
        analysis_type="INSURANCE_VERIFICATION",
        parameters={"damage_type": "Flood"},
        results=result,
        claim_info={"reference_no": "TEST-REF-9921", "farmer_name": "Sunita Devi", "crop_type": "Soybean"}
    )

    assert Path(pdf_path).exists()
    assert Path(pdf_path).stat().st_size > 1000

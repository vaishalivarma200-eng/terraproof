"""
Unit & Integration Tests for Phase 8:
- Claim Risk Engine (7 transparent signals & 0-100 score)
- Cadastral Boundary Overlap Detection
- Land-Use Change Detection Engine (unauthorized non-agri construction)
- Village-level Inspection Priority Triage
"""

import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.claim import Claim
from app.analysis.risk_engine import compute_claim_risk_score, check_boundary_overlap
from app.analysis.land_use_change import detect_land_use_change

# In-memory SQLite fixture
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

# ----------------- 1. Boundary Spatial Overlap Checks -----------------

def test_boundary_overlap_disjoint():
    poly_a = {
        "type": "Polygon",
        "coordinates": [[[77.0, 20.0], [77.02, 20.0], [77.02, 20.02], [77.0, 20.02], [77.0, 20.0]]]
    }
    # Completely separate parcel 5 km away
    poly_b = {
        "type": "Polygon",
        "coordinates": [[[77.1, 20.1], [77.12, 20.1], [77.12, 20.12], [77.1, 20.12], [77.1, 20.1]]]
    }
    res = check_boundary_overlap(poly_a, [poly_b])
    assert res["has_overlap"] is False
    assert res["overlapping_claims_count"] == 0
    assert res["max_overlap_percentage"] == 0.0

def test_boundary_overlap_significant_intersection():
    poly_a = {
        "type": "Polygon",
        "coordinates": [[[77.0, 20.0], [77.02, 20.0], [77.02, 20.02], [77.0, 20.02], [77.0, 20.0]]]
    }
    # Overlapping parcel sharing 50%+ area
    poly_b = {
        "type": "Polygon",
        "coordinates": [[[77.01, 20.0], [77.03, 20.0], [77.03, 20.02], [77.01, 20.02], [77.01, 20.0]]]
    }
    res = check_boundary_overlap(poly_a, [poly_b])
    assert res["has_overlap"] is True
    assert res["overlapping_claims_count"] == 1
    assert res["max_overlap_percentage"] > 40.0

# ----------------- 2. Claim Risk Scoring Engine -----------------

def test_claim_risk_score_low_risk_clean():
    res = compute_claim_risk_score(
        claimed_area_ha=3.0,
        observed_damaged_area_ha=2.8,
        claimant_name="Ramesh Patil",
        crop_type="Soybean",
        survey_crop_type="Soybean",  # Matches DCS
        photo_verification_status="INSIDE",
        document_verification_report={
            "checks": {
                "name_match": {"status": "PASS"},
                "area_consistency": {"status": "PASS", "discrepancy_percent": 5.0},
                "tamper_hints": {"duplicate_detected": False}
            }
        }
    )
    assert res["composite_risk_score"] <= 30
    assert res["risk_tier"] == "LOW_RISK"
    assert res["triage_recommendation"] == "FAST_TRACK_ELIGIBLE"

def test_claim_risk_score_area_inflation_and_crop_mismatch():
    res = compute_claim_risk_score(
        claimed_area_ha=10.0,
        observed_damaged_area_ha=2.0,  # 80% gap
        claimant_name="Sunita Devi",
        crop_type="Soybean",
        survey_crop_type="Cotton",  # Mismatch vs DCS
        photo_verification_status="OUTSIDE",  # Photo taken elsewhere
        prior_claims_by_farmer=4,
        document_verification_report={
            "checks": {
                "tamper_hints": {"duplicate_detected": True},  # Recycled paper
                "area_consistency": {"status": "FAIL", "discrepancy_percent": 65.0}
            }
        }
    )
    assert res["composite_risk_score"] >= 70
    assert res["risk_tier"] == "HIGH_RISK"
    assert res["triage_recommendation"] == "PHYSICAL_AUDIT_REQUIRED"
    assert res["risk_factors_count"] >= 4

    # Verify specific risk factors
    factor_names = [f["factor"] for f in res["risk_factors"]]
    assert "AREA_DIVERGENCE_SEVERE" in factor_names
    assert "CROP_REGISTRY_MISMATCH" in factor_names
    assert "PHOTO_EXIF_OUTSIDE_BOUNDARY" in factor_names
    assert "RECYCLED_DOCUMENT_HASH" in factor_names

# ----------------- 3. Land-Use Change Detection Engine -----------------

def test_land_use_change_detection_structure():
    boundary = {
        "type": "Polygon",
        "coordinates": [[[77.0, 20.5], [77.02, 20.5], [77.02, 20.52], [77.0, 20.52], [77.0, 20.5]]]
    }
    res = detect_land_use_change(
        boundary_geojson=boundary,
        baseline_date=date(2023, 6, 1),
        current_date=date(2024, 6, 1),
        parcel_khasra_no="142/1",
        village="Wadgaon",
        district="Akola"
    )
    assert res["has_suspected_change"] is True
    assert res["change_classification"] == "NEW_BUILT_STRUCTURE"
    assert res["change_area_ha"] > 0
    assert res["confidence_score"] >= 80
    assert "overlays_geojson" in res
    assert len(res["overlays_geojson"]["features"]) > 0
    assert "Section 172 Land Revenue Code" in res["inspector_task_directive"]
    assert "Suspected change based on multi-temporal spectral and radar anomalies" in res["disclaimer"]

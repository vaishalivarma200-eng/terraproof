"""
Unit & Integration Tests for Phase 7:
- Privacy-first Identity abstraction (Zero Raw Aadhaar storage)
- DPDP Act Consent Logging, Data Export, and Erasure
- Bilingual Hindi + English Land Document OCR Parsing
- Land Document Verification Engine (Area, Name, Tenancy, Duplicate Tamper Detection)
- Official Integration Adapters (AgriStack DCS, e-Girdawari, PMFBY/NCIP, Land Records)
"""

import pytest
import asyncio
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.claim import Claim
from app.models.document import LandDocument
from app.identity.mock_provider import MockIdentityProvider
from app.identity.aadhaar_qr_verifier import AadhaarSecureQRVerifier
from app.identity.mobile_otp import MobileOTPProvider
from app.identity.agristack_adapter import AgriStackRegistryAdapter
from app.identity.consent_manager import ConsentManager
from app.documents.ocr_parser import parse_land_record_text, compute_document_hash
from app.documents.verifier import verify_land_document, fuzzy_name_match
from app.adapters.agristack_dcs import AgriStackDCSAdapter
from app.adapters.girdawari import EGirdawariAdapter
from app.adapters.pmfby_ncip import PMFBYNCIPAdapter
from app.adapters.land_records import LandRecordImporter

# Set up in-memory SQLite database for isolated tests
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

# ----------------- 1. Identity & Zero Raw Aadhaar Storage -----------------

def test_mock_provider_zero_raw_aadhaar():
    provider = MockIdentityProvider()
    res = asyncio.run(provider.verify_credentials({"raw_aadhaar": "987654321098", "farmer_name": "Ramesh Patil"}))
    
    # Assert raw 12 digits are never in masked_identifier
    assert "987654321098" not in res.masked_identifier
    assert res.masked_identifier == "XXXX-XXXX-1098"
    assert res.is_verified is True
    assert len(res.salted_hash) == 64  # SHA-256

def test_aadhaar_qr_verifier():
    verifier = AadhaarSecureQRVerifier()
    res = asyncio.run(verifier.verify_credentials({"qr_data": "sample_signed_qr_payload"}))
    
    assert res.is_verified is True
    assert res.masked_identifier.startswith("XXXX-XXXX-")
    assert res.verification_source == "AADHAAR_SECURE_QR"

def test_mobile_otp_provider():
    provider = MobileOTPProvider()
    res = asyncio.run(provider.verify_credentials({"phone_number": "9876543210", "otp": "774921"}))
    
    assert res.is_verified is True
    assert res.masked_identifier == "+91-98XXXXXX10"
    assert "9876543210" not in res.masked_identifier

def test_agristack_farmer_adapter():
    adapter = AgriStackRegistryAdapter()
    res = asyncio.run(adapter.verify_credentials({"farmer_id": "FAR-MH-2024-88392"}))
    
    assert res.is_verified is True
    assert res.masked_identifier.endswith("-88392")
    assert res.verification_source == "AGRISTACK"

# ----------------- 2. DPDP Act Compliance (Consent, Export, Erasure) -----------------

def test_dpdp_consent_export_and_erasure(test_db):
    manager = ConsentManager(test_db)

    # 1. Add sample claim
    claim = Claim(
        reference_no="CLM-TEST-DPDP-01",
        farmer_name="Sita Ram",
        crop_type="Soybean",
        claimed_area_ha=2.5,
        damage_type="Flood",
        incident_date_start=date(2024, 7, 10),
        incident_date_end=date(2024, 7, 15),
        latitude=20.5,
        longitude=77.0,
        boundary_geojson={"type": "Polygon", "coordinates": [[[77.0, 20.5], [77.01, 20.5], [77.01, 20.51], [77.0, 20.51], [77.0, 20.5]]]},
        supporting_notes="Farmer telephone: 9999988888",
        status="SUBMITTED"
    )
    test_db.add(claim)
    test_db.commit()

    # 2. Log Consent
    consent = manager.log_consent(farmer_name="Sita Ram", masked_identifier="XXXX-XXXX-8888")
    assert consent["is_active"] is True
    assert consent["farmer_name"] == "Sita Ram"

    # 3. Export Farmer Dossier (Right to Data Portability)
    dossier = manager.export_farmer_dossier("Sita Ram")
    assert dossier["farmer_name"] == "Sita Ram"
    assert len(dossier["claims"]) == 1
    assert dossier["claims"][0]["claim_reference"] == "CLM-TEST-DPDP-01"

    # 4. Purge Farmer Personal Data (Right to Erasure)
    purge_res = manager.purge_farmer_personal_data("Sita Ram")
    assert purge_res["affected_records"] == 1

    # Verify claim is anonymized
    updated = test_db.query(Claim).filter(Claim.reference_no == "CLM-TEST-DPDP-01").first()
    assert "Sita Ram" not in updated.farmer_name
    assert updated.farmer_name.startswith("ANONYMIZED_FARMER_")
    assert "[REDACTED PER DPDP ACT ERASURE REQUEST]" in updated.supporting_notes

# ----------------- 3. Bilingual Land Document OCR Parsing -----------------

def test_ocr_parser_hindi_and_english():
    # Bilingual RoR sample
    sample_text = """
    मध्यप्रदेश शासन - राजस्व विभाग (भू-अभिलेख)
    खसरा / खतौनी नकल 
    खसरा संख्या: 142/1
    खाता संख्या: 88
    खातेदार का नाम: रमेश तुकाराम पाटिल
    क्षेत्रफल: 3.20 हेक्टेयर
    गाँव: वडगांव
    जिला: अकोला
    """
    parsed = parse_land_record_text(sample_text)
    assert parsed["khasra_no"] == "142/1"
    assert parsed["khatauni_no"] == "88"
    assert "रमेश तुकाराम पाटिल" in parsed["owner_name"]
    assert parsed["extracted_area_ha"] == 3.20

def test_ocr_parser_area_conversions():
    # Test Bigha conversion
    bigha_text = "खसरा संख्या: 201/4 | खातेदार: राम सिंह | क्षेत्रफल: 4 बीघा"
    parsed_bigha = parse_land_record_text(bigha_text)
    assert parsed_bigha["extracted_area_ha"] == pytest.approx(4 * 0.2529, rel=1e-2)

    # Test Acre conversion
    acre_text = "Survey No: 99 | Owner: Sunita Devi | Area: 5.5 Acre"
    parsed_acre = parse_land_record_text(acre_text)
    assert parsed_acre["extracted_area_ha"] == pytest.approx(5.5 * 0.404686, rel=1e-2)

# ----------------- 4. Land Document Verification Engine -----------------

def test_verify_land_document_owner_pass():
    extracted = {
        "khasra_no": "142/1",
        "owner_name": "Ramesh Tukaram Patil",
        "extracted_area_ha": 3.2,
        "village": "Wadgaon",
        "district": "Akola"
    }
    res = verify_land_document(
        extracted_data=extracted,
        claimant_name="Ramesh T. Patil",
        drawn_boundary_ha=3.15,
        claimed_area_ha=3.0,
        claim_district="Akola",
        tenancy_type="OWNER"
    )
    assert res["verification_status"] == "VERIFIED"
    assert res["checks"]["name_match"]["status"] == "PASS"
    assert res["checks"]["area_consistency"]["status"] == "PASS"

def test_verify_land_document_area_inflation_warn():
    extracted = {
        "khasra_no": "142/1",
        "owner_name": "Ramesh Patil",
        "extracted_area_ha": 2.0,  # Document says 2 ha
        "district": "Akola"
    }
    res = verify_land_document(
        extracted_data=extracted,
        claimant_name="Ramesh Patil",
        drawn_boundary_ha=6.5,  # Drawn boundary inflated to 6.5 ha
        claimed_area_ha=6.0,
        claim_district="Akola",
        tenancy_type="OWNER"
    )
    assert res["verification_status"] == "NEEDS_REVIEW"
    assert res["checks"]["area_consistency"]["status"] == "WARN"
    assert "Documented land area (2.0 ha) is smaller than drawn field boundary" in res["checks"]["area_consistency"]["reason"]

def test_verify_land_document_tenant_protection():
    extracted = {
        "khasra_no": "142/1",
        "owner_name": "Harishchandra Shinde",  # Landlord on 7/12
        "extracted_area_ha": 4.0
    }
    # Claimant is a tenant farmer
    res = verify_land_document(
        extracted_data=extracted,
        claimant_name="Mahesh Pawar",
        drawn_boundary_ha=3.8,
        claimed_area_ha=3.5,
        tenancy_type="TENANT"
    )
    # Tenancy check explains the difference and does not fail
    assert res["checks"]["tenancy_validation"]["status"] == "PASS"
    assert "Tenant / Sharecropper claim recognized" in res["checks"]["tenancy_validation"]["reason"]

def test_verify_land_document_duplicate_hash():
    extracted = {"owner_name": "Kishan Lal", "extracted_area_ha": 2.0}
    res = verify_land_document(
        extracted_data=extracted,
        claimant_name="Kishan Lal",
        drawn_boundary_ha=2.0,
        claimed_area_ha=2.0,
        is_duplicate_hash=True
    )
    assert res["verification_status"] == "NEEDS_REVIEW"
    assert res["checks"]["tamper_detection"]["status"] == "WARN"
    assert "recycled document" in res["checks"]["tamper_detection"]["reason"]

# ----------------- 5. Official Integration Adapters -----------------

def test_agristack_dcs_adapter():
    adapter = AgriStackDCSAdapter()
    rec = asyncio.run(adapter.get_crop_sown_record("142/1", district="Akola"))
    assert rec is not None
    assert rec.crop_name == "Soybean"
    assert rec.farmer_name == "Ramesh Tukaram Patil"

def test_girdawari_adapter_export():
    adapter = EGirdawariAdapter()
    claim_data = {
        "reference_no": "CLM-MH-001",
        "khasra_no": "142/1",
        "farmer_name": "Ramesh Patil",
        "crop_type": "Soybean",
        "claimed_area_ha": 3.0,
        "district": "Akola",
        "state": "Maharashtra"
    }
    analysis_data = {
        "damaged_area_ha": 2.1,
        "damage_percentage": 70.0,
        "peril_classification": "Flood",
        "overall_confidence_score": 90
    }
    entry = adapter.generate_draft_entry(claim_data, analysis_data)
    assert entry.khasra_no == "142/1"
    assert entry.satellite_damage_percent == 70.0
    assert entry.peril_cause == "Flood"

    csv_out = adapter.export_csv([entry])
    assert "khasra_no,village,patwar_halka" in csv_out
    assert "CLM-MH-001" not in csv_out  # Ensure official revenue format
    assert "142/1" in csv_out

def test_pmfby_ncip_adapter_export():
    adapter = PMFBYNCIPAdapter()
    claim_data = {
        "reference_no": "CLM-MH-001",
        "farmer_name": "Ramesh Patil",
        "masked_aadhaar_ref": "XXXX-XXXX-4921",
        "crop_type": "Soybean",
        "crop_season": "Kharif",
        "district": "Akola",
        "khasra_no": "142/1",
        "claimed_area_ha": 3.0,
        "sum_insured_per_ha": 40000.0
    }
    analysis_data = {
        "damaged_area_ha": 2.0,
        "damage_percentage": 66.7,
        "peril_classification": "Flood",
        "overall_confidence_score": 85
    }
    dossier = adapter.generate_dossier(claim_data, analysis_data)
    assert dossier.ncip_policy_id.startswith("NCIP-2024-")
    assert dossier.sum_insured_inr == 120000.0
    assert dossier.recommended_payout_max_inr == 80000.0
    assert len(dossier.dossier_sha256) == 64

    csv_out = adapter.export_csv([dossier])
    assert "ncip_policy_id" in csv_out
    assert "XXXX-XXXX-4921" in csv_out

def test_land_record_importer():
    importer = LandRecordImporter()
    geojson_sample = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "khasra_no": "142/1",
                    "owner_name": "Ramesh Patil",
                    "village": "Wadgaon",
                    "district": "Akola",
                    "area_ha": 3.2
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.0, 20.5], [77.01, 20.5], [77.01, 20.51], [77.0, 20.51], [77.0, 20.5]]]
                }
            }
        ]
    }
    parcels = importer.parse_geojson_features(geojson_sample)
    assert len(parcels) == 1
    assert parcels[0].khasra_no == "142/1"
    assert parcels[0].official_area_ha == 3.2

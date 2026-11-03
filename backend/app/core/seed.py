"""
TerraProof Seed Data & Demonstration Scenarios
Loads either the canonical 8 Kharif Flood demo evaluation claims (Judge-Ready)
or fallback starter scenarios.
Integrates complete end-to-end evidence chains: Claim, AnalysisJob, LandDocument,
OfficialInspection, and Cryptographic AuditLedger.
"""

import os
import json
import logging
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.claim import Claim
from app.models.analysis import AnalysisJob
from app.models.document import LandDocument
from app.models.decision import OfficialInspection
from app.core.audit_chain import append_audit_block

logger = logging.getLogger(__name__)

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
BASE_DIR = REPO_ROOT
DEMO_CLAIMS_PATH = os.path.join(BASE_DIR, "data", "demo", "claims_seed.json")

def seed_demo_kharif_flood(db: Session) -> int:
    """Loads the 8 canonical demonstration claims from data/demo/claims_seed.json."""
    if not os.path.exists(DEMO_CLAIMS_PATH):
        logger.warning(f"Demo claims file not found at {DEMO_CLAIMS_PATH}. Running generator...")
        import subprocess
        script_path = os.path.join(BASE_DIR, "scripts", "generate_demo_data.py")
        subprocess.run(["python", script_path], check=True)

    with open(DEMO_CLAIMS_PATH, "r", encoding="utf-8") as f:
        demo_claims = json.load(f)

    # 1. Clean up existing records for clean demo state
    db.query(OfficialInspection).delete()
    db.query(LandDocument).delete()
    db.query(AnalysisJob).delete()
    db.query(Claim).delete()
    db.commit()

    created_claims = []
    for c_data in demo_claims:
        start_d = date.fromisoformat(c_data["incident_date_start"])
        end_d = date.fromisoformat(c_data["incident_date_end"])
        payout = c_data.get("payout_calculation", {})

        claim = Claim(
            reference_no=c_data["reference_no"],
            farmer_name=c_data["farmer_name"],
            crop_type=c_data["crop_type"],
            crop_season=c_data.get("crop_season", "Kharif"),
            claimed_area_ha=float(c_data["claimed_area_ha"]),
            cultivated_area_ha=float(c_data.get("cultivated_area_ha", c_data["claimed_area_ha"])),
            damage_type=c_data["damage_type"],
            incident_date_start=start_d,
            incident_date_end=end_d,
            state=c_data.get("state", "Uttar Pradesh"),
            district=c_data.get("district", "Vikrampur (Fictional Demo District)"),
            claimed_loss_amount=float(payout.get("claimed_total_inr", 150000.0)),
            sum_insured_per_ha=float(payout.get("sum_insured_per_ha", 35000.0)),
            khasra_no=c_data.get("khasra_no"),
            khatauni_no=c_data.get("khatauni_no"),
            tenancy_type=c_data.get("tenancy_type", "OWNER"),
            masked_aadhaar_ref=c_data.get("masked_aadhaar_ref", "XXXX-XXXX-1234"),
            kyc_status=c_data.get("kyc_status", "VERIFIED"),
            latitude=float(c_data["latitude"]),
            longitude=float(c_data["longitude"]),
            boundary_geojson=c_data["boundary_geojson"],
            field_photos=c_data.get("field_photos", []),
            supporting_notes=f"Synthetic demonstration claim: {c_data.get('claim_archetype')}. {c_data.get('risk_assessment', {}).get('recommended_action', '')}",
            status=c_data.get("status", "SUBMITTED"),
            risk_score=float(c_data.get("risk_assessment", {}).get("composite_risk_score", 15.0)),
            risk_tier=c_data.get("risk_assessment", {}).get("risk_tier", "LOW_RISK"),
            risk_signals=c_data.get("risk_assessment", {}),
            land_use_change_flags=c_data.get("land_use_change_flags", None)
        )
        db.add(claim)
        db.flush()

        # 2. Attach Precomputed Completed AnalysisJob
        fusion_mode = "SENTINEL_1_SAR_MONSOON_FALLBACK" if c_data["reference_no"] == "CLM-DEMO-006" else "SENTINEL_2_OPTICAL_CONFIRMED"
        verdict = "APPROVE_FAST_TRACK" if c_data.get("claim_archetype") == "GENUINE_CLAIM" else ("FIELD_AUDIT_REQUIRED" if c_data.get("claim_archetype") == "INFLATED_CLAIM" else "REJECT_ANOMALOUS")
        job_results = {
            "summary": f"Automated geospatial verification completed for {c_data['farmer_name']}. Observed damaged area: {c_data['observed_damaged_ha']} ha vs claimed {c_data['claimed_area_ha']} ha (Divergence: {c_data['divergence_pct']}%). Confidence score: {c_data['confidence_score']}/100.",
            "verdict_recommendation": verdict,
            "integrity_hash": f"SHA256-{c_data['reference_no']}-VERIFIED",
            "metrics": {
                "baseline_index_mean": 0.68,
                "post_event_index_mean": 0.18,
                "index_delta_mean": -0.50,
                "total_field_area_ha": float(c_data["claimed_area_ha"]),
                "estimated_affected_area_ha": float(c_data["observed_damaged_ha"]),
                "damaged_area_ha": float(c_data["observed_damaged_ha"]),
                "damage_percentage": round((float(c_data["observed_damaged_ha"]) / float(c_data["claimed_area_ha"])) * 100, 1),
                "claimed_area_ha": float(c_data["claimed_area_ha"]),
                "area_discrepancy_percent": float(c_data["divergence_pct"]),
                "confidence_score": float(c_data["confidence_score"]),
                "confidence_rationale": f"High multi-spectral coherence ({c_data['confidence_score']}%) across 10m spatial grid.",
                "confidence_breakdown": c_data.get("confidence_breakdown", {}),
                "peril_classification": {
                    "classified_peril": c_data["damage_type"],
                    "confidence": float(c_data["confidence_score"]),
                    "consistency_with_claim": "CONSISTENT" if c_data.get("claim_archetype") == "GENUINE_CLAIM" else "INCONSISTENT_DIVERGENT",
                    "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
                    "rationale": f"Spectral transition matches acute {c_data['damage_type'].lower()} inundation timeline.",
                    "recommended_action": "Approve settlement" if c_data.get("claim_archetype") == "GENUINE_CLAIM" else "Physical audit required"
                },
                "sensor_fusion_mode": fusion_mode,
                "compensation_scenario": payout,
                "weather_summary": {
                    "peak_precipitation_mm": 84.8,
                    "total_period_precipitation_mm": 199.6,
                    "normal_baseline_mm": 28.0,
                    "anomaly_percentage": 612.9
                },
                "crop_calendar_context": {
                    "crop_type": c_data["crop_type"],
                    "season": c_data["crop_season"],
                    "sowing_window": "June 15 - July 15",
                    "harvest_window": "October 20 - November 25"
                }
            },
            "observations_used": [],
            "limitations": [
                "Optical cloud cover during peak monsoon requires Sentinel-1 C-band SAR backscatter fusion.",
                "10m pixel resolution bounds mixed-pixel uncertainty to +/- 0.04 ha."
            ],
            "potential_inconsistencies": [] if c_data.get("claim_archetype") == "GENUINE_CLAIM" else [
                f"Discrepancy detected: Claimed {c_data['claimed_area_ha']} ha vs Verified {c_data['observed_damaged_ha']} ha ({c_data['divergence_pct']}% divergence)."
            ],
            "overlays_geojson": c_data.get("overlays_geojson")
        }

        analysis_job = AnalysisJob(
            claim_id=claim.id,
            analysis_type="INSURANCE_VERIFICATION",
            status="COMPLETED",
            execution_mode="demo",
            parameters={
                "boundary_geojson": c_data["boundary_geojson"],
                "damage_type": c_data["damage_type"],
                "incident_start": c_data["incident_date_start"],
                "incident_end": c_data["incident_date_end"],
                "crop_type": c_data["crop_type"],
                "claimed_area_ha": c_data["claimed_area_ha"],
                "crop_season": c_data["crop_season"]
            },
            results=job_results,
            compensation_scenario=payout,
            integrity_hash=f"SHA256-{c_data['reference_no']}-VERIFIED",
            completed_at=datetime.now(timezone.utc)
        )
        db.add(analysis_job)

        # 3. Attach Land Documents
        for doc in c_data.get("documents", []):
            land_doc = LandDocument(
                claim_id=claim.id,
                document_type=doc.get("document_type", "7/12_JAMABANDI"),
                filename=doc.get("file_name", "document.pdf"),
                file_hash=doc.get("document_hash", "HASH123"),
                tenancy_type=claim.tenancy_type or "OWNER",
                extracted_data=doc.get("ocr_extracted", {}),
                verification_status=doc.get("verification_status", "VERIFIED"),
                verification_report=doc,
                created_at=datetime.now(timezone.utc)
            )
            db.add(land_doc)

        # 4. Attach Pre-inspection for relevant archetypes
        if c_data["reference_no"] in ["CLM-DEMO-002", "CLM-DEMO-008"]:
            inspection = OfficialInspection(
                claim_id=claim.id,
                officer_name="Kailash Sharma (Patwari)",
                officer_role="PATWARI",
                jurisdiction_village=c_data.get("village", "Rampur Kalan"),
                jurisdiction_tehsil="Vikrampur Tehsil",
                jurisdiction_district=claim.district,
                inspection_date=date(2026, 7, 15),
                device_latitude=claim.latitude,
                device_longitude=claim.longitude,
                checklist_crop_present=True,
                checklist_water_marks_observed=True,
                checklist_structure_present=(c_data["reference_no"] == "CLM-DEMO-008"),
                checklist_boundary_matches=(c_data["reference_no"] != "CLM-DEMO-002"),
                prefilled_satellite_damage_percent=float(c_data["divergence_pct"]),
                confirmed_damage_percent=float(c_data["observed_damaged_ha"] / c_data["claimed_area_ha"] * 100.0) if c_data["claimed_area_ha"] > 0 else 0.0,
                decision_action="REQUEST_MORE_INFO" if c_data["reference_no"] == "CLM-DEMO-002" else "ESCALATE_TO_TEHSILDAR",
                decision_remarks="Automated pre-screening priority assigned following multi-sensor satellite divergence analysis.",
                signature_hash=f"SHA256-INSP-{c_data['reference_no']}",
                signed_at=datetime.now(timezone.utc)
            )
            db.add(inspection)

        # 5. Append Genesis Audit Block
        append_audit_block(
            db=db,
            event_type="DEMO_CLAIM_SEEDED",
            record_id=claim.id,
            actor=f"DEMO_SCENARIO:{c_data['reference_no']}",
            payload={
                "reference_no": claim.reference_no,
                "crop_type": claim.crop_type,
                "claimed_area_ha": claim.claimed_area_ha,
                "observed_damaged_ha": c_data["observed_damaged_ha"],
                "divergence_pct": c_data["divergence_pct"],
                "triage_color": c_data["triage_color"],
                "status": claim.status
            }
        )
        created_claims.append(claim)

    db.commit()
    print(f"Successfully loaded {len(created_claims)} demo claims with full analysis and evidence chains.")
    return len(created_claims)

def seed_initial_claims(force: bool = False):
    """Entry point for database initial seed / reset."""
    init_db()
    db = SessionLocal()
    try:
        existing_count = db.query(Claim).count()
        if existing_count >= 8 and not force:
            return

        seed_demo_kharif_flood(db)
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_claims(force=True)

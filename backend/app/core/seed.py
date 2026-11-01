"""
TerraProof Seed Data & Demonstration Scenarios
Generates the 4 comprehensive verification archetypes requested for evaluation:
1. Genuine Flood Claim (Fast-Track Approved, high confidence, consistent docs)
2. Inflated Area Claim (Flagged by Risk Engine, document 3.2 ha vs claimed 14.5 ha)
3. Land Document Tenancy Mismatch (Tenant claim with missing owner lease declaration)
4. Suspected Unauthorized Construction (NDBI increase & SAR double-bounce detected)
"""
from datetime import date
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.claim import Claim
from app.models.document import LandDocument
from app.models.decision import OfficialInspection
from app.core.audit_chain import append_audit_block

def seed_initial_claims(force: bool = False):
    """Seeds initial demonstration scenarios into the database."""
    init_db()
    db = SessionLocal()
    try:
        existing_count = db.query(Claim).count()
        if existing_count > 0 and not force:
            print(f"Database already contains {existing_count} claims. Skipping seed.")
            return

        if force:
            # Clean up old records for clean demo reset
            db.query(LandDocument).delete()
            db.query(OfficialInspection).delete()
            db.query(Claim).delete()
            db.commit()

        # Scenario 1: Genuine Flood Claim (Fast-Track Approved)
        # Farmer: Gurpreet Singh, Ludhiana, Punjab. 3.5 ha paddy inundated by canal breach.
        claim_1 = Claim(
            reference_no="CLM-2026-0891",
            farmer_name="Gurpreet Singh",
            crop_type="Rice",
            claimed_area_ha=3.5,
            damage_type="Flood",
            incident_date_start=date(2026, 7, 10),
            incident_date_end=date(2026, 7, 18),
            state="Punjab",
            district="Ludhiana",
            crop_season="Kharif",
            cultivated_area_ha=3.5,
            claimed_loss_amount=133000.0,
            sum_insured_per_ha=38000.0,
            khasra_no="142/2",
            khatauni_no="84",
            tenancy_type="OWNER",
            masked_aadhaar_ref="XXXX-XXXX-1098",
            kyc_status="VERIFIED",
            latitude=30.901,
            longitude=75.857,
            boundary_geojson={
                "type": "Polygon",
                "coordinates": [[
                    [75.855, 30.900],
                    [75.859, 30.900],
                    [75.859, 30.903],
                    [75.855, 30.903],
                    [75.855, 30.900]
                ]]
            },
            supporting_notes="Sustained monsoon canal breach flooded rice paddy field. Satellite NDWI confirmed 78% water coverage.",
            status="FAST_TRACK_APPROVED"
        )

        # Scenario 2: Inflated Area Claim (Flagged by Risk Engine)
        # Farmer: Vikramaditya Singh, Kota, Rajasthan. Claimed 14.5 ha, but Khasra title & drawn parcel is only 3.2 ha.
        claim_2 = Claim(
            reference_no="CLM-2026-1044",
            farmer_name="Vikramaditya Singh",
            crop_type="Soybean",
            claimed_area_ha=14.5,  # 353% inflation!
            damage_type="Drought",
            incident_date_start=date(2026, 6, 1),
            incident_date_end=date(2026, 6, 28),
            state="Rajasthan",
            district="Kota",
            crop_season="Kharif",
            cultivated_area_ha=3.2,
            claimed_loss_amount=435000.0,
            sum_insured_per_ha=30000.0,
            khasra_no="88/1",
            khatauni_no="112",
            tenancy_type="OWNER",
            masked_aadhaar_ref="XXXX-XXXX-5542",
            kyc_status="VERIFIED",
            latitude=25.213,
            longitude=75.864,
            boundary_geojson={
                "type": "Polygon",
                "coordinates": [[
                    [75.862, 25.211],
                    [75.866, 25.211],
                    [75.866, 25.215],
                    [75.862, 25.215],
                    [75.862, 25.211]
                ]]
            },
            supporting_notes="Claimant reported total loss of 14.5 hectares. Land records and satellite boundary quantify parcel as 3.2 ha.",
            status="FLAGGED_AREA_INFLATION"
        )

        # Scenario 3: Land Document Tenancy Mismatch (Tenancy Dispute)
        # Farmer: Devendra Meena, Karnal, Haryana. Filed as tenant farmer on 4.0 ha Wheat, but uploaded Jamabandi
        # belongs to landowner without registered tenant lease agreement affidavit.
        claim_3 = Claim(
            reference_no="CLM-2026-0520",
            farmer_name="Devendra Meena",
            crop_type="Wheat",
            claimed_area_ha=4.0,
            damage_type="Hail",
            incident_date_start=date(2026, 3, 12),
            incident_date_end=date(2026, 3, 14),
            state="Haryana",
            district="Karnal",
            crop_season="Rabi",
            cultivated_area_ha=4.0,
            claimed_loss_amount=140000.0,
            sum_insured_per_ha=35000.0,
            khasra_no="203/4",
            khatauni_no="49",
            tenancy_type="TENANT",
            masked_aadhaar_ref="XXXX-XXXX-8921",
            kyc_status="VERIFIED",
            latitude=29.685,
            longitude=76.990,
            boundary_geojson={
                "type": "Polygon",
                "coordinates": [[
                    [76.988, 29.683],
                    [76.992, 29.683],
                    [76.992, 29.687],
                    [76.988, 29.687],
                    [76.988, 29.683]
                ]]
            },
            supporting_notes="Tenant claim filed. Uploaded Jamabandi names landowner without annexed Tehsildar-notarized lease deed.",
            status="NEEDS_TENANCY_REVIEW"
        )

        # Scenario 4: Suspected Unauthorized Construction on Farmland
        # Farmer: Rajeshwari Bai, Ujjain, MP. 2.5 ha plot. NDBI temporal jump and SAR backscatter indicate
        # 0.45 ha concrete plinth / warehouse shed built on agricultural revenue parcel.
        claim_4 = Claim(
            reference_no="CLM-2026-0312",
            farmer_name="Rajeshwari Bai",
            crop_type="Cotton",
            claimed_area_ha=2.5,
            damage_type="Waterlogging",
            incident_date_start=date(2026, 8, 5),
            incident_date_end=date(2026, 8, 12),
            state="Madhya Pradesh",
            district="Ujjain",
            crop_season="Kharif",
            cultivated_area_ha=2.5,
            claimed_loss_amount=105000.0,
            sum_insured_per_ha=42000.0,
            khasra_no="512/3",
            khatauni_no="77",
            tenancy_type="OWNER",
            masked_aadhaar_ref="XXXX-XXXX-3341",
            kyc_status="VERIFIED",
            latitude=23.176,
            longitude=75.788,
            boundary_geojson={
                "type": "Polygon",
                "coordinates": [[
                    [75.786, 23.174],
                    [75.790, 23.174],
                    [75.790, 23.178],
                    [75.786, 23.178],
                    [75.786, 23.174]
                ]]
            },
            supporting_notes="Satellite change analysis detected +0.38 NDBI jump and severe SAR double-bounce consistent with concrete construction.",
            status="FLAGGED_UNAUTHORIZED_CONSTRUCTION"
        )

        claims_list = [claim_1, claim_2, claim_3, claim_4]
        for c in claims_list:
            db.add(c)
        db.commit()

        for c in claims_list:
            db.refresh(c)
            # Record Genesis / Initial state in cryptographic audit ledger
            append_audit_block(
                db=db,
                event_type="CLAIM_SUBMITTED",
                record_id=c.id,
                actor=f"SYSTEM_SEED:{c.reference_no}",
                payload={
                    "reference_no": c.reference_no,
                    "crop_type": c.crop_type,
                    "claimed_area_ha": c.claimed_area_ha,
                    "state": c.state,
                    "district": c.district,
                    "damage_type": c.damage_type,
                    "status": c.status
                }
            )

        print(f"Successfully seeded {len(claims_list)} master demonstration scenarios into TerraProof.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_claims(force=True)

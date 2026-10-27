from datetime import date
from app.core.database import SessionLocal, init_db
from app.models.claim import Claim

def seed_initial_claims():
    init_db()
    db = SessionLocal()
    try:
        if db.query(Claim).count() > 0:
            print("Database already contains claims. Skipping seed.")
            return

        sample_claims = [
            Claim(
                reference_no="CLM-2026-0891",
                farmer_name="Gurpreet Singh",
                crop_type="Rice",
                claimed_area_ha=14.5,
                damage_type="Flood",
                incident_date_start=date(2026, 7, 10),
                incident_date_end=date(2026, 7, 18),
                latitude=26.91,
                longitude=75.81,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [75.80, 26.90],
                        [75.82, 26.90],
                        [75.82, 26.92],
                        [75.80, 26.92],
                        [75.80, 26.90]
                    ]]
                },
                supporting_notes="Sustained monsoon canal inundation flooded rice paddy field.",
                status="SUBMITTED"
            ),
            Claim(
                reference_no="CLM-2026-1044",
                farmer_name="Pooja Patel",
                crop_type="Soybean",
                claimed_area_ha=18.2,
                damage_type="Drought",
                incident_date_start=date(2026, 6, 1),
                incident_date_end=date(2026, 6, 28),
                latitude=27.21,
                longitude=76.11,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [76.10, 27.20],
                        [76.13, 27.20],
                        [76.13, 27.23],
                        [76.10, 27.23],
                        [76.10, 27.20]
                    ]]
                },
                supporting_notes="Severe 4-week dry spell resulting in leaf wilting and stunted vegetative growth.",
                status="SUBMITTED"
            ),
            Claim(
                reference_no="CLM-2026-0520",
                farmer_name="Rameshwar Sharma",
                crop_type="Wheat",
                claimed_area_ha=9.8,
                damage_type="Hail",
                incident_date_start=date(2026, 3, 12),
                incident_date_end=date(2026, 3, 14),
                latitude=27.42,
                longitude=76.32,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [76.30, 27.40],
                        [76.33, 27.40],
                        [76.33, 27.43],
                        [76.30, 27.43],
                        [76.30, 27.40]
                    ]]
                },
                supporting_notes="Sudden localized squall and hailstorm during grain-filling stage.",
                status="SUBMITTED"
            )
        ]

        for c in sample_claims:
            db.add(c)
        db.commit()
        print(f"Successfully seeded {len(sample_claims)} realistic sample agricultural claims.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_claims()

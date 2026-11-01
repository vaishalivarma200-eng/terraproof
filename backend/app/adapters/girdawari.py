"""
TerraProof e-Girdawari Integration & Revenue Department Adapter
Enables bi-directional interoperability with state revenue portals (MP Saara, UP e-Girdawari,
MahaBhulekh/Girdawari, Haryana Meri Fasal Mera Byora).
Generates standardized Draft Girdawari entries (CSV / JSON) for Patwari review and submission.
"""

import io
import csv
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class DraftGirdawariEntry(BaseModel):
    khasra_no: str = Field(..., description="Khasra / Survey parcel number")
    village: str
    patwar_halka: str = Field("Halka-04", description="Patwari administrative circle / halka")
    tehsil: str
    district: str
    state: str
    farmer_name: str
    crop_sown: str
    sown_area_ha: float
    satellite_damaged_area_ha: float
    satellite_damage_percent: float
    peril_cause: str  # Flood, Drought, Waterlogging, Hail, Normal Harvest
    observation_period: str
    confidence_score: int
    patwari_status: str = Field("DRAFT_PENDING_PATWARI_VERIFICATION", description="Official revenue lifecycle state")
    satellite_sensor_evidence: str = Field("Sentinel-2 MSI + Sentinel-1 SAR")
    remarks: str

# Sample official Girdawari records currently registered in state revenue portals
MOCK_OFFICIAL_GIRDAWARI: Dict[str, Dict[str, Any]] = {
    "142/1": {
        "khasra_no": "142/1",
        "village": "Wadgaon",
        "tehsil": "Balapur",
        "district": "Akola",
        "state": "Maharashtra",
        "recorded_crop": "Soybean",
        "recorded_area_ha": 3.2,
        "recorded_sowing_date": "2024-06-22",
        "official_loss_percent": None,  # Pending field inspection
        "girdawari_status": "SOWN_CONFIRMED"
    },
    "88/2": {
        "khasra_no": "88/2",
        "village": "Raikot",
        "tehsil": "Raikot",
        "district": "Ludhiana",
        "state": "Punjab",
        "recorded_crop": "Wheat",
        "recorded_area_ha": 5.0,
        "recorded_sowing_date": "2023-11-15",
        "official_loss_percent": 12.0,
        "girdawari_status": "PRELIMINARY_SURVEYED"
    }
}

class EGirdawariAdapter:
    """
    Adapter to export TerraProof satellite observations as official Draft Girdawari records.
    """

    def generate_draft_entry(
        self,
        claim_data: Dict[str, Any],
        analysis_data: Dict[str, Any]
    ) -> DraftGirdawariEntry:
        """
        Creates a structured Draft Girdawari Entry from a claim and satellite analysis result.
        """
        khasra = claim_data.get("khasra_no") or "Unassigned"
        village = claim_data.get("village") or "Revenue Village"
        tehsil = claim_data.get("tehsil") or claim_data.get("district") or "Tehsil"
        district = claim_data.get("district") or "District"
        state = claim_data.get("state") or "Punjab"
        farmer_name = claim_data.get("farmer_name") or "Claimant"
        crop_sown = claim_data.get("crop_type") or "Paddy"
        
        claimed_ha = float(claim_data.get("claimed_area_ha") or 2.0)
        damaged_ha = float(analysis_data.get("damaged_area_ha") or 0.0)
        damage_pct = float(analysis_data.get("damage_percentage") or 0.0)
        peril = analysis_data.get("peril_classification") or claim_data.get("damage_type") or "Flood"
        confidence = int(analysis_data.get("overall_confidence_score") or 85)

        start_date = str(claim_data.get("incident_date_start") or "")
        end_date = str(claim_data.get("incident_date_end") or "")
        period_str = f"{start_date} to {end_date}"

        remarks = (
            f"Pre-screened by TerraProof. Satellite detected {damage_pct:.1f}% vegetative loss ({damaged_ha:.2f} ha) "
            f"primarily due to {peril}. Confidence: {confidence}%. Awaiting Patwari physical confirmation."
        )

        return DraftGirdawariEntry(
            khasra_no=khasra,
            village=village,
            patwar_halka="Halka-01",
            tehsil=tehsil,
            district=district,
            state=state,
            farmer_name=farmer_name,
            crop_sown=crop_sown,
            sown_area_ha=claimed_ha,
            satellite_damaged_area_ha=damaged_ha,
            satellite_damage_percent=round(damage_pct, 1),
            peril_cause=peril,
            observation_period=period_str,
            confidence_score=confidence,
            patwari_status="DRAFT_PENDING_PATWARI_VERIFICATION",
            satellite_sensor_evidence="Sentinel-2 MSI (Optical) + Sentinel-1 GRD (SAR)",
            remarks=remarks
        )

    def export_csv(self, entries: List[DraftGirdawariEntry]) -> str:
        """
        Exports draft girdawari entries into state revenue CSV template.
        """
        output = io.StringIO()
        fieldnames = [
            "khasra_no", "village", "patwar_halka", "tehsil", "district", "state",
            "farmer_name", "crop_sown", "sown_area_ha", "satellite_damaged_area_ha",
            "satellite_damage_percent", "peril_cause", "observation_period",
            "confidence_score", "patwari_status", "satellite_sensor_evidence", "remarks"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for e in entries:
            writer.writerow(e.model_dump())
        return output.getvalue()

    def get_official_girdawari(self, khasra_no: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves baseline state e-Girdawari record for discrepancy checking.
        """
        return MOCK_OFFICIAL_GIRDAWARI.get(khasra_no.strip())


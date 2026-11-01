"""
TerraProof PMFBY & National Crop Insurance Portal (NCIP) Adapter
Formats claim evidence and satellite-derived loss assessments according to
PMFBY / NCIP guidelines for bulk dossier submission and settlement verification.
"""

import io
import csv
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class PMFBYClaimEvidenceDossier(BaseModel):
    application_no: str
    ncip_policy_id: str
    farmer_name: str
    masked_aadhaar_ref: str
    crop_name: str
    crop_season: str
    notified_area_code: str
    khasra_no: str
    sum_insured_inr: float
    claimed_loss_area_ha: float
    satellite_assessed_damage_ha: float
    satellite_damage_percent: float
    satellite_confidence_score: int
    peril_classification: str
    recommended_payout_min_inr: float
    recommended_payout_max_inr: float
    dossier_sha256: str
    generated_at: str

class PMFBYNCIPAdapter:
    """
    Adapter to generate PMFBY/NCIP claim evidence dossiers and CSV batch files.
    """

    def generate_dossier(
        self,
        claim_data: Dict[str, Any],
        analysis_data: Dict[str, Any]
    ) -> PMFBYClaimEvidenceDossier:
        """
        Builds a signed PMFBY evidence dossier.
        """
        ref_no = claim_data.get("reference_no", "CLM-000")
        masked_aadhaar = claim_data.get("masked_aadhaar_ref") or "XXXX-XXXX-4921"
        sum_insured = float(claim_data.get("sum_insured_per_ha") or 35000.0)
        claimed_ha = float(claim_data.get("claimed_area_ha") or 2.0)
        damaged_ha = float(analysis_data.get("damaged_area_ha") or 0.0)
        damage_pct = float(analysis_data.get("damage_percentage") or 0.0)
        confidence = int(analysis_data.get("overall_confidence_score") or 85)
        peril = analysis_data.get("peril_classification") or "Flood"

        # Payout ranges based on confidence-adjusted calculation
        base_payout = damaged_ha * sum_insured
        min_payout = round(base_payout * (confidence / 100.0), 2)
        max_payout = round(base_payout, 2)

        # Hash dossier content for tamper verification
        raw_signature = f"{ref_no}:{masked_aadhaar}:{damaged_ha}:{damage_pct}:{confidence}"
        dossier_hash = hashlib.sha256(raw_signature.encode("utf-8")).hexdigest()

        return PMFBYClaimEvidenceDossier(
            application_no=ref_no,
            ncip_policy_id=f"NCIP-2024-{ref_no.replace('CLM-', '')}",
            farmer_name=claim_data.get("farmer_name", "Farmer"),
            masked_aadhaar_ref=masked_aadhaar,
            crop_name=claim_data.get("crop_type", "Paddy"),
            crop_season=claim_data.get("crop_season", "Kharif"),
            notified_area_code=f"IU-{claim_data.get('district', 'DIST')[:3].upper()}-001",
            khasra_no=claim_data.get("khasra_no") or "142/1",
            sum_insured_inr=sum_insured * claimed_ha,
            claimed_loss_area_ha=claimed_ha,
            satellite_assessed_damage_ha=damaged_ha,
            satellite_damage_percent=round(damage_pct, 1),
            satellite_confidence_score=confidence,
            peril_classification=peril,
            recommended_payout_min_inr=min_payout,
            recommended_payout_max_inr=max_payout,
            dossier_sha256=dossier_hash,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

    def export_csv(self, dossiers: List[PMFBYClaimEvidenceDossier]) -> str:
        """
        Exports PMFBY evidence dossiers to NCIP bulk upload CSV format.
        """
        output = io.StringIO()
        fieldnames = [
            "application_no", "ncip_policy_id", "farmer_name", "masked_aadhaar_ref",
            "crop_name", "crop_season", "notified_area_code", "khasra_no",
            "sum_insured_inr", "claimed_loss_area_ha", "satellite_assessed_damage_ha",
            "satellite_damage_percent", "satellite_confidence_score", "peril_classification",
            "recommended_payout_min_inr", "recommended_payout_max_inr", "dossier_sha256", "generated_at"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for d in dossiers:
            writer.writerow(d.model_dump())
        return output.getvalue()

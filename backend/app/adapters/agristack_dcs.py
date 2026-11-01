"""
TerraProof AgriStack & Digital Crop Survey (DCS) Integration Adapter
Connects with India's AgriStack Farmer ID registry and Digital Crop Survey (DCS)
crop-sown registry. Provides mock/stub adapters ready for live state/national API endpoints.
"""

from typing import Dict, Any, List, Optional
from datetime import date
from pydantic import BaseModel, Field

class DCSCropSownRecord(BaseModel):
    plot_id: str
    khasra_no: str
    village: str
    district: str
    state: str
    farmer_id: str
    farmer_name: str
    crop_name: str
    crop_variety: Optional[str] = "Standard Hybrid"
    crop_season: str  # Kharif, Rabi, Zaid
    sowing_date: date
    sown_area_ha: float
    irrigation_source: str = "Canal / Borewell"
    is_verified_by_surveyor: bool = True
    geotagged_photo_urls: List[str] = Field(default_factory=list)
    survey_timestamp: Optional[str] = None

# Curated reference registry for realistic Indian agricultural states
MOCK_DCS_DATABASE: List[Dict[str, Any]] = [
    {
        "plot_id": "DCS-MH-AKL-001",
        "khasra_no": "142/1",
        "village": "Wadgaon",
        "district": "Akola",
        "state": "Maharashtra",
        "farmer_id": "FAR-MH-2024-88392",
        "farmer_name": "Ramesh Tukaram Patil",
        "crop_name": "Soybean",
        "crop_variety": "JS 335",
        "crop_season": "Kharif",
        "sowing_date": date(2024, 6, 22),
        "sown_area_ha": 3.2,
        "irrigation_source": "Rainfed",
        "is_verified_by_surveyor": True,
        "geotagged_photo_urls": ["https://storage.terraproof.org/dcs/mh_akl_142_1_sown.jpg"],
        "survey_timestamp": "2024-07-05T10:30:00Z"
    },
    {
        "plot_id": "DCS-PB-LDH-045",
        "khasra_no": "88/2",
        "village": "Raikot",
        "district": "Ludhiana",
        "state": "Punjab",
        "farmer_id": "FAR-PB-2024-11029",
        "farmer_name": "Gurpreet Singh",
        "crop_name": "Wheat",
        "crop_variety": "HD-3086",
        "crop_season": "Rabi",
        "sowing_date": date(2023, 11, 15),
        "sown_area_ha": 5.0,
        "irrigation_source": "Tubewell",
        "is_verified_by_surveyor": True,
        "geotagged_photo_urls": ["https://storage.terraproof.org/dcs/pb_ldh_88_2_sown.jpg"],
        "survey_timestamp": "2023-12-01T09:15:00Z"
    },
    {
        "plot_id": "DCS-MP-IND-019",
        "khasra_no": "204/3",
        "village": "Sanwer",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "farmer_id": "FAR-MP-2024-55421",
        "farmer_name": "Suresh Chandra Patel",
        "crop_name": "Soybean",
        "crop_variety": "JS 9560",
        "crop_season": "Kharif",
        "sowing_date": date(2024, 6, 28),
        "sown_area_ha": 4.5,
        "irrigation_source": "Canal",
        "is_verified_by_surveyor": True,
        "geotagged_photo_urls": ["https://storage.terraproof.org/dcs/mp_ind_204_3_sown.jpg"],
        "survey_timestamp": "2024-07-12T14:20:00Z"
    }
]

class AgriStackDCSAdapter:
    """
    Adapter for querying AgriStack Digital Crop Survey (DCS) plot records
    and Farmer ID registry.
    """

    def __init__(self, mode: str = "mock"):
        self.mode = mode

    async def get_crop_sown_record(
        self,
        khasra_no: str,
        village: Optional[str] = None,
        district: Optional[str] = None
    ) -> Optional[DCSCropSownRecord]:
        """
        Retrieves official crop-sown record from Digital Crop Survey for the specified parcel.
        """
        clean_khasra = khasra_no.strip().lower()
        clean_dist = district.strip().lower() if district else None

        for rec in MOCK_DCS_DATABASE:
            if rec["khasra_no"].strip().lower() == clean_khasra:
                if not clean_dist or rec["district"].strip().lower() == clean_dist:
                    return DCSCropSownRecord(**rec)

        # Fallback generated stub if not explicitly in seed
        return DCSCropSownRecord(
            plot_id=f"DCS-STUB-{clean_khasra.replace('/', '-')}",
            khasra_no=khasra_no,
            village=village or "Unspecified Village",
            district=district or "Unspecified District",
            state="India",
            farmer_id=f"FAR-STUB-{abs(hash(khasra_no)) % 100000}",
            farmer_name="Verified Landholder",
            crop_name="Soybean",
            crop_variety="Standard Certified Seed",
            crop_season="Kharif",
            sowing_date=date(2024, 6, 25),
            sown_area_ha=2.5,
            irrigation_source="Borewell",
            is_verified_by_surveyor=False,
            geotagged_photo_urls=[]
        )

    async def get_farmer_profile(self, farmer_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves farmer identity summary linked to an AgriStack Farmer ID.
        """
        for rec in MOCK_DCS_DATABASE:
            if rec["farmer_id"].strip().upper() == farmer_id.strip().upper():
                return {
                    "farmer_id": rec["farmer_id"],
                    "farmer_name": rec["farmer_name"],
                    "state": rec["state"],
                    "district": rec["district"],
                    "registered_plots": [rec["khasra_no"]],
                    "total_holding_ha": rec["sown_area_ha"],
                    "kyc_status": "VERIFIED_AGRISTACK"
                }

        return {
            "farmer_id": farmer_id,
            "farmer_name": "AgriStack Registered Farmer",
            "state": "Maharashtra",
            "district": "Akola",
            "registered_plots": ["142/1"],
            "total_holding_ha": 3.0,
            "kyc_status": "PENDING_CONSENT"
        }


from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Tuple
from app.satellite.base import BaseSatelliteProvider
from app.geospatial.raster import generate_synthetic_sentinel2_bands

class DemonstrationSatelliteProvider(BaseSatelliteProvider):
    """
    Demonstration Mode Satellite Provider.
    Generates deterministic, mathematically consistent synthetic fixtures for offline student work,
    automated testing, and UI previews without hitting remote rate limits or requiring active credentials.
    All outputs are explicitly labeled as demonstration fixtures.
    """

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "name": "TerraProof Demonstration Engine",
            "api_endpoint": "local://fixtures/synthetic",
            "license": "Educational Test Fixture (Non-operational)",
            "supported_satellites": ["Sentinel-2 MSI (Calibrated Fixture)", "Sentinel-1 SAR C-Band (Calibrated Fixture)"],
            "mode": "demo",
            "is_operational": True,
            "quota_status": "Unlimited Local Test Tier"
        }

    async def search_scenes(
        self,
        bbox: Tuple[float, float, float, float],
        start_date: date,
        end_date: date,
        collection: str = "sentinel-2-l2a",
        max_cloud_cover: float = 30.0
    ) -> List[Dict[str, Any]]:
        """
        Returns structured sample scenes explicitly marked as demonstration data.
        """
        mid_date = start_date + (end_date - start_date) // 2
        
        return [
            {
                "id": f"DEMO_S2A_MSIL2A_{start_date.strftime('%Y%m%d')}_T43RER",
                "collection": collection,
                "satellite": "Sentinel-2 MSI (Demonstration Fixture)",
                "datetime": f"{start_date.isoformat()}T10:30:00Z",
                "cloud_cover_percentage": 4.2,
                "ground_sampling_distance_m": 10.0,
                "platform": "Sentinel-2A",
                "constellation": "Copernicus",
                "thumbnail_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
                "assets_available": ["B02", "B03", "B04", "B08", "B11", "visual"],
                "data_provenance": "DEMO MODE: Synthetic observation fixture for testing"
            },
            {
                "id": f"DEMO_S2B_MSIL2A_{mid_date.strftime('%Y%m%d')}_T43RER",
                "collection": collection,
                "satellite": "Sentinel-2 MSI (Demonstration Fixture)",
                "datetime": f"{mid_date.isoformat()}T10:35:00Z",
                "cloud_cover_percentage": 8.5,
                "ground_sampling_distance_m": 10.0,
                "platform": "Sentinel-2B",
                "constellation": "Copernicus",
                "thumbnail_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
                "assets_available": ["B02", "B03", "B04", "B08", "B11", "visual"],
                "data_provenance": "DEMO MODE: Synthetic observation fixture for testing"
            }
        ]

    async def fetch_raster_bands(
        self,
        scene_id: str,
        bbox: Tuple[float, float, float, float],
        bands: List[str]
    ) -> Dict[str, Any]:
        """
        Generates synthetic NumPy reflectance arrays for the requested bounding box.
        """
        # Determine scenario based on scene_id keyword
        scenario = "healthy_crop"
        if "POST" in scene_id or "FLOOD" in scene_id:
            scenario = "flood_inundated"
        elif "DROUGHT" in scene_id:
            scenario = "drought_stressed"
        elif "DEFOREST" in scene_id:
            scenario = "deforested_bare_soil"

        band_arrays = generate_synthetic_sentinel2_bands(bbox, width=60, height=60, scenario=scenario)
        return {
            "status": "demo_synthetic_ready",
            "scene_id": scene_id,
            "bands": band_arrays,
            "resolution_m": 10.0,
            "provenance_disclaimer": "SYNTHETIC TEST FIXTURE: NOT ACTUAL GROUND MEASUREMENT"
        }

"""
Google Earth Engine (GEE) Adapter (Stub & Documentation).
Enables enterprise planetary-scale raster computation via Google Cloud Platform service accounts.
"""

import os
import logging
from datetime import date
from typing import Dict, Any, List, Optional

from .base import SatelliteDataService, SatelliteDatasetResult, SceneMetadata
from .boundary_handler import compute_boundary_hash

logger = logging.getLogger(__name__)

class EarthEngineAdapter(SatelliteDataService):
    """
    Adapter stub for Google Earth Engine API.
    To activate in production:
    1. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/gee-service-account.json
    2. Set GEE_PROJECT_ID in .env
    3. Install 'earthengine-api' package.
    """
    def __init__(self):
        self.project_id = os.getenv("GEE_PROJECT_ID", "")
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

    def is_available(self) -> bool:
        return bool(self.project_id and self.credentials_path and os.path.exists(self.credentials_path))

    async def search_scenes(
        self,
        bbox: List[float],
        start_date: date,
        end_date: date,
        collection: str = "COPERNICUS/S2_SR_HARMONIZED"
    ) -> List[SceneMetadata]:
        logger.info("EarthEngineAdapter: GEE project unconfigured. Falling back to primary satellite services.")
        return []

    async def get_imagery_and_metrics(
        self,
        boundary_geojson: Dict[str, Any],
        target_date: date,
        date_window_days: int = 7,
        product_types: Optional[List[str]] = None,
        max_cloud_cover: float = 25.0
    ) -> SatelliteDatasetResult:
        raise NotImplementedError("EarthEngineAdapter requires a configured Google Cloud GEE Service Account.")


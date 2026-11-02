"""
Unified Satellite Data Service Orchestrator.
Orchestrates caching, automated sensor fallback (Optical Sentinel-2 -> SAR Sentinel-1),
and multi-provider failover:
1. LocalCacheAdapter (fastest, offline-safe)
2. CopernicusSentinelHubAdapter (CDSE live when CDSE_CLIENT_ID configured)
3. PlanetaryComputerSTACAdapter (open public STAC fallback)
"""

import logging
from datetime import date
from typing import Dict, Any, List, Optional

from app.core.config import settings
from .base import SatelliteDataService, SatelliteDatasetResult, SceneMetadata
from .boundary_handler import compute_boundary_hash, normalize_boundary_to_geojson
from .copernicus_adapter import CopernicusSentinelHubAdapter
from .planetary_stac_adapter import PlanetaryComputerSTACAdapter
from .cache_adapter import LocalCacheAdapter
from .earth_engine_adapter import EarthEngineAdapter

logger = logging.getLogger(__name__)

class UnifiedSatelliteDataService(SatelliteDataService):
    def __init__(self):
        self.cache_adapter = LocalCacheAdapter()
        self.cdse_adapter = CopernicusSentinelHubAdapter()
        self.stac_adapter = PlanetaryComputerSTACAdapter()
        self.gee_adapter = EarthEngineAdapter()

    async def get_imagery_and_metrics(
        self,
        boundary_geojson: Dict[str, Any],
        target_date: date,
        date_window_days: int = 7,
        product_types: Optional[List[str]] = None,
        max_cloud_cover: float = 25.0
    ) -> SatelliteDatasetResult:
        # 1. Normalize boundary and calculate area
        norm_geojson, area_ha = normalize_boundary_to_geojson(boundary_geojson)
        b_hash = compute_boundary_hash(norm_geojson)

        # 2. Check cache first
        cached = self.cache_adapter.get_cached(b_hash, target_date)
        if cached:
            cached.area_ha = area_ha
            return cached

        # 3. If in 'real' mode and CDSE credentials exist, try CDSE
        mode = settings.TERRAPROOF_MODE.lower()
        if mode == "real" and self.cdse_adapter.is_configured():
            try:
                res = await self.cdse_adapter.get_imagery_and_metrics(
                    norm_geojson, target_date, date_window_days, product_types, max_cloud_cover
                )
                res.area_ha = area_ha
                self.cache_adapter.store_cached(res, target_date)
                return res
            except Exception as e:
                logger.warning(f"CDSE adapter failed ({e}). Attempting Planetary Computer fallback.")

        # 4. Try Planetary Computer STAC
        if mode == "real":
            try:
                res = await self.stac_adapter.get_imagery_and_metrics(
                    norm_geojson, target_date, date_window_days, product_types, max_cloud_cover
                )
                res.area_ha = area_ha
                self.cache_adapter.store_cached(res, target_date)
                return res
            except Exception as e:
                logger.warning(f"Planetary Computer adapter failed ({e}). Falling back to local offline cache.")

        # 5. Local Cache / Offline Demo fallback
        res = await self.cache_adapter.get_imagery_and_metrics(
            norm_geojson, target_date, date_window_days, product_types, max_cloud_cover
        )
        res.area_ha = area_ha
        return res

    async def search_scenes(
        self,
        bbox: List[float],
        start_date: date,
        end_date: date,
        collection: str = "sentinel-2-l2a"
    ) -> List[SceneMetadata]:
        if settings.TERRAPROOF_MODE.lower() == "real":
            if self.cdse_adapter.is_configured():
                res = await self.cdse_adapter.search_scenes(bbox, start_date, end_date, collection)
                if res:
                    return res
            res = await self.stac_adapter.search_scenes(bbox, start_date, end_date, collection)
            if res:
                return res
        return await self.cache_adapter.search_scenes(bbox, start_date, end_date, collection)

_service_instance: Optional[UnifiedSatelliteDataService] = None

def get_satellite_data_service() -> UnifiedSatelliteDataService:
    global _service_instance
    if _service_instance is None:
        _service_instance = UnifiedSatelliteDataService()
    return _service_instance

"""
Satellite Data Service Package
Provides multi-adapter Earth observation data retrieval:
1. CopernicusSentinelHubAdapter (CDSE OAuth2)
2. PlanetaryComputerSTACAdapter (Microsoft Planetary Computer)
3. EarthEngineAdapter (Google Earth Engine stub)
4. LocalCacheAdapter (Precomputed disk cache for offline demo & rate limiting)
"""

from .base import SatelliteDataService, SatelliteDatasetResult, SceneMetadata
from .boundary_handler import normalize_boundary_to_geojson, compute_boundary_hash
from .service import get_satellite_data_service

__all__ = [
    "SatelliteDataService",
    "SatelliteDatasetResult",
    "SceneMetadata",
    "normalize_boundary_to_geojson",
    "compute_boundary_hash",
    "get_satellite_data_service"
]


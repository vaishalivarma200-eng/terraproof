"""
Base interface and data contracts for the Satellite Data Service.
"""

from abc import ABC, abstractmethod
from datetime import date
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SceneMetadata(BaseModel):
    scene_id: str
    sensor: str  # "Sentinel-2A", "Sentinel-2B", "Sentinel-1A", "Sentinel-1B", "Copernicus-DEM"
    collection: str  # "sentinel-2-l2a", "sentinel-1-grd"
    acquisition_date: str
    cloud_cover_percentage: float = 0.0
    resolution_meters: float = 10.0
    orbit_direction: Optional[str] = "DESCENDING"
    tile_id: Optional[str] = None
    data_source: str = "Copernicus Data Space Ecosystem"

class SatelliteDatasetResult(BaseModel):
    boundary_hash: str
    area_ha: float
    acquisition_date: str
    sensor_used: str  # "Sentinel-2 MSI", "Sentinel-1 C-SAR", "Copernicus Fusion"
    cloud_cover_pct: float = 0.0
    resolution_m: float = 10.0
    data_source: str
    is_sar_fallback: bool = False
    
    # Raster layer payloads or GeoJSON vector classifications
    layers: Dict[str, Any] = Field(default_factory=dict)
    # e.g.:
    # "true_color_url": "/api/v1/satellite/tiles/...",
    # "ndvi_mean": 0.65,
    # "ndwi_mean": -0.15,
    # "water_mask_geojson": {...},
    # "cropland_mask_geojson": {...},
    # "builtup_mask_geojson": {...}
    
    summary_stats: Dict[str, Any] = Field(default_factory=dict)
    cached: bool = False

class SatelliteDataService(ABC):
    """Abstract interface for all satellite data adapters."""

    @abstractmethod
    async def get_imagery_and_metrics(
        self,
        boundary_geojson: Dict[str, Any],
        target_date: date,
        date_window_days: int = 7,
        product_types: Optional[List[str]] = None,
        max_cloud_cover: float = 25.0
    ) -> SatelliteDatasetResult:
        """Retrieves clipped imagery, indices, and water masks for a target date."""
        pass

    @abstractmethod
    async def search_scenes(
        self,
        bbox: List[float],
        start_date: date,
        end_date: date,
        collection: str = "sentinel-2-l2a"
    ) -> List[SceneMetadata]:
        """Searches acquisition catalog for matching scenes."""
        pass


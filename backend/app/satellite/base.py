from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import List, Dict, Any, Optional, Tuple

class BaseSatelliteProvider(ABC):
    """
    Abstract interface for satellite observation catalog retrieval.
    Enables swapping between STAC, CDSE, Google Earth Engine, or offline demo fixtures.
    """

    @abstractmethod
    async def search_scenes(
        self,
        bbox: Tuple[float, float, float, float],
        start_date: date,
        end_date: date,
        collection: str = "sentinel-2-l2a",
        max_cloud_cover: float = 30.0
    ) -> List[Dict[str, Any]]:
        """Searches for matching satellite acquisition scenes."""
        pass

    @abstractmethod
    async def fetch_raster_bands(
        self,
        scene_id: str,
        bbox: Tuple[float, float, float, float],
        bands: List[str]
    ) -> Dict[str, Any]:
        """Retrieves raster band arrays for the specified scene and study area."""
        pass

    @abstractmethod
    def get_provider_metadata(self) -> Dict[str, Any]:
        """Returns provider name, license, operational status, and mode."""
        pass

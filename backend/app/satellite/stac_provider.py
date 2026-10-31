import logging
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
import httpx
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
from app.core.config import settings
from app.satellite.base import BaseSatelliteProvider

logger = logging.getLogger(__name__)

class PlanetaryComputerSTACProvider(BaseSatelliteProvider):
    """
    Real Satellite Data Provider using the open SpatioTemporal Asset Catalog (STAC) API.
    Accesses Sentinel-2 Level-2A (optical Cloud-Optimized GeoTIFFs) and Sentinel-1 GRD (radar).
    Implements dynamic SAS URL signing and remote windowed pixel streaming via rasterio vsicurl.
    """

    def __init__(self):
        self.endpoint = settings.STAC_API_URL.rstrip("/")
        self.search_url = f"{self.endpoint}/search"
        self.sas_sign_url = "https://planetarycomputer.microsoft.com/api/sas/v1/sign"
        self.timeout = 20.0

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "name": "Microsoft Planetary Computer STAC",
            "api_endpoint": self.endpoint,
            "license": "Copernicus Open Access / Public Domain",
            "supported_satellites": ["Sentinel-2 MSI (Level-2A)", "Sentinel-1 SAR C-Band (GRD)"],
            "mode": "real",
            "is_operational": True,
            "quota_status": "Free Public Tier (SAS token auto-signing enabled)"
        }

    async def sign_asset_url(self, href: str) -> str:
        """
        Signs an Azure Blob asset URL using the Planetary Computer SAS API.
        Enables unauthenticated read access to underlying Sentinel Cloud-Optimized GeoTIFFs.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(f"{self.sas_sign_url}?href={href}")
                if resp.status_code == 200:
                    return resp.json().get("href", href)
                else:
                    logger.warning(f"SAS sign returned HTTP {resp.status_code} for {href}")
                    return href
        except Exception as e:
            logger.error(f"Failed to sign asset URL: {str(e)}")
            return href

    async def search_scenes(
        self,
        bbox: Tuple[float, float, float, float],
        start_date: date,
        end_date: date,
        collection: str = "sentinel-2-l2a",
        max_cloud_cover: float = 35.0,
        buffer_days: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Queries STAC for real satellite observations intersecting the bounding box.
        Applies a temporal buffer around the target date to account for orbital revisit cycles (5-12 days).
        Sorts results by lowest cloud cover percentage to prioritize clear observations.
        """
        min_lon, min_lat, max_lon, max_lat = bbox

        # Expand narrow or single-day queries by buffer_days to discover actual satellite passes
        query_start = start_date - timedelta(days=buffer_days) if (end_date - start_date).days < buffer_days else start_date
        query_end = end_date + timedelta(days=buffer_days) if (end_date - start_date).days < buffer_days else end_date

        time_range = f"{query_start.isoformat()}T00:00:00Z/{query_end.isoformat()}T23:59:59Z"

        payload = {
            "collections": [collection],
            "bbox": [min_lon, min_lat, max_lon, max_lat],
            "datetime": time_range,
            "limit": 10
        }

        # Filter cloud cover for optical Sentinel-2
        if collection == "sentinel-2-l2a":
            payload["query"] = {
                "eo:cloud_cover": {"lt": max_cloud_cover}
            }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.search_url, json=payload)
                if response.status_code != 200:
                    logger.warning(f"STAC search returned HTTP {response.status_code}: {response.text}")
                    return []

                data = response.json()
                features = data.get("features", [])
                
                results = []
                for feat in features:
                    props = feat.get("properties", {})
                    assets = feat.get("assets", {})
                    
                    thumbnail_url = None
                    if "rendered_preview" in assets:
                        thumbnail_url = assets["rendered_preview"].get("href")
                    elif "thumbnail" in assets:
                        thumbnail_url = assets["thumbnail"].get("href")

                    results.append({
                        "id": feat.get("id"),
                        "collection": feat.get("collection"),
                        "satellite": "Sentinel-2 MSI" if "sentinel-2" in collection else "Sentinel-1 SAR",
                        "datetime": props.get("datetime"),
                        "cloud_cover_percentage": props.get("eo:cloud_cover"),
                        "ground_sampling_distance_m": props.get("gsd", 10.0),
                        "platform": props.get("platform"),
                        "constellation": props.get("constellation"),
                        "thumbnail_url": thumbnail_url,
                        "assets": assets,
                        "data_provenance": "Microsoft Planetary Computer STAC (Live Query)"
                    })

                # Sort by lowest cloud cover
                results.sort(key=lambda s: s.get("cloud_cover_percentage") if s.get("cloud_cover_percentage") is not None else 999.0)
                return results

        except Exception as e:
            logger.error(f"Failed to query live STAC catalog: {str(e)}")
            return []

    async def fetch_raster_bands(
        self,
        scene_or_id: Any,
        bbox: Tuple[float, float, float, float],
        bands: List[str]
    ) -> Dict[str, Any]:
        """
        Retrieves real multi-spectral pixel arrays directly from signed Cloud-Optimized GeoTIFFs (COGs).
        Uses GDAL/rasterio vsicurl streaming to extract ONLY the requested study area window,
        avoiding downloading the entire 800MB scene.
        Values are scaled to surface reflectance (0.0 - 1.0).
        """
        assets: Dict[str, Any] = {}
        scene_id: str = "UNKNOWN_SCENE"

        if isinstance(scene_or_id, dict):
            assets = scene_or_id.get("assets", {})
            scene_id = scene_or_id.get("id", "UNKNOWN_SCENE")
        elif isinstance(scene_or_id, str):
            scene_id = scene_or_id
            # Query STAC for scene item by ID to get assets
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    item_resp = await client.get(f"{self.endpoint}/collections/sentinel-2-l2a/items/{scene_id}")
                    if item_resp.status_code == 200:
                        assets = item_resp.json().get("assets", {})
            except Exception as e:
                logger.error(f"Failed to fetch item metadata for scene {scene_id}: {str(e)}")

        if not assets:
            raise ValueError(f"No assets catalog available for scene {scene_id}")

        band_arrays: Dict[str, np.ndarray] = {}

        # Rasterio GDAL HTTP environment for remote streaming
        gdal_env = rasterio.Env(
            GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
            CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.TIF",
            GDAL_HTTP_TIMEOUT=20
        )

        with gdal_env:
            for b in bands:
                if b not in assets:
                    logger.warning(f"Band {b} not found in scene {scene_id} assets")
                    continue

                raw_href = assets[b].get("href")
                if not raw_href:
                    continue

                # Sign the asset URL
                signed_href = await self.sign_asset_url(raw_href)

                try:
                    with rasterio.open(signed_href) as src:
                        # Transform WGS84 bounding box to source CRS (UTM projection)
                        utm_bounds = transform_bounds("EPSG:4326", src.crs, *bbox)
                        window = from_bounds(*utm_bounds, transform=src.transform)

                        # Read the single band within the study window
                        data = src.read(1, window=window)

                        # Sentinel-2 Level-2A surface reflectance is scaled by 10,000
                        # 0 to 10,000 -> 0.0 to 1.0 reflectance
                        data_float = data.astype(np.float32) / 10000.0
                        data_float = np.clip(data_float, 0.0, 1.0)

                        band_arrays[b] = data_float
                except Exception as e:
                    logger.error(f"Error streaming band {b} from {signed_href}: {str(e)}")
                    raise RuntimeError(f"Failed to stream satellite band {b}: {str(e)}")

        if not band_arrays:
            raise RuntimeError(f"Could not extract any requested bands {bands} from scene {scene_id}")

        return {
            "status": "real_pixels_acquired",
            "scene_id": scene_id,
            "bands": band_arrays,
            "resolution_m": 10.0,
            "data_provenance": "Microsoft Planetary Computer STAC (Sentinel-2 L2A Signed COG Streaming)"
        }

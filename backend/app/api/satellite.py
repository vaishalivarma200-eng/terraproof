from datetime import date
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from app.schemas.geospatial import GeoJSONGeometry, StudyAreaValidationResult, BoundingBox
from app.schemas.satellite import ObservationSummary
from app.geospatial.validation import validate_study_area
from app.satellite.factory import get_satellite_provider

router = APIRouter(prefix="", tags=["Geospatial & Satellite Catalog"])

class SceneSearchRequest(BaseModel):
    bbox: BoundingBox
    start_date: date
    end_date: date
    collection: str = Field(default="sentinel-2-l2a")
    max_cloud_cover: float = Field(default=30.0, ge=0.0, le=100.0)

@router.post("/geospatial/validate-area", response_model=StudyAreaValidationResult)
def validate_geometry(geometry: GeoJSONGeometry):
    """
    Validates a proposed farm field boundary or study area.
    Computes exact ellipsoidal geodesic area in hectares and bounding box.
    """
    geom_dict = geometry.model_dump()
    return validate_study_area(geom_dict)

@router.post("/satellite/search")
async def search_satellite_scenes(req: SceneSearchRequest):
    """
    Searches the satellite provider catalog for acquisitions intersecting the bounding box.
    In 'real' mode, contacts Planetary Computer STAC; in 'demo' mode, returns calibrated demonstration fixtures.
    """
    bbox_tuple = (req.bbox.min_lon, req.bbox.min_lat, req.bbox.max_lon, req.bbox.max_lat)
    provider = get_satellite_provider()
    
    scenes = await provider.search_scenes(
        bbox=bbox_tuple,
        start_date=req.start_date,
        end_date=req.end_date,
        collection=req.collection,
        max_cloud_cover=req.max_cloud_cover
    )
    return {
        "count": len(scenes),
        "provider": provider.get_provider_metadata()["name"],
        "mode": provider.get_provider_metadata()["mode"],
        "scenes": scenes
    }

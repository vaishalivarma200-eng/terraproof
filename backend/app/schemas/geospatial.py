from typing import Any, List, Literal
from pydantic import BaseModel, Field, field_validator

class CoordinatePair(BaseModel):
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")

class BoundingBox(BaseModel):
    min_lon: float = Field(..., ge=-180.0, le=180.0)
    min_lat: float = Field(..., ge=-90.0, le=90.0)
    max_lon: float = Field(..., ge=-180.0, le=180.0)
    max_lat: float = Field(..., ge=-90.0, le=90.0)

    @field_validator("max_lon")
    @classmethod
    def validate_longitude_order(cls, v: float, info) -> float:
        min_lon = info.data.get("min_lon")
        if min_lon is not None and v <= min_lon:
            raise ValueError("max_lon must be strictly greater than min_lon")
        return v

    @field_validator("max_lat")
    @classmethod
    def validate_latitude_order(cls, v: float, info) -> float:
        min_lat = info.data.get("min_lat")
        if min_lat is not None and v <= min_lat:
            raise ValueError("max_lat must be strictly greater than min_lat")
        return v

class GeoJSONGeometry(BaseModel):
    type: Literal["Polygon", "MultiPolygon"]
    coordinates: List[Any]

    @field_validator("coordinates")
    @classmethod
    def validate_ring(cls, coords: List[Any], info) -> List[Any]:
        if not coords:
            raise ValueError("Polygon coordinates cannot be empty")
        geom_type = info.data.get("type")
        if geom_type == "Polygon":
            outer_ring = coords[0]
            if len(outer_ring) < 4:
                raise ValueError("A valid polygon ring must have at least 4 coordinate pairs (first and last matching)")
            # Validate closed ring
            if outer_ring[0] != outer_ring[-1]:
                # Automatically close ring if minor floating-point or omission
                outer_ring.append(outer_ring[0])
        return coords

class StudyAreaValidationResult(BaseModel):
    is_valid: bool
    area_ha: float
    bbox: BoundingBox
    center_lon: float
    center_lat: float
    validation_message: str

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.geospatial import GeoJSONGeometry

class ClaimCreate(BaseModel):
    reference_no: str = Field(..., min_length=3, max_length=64, description="Unique claim reference code")
    farmer_name: str = Field(..., min_length=2, max_length=128)
    crop_type: str = Field(..., min_length=2, max_length=64)
    claimed_area_ha: float = Field(..., gt=0.01, le=100000.0, description="Reported affected area in hectares")
    damage_type: str = Field(..., description="Reported disaster type e.g., Flood, Drought, Hail, Storm, Pest")
    incident_date_start: date = Field(..., description="Start of incident window")
    incident_date_end: date = Field(..., description="End of incident window")
    boundary_geojson: GeoJSONGeometry = Field(..., description="Field boundary polygon (WGS84 EPSG:4326)")
    supporting_notes: Optional[str] = Field(None, max_length=2000)

class ClaimReviewRequest(BaseModel):
    reviewer_decision: str = Field(..., description="APPROVED, PARTIAL, REJECTED, FIELD_INSPECTION")
    reviewer_notes: str = Field(..., min_length=3, max_length=2000)

class ClaimResponse(BaseModel):
    id: str
    reference_no: str
    farmer_name: str
    crop_type: str
    claimed_area_ha: float
    damage_type: str
    incident_date_start: date
    incident_date_end: date
    latitude: float
    longitude: float
    boundary_geojson: Dict[str, Any]
    supporting_notes: Optional[str]
    status: str
    reviewer_decision: Optional[str]
    reviewer_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

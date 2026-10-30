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

    # Indian Agricultural & Policy Context
    state: Optional[str] = Field("Punjab", description="Indian state")
    district: Optional[str] = Field(None, description="Indian district")
    crop_season: Optional[str] = Field("Kharif", description="Kharif, Rabi, or Zaid")
    cultivated_area_ha: Optional[float] = Field(None, description="Total cultivated holding area in ha")
    claimed_loss_amount: Optional[float] = Field(None, description="Claimed monetary loss in INR (₹)")
    sum_insured_per_ha: Optional[float] = Field(35000.0, description="Sum insured per hectare under PMFBY in INR (₹)")
    khasra_no: Optional[str] = Field(None, description="Khasra land record parcel number")
    khatauni_no: Optional[str] = Field(None, description="Khatauni ledger account number")
    field_photos: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class FieldInspectionCreate(BaseModel):
    inspector_name: str = Field(..., min_length=2, max_length=128)
    inspection_date: date = Field(...)
    crop_growth_stage: str = Field(..., description="e.g., Vegetative, Flowering, Grain Filling, Mature, Harvested")
    observed_damage_type: str = Field(...)
    estimated_ground_damage_percent: float = Field(..., ge=0.0, le=100.0)
    ground_damage_area_ha: Optional[float] = Field(None, ge=0.0)
    crop_lodging_observed: bool = Field(False)
    submergence_depth_cm: Optional[float] = Field(None, ge=0.0)
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None
    inspection_notes: str = Field(..., min_length=5, max_length=2000)
    photo_urls: Optional[List[str]] = Field(default_factory=list)

class PhotoVerificationRequest(BaseModel):
    photo_base64: Optional[str] = None
    photo_url: Optional[str] = None
    filename: Optional[str] = "photo.jpg"
    boundary_geojson: Dict[str, Any]

class PhotoVerificationResponse(BaseModel):
    has_gps: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capture_time: Optional[str] = None
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    is_inside_boundary: bool
    distance_to_boundary_meters: float
    status_label: str  # INSIDE, NEAR (<100m), OUTSIDE, NO_GPS
    explanation: str

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
    state: Optional[str]
    district: Optional[str]
    crop_season: Optional[str]
    cultivated_area_ha: Optional[float]
    claimed_loss_amount: Optional[float]
    sum_insured_per_ha: Optional[float]
    khasra_no: Optional[str]
    khatauni_no: Optional[str]
    latitude: float
    longitude: float
    boundary_geojson: Dict[str, Any]
    supporting_notes: Optional[str]
    field_photos: Optional[List[Dict[str, Any]]]
    field_inspections: Optional[List[Dict[str, Any]]]
    status: str
    reviewer_decision: Optional[str]
    reviewer_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

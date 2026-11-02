"""
Pydantic Schemas for Regional Flood Event Before/After Comparison.
"""

from datetime import date
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class DistrictFloodStatistic(BaseModel):
    district: str
    circle_name: Optional[str] = None
    flooded_ha: float
    cropland_affected_ha: float
    builtup_affected_ha: float
    roads_affected_km: float
    estimated_duration_days: int = 7
    asdma_reported_status: Optional[str] = "HEAVILY_AFFECTED"
    satellite_agreement_pct: float = 88.5
    confidence_score: int = 89

class RegionComparisonRequest(BaseModel):
    state: str = Field(default="Assam", description="State name")
    district: str = Field(default="Morigaon", description="District name")
    circle_or_village: Optional[str] = Field(default=None, description="Revenue circle or village")
    custom_boundary_geojson: Optional[Dict[str, Any]] = None
    before_date: date = Field(default=date(2024, 6, 20))
    during_date: Optional[date] = Field(default=date(2024, 7, 6))
    after_date: date = Field(default=date(2024, 7, 22))
    include_official_validation: bool = True
    is_offline_demo: bool = True

class ASDMAValidationEntry(BaseModel):
    district: str
    asdma_affected_population: int
    asdma_relief_camps: int
    satellite_detected_flooded_ha: float
    validation_status: str  # "CONCORDANT", "SATELLITE_DETECTED_EARLIER", "REPORT_MISMATCH"
    agreement_percentage: float

class RegionComparisonResponse(BaseModel):
    event_id: str
    event_title: str
    state: str
    district: str
    before_date: str
    after_date: str
    sensor_attribution: Dict[str, Any]
    summary_text: str
    total_flooded_ha: float
    total_cropland_affected_ha: float
    total_builtup_affected_ha: float
    total_roads_affected_km: float
    district_breakdown: List[DistrictFloodStatistic]
    before_layer: Dict[str, Any]
    after_layer: Dict[str, Any]
    change_mask_geojson: Dict[str, Any]
    cropland_mask_geojson: Dict[str, Any]
    builtup_mask_geojson: Dict[str, Any]
    roads_mask_geojson: Dict[str, Any]
    asdma_validation: Dict[str, Any]
    is_offline_demo: bool = True


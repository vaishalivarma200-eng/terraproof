from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.geospatial import GeoJSONGeometry

class AnalysisRequest(BaseModel):
    claim_id: Optional[str] = Field(None, description="Optional associated claim ID")
    analysis_type: Literal[
        "INSURANCE_VERIFICATION",
        "FLOOD_DETECTION",
        "DROUGHT_STRESS",
        "DEFORESTATION_CHANGE"
    ]
    boundary_geojson: GeoJSONGeometry
    pre_event_date_start: date
    pre_event_date_end: date
    post_event_date_start: date
    post_event_date_end: date
    max_cloud_cover_percent: float = Field(default=25.0, ge=0.0, le=100.0)
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class EvidenceMetrics(BaseModel):
    baseline_index_mean: float
    post_event_index_mean: float
    index_delta_mean: float
    estimated_affected_area_ha: float
    estimated_inundated_area_ha: Optional[float] = None
    estimated_vegetation_loss_area_ha: Optional[float] = None
    total_field_area_ha: Optional[float] = None
    claimed_area_ha: Optional[float] = None
    area_discrepancy_percent: Optional[float] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    confidence_rationale: str
    confidence_score_100: Optional[int] = Field(default=None, description="Explainable composite score 0 to 100")
    confidence_grade: Optional[str] = Field(default=None, description="Score tier: HIGH/MODERATE/LOW/INSUFFICIENT")
    confidence_breakdown: Optional[Dict[str, Any]] = Field(default=None, description="5-pillar explainability breakdown")
    peril_classification: Optional[Dict[str, Any]] = Field(default=None, description="Agro-meteorological peril identification")
    crop_season_context: Optional[Dict[str, Any]] = Field(default=None, description="Phenological calendar & harvest risk assessment")
    zoned_damage: Optional[Dict[str, Any]] = Field(default=None, description="Pixel-level damage severity zone hectares")
    sensor_fusion_mode: Optional[str] = Field(default=None, description="Optical Sentinel-2 or Sentinel-1 SAR monsoon fallback")
    weather_context: Optional[Dict[str, Any]] = None
    compensation_scenario: Optional[Dict[str, Any]] = None

class AnalysisResultSchema(BaseModel):
    summary: str
    verdict_recommendation: str  # "CONSISTENT_WITH_REPORTED_DAMAGE", "INCONSISTENT_MINIMAL_CHANGE", "INCONCLUSIVE_HIGH_CLOUD_COVER"
    metrics: EvidenceMetrics
    observations_used: List[Dict[str, Any]]
    limitations: List[str]
    potential_inconsistencies: List[str]
    overlays_geojson: Optional[Dict[str, Any]] = None

class AnalysisJobResponse(BaseModel):
    id: str
    claim_id: Optional[str] = None
    analysis_type: str
    status: str
    execution_mode: str
    integrity_hash: Optional[str] = None
    version: Optional[str] = "1.0.0"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    results: Optional[Dict[str, Any]] = None
    report_pdf_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

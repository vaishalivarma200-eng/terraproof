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
    claimed_area_ha: Optional[float] = None
    area_discrepancy_percent: Optional[float] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    confidence_rationale: str
    weather_context: Optional[Dict[str, Any]] = None

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
    claim_id: Optional[str]
    analysis_type: str
    status: str
    execution_mode: str
    parameters: Dict[str, Any]
    results: Optional[AnalysisResultSchema]
    report_pdf_url: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

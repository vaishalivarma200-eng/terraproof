from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ObservationSummary(BaseModel):
    id: str
    provider: str
    satellite: str
    scene_id: str
    acquisition_date: datetime
    cloud_cover_percentage: Optional[float]
    ground_sampling_distance_m: Optional[float]
    bands: List[str]
    preview_url: Optional[str]

class ProviderStatus(BaseModel):
    provider_name: str
    is_operational: bool
    mode: str  # "real" or "demo"
    message: str
    supported_satellites: List[str]

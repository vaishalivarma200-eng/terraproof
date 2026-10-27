import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False)
    
    provider = Column(String(64), nullable=False)  # "Planetary Computer STAC", "Copernicus CDSE", "TerraProof Demonstration Engine"
    satellite = Column(String(64), nullable=False)  # "Sentinel-2 MSI", "Sentinel-1 SAR C-Band"
    scene_id = Column(String(128), nullable=False)
    acquisition_date = Column(DateTime, nullable=False)
    
    # Metadata
    cloud_cover_percentage = Column(Float, nullable=True)
    ground_sampling_distance_m = Column(Float, nullable=True)  # e.g., 10.0m
    orbit_direction = Column(String(32), nullable=True)  # ASCENDING / DESCENDING for SAR
    bands_acquired = Column(JSON, nullable=True)
    preview_url = Column(String(512), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    job = relationship("AnalysisJob", back_populates="observations")

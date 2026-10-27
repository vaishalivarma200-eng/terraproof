import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    
    # Types: INSURANCE_VERIFICATION, FLOOD_DETECTION, DROUGHT_STRESS, DEFORESTATION_CHANGE
    analysis_type = Column(String(64), nullable=False)
    
    # Status: QUEUED, PROCESSING, COMPLETED, FAILED
    status = Column(String(32), default="QUEUED", nullable=False)
    
    # Mode used for this run: "demo" or "real"
    execution_mode = Column(String(16), default="demo", nullable=False)
    
    # Inputs: study area bbox/geojson, date ranges, parameters
    parameters = Column(JSON, nullable=False)
    
    # Outputs: computed metrics, anomalies, change masks, geojson overlays
    results = Column(JSON, nullable=True)
    
    # Generated PDF report filepath
    report_pdf_path = Column(String(256), nullable=True)
    
    # Error message if failed
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    claim = relationship("Claim", back_populates="analysis_jobs")
    observations = relationship("SatelliteObservation", back_populates="job", cascade="all, delete-orphan")


import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, Text, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_no = Column(String(64), unique=True, index=True, nullable=False)
    farmer_name = Column(String(128), nullable=False)
    crop_type = Column(String(64), nullable=False)
    claimed_area_ha = Column(Float, nullable=False)
    damage_type = Column(String(64), nullable=False)  # Flood, Drought, Hail, Storm, Pest, Fire
    incident_date_start = Column(Date, nullable=False)
    incident_date_end = Column(Date, nullable=False)

    # Indian Agricultural & Policy Context
    state = Column(String(64), nullable=True, default="Punjab")
    district = Column(String(64), nullable=True)
    crop_season = Column(String(32), nullable=True, default="Kharif")  # Kharif, Rabi, Zaid
    cultivated_area_ha = Column(Float, nullable=True)  # Total farm size
    claimed_loss_amount = Column(Float, nullable=True)  # In INR (₹)
    sum_insured_per_ha = Column(Float, nullable=True, default=35000.0)  # In INR (₹)
    khasra_no = Column(String(64), nullable=True)  # Land record plot identifier
    khatauni_no = Column(String(64), nullable=True)  # Landholder account identifier
    
    # Representative centroid coordinate for quick mapping
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Boundary polygon stored as GeoJSON Feature or Polygon
    boundary_geojson = Column(JSON, nullable=False)
    
    supporting_notes = Column(Text, nullable=True)

    # Attached Photographs & EXIF Verification Data
    field_photos = Column(JSON, nullable=True, default=list)

    # Field Agent Ground Inspections
    field_inspections = Column(JSON, nullable=True, default=list)
    
    # Review & Lifecycle Status
    # SUBMITTED -> ANALYZING -> EVIDENCE_GENERATED -> REVIEWED
    status = Column(String(32), default="SUBMITTED", nullable=False)
    
    # Reviewer decision and notes
    reviewer_decision = Column(String(32), nullable=True)  # APPROVED, PARTIAL, REJECTED, FIELD_INSPECTION
    reviewer_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Identity & Tenancy Context (Privacy-First)
    tenancy_type = Column(String(32), default="OWNER", nullable=True)  # OWNER, TENANT, SHARECROPPER
    masked_aadhaar_ref = Column(String(32), nullable=True)  # e.g. "XXXX-XXXX-4921" (Never raw 12 digits)
    kyc_status = Column(String(32), default="UNVERIFIED", nullable=True)  # VERIFIED, UNVERIFIED

    # Relationships
    analysis_jobs = relationship("AnalysisJob", back_populates="claim", cascade="all, delete-orphan")
    land_documents = relationship("LandDocument", back_populates="claim", cascade="all, delete-orphan")


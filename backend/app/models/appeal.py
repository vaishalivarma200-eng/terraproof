"""
TerraProof Farmer Grievance & Statutory Appeal Model
Supports procedural justice, independent administrative review, and SLA tracking.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class FarmerAppeal(Base):
    __tablename__ = "farmer_appeals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reference_no = Column(String(64), nullable=False, unique=True, index=True)
    farmer_masked_id = Column(String(64), nullable=True)  # Masked Aadhaar or Farmer ID ref
    
    grounds_type = Column(String(64), nullable=False)
    # e.g., CONTESTED_DAMAGE_PCT, WATER_RECESSION_ROOT_ROT, LOCALIZED_HAIL, BOUNDARY_MISALIGNMENT, CROP_MISIDENTIFICATION
    
    farmer_statement = Column(Text, nullable=False)
    supporting_photo_urls = Column(JSON, default=list)
    
    # Review Hierarchy (Mandatory Independence: Tehsildar / Sub-Divisional Officer, not original inspecting Patwari)
    assigned_reviewer_role = Column(String(32), default="TEHSILDAR", nullable=False)
    assigned_reviewer_name = Column(String(128), nullable=True)
    
    # Status
    status = Column(String(32), default="FILED", nullable=False)  # FILED, UNDER_REVIEW, REVISED_APPROVED, UPHELD, DISMISSED
    
    original_damage_percent = Column(Float, nullable=False, default=0.0)
    revised_damage_percent = Column(Float, nullable=True)
    
    resolution_remarks = Column(Text, nullable=True)
    resolution_signature_hash = Column(String(64), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    claim = relationship("Claim", backref="appeals_list")


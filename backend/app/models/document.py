import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class LandDocument(Base):
    __tablename__ = "land_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    
    # Document Type: ROR_7_12, KHASRA_KHATAUNI, JAMABANDI, LEASE_AGREEMENT, SALE_DEED
    document_type = Column(String(64), nullable=False)
    
    # Ownership vs Tenant
    tenancy_type = Column(String(32), default="OWNER", nullable=False)  # OWNER, TENANT, SHARECROPPER
    
    filename = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=True)
    file_hash = Column(String(64), index=True, nullable=False)  # SHA-256 for duplicate detection
    
    # Extracted metadata from OCR / DigiLocker
    extracted_data = Column(JSON, nullable=True)
    
    # Verification Lifecycle: VERIFIED, NEEDS_REVIEW, UNVERIFIED
    verification_status = Column(String(32), default="UNVERIFIED", nullable=False)
    
    # Detailed cross-check report (name_match, area_consistency, location_match, tamper_hints)
    verification_report = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationship to claim
    claim = relationship("Claim", back_populates="land_documents")


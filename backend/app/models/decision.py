"""
TerraProof Official Decision & Ground Inspection Models
Models official workflow decisions, multi-level hierarchy (Patwari -> Kanungo -> Tehsildar -> District),
SLA tracking, digital signatures, and inspection checklists.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Text, Boolean, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class OfficialInspection(Base):
    __tablename__ = "official_inspections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)

    # Officer Identity & Hierarchy
    officer_name = Column(String(128), nullable=False)
    officer_role = Column(String(32), nullable=False)  # PATWARI, KANUNGO, TEHSILDAR, DISTRICT_COLLECTOR
    jurisdiction_village = Column(String(64), nullable=True)
    jurisdiction_tehsil = Column(String(64), nullable=True)
    jurisdiction_district = Column(String(64), nullable=True)

    # GPS & Mobile Timestamp
    inspection_date = Column(Date, nullable=False)
    device_latitude = Column(Float, nullable=True)
    device_longitude = Column(Float, nullable=True)
    is_geotag_matched_boundary = Column(Boolean, default=True)

    # Standard Field Checklist
    checklist_crop_present = Column(Boolean, default=True)
    checklist_water_marks_observed = Column(Boolean, default=False)
    checklist_structure_present = Column(Boolean, default=False)
    checklist_boundary_matches = Column(Boolean, default=True)

    # Damage Confirmation & Override Tracking
    prefilled_satellite_damage_percent = Column(Float, nullable=False, default=0.0)
    confirmed_damage_percent = Column(Float, nullable=False)
    override_occurred = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    low_damage_insufficient_flag = Column(Boolean, default=False)

    # Decision Workflow & Escalation
    # CONFIRM_EVIDENCE, REQUEST_MORE_INFO, ESCALATE_TO_KANUNGO, ESCALATE_TO_TEHSILDAR, CONFIRMED_VIOLATION, FINAL_SETTLEMENT_ORDER
    decision_action = Column(String(64), nullable=False, default="CONFIRM_EVIDENCE")
    decision_remarks = Column(Text, nullable=False)
    
    # Cryptographic Signature & Proof of Work
    signature_hash = Column(String(64), nullable=False)  # SHA-256 tamper-proof digest
    signed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # SLA Tracking
    sla_deadline = Column(DateTime, nullable=True)
    sla_status = Column(String(32), default="ON_TIME")  # ON_TIME, NEARING_SLA, OVERDUE

    # Geotagged Photos & PDF Dossier
    inspection_photos = Column(JSON, default=list)
    report_pdf_path = Column(String(512), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationship to claim
    claim = relationship("Claim", back_populates="official_inspections_list")

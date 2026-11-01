"""
TerraProof Cryptographic Append-Only Audit Ledger Model
Guarantees tamper-evident traceability for satellite analyses, document checks,
official orders, and farmer appeals.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.core.database import Base

class AuditBlock(Base):
    __tablename__ = "audit_blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    block_index = Column(Integer, unique=True, nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    timestamp_iso = Column(String(64), nullable=True)
    
    event_type = Column(String(64), nullable=False, index=True)
    # e.g., CLAIM_SUBMITTED, ANALYSIS_EXECUTED, DOCUMENT_VERIFIED,
    #       OFFICIAL_INSPECTED, APPEAL_FILED, APPEAL_RESOLVED
    
    record_id = Column(String(64), nullable=False, index=True)
    actor = Column(String(128), nullable=False)  # e.g. "OFFICIAL:PATWARI:RAJESH_SHARMA", "SYSTEM:RISK_ENGINE"
    
    payload_summary = Column(JSON, default=dict)  # Metadata summary without raw PII
    data_hash = Column(String(64), nullable=False)  # SHA-256 of payload
    previous_hash = Column(String(64), nullable=False)  # SHA-256 of previous block
    block_hash = Column(String(64), nullable=False, unique=True)  # Cryptographic chain digest

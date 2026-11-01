"""
TerraProof Cryptographic Audit Ledger Service
Implements a tamper-evident, append-only hash chain.
Every state transition (claim submission, satellite analysis, document check,
official decision order, farmer grievance) is permanently cryptographically chained.
"""
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.audit import AuditBlock

GENESIS_PREVIOUS_HASH = "0" * 64

def calculate_data_hash(payload: Dict[str, Any]) -> str:
    """Computes a deterministic SHA-256 digest of arbitrary payload dictionary."""
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

def calculate_block_hash(
    block_index: int,
    timestamp_str: str,
    event_type: str,
    record_id: str,
    actor: str,
    data_hash: str,
    previous_hash: str
) -> str:
    """Computes SHA-256 digest sealing the block into the append-only ledger."""
    header = f"{block_index}:{timestamp_str}:{event_type}:{record_id}:{actor}:{data_hash}:{previous_hash}"
    return hashlib.sha256(header.encode("utf-8")).hexdigest()

def append_audit_block(
    db: Session,
    event_type: str,
    record_id: str,
    actor: str,
    payload: Optional[Dict[str, Any]] = None
) -> AuditBlock:
    """
    Appends a new event block to the tamper-evident cryptographic ledger.
    Guarantees strict linear ordering and backward-linked hash pointers.
    """
    payload = payload or {}
    data_hash = calculate_data_hash(payload)

    # Find tip of the chain
    latest_block = db.query(AuditBlock).order_by(desc(AuditBlock.block_index)).first()
    
    if latest_block is None:
        next_index = 0
        previous_hash = GENESIS_PREVIOUS_HASH
    else:
        next_index = latest_block.block_index + 1
        previous_hash = latest_block.block_hash

    now_utc = datetime.now(timezone.utc)
    timestamp_str = now_utc.isoformat()

    block_hash = calculate_block_hash(
        block_index=next_index,
        timestamp_str=timestamp_str,
        event_type=event_type,
        record_id=record_id,
        actor=actor,
        data_hash=data_hash,
        previous_hash=previous_hash
    )

    new_block = AuditBlock(
        block_index=next_index,
        timestamp=now_utc,
        timestamp_iso=timestamp_str,
        event_type=event_type,
        record_id=record_id,
        actor=actor,
        payload_summary={k: v for k, v in payload.items() if not str(k).lower().startswith("raw_")},
        data_hash=data_hash,
        previous_hash=previous_hash,
        block_hash=block_hash
    )

    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    return new_block

def verify_chain_integrity(db: Session) -> Dict[str, Any]:
    """
    Audits the entire cryptographic ledger from Genesis block to tip.
    Re-evaluates every block hash and parent pointer to mathematically prove zero tampering.
    """
    blocks: List[AuditBlock] = db.query(AuditBlock).order_by(AuditBlock.block_index.asc()).all()

    if not blocks:
        return {
            "is_valid": True,
            "total_blocks": 0,
            "status": "EMPTY_CHAIN",
            "message": "Cryptographic ledger is uninitialized."
        }

    for i, block in enumerate(blocks):
        # 1. Verify index sequence
        if block.block_index != i:
            return {
                "is_valid": False,
                "status": "CORRUPTED_INDEX_SEQUENCE",
                "tampered_at_index": block.block_index,
                "message": f"Expected index {i}, found {block.block_index}"
            }

        # 2. Verify previous hash pointer
        if i == 0:
            if block.previous_hash != GENESIS_PREVIOUS_HASH:
                return {
                    "is_valid": False,
                    "status": "CORRUPTED_GENESIS_POINTER",
                    "tampered_at_index": 0,
                    "message": "Genesis block does not point to null hash."
                }
        else:
            prev = blocks[i - 1]
            if block.previous_hash != prev.block_hash:
                return {
                    "is_valid": False,
                    "status": "BROKEN_CHAIN_LINK",
                    "tampered_at_index": block.block_index,
                    "message": f"Block {block.block_index} previous_hash mismatch with block {prev.block_index}."
                }

        # 3. Re-verify mathematical block hash
        ts_str = block.timestamp_iso or block.timestamp.isoformat()
        expected_hash = calculate_block_hash(
            block_index=block.block_index,
            timestamp_str=ts_str,
            event_type=block.event_type,
            record_id=block.record_id,
            actor=block.actor,
            data_hash=block.data_hash,
            previous_hash=block.previous_hash
        )

        if block.block_hash != expected_hash:
            return {
                "is_valid": False,
                "status": "TAMPERED_BLOCK_DIGEST",
                "tampered_at_index": block.block_index,
                "message": f"Block {block.block_index} cryptographic digest failed verification."
            }

    return {
        "is_valid": True,
        "status": "VERIFIED_TAMPER_FREE",
        "total_blocks": len(blocks),
        "genesis_hash": blocks[0].block_hash,
        "tip_hash": blocks[-1].block_hash,
        "audit_timestamp": datetime.now(timezone.utc).isoformat()
    }

def get_recent_audit_blocks(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves chronological audit blocks for administrative transparency."""
    blocks = db.query(AuditBlock).order_by(desc(AuditBlock.block_index)).limit(limit).all()
    return [
        {
            "block_index": b.block_index,
            "timestamp": b.timestamp.isoformat(),
            "event_type": b.event_type,
            "record_id": b.record_id,
            "actor": b.actor,
            "payload_summary": b.payload_summary,
            "data_hash": b.data_hash,
            "previous_hash": b.previous_hash,
            "block_hash": b.block_hash
        }
        for b in blocks
    ]

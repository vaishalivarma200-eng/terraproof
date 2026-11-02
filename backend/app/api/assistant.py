"""
TerraProof TerraGuide Assistant API Router
Provides context-aware conversational decision support grounded in satellite & land records.
Logs all interactions to the cryptographic audit trail.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.assistant.llm_provider import get_assistant_provider
from app.core.audit_chain import append_audit_block
from app.models.claim import Claim

router = APIRouter(prefix="/assistant", tags=["TerraGuide AI Assistant"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User query or question")
    claim_id: Optional[str] = Field(None, description="Optional active claim ID or reference number")
    role: Optional[str] = Field("judge", description="Role: farmer | adjuster | official | judge")
    language: Optional[str] = Field("en", description="Language: en | hi | hinglish")

class ChatResponse(BaseModel):
    reply: str
    evidence_used: List[str]
    knowledge_references: List[str]
    tools_called: List[str]
    role: str
    language: str
    ai_mode: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Submits a conversational query to TerraGuide AI.
    Answers derive strictly from verified claim data and /data/knowledge markdown files.
    """
    provider = get_assistant_provider()
    result = provider.answer(
        query=req.message,
        claim_id=req.claim_id,
        role=req.role or "judge",
        language=req.language or "en",
        db=db
    )

    # Cryptographic Audit Log
    try:
        append_audit_block(
            db=db,
            event_type="ASSISTANT_QUERY",
            record_id=req.claim_id or "GENERAL_SESSION",
            actor=f"USER_ROLE:{req.role.upper() if req.role else 'JUDGE'}",
            payload={
                "query": req.message,
                "role": req.role,
                "language": req.language,
                "ai_mode": result["ai_mode"],
                "tools_called": result["tools_called"],
                "evidence_count": len(result["evidence_used"])
            }
        )
    except Exception as e:
        print(f"Audit log warning: {e}")

    return result

@router.get("/suggested-questions")
def get_suggested_questions(claim_id: Optional[str] = None, role: Optional[str] = "judge", db: Session = Depends(get_db)):
    """Returns context-sensitive question chips based on active claim and role."""
    base_chips = [
        "Which districts were most affected in the Assam flood?",
        "How did SAR radar penetrate 94% cloud cover in Assam?",
        "What if the river level rises by 2.5 meters?",
        "What changes if the reservoir level is 5 m lower?",
        "Why was this claim flagged?",
        "What does 58.7% divergence mean?",
        "What should the patwari do next?",
        "What can TerraProof NOT do?"
    ]

    if not claim_id:
        return {"suggested_questions": base_chips}

    claim = db.query(Claim).filter(
        (Claim.id == claim_id) | (Claim.reference_no == claim_id)
    ).first()

    if not claim:
        return {"suggested_questions": base_chips}

    # Contextual tweaks based on claim archetype
    chips = []
    if claim.reference_no == "CLM-DEMO-001":
        chips = [
            "Why is C-001 fast-track approved?",
            "What documents were verified for C-001?",
            "How much payout is approved?",
            "What can TerraProof NOT do?"
        ]
    elif claim.reference_no == "CLM-DEMO-002":
        chips = [
            "Why was C-002 flagged for area inflation?",
            "What does 58.7% divergence mean for C-002?",
            "How much payout was claimed vs calculated?",
            "What should the patwari do next?"
        ]
    elif claim.reference_no == "CLM-DEMO-003":
        chips = [
            "Why is wheat claimed in July a conflict?",
            "What did Digital Crop Survey (DCS) record?",
            "What should the patwari do next?",
            "Explain this to a farmer"
        ]
    elif claim.reference_no == "CLM-DEMO-004":
        chips = [
            "Why does document area 3.2 ha conflict with 7.9 ha?",
            "What does the 71% name match mean?",
            "What documents are needed to rectify this?",
            "What should the patwari do next?"
        ]
    elif claim.reference_no == "CLM-DEMO-005":
        chips = [
            "Why is C-005 flagged as a duplicate collision?",
            "How was the 60% polygon overlap detected?",
            "What is the duplicate document fingerprint?",
            "What action is recommended for the Tehsildar?"
        ]
    elif claim.reference_no == "CLM-DEMO-006":
        chips = [
            "Why is confidence only 42% on C-006?",
            "How does monsoon cloud cover affect optical satellites?",
            "Why is physical verification mandated here?",
            "What can TerraProof NOT do?"
        ]
    elif claim.reference_no == "CLM-DEMO-007":
        chips = [
            "Why can't satellites detect subtle 10-15% damage?",
            "What is the PMFBY 33% calamity threshold?",
            "What field inspection is required?",
            "Explain this to a farmer"
        ]
    elif claim.reference_no == "CLM-DEMO-008":
        chips = [
            "What unauthorized construction was detected on C-008?",
            "What is the +0.42 NDBI index jump?",
            "Why was this referred to the Tehsildar?",
            "Explain this to a farmer"
        ]
    else:
        chips = base_chips

    return {"suggested_questions": chips}

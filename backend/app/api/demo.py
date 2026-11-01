"""
TerraProof Demonstration & Presentation Scenarios API
Allows reviewers and stakeholders to reset or inspect the 4 canonical verification archetypes:
1. Genuine Flood Claim (Fast-Track)
2. Inflated Area Claim (Risk Alert)
3. Land Document Tenancy Mismatch (Dispute)
4. Suspected Unauthorized Construction (Land-Use Change)
"""
from fastapi import APIRouter
from app.core.seed import seed_initial_claims

router = APIRouter(prefix="/demo", tags=["Demo Scenarios"])

@router.post("/reset-scenarios")
def reset_demonstration_scenarios():
    """Resets the database with the 4 benchmark evaluation scenarios."""
    seed_initial_claims(force=True)
    return {
        "status": "SUCCESS",
        "message": "TerraProof demonstration scenarios successfully re-seeded.",
        "scenarios": [
            {"ref": "CLM-2026-0891", "archetype": "Genuine Flood Claim (Fast-Track Approved)"},
            {"ref": "CLM-2026-1044", "archetype": "Inflated Area Claim (Flagged by Risk Engine)"},
            {"ref": "CLM-2026-0520", "archetype": "Land Document Tenancy Mismatch (Review Required)"},
            {"ref": "CLM-2026-0312", "archetype": "Suspected Unauthorized Construction (Land-Use Change)"}
        ]
    }

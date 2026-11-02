"""
Unit tests for Step 5: TerraGuide Assistant tool execution & grounded Q&A.
"""

from app.core.database import SessionLocal
from app.assistant.llm_provider import get_assistant_provider
from app.assistant.tools import explain_regional_event, explain_simulation

def test_explain_regional_event_tool():
    res = explain_regional_event()
    assert "event_title" in res
    assert res["total_flooded_ha"] > 100000.0
    assert "Morigaon" in res["most_affected_districts"]
    assert res["asdma_agreement_pct"] >= 90.0

def test_explain_simulation_tool():
    res = explain_simulation("RIVER_STAGE_RISE", 2.5)
    assert res["scenario_type"] == "RIVER_STAGE_RISE"
    assert res["incremental_flooded_ha"] > 0.0
    assert "sensitivity_range" in res
    assert "disclaimer" in res

def test_assistant_offline_template_answering():
    db = SessionLocal()
    try:
        provider = get_assistant_provider()
        res = provider.answer(
            query="Which districts were most affected in the Assam flood?",
            claim_id=None,
            role="judge",
            language="en",
            db=db
        )
        assert "Assam" in res["reply"]
        assert "Morigaon" in res["reply"]
        assert "Evidence used:" in res["reply"]
        assert res["ai_mode"] == "offline demo"
    finally:
        db.close()

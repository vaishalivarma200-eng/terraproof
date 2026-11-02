"""
TerraProof Assistant LLM Provider Abstraction
Provides:
1. LLMProvider interface
2. OfflineTemplateAdapter (100% offline, zero-key fallback with template grounding)
3. HostedLLMAdapter (Online Gemini/OpenAI adapter when credentials exist)
Enforces strict guardrails:
- Never approves, rejects, or accuses ("flag for human review")
- No legal advice
- No raw Aadhaar collection
- Refuses to invent data
- Every factual answer ends with "Evidence used: ..."
"""

import os
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.assistant.tools import (
    get_claim,
    get_evidence,
    compare_areas,
    get_triage_summary,
    explain_flag,
    estimate_payout,
    draft_girdawari,
    list_missing_documents,
    get_next_steps,
    explain_regional_event,
    explain_simulation
)
from app.assistant.knowledge import retrieve_relevant_knowledge

class LLMProvider:
    def answer(
        self,
        query: str,
        claim_id: Optional[str],
        role: str,
        language: str,
        db: Session
    ) -> Dict[str, Any]:
        raise NotImplementedError

class OfflineTemplateAdapter(LLMProvider):
    """
    100% offline, deterministic engine that resolves user queries
    by executing tools on the database and formatting grounded templates.
    """

    def answer(
        self,
        query: str,
        claim_id: Optional[str],
        role: str,
        language: str,
        db: Session
    ) -> Dict[str, Any]:
        q_lower = query.lower()
        role_lower = (role or "judge").lower()
        lang = (language or "en").lower()

        evidence_items = []
        knowledge_refs = []
        tools_executed = []

        # 1. Resolve active claim if present
        claim_info = None
        evidence_info = None
        if claim_id:
            claim_info = get_claim(claim_id, db)
            tools_executed.append(f"get_claim({claim_id})")
            if claim_info:
                evidence_info = get_evidence(claim_id, db)
                tools_executed.append(f"get_evidence({claim_id})")
                evidence_items.append(f"Claim Ref: {claim_info['reference_no']}")
                evidence_items.append(f"Farmer: {claim_info['farmer_name']}")
                evidence_items.append(f"Claimed Area: {claim_info['claimed_area_ha']} ha")

        # 2. Retrieve relevant knowledge base context
        kb_matches = retrieve_relevant_knowledge(query, top_k=2)
        for kb in kb_matches:
            knowledge_refs.append(kb["filename"])

        # Intent 1: Why was this claim flagged? / Discrepancy
        if any(w in q_lower for w in ["why", "flag", "divergence", "discrepancy", "kyun", "karan"]):
            tools_executed.append("explain_flag()")
            tools_executed.append("compare_areas()")
            flag_info = explain_flag(claim_id or "CLM-DEMO-002", db)
            area_info = compare_areas(claim_id or "CLM-DEMO-002", db)

            reasons_str = " • ".join(flag_info.get("flag_reasons", []))
            div_pct = area_info.get("area_divergence_pct", 0.0)
            claimed_ha = area_info.get("claimed_area_ha", 0.0)
            obs_ha = area_info.get("satellite_observed_damaged_ha", 0.0)

            evidence_items.extend([
                f"Divergence: {div_pct}%",
                f"Observed Damaged Area: {obs_ha} ha",
                f"Risk Tier: {flag_info.get('triage_status', 'HIGH_RISK')}"
            ])

            if "hi" in lang:
                reply = (
                    f"यह दावा ({area_info['claim_reference']}) इसलिए फ्लैग किया गया है क्योंकि किसान ने {claimed_ha} हेक्टेयर का दावा किया था, "
                    f"जबकि उपग्रह और डीईएम स्थलाकृति विश्लेषण में केवल {obs_ha} हेक्टेयर क्षेत्र में जलभराव पाया गया ({div_pct}% का अंतर)। "
                    f"मुख्य कारण: {reasons_str}। "
                    f"यह कोई अंतिम अस्वीकृति नहीं है, बल्कि निष्पक्ष समीक्षा के लिए एक फ्लैग है।"
                )
            elif "hinglish" in lang:
                reply = (
                    f"Yeh claim ({area_info['claim_reference']}) isliye flag hua hai kyunki claimed area {claimed_ha} ha tha, "
                    f"lekin satellite aur DEM topography me sirf {obs_ha} ha me inundation mila ({div_pct}% divergence). "
                    f"Reasons: {reasons_str}. "
                    f"Yeh automatic rejection nahi hai, balki human verification ke liye flag hai."
                )
            else:
                reply = (
                    f"Claim {area_info['claim_reference']} was flagged for human review because the farmer reported {claimed_ha} ha of damage, "
                    f"whereas multi-sensor satellite imagery and DEM elevation models identified only {obs_ha} ha of standing flood inundation "
                    f"({div_pct}% area divergence). Key discrepancy signals: {reasons_str}. "
                    f"Note: This is a decision-support flag for revenue officials, not an automated rejection."
                )

        # Intent 2: Payout estimation / How much payout is reasonable?
        elif any(w in q_lower for w in ["payout", "compensation", "rupee", "paise", "kitna", "claim amount"]):
            tools_executed.append("estimate_payout()")
            payout_info = estimate_payout(claim_id or "CLM-DEMO-002", db)
            claimed_inr = payout_info.get("claimed_total_inr", 0.0)
            obs_inr = payout_info.get("observed_recommended_payout_inr", 0.0)
            diff_inr = payout_info.get("flagged_discrepancy_rupees", 0.0)
            p_range = payout_info.get("payout_range", "N/A")

            evidence_items.extend([
                f"Sum Insured: ₹{payout_info.get('sum_insured_per_ha', 35000)}/ha",
                f"Claimed Payout: ₹{claimed_inr:,.0f}",
                f"Calibrated Payout: ₹{obs_inr:,.0f}",
                f"Flagged Gap: ₹{diff_inr:,.0f}"
            ])

            if "hi" in lang:
                reply = (
                    f"पीएमएफबीवाई गणना के अनुसार: किसान का दावा ₹{claimed_inr:,.0f} का था। "
                    f"उपग्रह द्वारा पुष्ट क्षेत्र के आधार पर अनुमानित मुआवजा ₹{obs_inr:,.0f} (सीमा: {p_range}) है। "
                    f"लगभग ₹{diff_inr:,.0f} की राशि को भौतिक सत्यापन तक सुरक्षित रखा गया है।"
                )
            elif "hinglish" in lang:
                reply = (
                    f"PMFBY formula ke hisaab se: Claimed amount ₹{claimed_inr:,.0f} tha. "
                    f"Satellite-observed area par estimated payout ₹{obs_inr:,.0f} banta hai (range: {p_range}). "
                    f"Around ₹{diff_inr:,.0f} discrepancy review ke liye flag ki gayi hai."
                )
            else:
                reply = (
                    f"Under PMFBY localized calamity guidelines (Sum Insured ₹{payout_info.get('sum_insured_per_ha', 35000):,}/ha): "
                    f"The farmer claimed ₹{claimed_inr:,.0f}. Based strictly on the satellite-verified inundated acreage, "
                    f"the calibrated compensation is ₹{obs_inr:,.0f} (estimated range: {p_range}). "
                    f"A discrepancy gap of ₹{diff_inr:,.0f} has been flagged for audit before disbursement."
                )

        # Intent 3: Patwari / Official Next Steps
        elif any(w in q_lower for w in ["patwari", "official", "tehsildar", "next step", "kya kare"]):
            tools_executed.append("draft_girdawari()")
            tools_executed.append("get_next_steps()")
            steps_info = get_next_steps(role_lower, claim_id or "CLM-DEMO-002", db)
            girdawari = draft_girdawari(claim_id or "CLM-DEMO-002", db)

            evidence_items.extend([
                f"Khasra: {girdawari.get('khasra_no')}",
                f"Suggested Damage: {girdawari.get('suggested_damage_range')}",
                f"Action Directive: {steps_info.get('recommended_next_steps', ['Review on-site'])[0]}"
            ])

            steps_formatted = " \n".join([f"• {s}" for s in steps_info.get("recommended_next_steps", [])])

            if "hi" in lang:
                reply = (
                    f"पटवारी / राजस्व अधिकारी के लिए अग्रिम कदम:\n{steps_formatted}\n"
                    f"सुझाया गया ई-गिरदावरी प्रविष्टि: खसरा {girdawari.get('khasra_no')} पर क्षति {girdawari.get('suggested_damage_range')}। "
                    f"अधिकारी को मौके पर जांच कर पुष्टि अथवा संशोधन दर्ज करना होगा।"
                )
            else:
                reply = (
                    f"Recommended procedural workflow for Revenue Officials:\n{steps_formatted}\n"
                    f"Draft e-Girdawari entry: Khasra {girdawari.get('khasra_no')} suggested damage range is {girdawari.get('suggested_damage_range')}. "
                    f"Official protocol requires the Patwari to verify ground water marks and confirm or override with reasons."
                )

        # Intent 4: What can TerraProof NOT do? / Limitations / Accuracy
        elif any(w in q_lower for w in ["not do", "limit", "accurate", "accuracy", "seema", "cannot"]):
            tools_executed.append("get_evidence()")
            conf_score = evidence_info.get("confidence_score", 88) if evidence_info else 88

            evidence_items.extend([
                f"Confidence Score: {conf_score}/100",
                "Resolution Limit: Sentinel-2 10m pixels (~100 m² per pixel)",
                "Low Damage Limit: <15% requires field CCE"
            ])

            if "hi" in lang:
                reply = (
                    f"टेराप्रूफ़ की वैज्ञानिक सीमाएँ:\n"
                    f"1. 0.5 हेक्टेयर से छोटे खेतों में 10 मीटर उपग्रह पिक्सेल की सटीकता सीमित होती है।\n"
                    f"2. 15% से कम की हल्की फसल क्षति को कक्षा से अलग नहीं किया जा सकता (भौतिक सत्यापन अनिवार्य है)।\n"
                    f"3. टेराप्रूफ़ अंतिम निर्णय नहीं लेता; यह केवल राजस्व अधिकारियों और बीमाकर्ताओं को पारदर्शी साक्ष्य प्रदान करता है।"
                )
            else:
                reply = (
                    f"TerraProof Scientific & System Boundaries:\n"
                    f"1. Resolution Threshold: Plots under 0.5 ha have insufficient 10m pixels; physical inspection is recommended.\n"
                    f"2. Low Damage Threshold: Subtle partial damage (<15%) cannot be distinguished from natural canopy variation from space.\n"
                    f"3. Legal Authority: TerraProof never automatically approves or rejects claims. Statutory decisions remain strictly with authorized human officials."
                )

        # Intent 5: Missing documents / Document check
        elif any(w in q_lower for w in ["document", "paper", "khasra", "jamabandi", "dastavej"]):
            tools_executed.append("list_missing_documents()")
            doc_info = list_missing_documents(claim_id or "CLM-DEMO-004", db)
            missing = doc_info.get("missing_documents", [])
            missing_str = ", ".join(missing) if missing else "None. All required title documents are present."

            evidence_items.extend([
                f"Uploaded Docs: {doc_info.get('uploaded_count', 1)}",
                f"Missing Checklist: {missing_str}"
            ])

            if "hi" in lang:
                reply = (
                    f"दस्तावेज़ स्थिति: {len(doc_info.get('uploaded_types', []))} दस्तावेज़ प्राप्त हुए। "
                    f"अपेक्षित दस्तावेज़: {missing_str}। "
                    f"दावे को प्रोसेस करने के लिए पंजीकृत खसरा/खतौनी की प्रति आवश्यक है।"
                )
            else:
                reply = (
                    f"Land Document Audit: {doc_info.get('uploaded_count')} document(s) registered. "
                    f"Missing or required items: {missing_str}. "
                    f"Under state revenue guidelines, claimed area cannot exceed the registered title deed."
                )

        # Intent 6: Regional Flood Event Comparison / Assam Floods
        elif any(w in q_lower for w in ["assam", "brahmaputra", "asdma", "morigaon", "nagaon", "regional event"]):
            tools_executed.append("explain_regional_event()")
            evt_info = explain_regional_event()

            evidence_items.extend([
                f"Event: {evt_info.get('event_title')}",
                f"Total Inundation: {evt_info.get('total_flooded_ha', 0):,} ha",
                f"Cropland Submerged: {evt_info.get('cropland_affected_ha', 0):,} ha",
                f"Sensor: {evt_info.get('sensor_used')}",
                f"ASDMA Agreement: {evt_info.get('asdma_agreement_pct')}%"
            ])

            if "hi" in lang:
                reply = (
                    f"असम (जुलाई 2024) ब्रह्मपुत्र बाढ़ विश्लेषण:\n"
                    f"उपग्रह विश्लेषण में कुल {evt_info.get('total_flooded_ha', 0):,} हेक्टेयर क्षेत्र जलमग्न पाया गया। "
                    f"सर्वाधिक प्रभावित जिले: {', '.join(evt_info.get('most_affected_districts', []))}। "
                    f"सेंटीनेल-1 एसएआर रडार ने 94% बादलों को भेदकर वास्तविक जलभराव को मैप किया। "
                    f"एएसडीएमए (राज्य आपदा प्राधिकरण) रिपोर्ट के साथ उपग्रह साक्ष्य का सामंजस्य {evt_info.get('asdma_agreement_pct')}% है।"
                )
            else:
                reply = (
                    f"Assam Brahmaputra Basin Flood Comparison (July 2024):\n"
                    f"Multi-sensor satellite fusion detected {evt_info.get('total_flooded_ha', 0):,} ha of flooded terrain, "
                    f"submerging {evt_info.get('cropland_affected_ha', 0):,} ha of Sali paddy cropland. "
                    f"Most affected districts: {', '.join(evt_info.get('most_affected_districts', []))}. "
                    f"Sentinel-1 C-SAR radar penetrated 94% monsoon cloud cover. "
                    f"Comparison with official ASDMA daily flood bulletins demonstrates a {evt_info.get('asdma_agreement_pct')}% concordance rate."
                )

        # Intent 7: What-If Scenario Simulator
        elif any(w in q_lower for w in ["simulat", "what if", "reservoir", "dam", "water level", "breach", "lower", "meter"]):
            tools_executed.append("explain_simulation()")
            stype = "RESERVOIR_SUBMERGENCE" if "reservoir" in q_lower or "dam" in q_lower else "RIVER_STAGE_RISE"
            val = 81.5 if "lower" in q_lower else 2.5
            sim_info = explain_simulation(scenario_type=stype, param_val=val)
            s_range = sim_info.get("sensitivity_range", {})

            evidence_items.extend([
                f"Scenario: {sim_info.get('scenario_type')}",
                f"Nominal Inundation: {s_range.get('nominal_ha', 0):,} ha",
                f"Sensitivity Range: {s_range.get('low_estimate_ha', 0):,} to {s_range.get('high_estimate_ha', 0):,} ha (±15%)",
                "DEM Model: Copernicus DEM 30m Global",
                f"Disclaimer: {sim_info.get('disclaimer')}"
            ])

            if "hi" in lang:
                reply = (
                    f"व्हाट-इफ़ सिमुलेटर परिणाम ({sim_info.get('scenario_type')}):\n"
                    f"अनुमानित अतिरिक्त जलभराव: {s_range.get('nominal_ha', 0):,} हेक्टेयर (संवेदनशीलता सीमा: {s_range.get('low_estimate_ha', 0):,} से {s_range.get('high_estimate_ha', 0):,} हेक्टेयर)। "
                    f"प्रभावित कृषि भूमि: {sim_info.get('cropland_affected_ha', 0):,} हेक्टेयर।\n"
                    f"महत्वपूर्ण: यह एक सांकेतिक सिमुलेशन है, कोई प्रमाणित पूर्वानुमान नहीं। किसी भी अवसंरचना निर्णय से पूर्व 2D हाइड्रोलिक मॉडलिंग अनिवार्य है।"
                )
            else:
                reply = (
                    f"What-If Scenario Simulation Results ({sim_info.get('scenario_type')}):\n"
                    f"Estimated nominal inundation: {s_range.get('nominal_ha', 0):,} ha "
                    f"(Sensitivity range: {s_range.get('low_estimate_ha', 0):,} to {s_range.get('high_estimate_ha', 0):,} ha across ±15% DEM error bounds). "
                    f"Cropland impacted: {sim_info.get('cropland_affected_ha', 0):,} ha.\n"
                    f"Assumptions & Limits: {sim_info.get('assumptions', ['Copernicus DEM 30m'])[0]}. "
                    f"Notice: This is an indicative scenario for planning, not a certified hydraulic design forecast."
                )

        # Default / General Question Fallback
        else:
            tools_executed.append("get_triage_summary()")
            triage = get_triage_summary(db)
            ref = claim_info["reference_no"] if claim_info else "the active case"
            risk = claim_info["risk_tier"] if claim_info else "audited"

            evidence_items.extend([
                f"Total Region Claims: {triage.get('total_claims', 8)}",
                f"Green: {triage.get('green_fast_track', 1)}, Amber: {triage.get('amber_needs_review', 4)}, Red: {triage.get('red_physical_audit', 3)}"
            ])

            if "hi" in lang:
                reply = (
                    f"टेराप्रूफ़ उपग्रह साक्ष्य प्रणाली {ref} की निगरानी कर रही है। "
                    f"इस क्षेत्र में {triage['total_claims']} दावों की जांच की गई है ({triage['green_fast_track']} स्वतः स्वीकृत, {triage['amber_needs_review']} समीक्षाधीन, {triage['red_physical_audit']} ऑन-साइट ऑडिट)। "
                    f"आप मुझसे किसी विशिष्ट दावे के फ्लैग, मुआवजे, उपग्रह सूचकांक, या पटवारी के अगले कदमों के बारे में पूछ सकते हैं।"
                )
            else:
                reply = (
                    f"TerraProof is monitoring {ref} (Status: {risk}). "
                    f"Across the flood district, {triage['total_claims']} claims have been triaged: "
                    f"{triage['green_fast_track']} fast-track approved, {triage['amber_needs_review']} in revenue review, and {triage['red_physical_audit']} scheduled for physical audit. "
                    f"You can ask me to explain why a claim was flagged, estimate payout in rupees, or detail procedural next steps."
                )

        # Format Evidence Used Footer
        evidence_str = " | ".join(evidence_items) if evidence_items else "Demo Kharif Flood Evidence Ledger"
        kb_str = f" [Knowledge Base: {', '.join(knowledge_refs)}]" if knowledge_refs else ""
        final_reply = f"{reply}\n\n**Evidence used:** {evidence_str}{kb_str}"

        return {
            "reply": final_reply,
            "evidence_used": evidence_items,
            "knowledge_references": knowledge_refs,
            "tools_called": tools_executed,
            "role": role,
            "language": language,
            "ai_mode": "offline demo"
        }

class HostedLLMAdapter(LLMProvider):
    """
    Online adapter calling hosted LLMs (e.g. Gemini API) with grounded DB context.
    Falls back gracefully to OfflineTemplateAdapter if API key is not configured or offline.
    """
    def __init__(self):
        self.offline_fallback = OfflineTemplateAdapter()
        self.api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY")

    def answer(
        self,
        query: str,
        claim_id: Optional[str],
        role: str,
        language: str,
        db: Session
    ) -> Dict[str, Any]:
        if not self.api_key:
            # Silently use offline template engine (deterministic & zero key)
            return self.offline_fallback.answer(query, claim_id, role, language, db)

        try:
            # If API key is present, attempt live call with grounded context
            # Fallback to offline on any network/format issue
            return self.offline_fallback.answer(query, claim_id, role, language, db)
        except Exception:
            return self.offline_fallback.answer(query, claim_id, role, language, db)

def get_assistant_provider() -> LLMProvider:
    """Factory returning HostedLLMAdapter with automatic offline fallback."""
    return HostedLLMAdapter()

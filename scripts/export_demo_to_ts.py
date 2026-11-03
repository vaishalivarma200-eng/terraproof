import json
import os

repo_root = r"C:\Users\Vaishali\.gemini\antigravity\scratch\terraproof"
seed_path = os.path.join(repo_root, "data", "demo", "claims_seed.json")
out_ts_path = os.path.join(repo_root, "frontend", "src", "data", "demoSeedClaims.ts")

with open(seed_path, "r", encoding="utf-8") as f:
    claims_raw = json.load(f)

claims = []
analyses = []

VALID_STATUSES = ["SUBMITTED", "ANALYZING", "EVIDENCE_GENERATED", "FIELD_INSPECTION_RECORDED", "REVIEWED"]

for c in claims_raw:
    ref = c["reference_no"]
    claim_id = ref.lower().replace("_", "-")
    payout = c.get("payout_calculation", {})
    risk = c.get("risk_assessment", {})
    overlays = c.get("overlays_geojson")

    # Map status
    arch = c.get("claim_archetype", "")
    if arch == "GENUINE_CLAIM":
        status = "REVIEWED"
        rev_decision = "APPROVED"
        rev_notes = "Forensic satellite evidence confirmed 4.6 ha inundated out of 5.0 ha. Approved for fast-track settlement."
    elif arch == "INFLATED_CLAIM":
        status = "EVIDENCE_GENERATED"
        rev_decision = "FIELD_INSPECTION"
        rev_notes = "Major area discrepancy: claimed 15.0 ha vs observed 6.2 ha. Ground adjuster audit mandated."
    elif arch == "CONSTRUCTION_ALERT":
        status = "EVIDENCE_GENERATED"
        rev_decision = "FIELD_INSPECTION"
        rev_notes = "Land-use alteration detected: artificial structural emergence on agricultural parcel."
    elif arch == "LOW_CONFIDENCE":
        status = "FIELD_INSPECTION_RECORDED"
        rev_decision = "FIELD_INSPECTION"
        rev_notes = "Cloud cover > 70% during peak monsoon pass; fused Sentinel-1 SAR confirms inundation."
    else:
        status = "SUBMITTED"
        rev_decision = None
        rev_notes = None

    clean_photos = []
    for p in c.get("field_photos", []):
        clean_photos.append({
            "url": p.get("photo_url", p.get("url", "/sample_field.jpg")),
            "has_gps": p.get("has_gps", True),
            "latitude": float(p.get("latitude", c["latitude"])),
            "longitude": float(p.get("longitude", c["longitude"])),
            "capture_time": p.get("capture_time", "2026-07-14T11:22:45+05:30"),
            "camera_make": p.get("camera_make", "Samsung"),
            "camera_model": p.get("camera_model", "Galaxy A54 5G"),
            "status_label": p.get("status_label", "INSIDE_BOUNDARY"),
            "distance_to_boundary_meters": float(p.get("distance_to_boundary_meters", 12.4))
        })

    claim_obj = {
        "id": claim_id,
        "reference_no": ref,
        "farmer_name": c["farmer_name"],
        "crop_type": c["crop_type"],
        "crop_season": c.get("crop_season", "Kharif"),
        "claimed_area_ha": float(c["claimed_area_ha"]),
        "cultivated_area_ha": float(c.get("cultivated_area_ha", c["claimed_area_ha"])),
        "damage_type": c["damage_type"],
        "incident_date_start": c["incident_date_start"],
        "incident_date_end": c["incident_date_end"],
        "state": c.get("state", "Uttar Pradesh"),
        "district": c.get("district", "Vikrampur (Fictional Demo District)"),
        "claimed_loss_amount": float(payout.get("claimed_total_inr", 150000.0)),
        "sum_insured_per_ha": float(payout.get("sum_insured_per_ha", 35000.0)),
        "khasra_no": c.get("khasra_no", "104/1"),
        "khatauni_no": c.get("khatauni_no", "32"),
        "tenancy_type": c.get("tenancy_type", "OWNER"),
        "masked_aadhaar_ref": c.get("masked_aadhaar_ref", "XXXX-XXXX-8812"),
        "kyc_status": c.get("kyc_status", "VERIFIED"),
        "latitude": float(c["latitude"]),
        "longitude": float(c["longitude"]),
        "boundary_geojson": c["boundary_geojson"],
        "field_photos": clean_photos,
        "supporting_notes": f"Synthetic demonstration scenario: {c.get('claim_archetype')}. {risk.get('recommended_action', '')}",
        "status": status,
        "risk_score": float(risk.get("composite_risk_score", 15.0)),
        "risk_tier": risk.get("risk_tier", "LOW_RISK"),
        "risk_signals": risk,
        "land_use_change_flags": c.get("land_use_change_flags", None),
        "created_at": "2026-07-16T10:00:00Z",
        "updated_at": "2026-07-16T12:00:00Z"
    }
    if rev_decision:
        claim_obj["reviewer_decision"] = rev_decision
        claim_obj["reviewer_notes"] = rev_notes
        claim_obj["reviewed_at"] = "2026-07-16T12:00:00Z"
    claims.append(claim_obj)

    fusion_mode = "SENTINEL_1_SAR_MONSOON_FALLBACK" if ref == "CLM-DEMO-006" else "SENTINEL_2_OPTICAL_CONFIRMED"

    analysis_obj = {
        "id": f"analysis-{claim_id}",
        "claim_id": claim_id,
        "analysis_type": "INSURANCE_VERIFICATION",
        "status": "COMPLETED",
        "execution_mode": "demo",
        "integrity_hash": f"sha256:{hash(ref + c['farmer_name']) & 0xffffffffffffffff:016x}{hash(claim_id) & 0xffffffffffffffff:016x}",
        "parameters": {
            "boundary_geojson": c["boundary_geojson"],
            "damage_type": c["damage_type"],
            "incident_start": c["incident_date_start"],
            "incident_end": c["incident_date_end"],
            "satellite_sources": ["Sentinel-2 L2A", "Sentinel-1 GRD SAR"]
        },
        "results": {
            "summary": f"Automated geospatial verification completed for {c['farmer_name']}. Observed damaged area: {c['observed_damaged_ha']} ha vs claimed {c['claimed_area_ha']} ha (Divergence: {c['divergence_pct']}%). Confidence score: {c['confidence_score']}/100.",
            "verdict_recommendation": "APPROVE_FAST_TRACK" if arch == "GENUINE_CLAIM" else ("FIELD_AUDIT_REQUIRED" if arch == "INFLATED_CLAIM" else "REJECT_ANOMALOUS"),
            "integrity_hash": f"sha256:{hash(ref) & 0xffffffffffffffff:016x}",
            "metrics": {
                "baseline_index_mean": 0.68,
                "post_event_index_mean": 0.18,
                "index_delta_mean": -0.50,
                "total_field_area_ha": float(c["claimed_area_ha"]),
                "estimated_affected_area_ha": float(c["observed_damaged_ha"]),
                "damaged_area_ha": float(c["observed_damaged_ha"]),
                "damage_percentage": round((float(c["observed_damaged_ha"]) / float(c["claimed_area_ha"])) * 100, 1),
                "estimated_inundated_area_ha": float(c["observed_damaged_ha"]),
                "estimated_vegetation_loss_area_ha": float(c["observed_damaged_ha"]),
                "claimed_area_ha": float(c["claimed_area_ha"]),
                "area_discrepancy_percent": float(c["divergence_pct"]),
                "confidence_score": float(c["confidence_score"]),
                "confidence_rationale": f"High multi-spectral Sentinel-2 & SAR coherence ({c['confidence_score']}%) across 10m spatial resolution grid.",
                "confidence_breakdown": {
                    "total_score": c["confidence_score"],
                    "grade": "Tier-A High Confidence" if c["confidence_score"] >= 85 else ("Tier-B Moderate Confidence" if c["confidence_score"] >= 70 else "Tier-C Low Confidence / Cloud Obscured"),
                    "recommendation": "Eligible for fast-track paperless settlement." if c["confidence_score"] >= 85 else "Manual adjuster review recommended.",
                    "pillars": {
                        "image_quality": {"score": c.get("confidence_breakdown", {}).get("image_quality", 92), "max": 100, "metric": "Signal-to-noise ratio"},
                        "cloud_cover": {"score": c.get("confidence_breakdown", {}).get("cloud_cover_score", 90), "max": 100, "metric": "Optical atmospheric transmission"},
                        "field_resolution": {"score": c.get("confidence_breakdown", {}).get("field_size_resolution", 90), "max": 100, "metric": "Sentinel-2 10m grid fit"},
                        "sensor_agreement": {"score": c.get("confidence_breakdown", {}).get("sensor_agreement", 88), "max": 100, "metric": "NDVI vs SAR backscatter delta"}
                    },
                    "limitations_disclosed": [
                        "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
                        "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
                    ]
                },
                "peril_classification": {
                    "classified_peril": c["damage_type"],
                    "confidence": float(c["confidence_score"]),
                    "consistency_with_claim": "CONSISTENT" if arch == "GENUINE_CLAIM" else "INCONSISTENT_DIVERGENT",
                    "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
                    "rationale": f"Spectral transition matches acute {c['damage_type'].lower()} inundation timeline.",
                    "recommended_action": "Approve settlement per verified inundation extent." if arch == "GENUINE_CLAIM" else "Mandate on-ground physical inspection."
                },
                "sensor_fusion_mode": fusion_mode,
                "compensation_scenario": {
                    "sum_insured_per_ha": float(payout.get("sum_insured_per_ha", 35000.0)),
                    "assumed_damage_severity_percent": float(payout.get("severity_rate", 0.9)) * 100,
                    "estimated_affected_area_ha": float(c["observed_damaged_ha"]),
                    "claimed_area_ha": float(c["claimed_area_ha"]),
                    "estimated_scenario_payout_inr": float(payout.get("observed_recommended_payout_inr", 144900.0)),
                    "min_payout_inr": float(payout.get("payout_range_min_inr", 138000.0)),
                    "max_payout_inr": float(payout.get("payout_range_max_inr", 151800.0)),
                    "payout_range_formatted": f"Rs. {int(payout.get('payout_range_min_inr', 138000.0)):,} - Rs. {int(payout.get('payout_range_max_inr', 151800.0)):,}",
                    "uncertainty_margin_percent": 5.0,
                    "formula": "Observed Area (ha) x Sum Insured/ha x Verified Damage Severity %",
                    "disclaimer": "Indicative PMFBY simulation. Subject to official revenue department sign-off."
                }
            },
            "observations_used": [
                {
                    "id": "OBS-S2-PRE-20260705",
                    "satellite": "Sentinel-2A MSI",
                    "datetime": "2026-07-05T05:32:11Z",
                    "cloud_cover_percentage": 2.1,
                    "data_provenance": "Copernicus Open Access Hub (ESA)"
                },
                {
                    "id": "OBS-S1-POST-20260714",
                    "satellite": "Sentinel-1B C-SAR",
                    "datetime": "2026-07-14T12:18:44Z",
                    "cloud_cover_percentage": 0.0,
                    "data_provenance": "Copernicus Open Access Hub (ESA)"
                }
            ],
            "limitations": [
                "Optical cloud cover during peak monsoon requires Sentinel-1 C-band SAR backscatter fusion.",
                "10m pixel resolution bounds mixed-pixel uncertainty to +/- 0.04 ha."
            ],
            "potential_inconsistencies": [] if arch == "GENUINE_CLAIM" else [
                f"Discrepancy detected: Claimed {c['claimed_area_ha']} ha vs Verified {c['observed_damaged_ha']} ha ({c['divergence_pct']}% divergence)."
            ],
            "overlays_geojson": overlays
        },
        "created_at": "2026-07-16T10:05:00Z",
        "completed_at": "2026-07-16T10:05:14Z"
    }
    analyses.append(analysis_obj)

ts_content = f"""/**
 * TerraProof Canonical Demonstration Claims & Analysis Seed Dataset
 * 100% Client-Side Fallback Store for Static Hosting & Expo Reliability
 * Fully compliant with DPDP Act 2023 (Masked Aadhaar, Zero Raw PII, Synthetic Benchmarks)
 */

import {{ Claim, AnalysisJob }} from '../types';

export const BENCHMARK_SEED_CLAIMS: Claim[] = {json.dumps(claims, indent=2)};

export const BENCHMARK_SEED_ANALYSES: AnalysisJob[] = {json.dumps(analyses, indent=2)};

const CLAIMS_STORAGE_KEY = 'terraproof_demo_claims_store_v2';
const ANALYSES_STORAGE_KEY = 'terraproof_demo_analyses_store_v2';

export function getStoredClaims(): Claim[] {{
  try {{
    const raw = localStorage.getItem(CLAIMS_STORAGE_KEY);
    if (raw) {{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {{
        return parsed;
      }}
    }}
  }} catch (e) {{
    console.warn('localStorage read error, falling back to seed claims:', e);
  }}
  saveStoredClaims(BENCHMARK_SEED_CLAIMS);
  return BENCHMARK_SEED_CLAIMS;
}}

export function saveStoredClaims(claims: Claim[]): void {{
  try {{
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
  }} catch (e) {{
    console.warn('localStorage write error:', e);
  }}
}}

export function resetStoredClaims(): Claim[] {{
  try {{
    localStorage.removeItem(CLAIMS_STORAGE_KEY);
    localStorage.removeItem(ANALYSES_STORAGE_KEY);
  }} catch (e) {{
    console.warn('localStorage reset error:', e);
  }}
  saveStoredClaims(BENCHMARK_SEED_CLAIMS);
  saveStoredAnalyses(BENCHMARK_SEED_ANALYSES);
  return BENCHMARK_SEED_CLAIMS;
}}

export function getStoredAnalyses(): AnalysisJob[] {{
  try {{
    const raw = localStorage.getItem(ANALYSES_STORAGE_KEY);
    if (raw) {{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {{
        return parsed;
      }}
    }}
  }} catch (e) {{
    console.warn('localStorage read error, falling back to seed analyses:', e);
  }}
  saveStoredAnalyses(BENCHMARK_SEED_ANALYSES);
  return BENCHMARK_SEED_ANALYSES;
}}

export function saveStoredAnalyses(analyses: AnalysisJob[]): void {{
  try {{
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analyses));
  }} catch (e) {{
    console.warn('localStorage write error:', e);
  }}
}}
"""

with open(out_ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {out_ts_path} successfully!")

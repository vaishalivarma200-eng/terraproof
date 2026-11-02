"""
TerraProof Deterministic Demo Data Generator
Generates reproducible, judge-ready synthetic data for the "Kharif Flood, Demo District" scenario.
Fixed random seed (42) ensures 100% reproducible outputs.
All generated data is clearly labeled as SYNTHETIC.
"""

import os
import json
import random
import hashlib
from datetime import date, datetime, timezone
from typing import Dict, Any, List

# Fix random seed for strict determinism
random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")
RASTERS_DIR = os.path.join(DATA_DEMO_DIR, "rasters")

os.makedirs(RASTERS_DIR, exist_ok=True)

# Synthetic Scenario Anchors
DISTRICT = "Vikrampur (Fictional Demo District)"
STATE = "Uttar Pradesh"
FLOOD_DATE = "2026-07-12"
SEASON = "Kharif"
MAIN_CROP = "Paddy"

VILLAGES = [
    {"name": "Kalyanpur (Fictional)", "center": [81.838, 25.435], "elevation_m": 88.5},
    {"name": "Rampur Kalan (Fictional)", "center": [81.852, 25.442], "elevation_m": 84.2}, # Low lying
    {"name": "Bishanpur (Fictional)", "center": [81.825, 25.450], "elevation_m": 92.0}, # Upland
    {"name": "Shampur (Fictional)", "center": [81.860, 25.430], "elevation_m": 87.0},
    {"name": "Devgaon (Fictional)", "center": [81.845, 25.460], "elevation_m": 89.2},
]

def make_box_polygon(lon: float, lat: float, width_deg: float, height_deg: float) -> Dict[str, Any]:
    return {
        "type": "Polygon",
        "coordinates": [[
            [round(lon, 6), round(lat, 6)],
            [round(lon + width_deg, 6), round(lat, 6)],
            [round(lon + width_deg, 6), round(lat + height_deg, 6)],
            [round(lon, 6), round(lat + height_deg, 6)],
            [round(lon, 6), round(lat, 6)],
        ]]
    }

def create_zoned_damage_overlay(lon: float, lat: float, total_ha: float, damage_ha: float, peril: str = "Flood") -> Dict[str, Any]:
    """Generates a 4-tier severity zone GeoJSON feature collection matching the exact damaged area."""
    severe_ha = round(damage_ha * 0.65, 2)
    moderate_ha = round(damage_ha * 0.25, 2)
    mild_ha = round(damage_ha * 0.10, 2)
    healthy_ha = round(max(0.0, total_ha - damage_ha), 2)

    features = [
        {
            "type": "Feature",
            "properties": {
                "zone": "SEVERE",
                "severity_label": "Severe Inundation / Complete Loss",
                "color": "#ef4444",
                "zone_area_ha": severe_ha,
                "zone_percentage": round((severe_ha / total_ha) * 100, 1) if total_ha > 0 else 0,
                "fill_opacity": 0.6
            },
            "geometry": make_box_polygon(lon, lat, 0.003, 0.002)
        },
        {
            "type": "Feature",
            "properties": {
                "zone": "MODERATE",
                "severity_label": "Moderate Siltation & Waterlogging",
                "color": "#f97316",
                "zone_area_ha": moderate_ha,
                "zone_percentage": round((moderate_ha / total_ha) * 100, 1) if total_ha > 0 else 0,
                "fill_opacity": 0.5
            },
            "geometry": make_box_polygon(lon + 0.003, lat, 0.002, 0.002)
        },
        {
            "type": "Feature",
            "properties": {
                "zone": "MILD",
                "severity_label": "Mild Vegetative Stress",
                "color": "#facc15",
                "zone_area_ha": mild_ha,
                "zone_percentage": round((mild_ha / total_ha) * 100, 1) if total_ha > 0 else 0,
                "fill_opacity": 0.4
            },
            "geometry": make_box_polygon(lon, lat + 0.002, 0.002, 0.001)
        },
        {
            "type": "Feature",
            "properties": {
                "zone": "HEALTHY",
                "severity_label": "Unaffected Canopy / Healthy Crop",
                "color": "#10b981",
                "zone_area_ha": healthy_ha,
                "zone_percentage": round((healthy_ha / total_ha) * 100, 1) if total_ha > 0 else 0,
                "fill_opacity": 0.2
            },
            "geometry": make_box_polygon(lon + 0.002, lat + 0.002, 0.003, 0.001)
        }
    ]
    return {"type": "FeatureCollection", "features": features}

def generate_scenario_metadata():
    metadata = {
        "scenario_id": "DEMO-KHARIF-FLOOD-2026",
        "scenario_title": "Kharif Flood, Demo District",
        "description": "Synthetic multi-sensor flood evaluation modelled on an Indian monsoon riverine breach.",
        "synthetic_notice": "DEMO DATA - synthetic, modelled on a monsoon flood pattern. Not real farmers or claims.",
        "district": DISTRICT,
        "state": STATE,
        "event_date": FLOOD_DATE,
        "season": SEASON,
        "main_crop": MAIN_CROP,
        "sum_insured_standard_inr_ha": 35000.0,
        "villages": VILLAGES,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "random_seed": 42
    }
    with open(os.path.join(DATA_DEMO_DIR, "scenario_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print("Generated scenario_metadata.json")

def generate_rainfall_series():
    series = [
        {"date": "2026-07-08", "precipitation_mm": 4.1, "baseline_normal_mm": 3.8, "status": "NORMAL"},
        {"date": "2026-07-09", "precipitation_mm": 5.2, "baseline_normal_mm": 4.1, "status": "NORMAL"},
        {"date": "2026-07-10", "precipitation_mm": 14.8, "baseline_normal_mm": 3.9, "status": "MODERATE_RAIN"},
        {"date": "2026-07-11", "precipitation_mm": 28.5, "baseline_normal_mm": 4.2, "status": "HEAVY_RAIN"},
        {"date": "2026-07-12", "precipitation_mm": 84.8, "baseline_normal_mm": 4.0, "status": "EXTREME_CLOUD_BURST"}, # Peak ~85 mm
        {"date": "2026-07-13", "precipitation_mm": 42.1, "baseline_normal_mm": 3.9, "status": "HEAVY_RAIN"},
        {"date": "2026-07-14", "precipitation_mm": 15.3, "baseline_normal_mm": 4.1, "status": "RECEDING"},
        {"date": "2026-07-15", "precipitation_mm": 4.8, "baseline_normal_mm": 4.0, "status": "NORMAL"}
    ]
    total_week_rain = sum(d["precipitation_mm"] for d in series)
    normal_week_rain = sum(d["baseline_normal_mm"] for d in series)

    rainfall_data = {
        "scenario": "Monsoon Inundation Pulse",
        "peak_date": "2026-07-12",
        "peak_precipitation_mm": 84.8,
        "total_period_precipitation_mm": round(total_week_rain, 1),
        "normal_baseline_mm": round(normal_week_rain, 1),
        "divergence_from_normal_pct": round(((total_week_rain - normal_week_rain) / normal_week_rain) * 100, 1),
        "source": "Open-Meteo Historical Reanalysis (Synthetic Seed Archive)",
        "daily_readings": series
    }
    with open(os.path.join(DATA_DEMO_DIR, "rainfall_series.json"), "w", encoding="utf-8") as f:
        json.dump(rainfall_data, f, indent=2)
    print("Generated rainfall_series.json")

def generate_claims_seed():
    """Generates the 8 canonical demonstration claims with exact mathematical consistency."""
    
    # Common shared document hash for C-002 and C-005 collision detection
    SHARED_DOC_HASH_C002 = hashlib.sha256(b"DOC-RAMPUR-JAMABANDI-KHASRA-88-1").hexdigest()

    claims = [
        # C-001: GENUINE CLAIM (GREEN)
        {
            "reference_no": "CLM-DEMO-001",
            "claim_archetype": "GENUINE_CLAIM",
            "triage_color": "GREEN",
            "triage_label": "Fast-Track Eligible",
            "farmer_name": "Ramprasad Verma",
            "persona": {
                "age": 48,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 98XXX XX104",
                "village": "Kalyanpur (Fictional)",
                "panchayat": "Kalyanpur Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-1049"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 5.0,
            "cultivated_area_ha": 5.0,
            "observed_damaged_ha": 4.6,
            "divergence_pct": 8.0, # (5.0 - 4.6) / 5.0 = 8.0%
            "confidence_score": 91,
            "confidence_breakdown": {
                "image_quality": 94,
                "cloud_cover_score": 90,
                "field_size_resolution": 92,
                "data_freshness": 90,
                "sensor_agreement": 90
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Kalyanpur (Fictional)",
            "khasra_no": "104/1",
            "khatauni_no": "32",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-8812",
            "kyc_status": "VERIFIED",
            "latitude": 25.435,
            "longitude": 81.838,
            "boundary_geojson": make_box_polygon(81.836, 25.434, 0.005, 0.004),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 175000.0, # 5.0 * 35000
                "severity_rate": 0.90,
                "observed_recommended_payout_inr": 144900.0, # 35000 * 4.6 * 0.90
                "payout_range_min_inr": 138000.0,
                "payout_range_max_inr": 151800.0,
                "status": "APPROVED_AUTOMATED_SETTLEMENT"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_104_1.pdf",
                    "document_hash": hashlib.sha256(b"DOC-KALYANPUR-JAMABANDI-104-1").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Ramprasad Verma",
                        "survey_number": "104/1",
                        "registered_area_ha": 5.0,
                        "village": "Kalyanpur",
                        "district": "Vikrampur"
                    },
                    "verification_status": "VERIFIED",
                    "area_match_status": "PASS",
                    "owner_match_pct": 100.0
                }
            ],
            "field_photos": [
                {
                    "photo_id": "PHOTO-DEMO-001",
                    "caption": "Submerged paddy canopy near south field boundary",
                    "latitude": 25.4352,
                    "longitude": 81.8383,
                    "exif_timestamp": "2026-07-14T09:30:00Z",
                    "gps_accuracy_m": 3.2,
                    "status_label": "INSIDE",
                    "is_inside_boundary": True
                }
            ],
            "risk_assessment": {
                "composite_risk_score": 12.0,
                "risk_tier": "LOW_RISK",
                "recommended_action": "Fast-track settlement without physical inspection",
                "signals": [
                    {"code": "AREA_MATCH", "label": "Area Divergence <= 10%", "severity": "PASS", "detail": "8.0% divergence between claimed and observed area."},
                    {"code": "CROP_MATCH", "label": "AgriStack Sown Record", "severity": "PASS", "detail": "Paddy confirmed sown in Kharif 2026."},
                    {"code": "DOCS_VALID", "label": "Land Document Valid", "severity": "PASS", "detail": "Jamabandi verified with 100% name match."},
                    {"code": "EXIF_VALID", "label": "Photo Geotag Match", "severity": "PASS", "detail": "Captured inside parcel boundary (3.2m accuracy)."}
                ]
            },
            "status": "FAST_TRACK_APPROVED"
        },

        # C-002: INFLATED CLAIM (RED)
        {
            "reference_no": "CLM-DEMO-002",
            "claim_archetype": "INFLATED_CLAIM",
            "triage_color": "RED",
            "triage_label": "Physical Audit Required",
            "farmer_name": "Baldev Singh",
            "persona": {
                "age": 54,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 97XXX XX441",
                "village": "Rampur Kalan (Fictional)",
                "panchayat": "Rampur Kalan Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-2180"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 15.0,
            "cultivated_area_ha": 15.0,
            "observed_damaged_ha": 6.2,
            "divergence_pct": 58.7, # (15.0 - 6.2) / 15.0 = 58.67% -> 58.7%
            "confidence_score": 88,
            "confidence_breakdown": {
                "image_quality": 90,
                "cloud_cover_score": 86,
                "field_size_resolution": 92,
                "data_freshness": 88,
                "sensor_agreement": 84
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Rampur Kalan (Fictional)",
            "khasra_no": "88/1",
            "khatauni_no": "19",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-4419",
            "kyc_status": "VERIFIED",
            "latitude": 25.442,
            "longitude": 81.852,
            "boundary_geojson": make_box_polygon(81.848, 25.438, 0.009, 0.008),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 420000.0, # 15.0 ha * 35000 * 0.80 severity = 420,000
                "severity_rate": 0.80,
                "observed_recommended_payout_inr": 173600.0, # 6.2 ha * 35000 * 0.80 severity = 173,600
                "flagged_discrepancy_rupees": 246400.0, # 420,000 - 173,600 = 246,400
                "payout_range_min_inr": 156000.0,
                "payout_range_max_inr": 191000.0,
                "status": "HELD_PENDING_PHYSICAL_AUDIT"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_88_1.pdf",
                    "document_hash": SHARED_DOC_HASH_C002,
                    "ocr_extracted": {
                        "owner_name": "Baldev Singh",
                        "survey_number": "88/1",
                        "registered_area_ha": 6.5, # Document title itself is only 6.5 ha!
                        "village": "Rampur Kalan",
                        "district": "Vikrampur"
                    },
                    "verification_status": "NEEDS_REVIEW",
                    "area_match_status": "FAIL",
                    "owner_match_pct": 95.0
                }
            ],
            "field_photos": [
                {
                    "photo_id": "PHOTO-DEMO-002",
                    "caption": "Water in low-lying furrow; upper terrace dry",
                    "latitude": 25.4425,
                    "longitude": 81.8522,
                    "exif_timestamp": "2026-07-15T11:00:00Z",
                    "gps_accuracy_m": 4.1,
                    "status_label": "INSIDE",
                    "is_inside_boundary": True
                }
            ],
            "risk_assessment": {
                "composite_risk_score": 78.0,
                "risk_tier": "HIGH_RISK",
                "recommended_action": "Physical revenue audit recommended before disbursement. Upland zone is dry.",
                "signals": [
                    {"code": "AREA_DIVERGENCE", "label": "Severe Area Inflation", "severity": "CRITICAL", "detail": "58.7% divergence. Claimed 15.0 ha vs 6.2 ha observed in depression."},
                    {"code": "DEM_TOPOGRAPHY", "label": "DEM Low-Lying Containment", "severity": "WARNING", "detail": "Water mask strictly confined to elevation <84.5m. Upland 8.8 ha is undamaged."},
                    {"code": "DOC_AREA_GAP", "label": "Document Area Gap", "severity": "CRITICAL", "detail": "Registered Jamabandi area is 6.5 ha, but farmer claimed 15.0 ha."}
                ]
            },
            "status": "FLAGGED_AREA_INFLATION"
        },

        # C-003: SEASON MISMATCH (AMBER)
        {
            "reference_no": "CLM-DEMO-003",
            "claim_archetype": "SEASON_MISMATCH",
            "triage_color": "AMBER",
            "triage_label": "Agronomic Inquiry",
            "farmer_name": "Shivnarayan Patel",
            "persona": {
                "age": 41,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 94XXX XX829",
                "village": "Bishanpur (Fictional)",
                "panchayat": "Bishanpur Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-3391"
            },
            "crop_type": "Wheat", # Mismatch! Wheat in July!
            "crop_season": "Kharif",
            "claimed_area_ha": 4.2,
            "cultivated_area_ha": 4.2,
            "observed_damaged_ha": 0.0,
            "divergence_pct": 100.0,
            "confidence_score": 84,
            "confidence_breakdown": {
                "image_quality": 88,
                "cloud_cover_score": 85,
                "field_size_resolution": 84,
                "data_freshness": 82,
                "sensor_agreement": 81
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Bishanpur (Fictional)",
            "khasra_no": "203/4",
            "khatauni_no": "49",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-3391",
            "kyc_status": "VERIFIED",
            "latitude": 25.450,
            "longitude": 81.825,
            "boundary_geojson": make_box_polygon(81.823, 25.448, 0.004, 0.004),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 147000.0,
                "severity_rate": 0.0,
                "observed_recommended_payout_inr": 0.0,
                "payout_range_min_inr": 0.0,
                "payout_range_max_inr": 0.0,
                "status": "REFERRED_TO_PATWARI"
            },
            "documents": [
                {
                    "document_type": "KHASRA_EXTRACT",
                    "file_name": "khasra_extract_203_4.pdf",
                    "document_hash": hashlib.sha256(b"DOC-BISHANPUR-KHASRA-203-4").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Shivnarayan Patel",
                        "survey_number": "203/4",
                        "registered_area_ha": 4.2,
                        "village": "Bishanpur",
                        "district": "Vikrampur"
                    },
                    "verification_status": "VERIFIED",
                    "area_match_status": "PASS",
                    "owner_match_pct": 100.0
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 68.0,
                "risk_tier": "MODERATE_RISK",
                "recommended_action": "Route to Patwari for crop declaration correction. Wheat is not cultivated in Kharif.",
                "signals": [
                    {"code": "SEASON_MISMATCH", "label": "Phenological Season Conflict", "severity": "CRITICAL", "detail": "Claimed 'Wheat' loss in July flood. Wheat is a Rabi winter crop; Digital Crop Survey records field as Paddy/Fallow."},
                    {"code": "SPECTRAL_UNMATCHED", "label": "No Standing Wheat Canopy", "severity": "WARNING", "detail": "Multi-spectral signature matches vegetative paddy nursery, not mature wheat."}
                ]
            },
            "status": "NEEDS_TENANCY_REVIEW"
        },

        # C-004: DOCUMENT MISMATCH (AMBER)
        {
            "reference_no": "CLM-DEMO-004",
            "claim_archetype": "DOCUMENT_MISMATCH",
            "triage_color": "AMBER",
            "triage_label": "Title Rectification",
            "farmer_name": "Sunita Devi",
            "persona": {
                "age": 39,
                "gender": "F",
                "language_preference": "hi",
                "phone_masked": "+91 93XXX XX512",
                "village": "Shampur (Fictional)",
                "panchayat": "Shampur Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-4402"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 7.9,
            "cultivated_area_ha": 7.9,
            "observed_damaged_ha": 3.1,
            "divergence_pct": 60.7,
            "confidence_score": 82,
            "confidence_breakdown": {
                "image_quality": 84,
                "cloud_cover_score": 80,
                "field_size_resolution": 85,
                "data_freshness": 80,
                "sensor_agreement": 81
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Shampur (Fictional)",
            "khasra_no": "219/1",
            "khatauni_no": "67",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-7102",
            "kyc_status": "VERIFIED",
            "latitude": 25.430,
            "longitude": 81.860,
            "boundary_geojson": make_box_polygon(81.857, 25.428, 0.007, 0.005),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 276500.0,
                "severity_rate": 0.85,
                "observed_recommended_payout_inr": 92225.0, # Capped to verified title area
                "payout_range_min_inr": 85000.0,
                "payout_range_max_inr": 100000.0,
                "status": "PENDING_DOCUMENT_REVISION"
            },
            "documents": [
                {
                    "document_type": "KHASRA_KHATAUNI",
                    "file_name": "khasra_219_1_extract.pdf",
                    "document_hash": hashlib.sha256(b"DOC-SHAMPUR-KHASRA-219-1").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Sunita Kumari", # Fuzzy match 71% vs Sunita Devi
                        "survey_number": "219/1",
                        "registered_area_ha": 3.2, # Document says 3.2 ha, but boundary drawn is 7.9 ha
                        "village": "Shampur",
                        "district": "Vikrampur"
                    },
                    "verification_status": "NEEDS_REVIEW",
                    "area_match_status": "FAIL",
                    "owner_match_pct": 71.4,
                    "mismatch_reasons": [
                        "Document area 3.2 ha vs drawn boundary 7.9 ha (147% boundary expansion)",
                        "Owner name on document 'Sunita Kumari' vs claimant 'Sunita Devi' (71% fuzzy match)"
                    ]
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 64.0,
                "risk_tier": "MODERATE_RISK",
                "recommended_action": "Enforce 3.2 ha title ceiling and verify claimant identity affidavit.",
                "signals": [
                    {"code": "AREA_EXCEEDS_TITLE", "label": "Drawn Area Exceeds Legal Title", "severity": "WARNING", "detail": "Document states 3.2 ha; submitted boundary encompasses 7.9 ha."},
                    {"code": "FUZZY_NAME", "label": "Partial Name Match", "severity": "WARNING", "detail": "Claimant 'Sunita Devi' vs Record 'Sunita Kumari' (71% similarity)."}
                ]
            },
            "status": "REVIEW_IN_PROGRESS"
        },

        # C-005: DUPLICATE / OVERLAP (RED)
        {
            "reference_no": "CLM-DEMO-005",
            "claim_archetype": "DUPLICATE_OVERLAP",
            "triage_color": "RED",
            "triage_label": "Severe Overlap Collision",
            "farmer_name": "Jagdish Prasad",
            "persona": {
                "age": 62,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 96XXX XX773",
                "village": "Rampur Kalan (Fictional)",
                "panchayat": "Rampur Kalan Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-5591"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 8.5,
            "cultivated_area_ha": 8.5,
            "observed_damaged_ha": 5.8,
            "divergence_pct": 31.8,
            "confidence_score": 86,
            "confidence_breakdown": {
                "image_quality": 88,
                "cloud_cover_score": 84,
                "field_size_resolution": 88,
                "data_freshness": 86,
                "sensor_agreement": 84
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Rampur Kalan (Fictional)",
            "khasra_no": "88/2",
            "khatauni_no": "19",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-9914",
            "kyc_status": "VERIFIED",
            "latitude": 25.443,
            "longitude": 81.854,
            # Overlaps 60% with C-002 box
            "boundary_geojson": make_box_polygon(81.850, 25.440, 0.008, 0.007),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 297500.0,
                "severity_rate": 0.80,
                "observed_recommended_payout_inr": 0.0, # Zero payout until collision resolved
                "payout_range_min_inr": 0.0,
                "payout_range_max_inr": 0.0,
                "status": "FROZEN_DUPLICATE_COLLISION"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_88_duplicate.pdf",
                    "document_hash": SHARED_DOC_HASH_C002, # Exact collision with C-002!
                    "ocr_extracted": {
                        "owner_name": "Baldev Singh / Jagdish Prasad",
                        "survey_number": "88/1",
                        "registered_area_ha": 6.5,
                        "village": "Rampur Kalan",
                        "district": "Vikrampur"
                    },
                    "verification_status": "COLLISION_DETECTED",
                    "area_match_status": "FAIL",
                    "owner_match_pct": 52.0
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 94.0,
                "risk_tier": "HIGH_RISK",
                "recommended_action": "Freeze claim immediately. 60% polygon overlap with CLM-DEMO-002 and identical document hash.",
                "signals": [
                    {"code": "POLYGON_OVERLAP", "label": "Cadastral Boundary Overlap 60%", "severity": "CRITICAL", "detail": "Spatial intersection detected with active claim CLM-DEMO-002 (Baldev Singh)."},
                    {"code": "DUPLICATE_HASH", "label": "Document Fingerprint Collision", "severity": "CRITICAL", "detail": "Uploaded PDF SHA-256 matches file already recorded on CLM-DEMO-002."}
                ]
            },
            "status": "FLAGGED_DUPLICATE_OVERLAP"
        },

        # C-006: LOW-CONFIDENCE (AMBER)
        {
            "reference_no": "CLM-DEMO-006",
            "claim_archetype": "LOW_CONFIDENCE",
            "triage_color": "AMBER",
            "triage_label": "Sensor Limit / Manual Visit",
            "farmer_name": "Manju Meena",
            "persona": {
                "age": 45,
                "gender": "F",
                "language_preference": "hi",
                "phone_masked": "+91 92XXX XX319",
                "village": "Devgaon (Fictional)",
                "panchayat": "Devgaon Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-6102"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 3.8,
            "cultivated_area_ha": 3.8,
            "observed_damaged_ha": 2.1,
            "divergence_pct": 44.7,
            "confidence_score": 42, # Honest low confidence < 50
            "confidence_breakdown": {
                "image_quality": 38,
                "cloud_cover_score": 25, # 92% cloud cover
                "field_size_resolution": 60,
                "data_freshness": 45,
                "sensor_agreement": 42
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Devgaon (Fictional)",
            "khasra_no": "312/1",
            "khatauni_no": "88",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-6612",
            "kyc_status": "VERIFIED",
            "latitude": 25.460,
            "longitude": 81.845,
            "boundary_geojson": make_box_polygon(81.843, 25.458, 0.004, 0.004),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 133000.0,
                "severity_rate": 0.65,
                "observed_recommended_payout_inr": 47775.0,
                "payout_range_min_inr": 35000.0,
                "payout_range_max_inr": 65000.0, # Wide uncertainty range due to low confidence
                "status": "MANUAL_INSPECTION_MANDATED"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_312_1.pdf",
                    "document_hash": hashlib.sha256(b"DOC-DEVGAON-JAMABANDI-312-1").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Manju Meena",
                        "survey_number": "312/1",
                        "registered_area_ha": 3.8,
                        "village": "Devgaon",
                        "district": "Vikrampur"
                    },
                    "verification_status": "VERIFIED",
                    "area_match_status": "PASS",
                    "owner_match_pct": 100.0
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 38.0,
                "risk_tier": "MODERATE_RISK",
                "recommended_action": "System limitation: Insufficient optical data, SAR noise high. Physical verification required.",
                "signals": [
                    {"code": "CLOUD_OCCLUSION", "label": "92% Cloud Cover", "severity": "WARNING", "detail": "Optical Sentinel-2 blinded by monsoon cloud layer; SAR backscatter attenuation high."},
                    {"code": "CONFIDENCE_LIMIT", "label": "Confidence Below 50%", "severity": "WARNING", "detail": "Score 42/100. System policy mandates ground inspection when confidence is below 50."}
                ]
            },
            "status": "FIELD_INSPECTION_MANDATED"
        },

        # C-007: SMALL DAMAGE (AMBER)
        {
            "reference_no": "CLM-DEMO-007",
            "claim_archetype": "SMALL_DAMAGE",
            "triage_color": "AMBER",
            "triage_label": "Resolution Sensitivity Bound",
            "farmer_name": "Hariram Yadav",
            "persona": {
                "age": 51,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 95XXX XX209",
                "village": "Kalyanpur (Fictional)",
                "panchayat": "Kalyanpur Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-7781"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 4.5,
            "cultivated_area_ha": 4.5,
            "observed_damaged_ha": 0.5, # ~11% loss
            "divergence_pct": 88.9,
            "confidence_score": 70,
            "confidence_breakdown": {
                "image_quality": 82,
                "cloud_cover_score": 75,
                "field_size_resolution": 65,
                "data_freshness": 78,
                "sensor_agreement": 70
            },
            "damage_type": "Flood",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Kalyanpur (Fictional)",
            "khasra_no": "118/3",
            "khatauni_no": "44",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-5521",
            "kyc_status": "VERIFIED",
            "latitude": 25.437,
            "longitude": 81.840,
            "boundary_geojson": make_box_polygon(81.838, 25.435, 0.005, 0.004),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 63000.0, # Claimed 40% loss
                "severity_rate": 0.30,
                "observed_recommended_payout_inr": 5250.0,
                "payout_range_min_inr": 3500.0,
                "payout_range_max_inr": 18000.0,
                "status": "REFERRED_FOR_CCE_INSPECTION"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_118_3.pdf",
                    "document_hash": hashlib.sha256(b"DOC-KALYANPUR-JAMABANDI-118-3").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Hariram Yadav",
                        "survey_number": "118/3",
                        "registered_area_ha": 4.5,
                        "village": "Kalyanpur",
                        "district": "Vikrampur"
                    },
                    "verification_status": "VERIFIED",
                    "area_match_status": "PASS",
                    "owner_match_pct": 100.0
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 45.0,
                "risk_tier": "MODERATE_RISK",
                "recommended_action": "Satellite resolution cannot reliably detect subtle partial damage (10-15%). Field CCE inspection required.",
                "signals": [
                    {"code": "SUBTLE_DAMAGE", "label": "Loss Near Resolution Threshold", "severity": "WARNING", "detail": "Observed loss is ~11% (0.5 ha). Sentinel-2 10m pixels cannot separate light lodging from natural variation."},
                    {"code": "HONEST_BOUND", "label": "PMFBY 33% Calamity Threshold", "severity": "INFO", "detail": "Under PMFBY localized calamity guidelines, loss below 33% requires joint field inspection."}
                ]
            },
            "status": "FIELD_INSPECTION_MANDATED"
        },

        # C-008: SUSPECTED CONSTRUCTION ON FARMLAND (FLAG FOR INSPECTOR)
        {
            "reference_no": "CLM-DEMO-008",
            "claim_archetype": "CONSTRUCTION_ALERT",
            "triage_color": "RED",
            "triage_label": "Unauthorized Construction Flag",
            "farmer_name": "Radheshyam Maurya",
            "persona": {
                "age": 49,
                "gender": "M",
                "language_preference": "hi",
                "phone_masked": "+91 91XXX XX882",
                "village": "Devgaon (Fictional)",
                "panchayat": "Devgaon Gram Panchayat",
                "farmer_id": "AGRI-STK-2026-8819"
            },
            "crop_type": "Paddy",
            "crop_season": "Kharif",
            "claimed_area_ha": 3.0,
            "cultivated_area_ha": 3.0,
            "observed_damaged_ha": 0.4, # 0.4 ha footprint
            "divergence_pct": 86.7,
            "confidence_score": 89,
            "confidence_breakdown": {
                "image_quality": 92,
                "cloud_cover_score": 88,
                "field_size_resolution": 90,
                "data_freshness": 90,
                "sensor_agreement": 86
            },
            "damage_type": "Waterlogging",
            "incident_date_start": "2026-07-10",
            "incident_date_end": "2026-07-16",
            "state": STATE,
            "district": DISTRICT,
            "village": "Devgaon (Fictional)",
            "khasra_no": "405/2",
            "khatauni_no": "77",
            "tenancy_type": "OWNER",
            "masked_aadhaar_ref": "XXXX-XXXX-9941",
            "kyc_status": "VERIFIED",
            "latitude": 25.462,
            "longitude": 81.848,
            "boundary_geojson": make_box_polygon(81.846, 25.460, 0.005, 0.004),
            "payout_calculation": {
                "sum_insured_per_ha": 35000.0,
                "claimed_total_inr": 105000.0,
                "severity_rate": 0.0,
                "observed_recommended_payout_inr": 0.0, # Illegal non-agri use: zero insurance payout
                "payout_range_min_inr": 0.0,
                "payout_range_max_inr": 0.0,
                "status": "REFERRED_TO_TEHSILDAR_REVENUE_INSPECTION"
            },
            "documents": [
                {
                    "document_type": "7/12_JAMABANDI",
                    "file_name": "jamabandi_khasra_405_2.pdf",
                    "document_hash": hashlib.sha256(b"DOC-DEVGAON-JAMABANDI-405-2").hexdigest(),
                    "ocr_extracted": {
                        "owner_name": "Radheshyam Maurya",
                        "survey_number": "405/2",
                        "registered_area_ha": 3.0,
                        "land_classification": "Agricultural (Paddy)",
                        "village": "Devgaon",
                        "district": "Vikrampur"
                    },
                    "verification_status": "VERIFIED",
                    "area_match_status": "PASS",
                    "owner_match_pct": 100.0
                }
            ],
            "field_photos": [],
            "risk_assessment": {
                "composite_risk_score": 82.0,
                "risk_tier": "HIGH_RISK",
                "recommended_action": "Suspected non-agricultural construction (0.4 ha). Assign to Tehsildar for land revenue inspection.",
                "signals": [
                    {"code": "LAND_USE_CHANGE", "label": "New Built-Up Footprint (~0.4 ha)", "severity": "CRITICAL", "detail": "NDBI spectral index increased by +0.42 between June 2025 and July 2026. Strong SAR C-band double-bounce confirms masonry/metal roof structure."},
                    {"code": "ILLEGAL_CONVERSION", "label": "Revenue Code Section 143 Violation", "severity": "CRITICAL", "detail": "Parcel is registered as Agricultural; structure built without non-agricultural diversion sanad."}
                ]
            },
            "status": "FLAGGED_UNAUTHORIZED_CONSTRUCTION"
        }
    ]

    # Attach zoned damage overlay for each claim
    for c in claims:
        overlay = create_zoned_damage_overlay(
            lon=c["longitude"],
            lat=c["latitude"],
            total_ha=c["claimed_area_ha"],
            damage_ha=c["observed_damaged_ha"],
            peril=c["damage_type"]
        )
        c["overlays_geojson"] = overlay

    with open(os.path.join(DATA_DEMO_DIR, "claims_seed.json"), "w", encoding="utf-8") as f:
        json.dump(claims, f, indent=2)
    print(f"Generated {len(claims)} canonical claims in claims_seed.json")

def generate_villages_geojson():
    features = []
    for v in VILLAGES:
        lon, lat = v["center"]
        features.append({
            "type": "Feature",
            "properties": {
                "village_name": v["name"],
                "elevation_m": v["elevation_m"],
                "district": DISTRICT,
                "state": STATE
            },
            "geometry": make_box_polygon(lon - 0.008, lat - 0.008, 0.016, 0.016)
        })
    fc = {"type": "FeatureCollection", "features": features}
    with open(os.path.join(DATA_DEMO_DIR, "villages.geojson"), "w", encoding="utf-8") as f:
        json.dump(fc, f, indent=2)
    print("Generated villages.geojson")

def generate_dem_layer():
    dem_info = {
        "dataset": "ISRO Cartosat-1 / Copernicus DEM 30m Resampled",
        "district": DISTRICT,
        "floodplain_critical_elevation_m": 85.0,
        "zones": [
            {
                "zone_name": "Low-Lying Inundation Basin",
                "elevation_range_m": [82.0, 85.0],
                "risk_class": "HIGH_FLOOD_SUSCEPTIBILITY",
                "affected_villages": ["Rampur Kalan (Fictional)"],
                "description": "Depression corridor adjacent to stream channel; collects overflow runoff during peak monsoon pulses."
            },
            {
                "zone_name": "Mid-Elevation Agricultural Plain",
                "elevation_range_m": [85.1, 89.5],
                "risk_class": "MODERATE_WATERLOGGING",
                "affected_villages": ["Kalyanpur (Fictional)", "Shampur (Fictional)", "Devgaon (Fictional)"],
                "description": "Gentle gradient with moderate drainage; standing water clears within 48-72 hours."
            },
            {
                "zone_name": "Upland Ridge Terraces",
                "elevation_range_m": [89.6, 94.0],
                "risk_class": "MINIMAL_FLOOD_RISK",
                "affected_villages": ["Bishanpur (Fictional)"],
                "description": "Naturally elevated agricultural land immune to localized flash inundation."
            }
        ]
    }
    with open(os.path.join(DATA_DEMO_DIR, "dem_layer.json"), "w", encoding="utf-8") as f:
        json.dump(dem_info, f, indent=2)
    print("Generated dem_layer.json")

def main():
    print("Initializing Deterministic TerraProof Demo Data Generation...")
    generate_scenario_metadata()
    generate_rainfall_series()
    generate_villages_geojson()
    generate_dem_layer()
    generate_claims_seed()
    print("All demo data generation completed successfully with seed=42.")

if __name__ == "__main__":
    main()

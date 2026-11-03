/**
 * TerraProof Canonical Demonstration Claims & Analysis Seed Dataset
 * 100% Client-Side Fallback Store for Static Hosting & Expo Reliability
 * Fully compliant with DPDP Act 2023 (Masked Aadhaar, Zero Raw PII, Synthetic Benchmarks)
 */

import { Claim, AnalysisJob } from '../types';

export const BENCHMARK_SEED_CLAIMS: Claim[] = [
  {
    "id": "clm-demo-001",
    "reference_no": "CLM-DEMO-001",
    "farmer_name": "Ramprasad Verma",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 5.0,
    "cultivated_area_ha": 5.0,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 175000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "104/1",
    "khatauni_no": "32",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-8812",
    "kyc_status": "VERIFIED",
    "latitude": 25.435,
    "longitude": 81.838,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.836,
            25.434
          ],
          [
            81.841,
            25.434
          ],
          [
            81.841,
            25.438
          ],
          [
            81.836,
            25.438
          ],
          [
            81.836,
            25.434
          ]
        ]
      ]
    },
    "field_photos": [
      {
        "url": "/sample_field.jpg",
        "has_gps": true,
        "latitude": 25.4352,
        "longitude": 81.8383,
        "capture_time": "2026-07-14T11:22:45+05:30",
        "camera_make": "Samsung",
        "camera_model": "Galaxy A54 5G",
        "status_label": "INSIDE",
        "distance_to_boundary_meters": 12.4
      }
    ],
    "supporting_notes": "Synthetic demonstration scenario: GENUINE_CLAIM. Fast-track settlement without physical inspection",
    "status": "REVIEWED",
    "risk_score": 12.0,
    "risk_tier": "LOW_RISK",
    "risk_signals": {
      "composite_risk_score": 12.0,
      "risk_tier": "LOW_RISK",
      "recommended_action": "Fast-track settlement without physical inspection",
      "signals": [
        {
          "code": "AREA_MATCH",
          "label": "Area Divergence <= 10%",
          "severity": "PASS",
          "detail": "8.0% divergence between claimed and observed area."
        },
        {
          "code": "CROP_MATCH",
          "label": "AgriStack Sown Record",
          "severity": "PASS",
          "detail": "Paddy confirmed sown in Kharif 2026."
        },
        {
          "code": "DOCS_VALID",
          "label": "Land Document Valid",
          "severity": "PASS",
          "detail": "Jamabandi verified with 100% name match."
        },
        {
          "code": "EXIF_VALID",
          "label": "Photo Geotag Match",
          "severity": "PASS",
          "detail": "Captured inside parcel boundary (3.2m accuracy)."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z",
    "reviewer_decision": "APPROVED",
    "reviewer_notes": "Forensic satellite evidence confirmed 4.6 ha inundated out of 5.0 ha. Approved for fast-track settlement.",
    "reviewed_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-002",
    "reference_no": "CLM-DEMO-002",
    "farmer_name": "Baldev Singh",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 15.0,
    "cultivated_area_ha": 15.0,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 420000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "88/1",
    "khatauni_no": "19",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-4419",
    "kyc_status": "VERIFIED",
    "latitude": 25.442,
    "longitude": 81.852,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.848,
            25.438
          ],
          [
            81.857,
            25.438
          ],
          [
            81.857,
            25.446
          ],
          [
            81.848,
            25.446
          ],
          [
            81.848,
            25.438
          ]
        ]
      ]
    },
    "field_photos": [
      {
        "url": "/sample_field.jpg",
        "has_gps": true,
        "latitude": 25.4425,
        "longitude": 81.8522,
        "capture_time": "2026-07-14T11:22:45+05:30",
        "camera_make": "Samsung",
        "camera_model": "Galaxy A54 5G",
        "status_label": "INSIDE",
        "distance_to_boundary_meters": 12.4
      }
    ],
    "supporting_notes": "Synthetic demonstration scenario: INFLATED_CLAIM. Physical revenue audit recommended before disbursement. Upland zone is dry.",
    "status": "EVIDENCE_GENERATED",
    "risk_score": 78.0,
    "risk_tier": "HIGH_RISK",
    "risk_signals": {
      "composite_risk_score": 78.0,
      "risk_tier": "HIGH_RISK",
      "recommended_action": "Physical revenue audit recommended before disbursement. Upland zone is dry.",
      "signals": [
        {
          "code": "AREA_DIVERGENCE",
          "label": "Severe Area Inflation",
          "severity": "CRITICAL",
          "detail": "58.7% divergence. Claimed 15.0 ha vs 6.2 ha observed in depression."
        },
        {
          "code": "DEM_TOPOGRAPHY",
          "label": "DEM Low-Lying Containment",
          "severity": "WARNING",
          "detail": "Water mask strictly confined to elevation <84.5m. Upland 8.8 ha is undamaged."
        },
        {
          "code": "DOC_AREA_GAP",
          "label": "Document Area Gap",
          "severity": "CRITICAL",
          "detail": "Registered Jamabandi area is 6.5 ha, but farmer claimed 15.0 ha."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z",
    "reviewer_decision": "FIELD_INSPECTION",
    "reviewer_notes": "Major area discrepancy: claimed 15.0 ha vs observed 6.2 ha. Ground adjuster audit mandated.",
    "reviewed_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-003",
    "reference_no": "CLM-DEMO-003",
    "farmer_name": "Shivnarayan Patel",
    "crop_type": "Wheat",
    "crop_season": "Kharif",
    "claimed_area_ha": 4.2,
    "cultivated_area_ha": 4.2,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 147000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "203/4",
    "khatauni_no": "49",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-3391",
    "kyc_status": "VERIFIED",
    "latitude": 25.45,
    "longitude": 81.825,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.823,
            25.448
          ],
          [
            81.827,
            25.448
          ],
          [
            81.827,
            25.452
          ],
          [
            81.823,
            25.452
          ],
          [
            81.823,
            25.448
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: SEASON_MISMATCH. Route to Patwari for crop declaration correction. Wheat is not cultivated in Kharif.",
    "status": "SUBMITTED",
    "risk_score": 68.0,
    "risk_tier": "MODERATE_RISK",
    "risk_signals": {
      "composite_risk_score": 68.0,
      "risk_tier": "MODERATE_RISK",
      "recommended_action": "Route to Patwari for crop declaration correction. Wheat is not cultivated in Kharif.",
      "signals": [
        {
          "code": "SEASON_MISMATCH",
          "label": "Phenological Season Conflict",
          "severity": "CRITICAL",
          "detail": "Claimed 'Wheat' loss in July flood. Wheat is a Rabi winter crop; Digital Crop Survey records field as Paddy/Fallow."
        },
        {
          "code": "SPECTRAL_UNMATCHED",
          "label": "No Standing Wheat Canopy",
          "severity": "WARNING",
          "detail": "Multi-spectral signature matches vegetative paddy nursery, not mature wheat."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-004",
    "reference_no": "CLM-DEMO-004",
    "farmer_name": "Sunita Devi",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 7.9,
    "cultivated_area_ha": 7.9,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 276500.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "219/1",
    "khatauni_no": "67",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-7102",
    "kyc_status": "VERIFIED",
    "latitude": 25.43,
    "longitude": 81.86,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.857,
            25.428
          ],
          [
            81.864,
            25.428
          ],
          [
            81.864,
            25.433
          ],
          [
            81.857,
            25.433
          ],
          [
            81.857,
            25.428
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: DOCUMENT_MISMATCH. Enforce 3.2 ha title ceiling and verify claimant identity affidavit.",
    "status": "SUBMITTED",
    "risk_score": 64.0,
    "risk_tier": "MODERATE_RISK",
    "risk_signals": {
      "composite_risk_score": 64.0,
      "risk_tier": "MODERATE_RISK",
      "recommended_action": "Enforce 3.2 ha title ceiling and verify claimant identity affidavit.",
      "signals": [
        {
          "code": "AREA_EXCEEDS_TITLE",
          "label": "Drawn Area Exceeds Legal Title",
          "severity": "WARNING",
          "detail": "Document states 3.2 ha; submitted boundary encompasses 7.9 ha."
        },
        {
          "code": "FUZZY_NAME",
          "label": "Partial Name Match",
          "severity": "WARNING",
          "detail": "Claimant 'Sunita Devi' vs Record 'Sunita Kumari' (71% similarity)."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-005",
    "reference_no": "CLM-DEMO-005",
    "farmer_name": "Jagdish Prasad",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 8.5,
    "cultivated_area_ha": 8.5,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 297500.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "88/2",
    "khatauni_no": "19",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-9914",
    "kyc_status": "VERIFIED",
    "latitude": 25.443,
    "longitude": 81.854,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.85,
            25.44
          ],
          [
            81.858,
            25.44
          ],
          [
            81.858,
            25.447
          ],
          [
            81.85,
            25.447
          ],
          [
            81.85,
            25.44
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: DUPLICATE_OVERLAP. Freeze claim immediately. 60% polygon overlap with CLM-DEMO-002 and identical document hash.",
    "status": "SUBMITTED",
    "risk_score": 94.0,
    "risk_tier": "HIGH_RISK",
    "risk_signals": {
      "composite_risk_score": 94.0,
      "risk_tier": "HIGH_RISK",
      "recommended_action": "Freeze claim immediately. 60% polygon overlap with CLM-DEMO-002 and identical document hash.",
      "signals": [
        {
          "code": "POLYGON_OVERLAP",
          "label": "Cadastral Boundary Overlap 60%",
          "severity": "CRITICAL",
          "detail": "Spatial intersection detected with active claim CLM-DEMO-002 (Baldev Singh)."
        },
        {
          "code": "DUPLICATE_HASH",
          "label": "Document Fingerprint Collision",
          "severity": "CRITICAL",
          "detail": "Uploaded PDF SHA-256 matches file already recorded on CLM-DEMO-002."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-006",
    "reference_no": "CLM-DEMO-006",
    "farmer_name": "Manju Meena",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 3.8,
    "cultivated_area_ha": 3.8,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 133000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "312/1",
    "khatauni_no": "88",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-6612",
    "kyc_status": "VERIFIED",
    "latitude": 25.46,
    "longitude": 81.845,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.843,
            25.458
          ],
          [
            81.847,
            25.458
          ],
          [
            81.847,
            25.462
          ],
          [
            81.843,
            25.462
          ],
          [
            81.843,
            25.458
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: LOW_CONFIDENCE. System limitation: Insufficient optical data, SAR noise high. Physical verification required.",
    "status": "FIELD_INSPECTION_RECORDED",
    "risk_score": 38.0,
    "risk_tier": "MODERATE_RISK",
    "risk_signals": {
      "composite_risk_score": 38.0,
      "risk_tier": "MODERATE_RISK",
      "recommended_action": "System limitation: Insufficient optical data, SAR noise high. Physical verification required.",
      "signals": [
        {
          "code": "CLOUD_OCCLUSION",
          "label": "92% Cloud Cover",
          "severity": "WARNING",
          "detail": "Optical Sentinel-2 blinded by monsoon cloud layer; SAR backscatter attenuation high."
        },
        {
          "code": "CONFIDENCE_LIMIT",
          "label": "Confidence Below 50%",
          "severity": "WARNING",
          "detail": "Score 42/100. System policy mandates ground inspection when confidence is below 50."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z",
    "reviewer_decision": "FIELD_INSPECTION",
    "reviewer_notes": "Cloud cover > 70% during peak monsoon pass; fused Sentinel-1 SAR confirms inundation.",
    "reviewed_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-007",
    "reference_no": "CLM-DEMO-007",
    "farmer_name": "Hariram Yadav",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 4.5,
    "cultivated_area_ha": 4.5,
    "damage_type": "Flood",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 63000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "118/3",
    "khatauni_no": "44",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-5521",
    "kyc_status": "VERIFIED",
    "latitude": 25.437,
    "longitude": 81.84,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.838,
            25.435
          ],
          [
            81.843,
            25.435
          ],
          [
            81.843,
            25.439
          ],
          [
            81.838,
            25.439
          ],
          [
            81.838,
            25.435
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: SMALL_DAMAGE. Satellite resolution cannot reliably detect subtle partial damage (10-15%). Field CCE inspection required.",
    "status": "SUBMITTED",
    "risk_score": 45.0,
    "risk_tier": "MODERATE_RISK",
    "risk_signals": {
      "composite_risk_score": 45.0,
      "risk_tier": "MODERATE_RISK",
      "recommended_action": "Satellite resolution cannot reliably detect subtle partial damage (10-15%). Field CCE inspection required.",
      "signals": [
        {
          "code": "SUBTLE_DAMAGE",
          "label": "Loss Near Resolution Threshold",
          "severity": "WARNING",
          "detail": "Observed loss is ~11% (0.5 ha). Sentinel-2 10m pixels cannot separate light lodging from natural variation."
        },
        {
          "code": "HONEST_BOUND",
          "label": "PMFBY 33% Calamity Threshold",
          "severity": "INFO",
          "detail": "Under PMFBY localized calamity guidelines, loss below 33% requires joint field inspection."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z"
  },
  {
    "id": "clm-demo-008",
    "reference_no": "CLM-DEMO-008",
    "farmer_name": "Radheshyam Maurya",
    "crop_type": "Paddy",
    "crop_season": "Kharif",
    "claimed_area_ha": 3.0,
    "cultivated_area_ha": 3.0,
    "damage_type": "Waterlogging",
    "incident_date_start": "2026-07-10",
    "incident_date_end": "2026-07-16",
    "state": "Uttar Pradesh",
    "district": "Vikrampur (Fictional Demo District)",
    "claimed_loss_amount": 105000.0,
    "sum_insured_per_ha": 35000.0,
    "khasra_no": "405/2",
    "khatauni_no": "77",
    "tenancy_type": "OWNER",
    "masked_aadhaar_ref": "XXXX-XXXX-9941",
    "kyc_status": "VERIFIED",
    "latitude": 25.462,
    "longitude": 81.848,
    "boundary_geojson": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            81.846,
            25.46
          ],
          [
            81.851,
            25.46
          ],
          [
            81.851,
            25.464
          ],
          [
            81.846,
            25.464
          ],
          [
            81.846,
            25.46
          ]
        ]
      ]
    },
    "field_photos": [],
    "supporting_notes": "Synthetic demonstration scenario: CONSTRUCTION_ALERT. Suspected non-agricultural construction (0.4 ha). Assign to Tehsildar for land revenue inspection.",
    "status": "EVIDENCE_GENERATED",
    "risk_score": 82.0,
    "risk_tier": "HIGH_RISK",
    "risk_signals": {
      "composite_risk_score": 82.0,
      "risk_tier": "HIGH_RISK",
      "recommended_action": "Suspected non-agricultural construction (0.4 ha). Assign to Tehsildar for land revenue inspection.",
      "signals": [
        {
          "code": "LAND_USE_CHANGE",
          "label": "New Built-Up Footprint (~0.4 ha)",
          "severity": "CRITICAL",
          "detail": "NDBI spectral index increased by +0.42 between June 2025 and July 2026. Strong SAR C-band double-bounce confirms masonry/metal roof structure."
        },
        {
          "code": "ILLEGAL_CONVERSION",
          "label": "Revenue Code Section 143 Violation",
          "severity": "CRITICAL",
          "detail": "Parcel is registered as Agricultural; structure built without non-agricultural diversion sanad."
        }
      ]
    },
    "land_use_change_flags": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T12:00:00Z",
    "reviewer_decision": "FIELD_INSPECTION",
    "reviewer_notes": "Land-use alteration detected: artificial structural emergence on agricultural parcel.",
    "reviewed_at": "2026-07-16T12:00:00Z"
  }
];

export const BENCHMARK_SEED_ANALYSES: AnalysisJob[] = [
  {
    "id": "analysis-clm-demo-001",
    "claim_id": "clm-demo-001",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:ae04f1fb2cc4afab9fdba138b22010d4",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.836,
              25.434
            ],
            [
              81.841,
              25.434
            ],
            [
              81.841,
              25.438
            ],
            [
              81.836,
              25.438
            ],
            [
              81.836,
              25.434
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Ramprasad Verma. Observed damaged area: 4.6 ha vs claimed 5.0 ha (Divergence: 8.0%). Confidence score: 91/100.",
      "verdict_recommendation": "APPROVE_FAST_TRACK",
      "integrity_hash": "sha256:615d6e23ef47ff50",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 5.0,
        "estimated_affected_area_ha": 4.6,
        "damaged_area_ha": 4.6,
        "damage_percentage": 92.0,
        "estimated_inundated_area_ha": 4.6,
        "estimated_vegetation_loss_area_ha": 4.6,
        "claimed_area_ha": 5.0,
        "area_discrepancy_percent": 8.0,
        "confidence_score": 91.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (91%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 91,
          "grade": "Tier-A High Confidence",
          "recommendation": "Eligible for fast-track paperless settlement.",
          "pillars": {
            "image_quality": {
              "score": 94,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 90,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 92,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 90,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 91.0,
          "consistency_with_claim": "CONSISTENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Approve settlement per verified inundation extent."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 90.0,
          "estimated_affected_area_ha": 4.6,
          "claimed_area_ha": 5.0,
          "estimated_scenario_payout_inr": 144900.0,
          "min_payout_inr": 138000.0,
          "max_payout_inr": 151800.0,
          "payout_range_formatted": "Rs. 138,000 - Rs. 151,800",
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
      "potential_inconsistencies": [],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 2.99,
              "zone_percentage": 59.8,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.838,
                    25.435
                  ],
                  [
                    81.841,
                    25.435
                  ],
                  [
                    81.841,
                    25.437
                  ],
                  [
                    81.838,
                    25.437
                  ],
                  [
                    81.838,
                    25.435
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 1.15,
              "zone_percentage": 23.0,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.841,
                    25.435
                  ],
                  [
                    81.843,
                    25.435
                  ],
                  [
                    81.843,
                    25.437
                  ],
                  [
                    81.841,
                    25.437
                  ],
                  [
                    81.841,
                    25.435
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.46,
              "zone_percentage": 9.2,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.838,
                    25.437
                  ],
                  [
                    81.84,
                    25.437
                  ],
                  [
                    81.84,
                    25.438
                  ],
                  [
                    81.838,
                    25.438
                  ],
                  [
                    81.838,
                    25.437
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 0.4,
              "zone_percentage": 8.0,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.84,
                    25.437
                  ],
                  [
                    81.843,
                    25.437
                  ],
                  [
                    81.843,
                    25.438
                  ],
                  [
                    81.84,
                    25.438
                  ],
                  [
                    81.84,
                    25.437
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-002",
    "claim_id": "clm-demo-002",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:45859155fe58ffecc652065234a6f26d",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.848,
              25.438
            ],
            [
              81.857,
              25.438
            ],
            [
              81.857,
              25.446
            ],
            [
              81.848,
              25.446
            ],
            [
              81.848,
              25.438
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Baldev Singh. Observed damaged area: 6.2 ha vs claimed 15.0 ha (Divergence: 58.7%). Confidence score: 88/100.",
      "verdict_recommendation": "FIELD_AUDIT_REQUIRED",
      "integrity_hash": "sha256:bd31d42947894bf7",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 15.0,
        "estimated_affected_area_ha": 6.2,
        "damaged_area_ha": 6.2,
        "damage_percentage": 41.3,
        "estimated_inundated_area_ha": 6.2,
        "estimated_vegetation_loss_area_ha": 6.2,
        "claimed_area_ha": 15.0,
        "area_discrepancy_percent": 58.7,
        "confidence_score": 88.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (88%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 88,
          "grade": "Tier-A High Confidence",
          "recommendation": "Eligible for fast-track paperless settlement.",
          "pillars": {
            "image_quality": {
              "score": 90,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 86,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 92,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 84,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 88.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 80.0,
          "estimated_affected_area_ha": 6.2,
          "claimed_area_ha": 15.0,
          "estimated_scenario_payout_inr": 173600.0,
          "min_payout_inr": 156000.0,
          "max_payout_inr": 191000.0,
          "payout_range_formatted": "Rs. 156,000 - Rs. 191,000",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 15.0 ha vs Verified 6.2 ha (58.7% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 4.03,
              "zone_percentage": 26.9,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.852,
                    25.442
                  ],
                  [
                    81.855,
                    25.442
                  ],
                  [
                    81.855,
                    25.444
                  ],
                  [
                    81.852,
                    25.444
                  ],
                  [
                    81.852,
                    25.442
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 1.55,
              "zone_percentage": 10.3,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.855,
                    25.442
                  ],
                  [
                    81.857,
                    25.442
                  ],
                  [
                    81.857,
                    25.444
                  ],
                  [
                    81.855,
                    25.444
                  ],
                  [
                    81.855,
                    25.442
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.62,
              "zone_percentage": 4.1,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.852,
                    25.444
                  ],
                  [
                    81.854,
                    25.444
                  ],
                  [
                    81.854,
                    25.445
                  ],
                  [
                    81.852,
                    25.445
                  ],
                  [
                    81.852,
                    25.444
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 8.8,
              "zone_percentage": 58.7,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.854,
                    25.444
                  ],
                  [
                    81.857,
                    25.444
                  ],
                  [
                    81.857,
                    25.445
                  ],
                  [
                    81.854,
                    25.445
                  ],
                  [
                    81.854,
                    25.444
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-003",
    "claim_id": "clm-demo-003",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:d43d8d4b17a489972e30e3e36214a72d",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.823,
              25.448
            ],
            [
              81.827,
              25.448
            ],
            [
              81.827,
              25.452
            ],
            [
              81.823,
              25.452
            ],
            [
              81.823,
              25.448
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Shivnarayan Patel. Observed damaged area: 0.0 ha vs claimed 4.2 ha (Divergence: 100.0%). Confidence score: 84/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:26b30ef539ab6f6a",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 4.2,
        "estimated_affected_area_ha": 0.0,
        "damaged_area_ha": 0.0,
        "damage_percentage": 0.0,
        "estimated_inundated_area_ha": 0.0,
        "estimated_vegetation_loss_area_ha": 0.0,
        "claimed_area_ha": 4.2,
        "area_discrepancy_percent": 100.0,
        "confidence_score": 84.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (84%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 84,
          "grade": "Tier-B Moderate Confidence",
          "recommendation": "Manual adjuster review recommended.",
          "pillars": {
            "image_quality": {
              "score": 88,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 85,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 84,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 81,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 84.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 0.0,
          "estimated_affected_area_ha": 0.0,
          "claimed_area_ha": 4.2,
          "estimated_scenario_payout_inr": 0.0,
          "min_payout_inr": 0.0,
          "max_payout_inr": 0.0,
          "payout_range_formatted": "Rs. 0 - Rs. 0",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 4.2 ha vs Verified 0.0 ha (100.0% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 0.0,
              "zone_percentage": 0.0,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.825,
                    25.45
                  ],
                  [
                    81.828,
                    25.45
                  ],
                  [
                    81.828,
                    25.452
                  ],
                  [
                    81.825,
                    25.452
                  ],
                  [
                    81.825,
                    25.45
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 0.0,
              "zone_percentage": 0.0,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.828,
                    25.45
                  ],
                  [
                    81.83,
                    25.45
                  ],
                  [
                    81.83,
                    25.452
                  ],
                  [
                    81.828,
                    25.452
                  ],
                  [
                    81.828,
                    25.45
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.0,
              "zone_percentage": 0.0,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.825,
                    25.452
                  ],
                  [
                    81.827,
                    25.452
                  ],
                  [
                    81.827,
                    25.453
                  ],
                  [
                    81.825,
                    25.453
                  ],
                  [
                    81.825,
                    25.452
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 4.2,
              "zone_percentage": 100.0,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.827,
                    25.452
                  ],
                  [
                    81.83,
                    25.452
                  ],
                  [
                    81.83,
                    25.453
                  ],
                  [
                    81.827,
                    25.453
                  ],
                  [
                    81.827,
                    25.452
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-004",
    "claim_id": "clm-demo-004",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:735a48ff2fe6e080ef0b21aa4ba6ce22",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.857,
              25.428
            ],
            [
              81.864,
              25.428
            ],
            [
              81.864,
              25.433
            ],
            [
              81.857,
              25.433
            ],
            [
              81.857,
              25.428
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Sunita Devi. Observed damaged area: 3.1 ha vs claimed 7.9 ha (Divergence: 60.7%). Confidence score: 82/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:d99183030269a3e6",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 7.9,
        "estimated_affected_area_ha": 3.1,
        "damaged_area_ha": 3.1,
        "damage_percentage": 39.2,
        "estimated_inundated_area_ha": 3.1,
        "estimated_vegetation_loss_area_ha": 3.1,
        "claimed_area_ha": 7.9,
        "area_discrepancy_percent": 60.7,
        "confidence_score": 82.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (82%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 82,
          "grade": "Tier-B Moderate Confidence",
          "recommendation": "Manual adjuster review recommended.",
          "pillars": {
            "image_quality": {
              "score": 84,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 80,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 85,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 81,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 82.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 85.0,
          "estimated_affected_area_ha": 3.1,
          "claimed_area_ha": 7.9,
          "estimated_scenario_payout_inr": 92225.0,
          "min_payout_inr": 85000.0,
          "max_payout_inr": 100000.0,
          "payout_range_formatted": "Rs. 85,000 - Rs. 100,000",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 7.9 ha vs Verified 3.1 ha (60.7% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 2.02,
              "zone_percentage": 25.6,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.86,
                    25.43
                  ],
                  [
                    81.863,
                    25.43
                  ],
                  [
                    81.863,
                    25.432
                  ],
                  [
                    81.86,
                    25.432
                  ],
                  [
                    81.86,
                    25.43
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 0.78,
              "zone_percentage": 9.9,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.863,
                    25.43
                  ],
                  [
                    81.865,
                    25.43
                  ],
                  [
                    81.865,
                    25.432
                  ],
                  [
                    81.863,
                    25.432
                  ],
                  [
                    81.863,
                    25.43
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.31,
              "zone_percentage": 3.9,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.86,
                    25.432
                  ],
                  [
                    81.862,
                    25.432
                  ],
                  [
                    81.862,
                    25.433
                  ],
                  [
                    81.86,
                    25.433
                  ],
                  [
                    81.86,
                    25.432
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 4.8,
              "zone_percentage": 60.8,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.862,
                    25.432
                  ],
                  [
                    81.865,
                    25.432
                  ],
                  [
                    81.865,
                    25.433
                  ],
                  [
                    81.862,
                    25.433
                  ],
                  [
                    81.862,
                    25.432
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-005",
    "claim_id": "clm-demo-005",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:d4b9f4abda063faf193c4f0038ada822",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.85,
              25.44
            ],
            [
              81.858,
              25.44
            ],
            [
              81.858,
              25.447
            ],
            [
              81.85,
              25.447
            ],
            [
              81.85,
              25.44
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Jagdish Prasad. Observed damaged area: 5.8 ha vs claimed 8.5 ha (Divergence: 31.8%). Confidence score: 86/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:1e9148a39b0f9a6e",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 8.5,
        "estimated_affected_area_ha": 5.8,
        "damaged_area_ha": 5.8,
        "damage_percentage": 68.2,
        "estimated_inundated_area_ha": 5.8,
        "estimated_vegetation_loss_area_ha": 5.8,
        "claimed_area_ha": 8.5,
        "area_discrepancy_percent": 31.8,
        "confidence_score": 86.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (86%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 86,
          "grade": "Tier-A High Confidence",
          "recommendation": "Eligible for fast-track paperless settlement.",
          "pillars": {
            "image_quality": {
              "score": 88,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 84,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 88,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 84,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 86.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 80.0,
          "estimated_affected_area_ha": 5.8,
          "claimed_area_ha": 8.5,
          "estimated_scenario_payout_inr": 0.0,
          "min_payout_inr": 0.0,
          "max_payout_inr": 0.0,
          "payout_range_formatted": "Rs. 0 - Rs. 0",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 8.5 ha vs Verified 5.8 ha (31.8% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 3.77,
              "zone_percentage": 44.4,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.854,
                    25.443
                  ],
                  [
                    81.857,
                    25.443
                  ],
                  [
                    81.857,
                    25.445
                  ],
                  [
                    81.854,
                    25.445
                  ],
                  [
                    81.854,
                    25.443
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 1.45,
              "zone_percentage": 17.1,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.857,
                    25.443
                  ],
                  [
                    81.859,
                    25.443
                  ],
                  [
                    81.859,
                    25.445
                  ],
                  [
                    81.857,
                    25.445
                  ],
                  [
                    81.857,
                    25.443
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.58,
              "zone_percentage": 6.8,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.854,
                    25.445
                  ],
                  [
                    81.856,
                    25.445
                  ],
                  [
                    81.856,
                    25.446
                  ],
                  [
                    81.854,
                    25.446
                  ],
                  [
                    81.854,
                    25.445
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 2.7,
              "zone_percentage": 31.8,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.856,
                    25.445
                  ],
                  [
                    81.859,
                    25.445
                  ],
                  [
                    81.859,
                    25.446
                  ],
                  [
                    81.856,
                    25.446
                  ],
                  [
                    81.856,
                    25.445
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-006",
    "claim_id": "clm-demo-006",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:ec4258c2adef534a7bdb848dca309f3d",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.843,
              25.458
            ],
            [
              81.847,
              25.458
            ],
            [
              81.847,
              25.462
            ],
            [
              81.843,
              25.462
            ],
            [
              81.843,
              25.458
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Manju Meena. Observed damaged area: 2.1 ha vs claimed 3.8 ha (Divergence: 44.7%). Confidence score: 42/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:1dcd8e9d1a3a9b0b",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 3.8,
        "estimated_affected_area_ha": 2.1,
        "damaged_area_ha": 2.1,
        "damage_percentage": 55.3,
        "estimated_inundated_area_ha": 2.1,
        "estimated_vegetation_loss_area_ha": 2.1,
        "claimed_area_ha": 3.8,
        "area_discrepancy_percent": 44.7,
        "confidence_score": 42.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (42%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 42,
          "grade": "Tier-C Low Confidence / Cloud Obscured",
          "recommendation": "Manual adjuster review recommended.",
          "pillars": {
            "image_quality": {
              "score": 38,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 25,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 60,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 42,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 42.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_1_SAR_MONSOON_FALLBACK",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 65.0,
          "estimated_affected_area_ha": 2.1,
          "claimed_area_ha": 3.8,
          "estimated_scenario_payout_inr": 47775.0,
          "min_payout_inr": 35000.0,
          "max_payout_inr": 65000.0,
          "payout_range_formatted": "Rs. 35,000 - Rs. 65,000",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 3.8 ha vs Verified 2.1 ha (44.7% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 1.37,
              "zone_percentage": 36.1,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.845,
                    25.46
                  ],
                  [
                    81.848,
                    25.46
                  ],
                  [
                    81.848,
                    25.462
                  ],
                  [
                    81.845,
                    25.462
                  ],
                  [
                    81.845,
                    25.46
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 0.53,
              "zone_percentage": 13.9,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.848,
                    25.46
                  ],
                  [
                    81.85,
                    25.46
                  ],
                  [
                    81.85,
                    25.462
                  ],
                  [
                    81.848,
                    25.462
                  ],
                  [
                    81.848,
                    25.46
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.21,
              "zone_percentage": 5.5,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.845,
                    25.462
                  ],
                  [
                    81.847,
                    25.462
                  ],
                  [
                    81.847,
                    25.463
                  ],
                  [
                    81.845,
                    25.463
                  ],
                  [
                    81.845,
                    25.462
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 1.7,
              "zone_percentage": 44.7,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.847,
                    25.462
                  ],
                  [
                    81.85,
                    25.462
                  ],
                  [
                    81.85,
                    25.463
                  ],
                  [
                    81.847,
                    25.463
                  ],
                  [
                    81.847,
                    25.462
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-007",
    "claim_id": "clm-demo-007",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:e933a2248481b68970b050bfa51c2c98",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.838,
              25.435
            ],
            [
              81.843,
              25.435
            ],
            [
              81.843,
              25.439
            ],
            [
              81.838,
              25.439
            ],
            [
              81.838,
              25.435
            ]
          ]
        ]
      },
      "damage_type": "Flood",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Hariram Yadav. Observed damaged area: 0.5 ha vs claimed 4.5 ha (Divergence: 88.9%). Confidence score: 70/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:296dcf5700e1b10d",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 4.5,
        "estimated_affected_area_ha": 0.5,
        "damaged_area_ha": 0.5,
        "damage_percentage": 11.1,
        "estimated_inundated_area_ha": 0.5,
        "estimated_vegetation_loss_area_ha": 0.5,
        "claimed_area_ha": 4.5,
        "area_discrepancy_percent": 88.9,
        "confidence_score": 70.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (70%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 70,
          "grade": "Tier-B Moderate Confidence",
          "recommendation": "Manual adjuster review recommended.",
          "pillars": {
            "image_quality": {
              "score": 82,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 75,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 65,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 70,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Flood",
          "confidence": 70.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute flood inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 30.0,
          "estimated_affected_area_ha": 0.5,
          "claimed_area_ha": 4.5,
          "estimated_scenario_payout_inr": 5250.0,
          "min_payout_inr": 3500.0,
          "max_payout_inr": 18000.0,
          "payout_range_formatted": "Rs. 3,500 - Rs. 18,000",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 4.5 ha vs Verified 0.5 ha (88.9% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 0.33,
              "zone_percentage": 7.3,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.84,
                    25.437
                  ],
                  [
                    81.843,
                    25.437
                  ],
                  [
                    81.843,
                    25.439
                  ],
                  [
                    81.84,
                    25.439
                  ],
                  [
                    81.84,
                    25.437
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 0.12,
              "zone_percentage": 2.7,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.843,
                    25.437
                  ],
                  [
                    81.845,
                    25.437
                  ],
                  [
                    81.845,
                    25.439
                  ],
                  [
                    81.843,
                    25.439
                  ],
                  [
                    81.843,
                    25.437
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.05,
              "zone_percentage": 1.1,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.84,
                    25.439
                  ],
                  [
                    81.842,
                    25.439
                  ],
                  [
                    81.842,
                    25.44
                  ],
                  [
                    81.84,
                    25.44
                  ],
                  [
                    81.84,
                    25.439
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 4.0,
              "zone_percentage": 88.9,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.842,
                    25.439
                  ],
                  [
                    81.845,
                    25.439
                  ],
                  [
                    81.845,
                    25.44
                  ],
                  [
                    81.842,
                    25.44
                  ],
                  [
                    81.842,
                    25.439
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  },
  {
    "id": "analysis-clm-demo-008",
    "claim_id": "clm-demo-008",
    "analysis_type": "INSURANCE_VERIFICATION",
    "status": "COMPLETED",
    "execution_mode": "demo",
    "integrity_hash": "sha256:d787d9e5c09d7f727e0860a203d8efe7",
    "parameters": {
      "boundary_geojson": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              81.846,
              25.46
            ],
            [
              81.851,
              25.46
            ],
            [
              81.851,
              25.464
            ],
            [
              81.846,
              25.464
            ],
            [
              81.846,
              25.46
            ]
          ]
        ]
      },
      "damage_type": "Waterlogging",
      "incident_start": "2026-07-10",
      "incident_end": "2026-07-16",
      "satellite_sources": [
        "Sentinel-2 L2A",
        "Sentinel-1 GRD SAR"
      ]
    },
    "results": {
      "summary": "Automated geospatial verification completed for Radheshyam Maurya. Observed damaged area: 0.4 ha vs claimed 3.0 ha (Divergence: 86.7%). Confidence score: 89/100.",
      "verdict_recommendation": "REJECT_ANOMALOUS",
      "integrity_hash": "sha256:8115e6c9ce608980",
      "metrics": {
        "baseline_index_mean": 0.68,
        "post_event_index_mean": 0.18,
        "index_delta_mean": -0.5,
        "total_field_area_ha": 3.0,
        "estimated_affected_area_ha": 0.4,
        "damaged_area_ha": 0.4,
        "damage_percentage": 13.3,
        "estimated_inundated_area_ha": 0.4,
        "estimated_vegetation_loss_area_ha": 0.4,
        "claimed_area_ha": 3.0,
        "area_discrepancy_percent": 86.7,
        "confidence_score": 89.0,
        "confidence_rationale": "High multi-spectral Sentinel-2 & SAR coherence (89%) across 10m spatial resolution grid.",
        "confidence_breakdown": {
          "total_score": 89,
          "grade": "Tier-A High Confidence",
          "recommendation": "Eligible for fast-track paperless settlement.",
          "pillars": {
            "image_quality": {
              "score": 92,
              "max": 100,
              "metric": "Signal-to-noise ratio"
            },
            "cloud_cover": {
              "score": 88,
              "max": 100,
              "metric": "Optical atmospheric transmission"
            },
            "field_resolution": {
              "score": 90,
              "max": 100,
              "metric": "Sentinel-2 10m grid fit"
            },
            "sensor_agreement": {
              "score": 86,
              "max": 100,
              "metric": "NDVI vs SAR backscatter delta"
            }
          },
          "limitations_disclosed": [
            "10-meter spatial pixel resolution limits sub-cadastral bund boundary accuracy (< 0.05 ha).",
            "Atmospheric optical cloud occlusion mitigated through synthetic aperture radar (Sentinel-1 SAR) backscatter fusion."
          ]
        },
        "peril_classification": {
          "classified_peril": "Waterlogging",
          "confidence": 89.0,
          "consistency_with_claim": "INCONSISTENT_DIVERGENT",
          "spectral_signature": "MNDWI > 0.45; SAR VH/VV polarization ratio attenuation",
          "rationale": "Spectral transition matches acute waterlogging inundation timeline.",
          "recommended_action": "Mandate on-ground physical inspection."
        },
        "sensor_fusion_mode": "SENTINEL_2_OPTICAL_CONFIRMED",
        "compensation_scenario": {
          "sum_insured_per_ha": 35000.0,
          "assumed_damage_severity_percent": 0.0,
          "estimated_affected_area_ha": 0.4,
          "claimed_area_ha": 3.0,
          "estimated_scenario_payout_inr": 0.0,
          "min_payout_inr": 0.0,
          "max_payout_inr": 0.0,
          "payout_range_formatted": "Rs. 0 - Rs. 0",
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
      "potential_inconsistencies": [
        "Discrepancy detected: Claimed 3.0 ha vs Verified 0.4 ha (86.7% divergence)."
      ],
      "overlays_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "zone": "SEVERE",
              "severity_label": "Severe Inundation / Complete Loss",
              "color": "#ef4444",
              "zone_area_ha": 0.26,
              "zone_percentage": 8.7,
              "fill_opacity": 0.6
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.848,
                    25.462
                  ],
                  [
                    81.851,
                    25.462
                  ],
                  [
                    81.851,
                    25.464
                  ],
                  [
                    81.848,
                    25.464
                  ],
                  [
                    81.848,
                    25.462
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MODERATE",
              "severity_label": "Moderate Siltation & Waterlogging",
              "color": "#f97316",
              "zone_area_ha": 0.1,
              "zone_percentage": 3.3,
              "fill_opacity": 0.5
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.851,
                    25.462
                  ],
                  [
                    81.853,
                    25.462
                  ],
                  [
                    81.853,
                    25.464
                  ],
                  [
                    81.851,
                    25.464
                  ],
                  [
                    81.851,
                    25.462
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "MILD",
              "severity_label": "Mild Vegetative Stress",
              "color": "#facc15",
              "zone_area_ha": 0.04,
              "zone_percentage": 1.3,
              "fill_opacity": 0.4
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.848,
                    25.464
                  ],
                  [
                    81.85,
                    25.464
                  ],
                  [
                    81.85,
                    25.465
                  ],
                  [
                    81.848,
                    25.465
                  ],
                  [
                    81.848,
                    25.464
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {
              "zone": "HEALTHY",
              "severity_label": "Unaffected Canopy / Healthy Crop",
              "color": "#10b981",
              "zone_area_ha": 2.6,
              "zone_percentage": 86.7,
              "fill_opacity": 0.2
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    81.85,
                    25.464
                  ],
                  [
                    81.853,
                    25.464
                  ],
                  [
                    81.853,
                    25.465
                  ],
                  [
                    81.85,
                    25.465
                  ],
                  [
                    81.85,
                    25.464
                  ]
                ]
              ]
            }
          }
        ]
      }
    },
    "created_at": "2026-07-16T10:05:00Z",
    "completed_at": "2026-07-16T10:05:14Z"
  }
];

const CLAIMS_STORAGE_KEY = 'terraproof_demo_claims_store_v2';
const ANALYSES_STORAGE_KEY = 'terraproof_demo_analyses_store_v2';

export function getStoredClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(CLAIMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error, falling back to seed claims:', e);
  }
  saveStoredClaims(BENCHMARK_SEED_CLAIMS);
  return BENCHMARK_SEED_CLAIMS;
}

export function saveStoredClaims(claims: Claim[]): void {
  try {
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
  } catch (e) {
    console.warn('localStorage write error:', e);
  }
}

export function resetStoredClaims(): Claim[] {
  try {
    localStorage.removeItem(CLAIMS_STORAGE_KEY);
    localStorage.removeItem(ANALYSES_STORAGE_KEY);
  } catch (e) {
    console.warn('localStorage reset error:', e);
  }
  saveStoredClaims(BENCHMARK_SEED_CLAIMS);
  saveStoredAnalyses(BENCHMARK_SEED_ANALYSES);
  return BENCHMARK_SEED_CLAIMS;
}

export function getStoredAnalyses(): AnalysisJob[] {
  try {
    const raw = localStorage.getItem(ANALYSES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('localStorage read error, falling back to seed analyses:', e);
  }
  saveStoredAnalyses(BENCHMARK_SEED_ANALYSES);
  return BENCHMARK_SEED_ANALYSES;
}

export function saveStoredAnalyses(analyses: AnalysisJob[]): void {
  try {
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analyses));
  } catch (e) {
    console.warn('localStorage write error:', e);
  }
}

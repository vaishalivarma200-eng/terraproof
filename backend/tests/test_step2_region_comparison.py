"""
Unit tests for Step 2: Regional Flood Event Comparison (Assam 2024 Flood Benchmark) & ASDMA Validation.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_assam_flood_demo():
    response = client.get("/api/v1/events/assam-demo")
    assert response.status_code == 200
    data = response.json()

    assert data["event_id"] == "EVT-ASSAM-FLOOD-2024"
    assert data["state"] == "Assam"
    assert data["total_flooded_ha"] > 100000.0
    assert data["total_cropland_affected_ha"] > 50000.0
    assert len(data["district_breakdown"]) >= 5

    # Check top affected district (Morigaon)
    morigaon = next((d for d in data["district_breakdown"] if d["district"] == "Morigaon"), None)
    assert morigaon is not None
    assert morigaon["flooded_ha"] == 48200.0
    assert morigaon["cropland_affected_ha"] == 32400.0
    assert morigaon["satellite_agreement_pct"] > 90.0

    # ASDMA Validation Check
    assert "asdma_validation" in data
    assert data["asdma_validation"]["overall_satellite_concordance_rate_pct"] >= 90.0
    assert data["is_offline_demo"] is True

def test_compare_region_endpoint():
    req_payload = {
        "state": "Assam",
        "district": "Morigaon",
        "before_date": "2024-06-20",
        "after_date": "2024-07-22",
        "is_offline_demo": True
    }
    response = client.post("/api/v1/events/compare-region", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "Assam"
    assert data["total_flooded_ha"] > 0

def test_export_flood_statistics_csv():
    response = client.get("/api/v1/events/export-table-csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    content = response.text
    assert "Morigaon" in content
    assert "Nagaon" in content
    assert "Flooded Hectares" in content

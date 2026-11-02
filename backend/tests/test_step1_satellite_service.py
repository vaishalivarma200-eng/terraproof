"""
Test Step 1: SatelliteDataService, boundary normalizer, KML parser, and caching.
"""

import pytest
from datetime import date
from app.services.satellite.boundary_handler import (
    normalize_boundary_to_geojson,
    compute_boundary_hash,
    parse_kml_to_geojson
)
from app.services.satellite.service import get_satellite_data_service

def test_geojson_boundary_normalization():
    box_poly = {
        "type": "Polygon",
        "coordinates": [[
            [75.80, 26.90],
            [75.82, 26.90],
            [75.82, 26.92],
            [75.80, 26.92],
            [75.80, 26.90]
        ]]
    }
    norm_geom, area_ha = normalize_boundary_to_geojson(box_poly)
    assert norm_geom["type"] == "Polygon"
    assert area_ha > 0.0
    # ~2km x ~2.2km = ~440 ha
    assert 350.0 < area_ha < 550.0

    b_hash = compute_boundary_hash(norm_geom)
    assert len(b_hash) == 16
    assert isinstance(b_hash, str)

def test_kml_parsing_to_geojson():
    kml_sample = """<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Placemark>
        <name>Test Field</name>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>
                92.80,26.50,0 92.82,26.50,0 92.82,26.52,0 92.80,26.52,0 92.80,26.50,0
              </coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
    </kml>
    """
    geom, area_ha = normalize_boundary_to_geojson(kml_sample)
    assert geom["type"] == "Polygon"
    assert area_ha > 0.0

import asyncio

def test_satellite_data_service_caching():
    async def _run():
        service = get_satellite_data_service()
        poly = {
            "type": "Polygon",
            "coordinates": [[
                [81.83, 25.43],
                [81.84, 25.43],
                [81.84, 25.44],
                [81.83, 25.44],
                [81.83, 25.43]
            ]]
        }
        res = await service.get_imagery_and_metrics(poly, target_date=date(2026, 7, 12))
        assert res.area_ha > 0.0
        assert res.sensor_used != ""
        assert res.data_source != ""

    asyncio.run(_run())

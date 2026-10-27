import pytest
from app.geospatial.geodesic import calculate_geodesic_polygon_area_ha, compute_geojson_area_ha
from app.geospatial.validation import validate_study_area

def test_geodesic_polygon_area_positive():
    # A 0.01 deg x 0.01 deg box near equator (~1.1 km x 1.1 km = ~120-123 ha)
    coords = [
        [0.0, 0.0],
        [0.01, 0.0],
        [0.01, 0.01],
        [0.0, 0.01],
        [0.0, 0.0]
    ]
    area_ha = calculate_geodesic_polygon_area_ha(coords)
    assert 115.0 < area_ha < 130.0

def test_validate_study_area_valid():
    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [77.10, 28.60],
            [77.12, 28.60],
            [77.12, 28.62],
            [77.10, 28.62],
            [77.10, 28.60]
        ]]
    }
    result = validate_study_area(polygon_geojson)
    assert result.is_valid is True
    assert result.area_ha > 0.0
    assert result.bbox.min_lon == 77.10
    assert result.bbox.max_lat == 28.62

def test_validate_study_area_invalid_coordinates():
    # Longitude > 180
    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [195.0, 20.0],
            [196.0, 20.0],
            [196.0, 21.0],
            [195.0, 21.0],
            [195.0, 20.0]
        ]]
    }
    result = validate_study_area(polygon_geojson)
    assert result.is_valid is False
    assert "exceed standard geographic" in result.validation_message

def test_validate_study_area_tiny_sliver():
    # Tiny 0.0000001 deg square
    polygon_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [0.0, 0.0],
            [0.000001, 0.0],
            [0.000001, 0.000001],
            [0.0, 0.000001],
            [0.0, 0.0]
        ]]
    }
    result = validate_study_area(polygon_geojson)
    assert result.is_valid is False
    assert "too small" in result.validation_message

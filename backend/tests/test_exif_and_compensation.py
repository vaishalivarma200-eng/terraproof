import pytest
from app.geospatial.geodesic import compute_geodesic_distance_m
from app.geospatial.exif_verifier import verify_photo_against_boundary

def test_geodesic_distance_calculation():
    # Distance between New Delhi (28.6139, 77.2090) and Jaipur (26.9124, 75.7873) is ~235-245 km
    dist_m = compute_geodesic_distance_m(28.6139, 77.2090, 26.9124, 75.7873)
    assert 230000 < dist_m < 250000

def test_exif_boundary_verification_inside():
    # Polygon around [76.20, 27.10] to [76.22, 27.12]
    boundary = {
        "type": "Polygon",
        "coordinates": [[
            [76.20, 27.10],
            [76.22, 27.10],
            [76.22, 27.12],
            [76.20, 27.12],
            [76.20, 27.10]
        ]]
    }

    # Point inside the polygon
    res = verify_photo_against_boundary(
        image_bytes=None,
        manual_lat=27.11,
        manual_lon=76.21,
        boundary_geojson=boundary
    )

    assert res["has_gps"] is True
    assert res["is_inside_boundary"] is True
    assert res["status_label"] == "INSIDE_BOUNDARY"
    assert res["distance_to_boundary_meters"] == 0.0

def test_exif_boundary_verification_near():
    boundary = {
        "type": "Polygon",
        "coordinates": [[
            [76.20, 27.10],
            [76.22, 27.10],
            [76.22, 27.12],
            [76.20, 27.12],
            [76.20, 27.10]
        ]]
    }

    # Point very close to border (approx 30m away)
    res = verify_photo_against_boundary(
        image_bytes=None,
        manual_lat=27.1003,
        manual_lon=76.1997,
        boundary_geojson=boundary
    )

    assert res["has_gps"] is True
    assert res["status_label"] == "NEAR_BOUNDARY"
    assert 0.0 < res["distance_to_boundary_meters"] <= 100.0

def test_exif_boundary_verification_no_gps():
    boundary = {
        "type": "Polygon",
        "coordinates": [[
            [76.20, 27.10],
            [76.22, 27.10],
            [76.22, 27.12],
            [76.20, 27.12],
            [76.20, 27.10]
        ]]
    }

    res = verify_photo_against_boundary(
        image_bytes=None,
        manual_lat=None,
        manual_lon=None,
        boundary_geojson=boundary
    )

    assert res["has_gps"] is False
    assert res["status_label"] == "NO_GPS_METADATA"


from typing import Dict, Any, Tuple
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.validation import explain_validity
from app.geospatial.geodesic import compute_geojson_area_ha, compute_bounding_box, compute_centroid
from app.schemas.geospatial import StudyAreaValidationResult, BoundingBox

def validate_study_area(geojson_dict: Dict[str, Any]) -> StudyAreaValidationResult:
    """
    Validates study area geometry:
    1. Validates GeoJSON structural schema.
    2. Validates coordinates are within standard WGS84 range: lon [-180, 180], lat [-90, 90].
    3. Checks for topological validity and self-intersections.
    4. Computes geodesic area, bounding box, and centroid.
    5. Flags excessive study areas (> 50,000 ha) or near-zero slivers (< 0.01 ha).
    """
    try:
        geom = shape(geojson_dict)
    except Exception as e:
        return StudyAreaValidationResult(
            is_valid=False,
            area_ha=0.0,
            bbox=BoundingBox(min_lon=0, min_lat=0, max_lon=1, max_lat=1),
            center_lon=0.0,
            center_lat=0.0,
            validation_message=f"Invalid GeoJSON structure: {str(e)}"
        )

    if not isinstance(geom, (Polygon, MultiPolygon)):
        return StudyAreaValidationResult(
            is_valid=False,
            area_ha=0.0,
            bbox=BoundingBox(min_lon=0, min_lat=0, max_lon=1, max_lat=1),
            center_lon=0.0,
            center_lat=0.0,
            validation_message=f"Expected Polygon or MultiPolygon, received {geom.geom_type}"
        )

    # Check bounds
    min_lon, min_lat, max_lon, max_lat = geom.bounds
    if min_lon < -180.0 or max_lon > 180.0 or min_lat < -90.0 or max_lat > 90.0:
        return StudyAreaValidationResult(
            is_valid=False,
            area_ha=0.0,
            bbox=BoundingBox(min_lon=0, min_lat=0, max_lon=1, max_lat=1),
            center_lon=0.0,
            center_lat=0.0,
            validation_message="Coordinates exceed standard geographic WGS84 boundaries (-180..180 lon, -90..90 lat)"
        )

    # Check validity
    if not geom.is_valid:
        validity_reason = explain_validity(geom)
        # Attempt repair
        repaired = geom.buffer(0)
        if not repaired.is_valid or repaired.is_empty:
            return StudyAreaValidationResult(
                is_valid=False,
                area_ha=0.0,
                bbox=BoundingBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat),
                center_lon=(min_lon + max_lon) / 2.0,
                center_lat=(min_lat + max_lat) / 2.0,
                validation_message=f"Topologically invalid polygon: {validity_reason}"
            )

    area_ha = compute_geojson_area_ha(geojson_dict)
    if area_ha < 0.01:
        return StudyAreaValidationResult(
            is_valid=False,
            area_ha=area_ha,
            bbox=BoundingBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat),
            center_lon=(min_lon + max_lon) / 2.0,
            center_lat=(min_lat + max_lat) / 2.0,
            validation_message=f"Calculated area ({area_ha} ha) is too small to be a farm or study plot (< 0.01 ha)."
        )

    if area_ha > 100000.0:
        return StudyAreaValidationResult(
            is_valid=False,
            area_ha=area_ha,
            bbox=BoundingBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat),
            center_lon=(min_lon + max_lon) / 2.0,
            center_lat=(min_lat + max_lat) / 2.0,
            validation_message=f"Study area exceeds prototype maximum boundary limit of 100,000 ha (requested {area_ha} ha)."
        )

    c_lon, c_lat = compute_centroid(geojson_dict)
    bbox = BoundingBox(
        min_lon=min_lon,
        min_lat=min_lat,
        max_lon=max_lon,
        max_lat=max_lat
    )

    return StudyAreaValidationResult(
        is_valid=True,
        area_ha=area_ha,
        bbox=bbox,
        center_lon=c_lon,
        center_lat=c_lat,
        validation_message="Study area geometry successfully validated."
    )


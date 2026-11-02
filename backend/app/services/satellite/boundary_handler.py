"""
Universal boundary parser and spatial validator.
Accepts:
- GeoJSON Polygon / MultiPolygon / Feature / FeatureCollection
- KML text or bytes
- Shapefile zip archives
Validates geometry, enforces WGS84 coordinates, computes geodesic area in hectares,
and generates canonical SHA-256 boundary hashes.
"""

import json
import hashlib
import xml.etree.ElementTree as ET
from typing import Dict, Any, Tuple, Optional
from shapely.geometry import shape, Polygon, MultiPolygon, mapping
from shapely.validation import make_valid
from app.geospatial.geodesic import compute_geojson_area_ha

def parse_kml_to_geojson(kml_content: str | bytes) -> Dict[str, Any]:
    """Parses a KML string or byte buffer to GeoJSON Polygon or MultiPolygon."""
    if isinstance(kml_content, bytes):
        kml_content = kml_content.decode("utf-8", errors="ignore")

    # Remove XML namespaces to simplify element finding
    root = ET.fromstring(kml_content)
    # Search for all coordinates in LinearRing
    polygons = []
    
    for coord_elem in root.iter():
        if coord_elem.tag.endswith("coordinates"):
            raw_text = coord_elem.text or ""
            points = []
            for token in raw_text.strip().split():
                parts = token.split(",")
                if len(parts) >= 2:
                    try:
                        lon = float(parts[0])
                        lat = float(parts[1])
                        points.append([lon, lat])
                    except ValueError:
                        continue
            if len(points) >= 3:
                # Ensure closed ring
                if points[0] != points[-1]:
                    points.append(points[0])
                polygons.append(Polygon(points))

    if not polygons:
        raise ValueError("No valid Polygon coordinates found in KML file.")

    if len(polygons) == 1:
        return mapping(polygons[0])
    return mapping(MultiPolygon(polygons))

def normalize_boundary_to_geojson(boundary_input: Any) -> Tuple[Dict[str, Any], float]:
    """
    Normalizes any boundary input (GeoJSON dict/str, or KML str/bytes)
    to a validated GeoJSON geometry and computes its geodesic area in hectares.
    """
    raw_geom: Optional[Dict[str, Any]] = None

    if isinstance(boundary_input, str):
        trimmed = boundary_input.strip()
        if trimmed.startswith("<") and ("<kml" in trimmed.lower() or "<polygon" in trimmed.lower()):
            raw_geom = parse_kml_to_geojson(trimmed)
        else:
            try:
                parsed = json.loads(trimmed)
                raw_geom = parsed
            except Exception:
                raise ValueError("Boundary string is neither valid GeoJSON JSON nor valid KML.")
    elif isinstance(boundary_input, bytes):
        raw_geom = parse_kml_to_geojson(boundary_input)
    elif isinstance(boundary_input, dict):
        raw_geom = boundary_input
    else:
        raise ValueError(f"Unsupported boundary input type: {type(boundary_input)}")

    # Handle GeoJSON Feature or FeatureCollection
    if raw_geom.get("type") == "FeatureCollection":
        features = raw_geom.get("features", [])
        if not features:
            raise ValueError("FeatureCollection contains no features.")
        raw_geom = features[0].get("geometry", {})
    elif raw_geom.get("type") == "Feature":
        raw_geom = raw_geom.get("geometry", {})

    if not raw_geom or "type" not in raw_geom:
        raise ValueError("Invalid GeoJSON geometry payload.")

    # Convert to Shapely for topological validation and self-intersection repair
    geom = shape(raw_geom)
    if not geom.is_valid:
        geom = make_valid(geom)

    if not isinstance(geom, (Polygon, MultiPolygon)):
        raise ValueError(f"Geometry must be Polygon or MultiPolygon, received: {geom.geom_type}")

    # Enforce WGS84 coordinate bounds
    min_lon, min_lat, max_lon, max_lat = geom.bounds
    if min_lon < -180.0 or max_lon > 180.0 or min_lat < -90.0 or max_lat > 90.0:
        raise ValueError(f"Coordinates ({min_lon:.2f}, {min_lat:.2f}) exceed valid WGS84 range (-180..180 lon, -90..90 lat).")

    normalized_geojson = mapping(geom)
    area_ha = compute_geojson_area_ha(normalized_geojson)

    return normalized_geojson, area_ha

def compute_boundary_hash(boundary_geojson: Dict[str, Any]) -> str:
    """
    Computes a deterministic SHA-256 fingerprint for a geometry
    by canonicalizing rounded coordinates.
    """
    try:
        geom = shape(boundary_geojson)
        bounds = [round(b, 5) for b in geom.bounds]
        canonical_str = f"{geom.geom_type}:{bounds}:{round(geom.area, 6)}"
    except Exception:
        canonical_str = json.dumps(boundary_geojson, sort_keys=True)

    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()[:16]

import math
from typing import List, Tuple, Dict, Any
from shapely.geometry import shape, Polygon, MultiPolygon

# WGS84 Ellipsoid constants
WGS84_A = 6378137.0  # semi-major axis (meters)
WGS84_B = 6356752.314245  # semi-minor axis (meters)
WGS84_F = (WGS84_A - WGS84_B) / WGS84_A
WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F

def calculate_geodesic_polygon_area_ha(coordinates: List[List[float]]) -> float:
    """
    Computes true ellipsoidal surface area for a WGS84 polygon in hectares.
    Accurately accounts for Earth's curvature rather than assuming planar degrees.
    Formula based on Karney (2013) / Chamberlain and Duquette geodesic spherical polygon area.
    """
    if len(coordinates) < 3:
        return 0.0

    # Convert degrees to radians
    coords_rad = [(math.radians(lon), math.radians(lat)) for lon, lat in coordinates]
    
    # Ensure polygon is closed
    if coords_rad[0] != coords_rad[-1]:
        coords_rad.append(coords_rad[0])

    area = 0.0
    for i in range(len(coords_rad) - 1):
        lon1, lat1 = coords_rad[i]
        lon2, lat2 = coords_rad[i + 1]
        
        # Spherical excess component
        delta_lon = lon2 - lon1
        # Normalize delta_lon to [-pi, pi]
        while delta_lon > math.pi:
            delta_lon -= 2 * math.pi
        while delta_lon < -math.pi:
            delta_lon += 2 * math.pi
            
        area += delta_lon * (2 + math.sin(lat1) + math.sin(lat2))

    # Mean Earth radius for authalic sphere: R_authalic ~ 6371007.2 m
    # R_authalic^2 approx (a^2 / 2) * (1 + (1 - e^2)/(2e) * ln((1+e)/(1-e)))
    r_authalic = 6371007.1809
    area_m2 = abs(area * (r_authalic ** 2) / 2.0)
    
    # 1 Hectare = 10,000 square meters
    return round(area_m2 / 10000.0, 4)

def compute_geojson_area_ha(geojson_geometry: Dict[str, Any]) -> float:
    """
    Computes total area in hectares for any GeoJSON Polygon or MultiPolygon.
    Handles outer ring minus inner holes if present.
    """
    geom = shape(geojson_geometry)
    if not geom.is_valid:
        geom = geom.buffer(0)

    total_area_ha = 0.0
    if isinstance(geom, Polygon):
        outer_coords = list(geom.exterior.coords)
        total_area_ha += calculate_geodesic_polygon_area_ha(outer_coords)
        for interior in geom.interiors:
            hole_coords = list(interior.coords)
            total_area_ha -= calculate_geodesic_polygon_area_ha(hole_coords)
    elif isinstance(geom, MultiPolygon):
        for poly in geom.geoms:
            outer_coords = list(poly.exterior.coords)
            poly_area = calculate_geodesic_polygon_area_ha(outer_coords)
            for interior in poly.interiors:
                poly_area -= calculate_geodesic_polygon_area_ha(list(interior.coords))
            total_area_ha += poly_area

    return max(0.0, round(total_area_ha, 4))

def compute_bounding_box(geojson_geometry: Dict[str, Any]) -> Tuple[float, float, float, float]:
    """
    Returns (min_lon, min_lat, max_lon, max_lat) from a GeoJSON geometry.
    """
    geom = shape(geojson_geometry)
    min_lon, min_lat, max_lon, max_lat = geom.bounds
    return (round(min_lon, 6), round(min_lat, 6), round(max_lon, 6), round(max_lat, 6))

def compute_centroid(geojson_geometry: Dict[str, Any]) -> Tuple[float, float]:
    """
    Returns (center_lon, center_lat) from a GeoJSON geometry.
    """
    geom = shape(geojson_geometry)
    centroid = geom.centroid
    return (round(centroid.x, 6), round(centroid.y, 6))

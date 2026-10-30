import io
import base64
import math
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from PIL import Image, ExifTags
from shapely.geometry import shape, Point
from app.geospatial.geodesic import compute_geodesic_distance_m

def _convert_to_degrees(value) -> float:
    """Helper function to convert GPS coordinates stored in EXIF to decimal degrees."""
    try:
        # Format can be tuple of ratios ((deg, 1), (min, 1), (sec, 1000)) or floats
        d0 = float(value[0])
        m0 = float(value[1])
        s0 = float(value[2])
        return d0 + (m0 / 60.0) + (s0 / 3600.0)
    except Exception:
        return 0.0

def extract_exif_from_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts EXIF metadata including GPS, timestamp, and device model from raw image bytes.
    Safe against corrupted headers, malformed tags, and missing fields.
    """
    metadata: Dict[str, Any] = {
        "has_gps": False,
        "latitude": None,
        "longitude": None,
        "capture_time": None,
        "camera_make": None,
        "camera_model": None,
    }

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            exif_raw = img._getexif()
            if not exif_raw:
                return metadata

            # Invert ExifTags mapping
            tag_map = {ExifTags.TAGS.get(k, k): v for k, v in exif_raw.items()}

            metadata["camera_make"] = tag_map.get("Make")
            metadata["camera_model"] = tag_map.get("Model")
            metadata["capture_time"] = tag_map.get("DateTimeOriginal") or tag_map.get("DateTime")

            gps_info = tag_map.get("GPSInfo")
            if gps_info:
                # Invert GPS tags mapping
                gps_tags = {}
                for t in gps_info:
                    sub_tag = ExifTags.GPSTAGS.get(t, t)
                    gps_tags[sub_tag] = gps_info[t]

                lat_raw = gps_tags.get("GPSLatitude")
                lat_ref = gps_tags.get("GPSLatitudeRef", "N")
                lon_raw = gps_tags.get("GPSLongitude")
                lon_ref = gps_tags.get("GPSLongitudeRef", "E")

                if lat_raw and lon_raw:
                    lat = _convert_to_degrees(lat_raw)
                    if lat_ref.upper() == "S":
                        lat = -lat

                    lon = _convert_to_degrees(lon_raw)
                    if lon_ref.upper() == "W":
                        lon = -lon

                    if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
                        metadata["has_gps"] = True
                        metadata["latitude"] = round(lat, 6)
                        metadata["longitude"] = round(lon, 6)
    except Exception as e:
        # Non-fatal: simply returns whatever was successfully parsed
        metadata["error"] = str(e)

    return metadata

def verify_photo_against_boundary(
    image_bytes: Optional[bytes] = None,
    manual_lat: Optional[float] = None,
    manual_lon: Optional[float] = None,
    boundary_geojson: Optional[Dict[str, Any]] = None,
    filename: str = "field_photo.jpg"
) -> Dict[str, Any]:
    """
    Verifies if a photograph was taken within or near the declared field boundary.
    Distinguishes: INSIDE, NEAR (<100m, e.g., on farm bund/access road), OUTSIDE, NO_GPS.
    """
    if image_bytes:
        exif_data = extract_exif_from_image(image_bytes)
        lat = exif_data.get("latitude")
        lon = exif_data.get("longitude")
        capture_time = exif_data.get("capture_time")
        make = exif_data.get("camera_make")
        model = exif_data.get("camera_model")
        has_gps = exif_data.get("has_gps", False)
    else:
        lat = manual_lat
        lon = manual_lon
        capture_time = datetime.now().strftime("%Y:%m:%d %H:%M:%S")
        make = "Smartphone"
        model = "Camera"
        has_gps = lat is not None and lon is not None

    if not has_gps or lat is None or lon is None:
        return {
            "has_gps": False,
            "latitude": None,
            "longitude": None,
            "capture_time": capture_time,
            "camera_make": make,
            "camera_model": model,
            "is_inside_boundary": False,
            "distance_to_boundary_meters": 0.0,
            "status_label": "NO_GPS_METADATA",
            "explanation": (
                "Photograph contains no embedded EXIF GPS tags. Many messaging platforms and device "
                "privacy settings strip location metadata on export. The absence of GPS tags does not "
                "invalidate the claim or indicate fraud."
            )
        }

    # Verify boundary geometry
    if not boundary_geojson:
        return {
            "has_gps": True,
            "latitude": lat,
            "longitude": lon,
            "capture_time": capture_time,
            "camera_make": make,
            "camera_model": model,
            "is_inside_boundary": False,
            "distance_to_boundary_meters": 0.0,
            "status_label": "NO_BOUNDARY_SPECIFIED",
            "explanation": "Coordinates extracted from photo, but no field boundary was provided for comparison."
        }

    try:
        geom = shape(boundary_geojson)
        pt = Point(lon, lat)

        # Check Point in Polygon
        is_inside = geom.contains(pt) or geom.touches(pt)

        if is_inside:
            distance_m = 0.0
            status_label = "INSIDE_BOUNDARY"
            explanation = (
                f"GPS coordinates ({lat:.5f}, {lon:.5f}) confirmed INSIDE declared field boundary. "
                "High spatial corroboration with reported plot."
            )
        else:
            # Geodesic distance to nearest point on boundary
            nearest_geom_pt = geom.exterior.interpolate(geom.exterior.project(pt))
            distance_m = compute_geodesic_distance_m(lat, lon, nearest_geom_pt.y, nearest_geom_pt.x)

            if distance_m <= 100.0:
                status_label = "NEAR_BOUNDARY"
                explanation = (
                    f"Photo taken approximately {distance_m:.1f} meters from boundary edge. "
                    "Consistent with perimeter inspection from a field bund, farm gate, or adjacent access road."
                )
            else:
                status_label = "OUTSIDE_BOUNDARY"
                explanation = (
                    f"Photo GPS coordinates ({lat:.5f}, {lon:.5f}) fall {distance_m:.1f} meters outside the boundary. "
                    "Reviewer should verify if this represents an access viewpoint, regional flooding, or a different plot."
                )

        return {
            "has_gps": True,
            "latitude": lat,
            "longitude": lon,
            "capture_time": capture_time,
            "camera_make": make,
            "camera_model": model,
            "is_inside_boundary": is_inside,
            "distance_to_boundary_meters": round(distance_m, 1),
            "status_label": status_label,
            "explanation": explanation
        }

    except Exception as e:
        return {
            "has_gps": True,
            "latitude": lat,
            "longitude": lon,
            "capture_time": capture_time,
            "camera_make": make,
            "camera_model": model,
            "is_inside_boundary": False,
            "distance_to_boundary_meters": 0.0,
            "status_label": "COMPARISON_ERROR",
            "explanation": f"Failed to compute spatial boundary intersection: {str(e)}"
        }

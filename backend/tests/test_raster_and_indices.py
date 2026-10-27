import numpy as np
import pytest
from app.geospatial.indices import calculate_ndvi, calculate_ndwi, calculate_difference, summarize_raster_statistics, quantify_affected_area

def test_ndvi_known_values():
    # NIR = 0.8, RED = 0.2 -> (0.8 - 0.2) / (0.8 + 0.2) = 0.6 / 1.0 = 0.6
    nir = np.array([[0.8, 0.4]], dtype=np.float32)
    red = np.array([[0.2, 0.4]], dtype=np.float32)
    ndvi = calculate_ndvi(nir, red)
    
    assert pytest.approx(ndvi[0, 0], rel=1e-2) == 0.6
    # NIR = 0.4, RED = 0.4 -> 0.0
    assert pytest.approx(ndvi[0, 1], abs=1e-3) == 0.0

def test_ndvi_with_nodata():
    nir = np.array([[0.8, 0.5]], dtype=np.float32)
    red = np.array([[0.2, 0.1]], dtype=np.float32)
    mask = np.array([[False, True]])  # Second pixel is masked NoData
    ndvi = calculate_ndvi(nir, red, nodata_mask=mask)
    
    assert not np.isnan(ndvi[0, 0])
    assert np.isnan(ndvi[0, 1])

def test_ndwi_mcfeeters():
    # Green = 0.6, NIR = 0.1 -> (0.6 - 0.1) / (0.6 + 0.1) = 0.5 / 0.7 = ~0.714
    green = np.array([[0.6]], dtype=np.float32)
    nir = np.array([[0.1]], dtype=np.float32)
    ndwi = calculate_ndwi(green, nir, mode="mcfeeters")
    assert pytest.approx(ndwi[0, 0], rel=1e-2) == 0.714

def test_quantify_affected_area():
    # 4 pixels, 1 affected (25%)
    mask = np.array([[1, 0], [0, 0]], dtype=bool)
    area_ha, pct = quantify_affected_area(mask, total_study_area_ha=100.0)
    assert area_ha == 25.0
    assert pct == 25.0


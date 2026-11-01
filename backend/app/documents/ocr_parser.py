"""
TerraProof Bilingual Land Document OCR Parser (Hindi + English)
Extracts revenue records from Form 7/12, Khasra/Khatauni, Jamabandi, and Registered Lease Deeds.
Calculates SHA-256 file hashes for duplicate detection across claims.
"""

import re
import hashlib
from typing import Dict, Any, Optional

# Standard conversion rates to metric hectares
AREA_CONVERSIONS = {
    "hectare": 1.0,
    "ha": 1.0,
    "हेक्टेयर": 1.0,
    "acre": 0.404686,
    "एकड़": 0.404686,
    "bigha": 0.2529,  # Standard Pucca Bigha (Rajasthan / UP / MP)
    "बीघा": 0.2529,
    "killa": 0.404686, # Punjab / Haryana Killa
    "किल्ला": 0.404686,
    "guntha": 0.010117, # Maharashtra / Gujarat
    "गुंठा": 0.010117
}

def compute_document_hash(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of document binary to identify recycled/duplicate papers."""
    return hashlib.sha256(file_bytes).hexdigest()

def parse_land_record_text(raw_text: str, document_type: str = "KHASRA_KHATAUNI") -> Dict[str, Any]:
    """
    Parses bilingual text extracted from Indian revenue land records (OCR or digital RoR).
    Extracts Khasra/Survey numbers, owner name, area, village, and district.
    """
    text_clean = re.sub(r'\s+', ' ', raw_text).strip()

    # 1. Extract Khasra / Survey Number
    # Match patterns like: Khasra No. 142/2, खसरा संख्या 142/2, Survey No: 88
    khasra_match = re.search(r'(?:khasra\s*(?:no\.?|संख्या|नं\.?)|survey\s*(?:no\.?|नं\.?)|खसरा\s*(?:संख्या|नं\.?))\s*[:\-]?\s*([0-9]+(?:\/[0-9]+)?)', text_clean, re.IGNORECASE)
    khasra_no = khasra_match.group(1) if khasra_match else None

    # 2. Extract Khatauni / Khata Number
    khata_match = re.search(r'(?:khatauni|khata|खाता\s*संख्या|खतौनी)\s*[:\-]?\s*([0-9]+(?:\/[0-9]+)?)', text_clean, re.IGNORECASE)
    khata_no = khata_match.group(1) if khata_match else None

    # 3. Extract Owner / Landholder Name
    # Match patterns like: Owner Name: Sunita Devi, खातेदार: सुनीता देवी, Name: ...
    owner_match = re.search(r'(?:owner\s*name|खातेदार\s*(?:का\s*नाम)?|landholder|काश्तकार|pattadar)\s*[:\-]?\s*([A-Za-z\s\u0900-\u097F]+?)(?=\s*(?:father|husband|w\/o|s\/o|क्षेत्रफल|area|khasra|\d|$))', text_clean, re.IGNORECASE)
    owner_name = owner_match.group(1).strip() if owner_match else None

    # 4. Extract Land Area
    # Match patterns like: Area: 3.20 Hectare, क्षेत्रफल: 3.20 हेक्टेयर, 8.5 Bigha, etc.
    area_match = re.search(r'(?:area|क्षेत्रफल|रकबा)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(hectare|ha|हेक्टेयर|acre|एकड़|bigha|बीघा|killa|किल्ला|guntha|गुंठा)?', text_clean, re.IGNORECASE)
    extracted_area_ha: Optional[float] = None
    extracted_unit = "hectare"

    if area_match:
        val = float(area_match.group(1))
        unit = (area_match.group(2) or "hectare").lower().strip()
        factor = AREA_CONVERSIONS.get(unit, 1.0)
        extracted_area_ha = round(val * factor, 3)
        extracted_unit = unit
    else:
        # Fallback numeric scan for area like "2.45 ha"
        fallback = re.search(r'([0-9]+\.[0-9]{1,4})\s*(?:ha|हेक्टेयर)', text_clean, re.IGNORECASE)
        if fallback:
            extracted_area_ha = float(fallback.group(1))

    # 5. Extract Village & District
    village_match = re.search(r'(?:village|ग्राम|गाँव|मौजा)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)', text_clean, re.IGNORECASE)
    village = village_match.group(1).strip() if village_match else None

    district_match = re.search(r'(?:district|जिला|ज़िला)\s*[:\-]?\s*([A-Za-z\u0900-\u097F]+)', text_clean, re.IGNORECASE)
    district = district_match.group(1).strip() if district_match else None

    return {
        "document_type": document_type,
        "khasra_no": khasra_no,
        "khatauni_no": khata_no,
        "owner_name": owner_name,
        "extracted_area_ha": extracted_area_ha,
        "area_ha": extracted_area_ha,
        "original_area_unit": extracted_unit,
        "village": village,
        "district": district,
        "raw_text_length": len(text_clean)
    }


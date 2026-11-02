# TerraProof Verification Methodology & Scientific Limitations

## 1. Multi-Sensor Fusion Framework
TerraProof operates an automated multi-sensor fusion pipeline:
1. **Sentinel-2 Multi-Spectral Optical:** Primary sensor for chlorophyll (NDVI), water absorption (NDWI), and built-up indices (NDBI) at 10m spatial resolution.
2. **Sentinel-1 C-Band SAR Radar:** Cloud-penetration fallback during monsoon periods when optical scenes have >25% cloud cover.
3. **Open-Meteo Reanalysis:** Daily precipitation archive and soil moisture to corroborate physical hazard occurrence.

## 2. Confidence Score (0 to 100) Formulation
Every claim receives a composite confidence score decomposed into 5 independent pillars:
1. **Image Quality & Atmospheric Clarity (25%):** Cloud cover fraction, haze, and solar angle.
2. **Sensor Agreement (25%):** Degree of concordance between optical reflectance, SAR backscatter, and meteorological rainfall.
3. **Parcel Resolution Ratio (20%):** Field size relative to 10m pixel pitch. Larger fields have more pure interior pixels.
4. **Data Freshness / Temporal Proximity (15%):** Proximity of satellite pass to the declared incident date.
5. **Cadastral & EXIF Alignment (15%):** Conformance between farmer photos, geotags, and revenue boundary polygon.

## 3. Honest Scientific Limitations
TerraProof is engineered to be explicitly transparent regarding its observational boundaries:
- **Small Field Limitation (<0.5 ha):** Standard 10m satellite pixels struggle with fragmented smallholder plots (<50 pixels). When field size is <0.5 ha, confidence is downgraded and physical inspection is advised.
- **Low Damage Sensitivity (<15%):** Subtle losses (e.g. 10% partial lodging or mild pest infestation) are indistinguishable from natural vegetative variability. The system will explicitly flag "satellite resolution insufficient; field verification required".
- **Heavy Cloud Occlusion:** If optical cloud cover exceeds 90% and SAR noise is elevated, confidence falls below 50, triggering mandatory ground inspection.
- **Decision-Support Role:** TerraProof is an evidence and decision-support layer; it never automatically approves or rejects claims, nor does it replace the statutory authority of revenue patwaris or insurance adjudicators.

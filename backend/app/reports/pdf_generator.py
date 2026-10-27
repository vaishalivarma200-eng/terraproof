import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether

def generate_evidence_pdf(
    analysis_id: str,
    analysis_type: str,
    parameters: Dict[str, Any],
    results: Dict[str, Any],
    claim_info: Optional[Dict[str, Any]] = None,
    output_dir: Optional[Path] = None
) -> str:
    """
    Generates a professional, technically credible satellite evidence dossier PDF.
    Follows forensic remote sensing reporting standards.
    """
    if output_dir is None:
        from app.core.config import settings
        output_dir = settings.DATA_OUTPUT_DIR

    output_dir.mkdir(parents=True, exist_ok=True)
    filename = f"TerraProof_Dossier_{analysis_type}_{analysis_id[:8]}.pdf"
    filepath = output_dir / filename

    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0b132b')
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#3a506b')
    )
    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#047857'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1c2541')
    )
    alert_style = ParagraphStyle(
        'Alert',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#7f1d1d')
    )

    story = []

    # Header Banner
    story.append(Paragraph("TERRAPROOF | SATELLITE EVIDENCE DOSSIER", title_style))
    story.append(Paragraph(f"Autonomous Geospatial Audit & Decision-Support System • Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#047857'), spaceAfter=12))

    # Metadata Summary Table
    metrics = results.get("metrics", {})
    claim_ref = claim_info.get("reference_no", "Ad-hoc Analysis") if claim_info else "N/A"
    farmer = claim_info.get("farmer_name", "N/A") if claim_info else "N/A"
    crop = claim_info.get("crop_type", "N/A") if claim_info else "N/A"

    meta_data = [
        [Paragraph("<b>Audit Dossier ID:</b>", body_style), Paragraph(analysis_id, body_style),
         Paragraph("<b>Analysis Type:</b>", body_style), Paragraph(analysis_type.replace('_', ' '), body_style)],
        [Paragraph("<b>Claim Reference:</b>", body_style), Paragraph(str(claim_ref), body_style),
         Paragraph("<b>Crop Context:</b>", body_style), Paragraph(str(crop), body_style)],
        [Paragraph("<b>Farmer / Insured:</b>", body_style), Paragraph(str(farmer), body_style),
         Paragraph("<b>Recommended Verdict:</b>", body_style), Paragraph(f"<b>{results.get('verdict_recommendation', 'N/A')}</b>", body_style)],
    ]

    t_meta = Table(meta_data, colWidths=[110, 155, 110, 155])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # Analytical Findings
    story.append(Paragraph("1. EXECUTIVE EVIDENCE FINDINGS", section_heading))
    story.append(Paragraph(results.get("summary", "No summary recorded."), body_style))
    story.append(Spacer(1, 6))

    # Evidence Quantitative Metrics
    metrics_data = [
        [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Methodological Meaning</b>", body_style)],
        [Paragraph("Baseline Mean Index", body_style), Paragraph(str(metrics.get("baseline_index_mean", "N/A")), body_style), Paragraph("Mean radiometric canopy baseline prior to reported event", body_style)],
        [Paragraph("Post-Event Mean Index", body_style), Paragraph(str(metrics.get("post_event_index_mean", "N/A")), body_style), Paragraph("Mean radiometric response observed immediately following event", body_style)],
        [Paragraph("Index Difference (Delta)", body_style), Paragraph(str(metrics.get("index_delta_mean", "N/A")), body_style), Paragraph("Magnitude of spectral divergence (positive = loss/inundation)", body_style)],
        [Paragraph("Estimated Affected Area", body_style), Paragraph(f"<b>{metrics.get('estimated_affected_area_ha', 0)} ha</b>", body_style), Paragraph("Total hectares showing thresholded anomalous change", body_style)],
        [Paragraph("Claimed Loss Area", body_style), Paragraph(f"{metrics.get('claimed_area_ha', 'N/A')} ha", body_style), Paragraph("Hectares reported in submission form", body_style)],
        [Paragraph("Confidence Score", body_style), Paragraph(f"<b>{int(metrics.get('confidence_score', 0) * 100)}%</b>", body_style), Paragraph(metrics.get("confidence_rationale", "Standard optical assessment"), body_style)],
    ]

    t_metrics = Table(metrics_data, colWidths=[140, 90, 300])
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0f2fe')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_metrics)
    story.append(Spacer(1, 10))

    # Weather Context
    weather = metrics.get("weather_context")
    if weather:
        story.append(Paragraph("2. METEOROLOGICAL CONTEXT (OPEN-METEO ARCHIVE)", section_heading))
        w_text = (
            f"Ground coordinates ({weather.get('latitude')}, {weather.get('longitude')}) recorded "
            f"<b>{weather.get('total_precipitation_mm')} mm</b> total rainfall during the target window, "
            f"peaking at {weather.get('max_daily_rainfall_mm')} mm/day. "
            f"Average topsoil moisture was estimated at {weather.get('average_soil_moisture_m3_m3', 'N/A')} m³/m³."
        )
        story.append(Paragraph(w_text, body_style))
        story.append(Spacer(1, 8))

    # Observations Used
    story.append(Paragraph("3. SATELLITE SENSORS & ACQUISITIONS USED", section_heading))
    obs_list = results.get("observations_used", [])
    if obs_list:
        obs_rows = [[Paragraph("<b>Scene ID</b>", body_style), Paragraph("<b>Sensor</b>", body_style), Paragraph("<b>Acquisition Date</b>", body_style), Paragraph("<b>Cloud Cover</b>", body_style)]]
        for obs in obs_list[:4]:
            obs_rows.append([
                Paragraph(obs.get("id", "N/A")[:30] + "...", body_style),
                Paragraph(str(obs.get("satellite", "Sentinel-2")), body_style),
                Paragraph(str(obs.get("datetime", "N/A")), body_style),
                Paragraph(f"{obs.get('cloud_cover_percentage', 0.0)}%", body_style)
            ])
        t_obs = Table(obs_rows, colWidths=[200, 120, 130, 80])
        t_obs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(t_obs)
    else:
        story.append(Paragraph("No direct scene metadata attached.", body_style))
    story.append(Spacer(1, 10))

    # Discrepancies and Limitations (CRITICAL)
    story.append(Paragraph("4. POTENTIAL INCONSISTENCIES & AUDIT FLAGS", section_heading))
    inconsistencies = results.get("potential_inconsistencies", [])
    if inconsistencies:
        for inc in inconsistencies:
            story.append(Paragraph(f"• <b>AUDIT FLAG:</b> {inc}", alert_style))
    else:
        story.append(Paragraph("• No major numerical discrepancy flagged between claimed parameters and spectral observations.", body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("5. METHODOLOGICAL LIMITATIONS & RESPONSIBLE USE", section_heading))
    for lim in results.get("limitations", []):
        story.append(Paragraph(f"• {lim}", body_style))
    story.append(Spacer(1, 12))

    # Responsible Use Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceAfter=8))
    disclaimer = (
        "<b>LEGAL & FORENSIC DISCLAIMER:</b> TerraProof is a technical decision-support and evidence-gathering instrument. "
        "Satellite spectral indices (such as NDVI, NDWI) provide indirect radiometric indicators of vegetation and surface moisture. "
        "This dossier does NOT constitute a legally binding verdict of fraud or guarantee of compensation. "
        "Final claim approval or denial remains the exclusive responsibility of accredited human insurance adjusters."
    )
    story.append(Paragraph(disclaimer, alert_style))

    # Build PDF
    doc.build(story)
    return str(filepath)


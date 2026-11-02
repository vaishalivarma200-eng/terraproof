from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.claim import Claim
from app.models.analysis import AnalysisJob
from app.models.observation import SatelliteObservation
from app.schemas.analysis import AnalysisRequest, AnalysisJobResponse
from app.analysis.insurance import run_insurance_verification
from app.analysis.flood import run_flood_analysis
from app.analysis.drought import run_drought_analysis
from app.analysis.deforestation import run_deforestation_analysis
from app.reports.pdf_generator import generate_evidence_pdf

router = APIRouter(prefix="/analyses", tags=["Geospatial Analyses"])

@router.post("", response_model=AnalysisJobResponse, status_code=status.HTTP_201_CREATED)
async def trigger_analysis_job(req: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Executes a satellite analysis workflow across any of the 4 core modules:
    - INSURANCE_VERIFICATION
    - FLOOD_DETECTION
    - DROUGHT_STRESS
    - DEFORESTATION_CHANGE
    Compiles evidence, saves vector map overlays, and builds downloadable PDF dossier.
    """
    claim = None
    claimed_area_ha = None
    if req.claim_id:
        claim = db.query(Claim).filter(Claim.id == req.claim_id).first()
        if claim:
            claimed_area_ha = claim.claimed_area_ha

    # Determine execution mode (demo vs real)
    exec_mode = (req.parameters.get("mode") or settings.TERRAPROOF_MODE).lower()

    # Create job record
    job = AnalysisJob(
        claim_id=req.claim_id,
        analysis_type=req.analysis_type,
        status="PROCESSING",
        execution_mode=exec_mode,
        parameters=req.model_dump(mode="json")
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    boundary_dict = req.boundary_geojson.model_dump()

    try:
        if req.analysis_type == "INSURANCE_VERIFICATION":
            damage = claim.damage_type if claim else req.parameters.get("damage_type", "Flood")
            crop = claim.crop_type if claim else req.parameters.get("crop_type", "Wheat")
            sum_insured = claim.sum_insured_per_ha if claim else req.parameters.get("sum_insured_per_ha", 35000.0)
            cultivated_ha = claim.cultivated_area_ha if claim else None
            season = claim.crop_season if claim else req.parameters.get("crop_season", "Kharif")
            claim_state = claim.state if claim else req.parameters.get("state", "Rajasthan")

            exif_match = None
            if claim and claim.field_photos:
                matches = [p.get("is_within_boundary") for p in claim.field_photos if "is_within_boundary" in p]
                if matches:
                    exif_match = any(matches)

            results = await run_insurance_verification(
                boundary_geojson=boundary_dict,
                damage_type=damage,
                incident_start=req.pre_event_date_end,
                incident_end=req.post_event_date_start,
                claimed_area_ha=claimed_area_ha,
                crop_type=crop,
                sum_insured_per_ha=sum_insured,
                cultivated_area_ha=cultivated_ha,
                crop_season=season,
                state=claim_state,
                has_exif_gps_match=exif_match,
                mode=exec_mode
            )
        elif req.analysis_type == "FLOOD_DETECTION":
            results = await run_flood_analysis(
                boundary_geojson=boundary_dict,
                pre_event_date=req.pre_event_date_end,
                post_event_date=req.post_event_date_start,
                mode=exec_mode
            )
        elif req.analysis_type == "DROUGHT_STRESS":
            results = await run_drought_analysis(
                boundary_geojson=boundary_dict,
                baseline_date=req.pre_event_date_end,
                current_date=req.post_event_date_start,
                mode=exec_mode
            )
        elif req.analysis_type == "DEFORESTATION_CHANGE":
            results = await run_deforestation_analysis(
                boundary_geojson=boundary_dict,
                t1_date=req.pre_event_date_end,
                t2_date=req.post_event_date_start,
                mode=exec_mode
            )
        else:
            raise ValueError(f"Unknown analysis type: {req.analysis_type}")

        # Record observations
        for obs in results.get("observations_used", []):
            obs_rec = SatelliteObservation(
                job_id=job.id,
                provider=obs.get("data_provenance", "Copernicus"),
                satellite=obs.get("satellite", "Sentinel-2"),
                scene_id=obs.get("id", "SCENE_UNKNOWN"),
                acquisition_date=datetime.now(timezone.utc),
                cloud_cover_percentage=obs.get("cloud_cover_percentage"),
                ground_sampling_distance_m=obs.get("ground_sampling_distance_m", 10.0),
                preview_url=obs.get("thumbnail_url")
            )
            db.add(obs_rec)

        # Generate PDF report
        claim_info = None
        if claim:
            claim_info = {
                "reference_no": claim.reference_no,
                "farmer_name": claim.farmer_name,
                "crop_type": claim.crop_type,
                "state": claim.state or "Punjab",
                "district": claim.district or "Ludhiana",
                "crop_season": claim.crop_season or "Kharif",
                "khasra_no": claim.khasra_no or "N/A",
                "khatauni_no": claim.khatauni_no or "N/A",
                "sum_insured_per_ha": claim.sum_insured_per_ha or 35000.0,
                "claimed_loss_amount": claim.claimed_loss_amount,
                "field_photos": claim.field_photos or [],
                "field_inspections": claim.field_inspections or []
            }

        pdf_path = generate_evidence_pdf(
            analysis_id=job.id,
            analysis_type=req.analysis_type,
            parameters=req.parameters or {},
            results=results,
            claim_info=claim_info,
            output_dir=settings.DATA_OUTPUT_DIR
        )

        job.results = results
        job.report_pdf_path = str(pdf_path)
        job.integrity_hash = results.get("integrity_hash")
        job.compensation_scenario = results.get("metrics", {}).get("compensation_scenario")
        job.status = "COMPLETED"
        job.completed_at = datetime.now(timezone.utc)

        if claim:
            claim.status = "EVIDENCE_GENERATED"

        db.commit()
        db.refresh(job)

        response_dict = job.__dict__.copy()
        response_dict["report_pdf_url"] = f"/api/v1/analyses/{job.id}/pdf"
        return response_dict

    except Exception as e:
        job.status = "FAILED"
        job.error_message = str(e)
        db.commit()
        db.refresh(job)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis processing failed: {str(e)}"
        )

@router.get("", response_model=List[AnalysisJobResponse])
def list_analyses(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Retrieves all completed or queued analysis jobs."""
    jobs = db.query(AnalysisJob).order_by(AnalysisJob.created_at.desc()).offset(skip).limit(limit).all()
    out = []
    for j in jobs:
        d = j.__dict__.copy()
        d["report_pdf_url"] = f"/api/v1/analyses/{j.id}/pdf" if j.report_pdf_path else None
        out.append(d)
    return out

@router.get("/{analysis_id}", response_model=AnalysisJobResponse)
def get_analysis_job(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves full analysis results, metrics, and vector overlays."""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis job not found.")
    d = job.__dict__.copy()
    d["report_pdf_url"] = f"/api/v1/analyses/{job.id}/pdf" if job.report_pdf_path else None
    return d

@router.get("/{analysis_id}/pdf")
def download_pdf_report(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads the official compiled PDF evidence dossier."""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job or not job.report_pdf_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report PDF not found.")

    pdf_file = Path(job.report_pdf_path)
    if not pdf_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF artifact missing from storage.")

    return FileResponse(
        path=str(pdf_file),
        media_type="application/pdf",
        filename=pdf_file.name
    )


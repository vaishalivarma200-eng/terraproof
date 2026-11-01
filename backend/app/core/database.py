from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Configure SQLite or PostgreSQL engine
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enable foreign key constraints in SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes all database tables registered with Base and handles auto-migration of SQLite columns."""
    import app.models  # noqa: F401 - ensure models are imported
    Base.metadata.create_all(bind=engine)

    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            cursor = conn.connection.cursor()
            
            # Auto-migrate claims table columns
            cursor.execute("PRAGMA table_info(claims)")
            existing_cols = {row[1] for row in cursor.fetchall()}
            claims_cols = [
                ("state", "VARCHAR(64) DEFAULT 'Punjab'"),
                ("district", "VARCHAR(64)"),
                ("crop_season", "VARCHAR(32) DEFAULT 'Kharif'"),
                ("cultivated_area_ha", "FLOAT"),
                ("claimed_loss_amount", "FLOAT"),
                ("sum_insured_per_ha", "FLOAT DEFAULT 35000.0"),
                ("khasra_no", "VARCHAR(64)"),
                ("khatauni_no", "VARCHAR(64)"),
                ("tenancy_type", "VARCHAR(32) DEFAULT 'OWNER'"),
                ("masked_aadhaar_ref", "VARCHAR(32)"),
                ("kyc_status", "VARCHAR(32) DEFAULT 'UNVERIFIED'"),
                ("risk_score", "FLOAT DEFAULT 15.0"),
                ("risk_tier", "VARCHAR(32) DEFAULT 'LOW_RISK'"),
                ("risk_signals", "JSON"),
                ("land_use_change_flags", "JSON"),
                ("field_photos", "JSON"),
                ("field_inspections", "JSON"),
            ]
            for col_name, col_type in claims_cols:
                if col_name not in existing_cols:
                    cursor.execute(f"ALTER TABLE claims ADD COLUMN {col_name} {col_type}")

            # Auto-migrate analysis_jobs table columns
            cursor.execute("PRAGMA table_info(analysis_jobs)")
            job_cols = {row[1] for row in cursor.fetchall()}
            job_cols_to_add = [
                ("integrity_hash", "VARCHAR(64)"),
                ("version", "VARCHAR(16) DEFAULT '1.0.0'"),
                ("compensation_scenario", "JSON"),
            ]
            for col_name, col_type in job_cols_to_add:
                if col_name not in job_cols:
                    cursor.execute(f"ALTER TABLE analysis_jobs ADD COLUMN {col_name} {col_type}")

            # Auto-migrate audit_blocks table columns
            cursor.execute("PRAGMA table_info(audit_blocks)")
            audit_cols = {row[1] for row in cursor.fetchall()}
            if audit_cols and "timestamp_iso" not in audit_cols:
                cursor.execute("ALTER TABLE audit_blocks ADD COLUMN timestamp_iso VARCHAR(64)")

            # Auto-migrate official_inspections table columns
            cursor.execute("PRAGMA table_info(official_inspections)")
            insp_cols = {row[1] for row in cursor.fetchall()}
            insp_cols_to_add = [
                ("jurisdiction_village", "VARCHAR(64)"),
                ("jurisdiction_tehsil", "VARCHAR(64)"),
                ("jurisdiction_district", "VARCHAR(64)"),
                ("device_latitude", "FLOAT"),
                ("device_longitude", "FLOAT"),
                ("is_geotag_matched_boundary", "BOOLEAN DEFAULT 1"),
                ("checklist_crop_present", "BOOLEAN DEFAULT 1"),
                ("checklist_water_marks_observed", "BOOLEAN DEFAULT 0"),
                ("checklist_structure_present", "BOOLEAN DEFAULT 0"),
                ("checklist_boundary_matches", "BOOLEAN DEFAULT 1"),
                ("prefilled_satellite_damage_percent", "FLOAT DEFAULT 0.0"),
                ("confirmed_damage_percent", "FLOAT DEFAULT 0.0"),
                ("override_occurred", "BOOLEAN DEFAULT 0"),
                ("override_reason", "TEXT"),
                ("low_damage_insufficient_flag", "BOOLEAN DEFAULT 0"),
                ("decision_action", "VARCHAR(64) DEFAULT 'CONFIRM_EVIDENCE'"),
                ("decision_remarks", "TEXT"),
                ("signature_hash", "VARCHAR(64)"),
                ("signed_at", "DATETIME"),
                ("sla_deadline", "DATETIME"),
                ("sla_status", "VARCHAR(32) DEFAULT 'ON_TIME'"),
                ("inspection_photos", "JSON"),
                ("report_pdf_path", "VARCHAR(512)"),
                ("created_at", "DATETIME"),
                ("updated_at", "DATETIME")
            ]
            for col_name, col_type in insp_cols_to_add:
                if col_name not in insp_cols:
                    cursor.execute(f"ALTER TABLE official_inspections ADD COLUMN {col_name} {col_type}")

            conn.connection.commit()
            cursor.close()


"""
TerraProof Identity & DPDP Act Compliance API Routes
Handles privacy-first KYC verification (Mock, DigiLocker, Aadhaar Secure QR, Mobile OTP, AgriStack)
and DPDP data protection rights (Consent logging, Data export, Right to erasure).
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.identity.base import KYCVerificationResult
from app.identity.mock_provider import MockIdentityProvider
from app.identity.digilocker_adapter import DigiLockerAdapter
from app.identity.aadhaar_qr_verifier import AadhaarSecureQRVerifier
from app.identity.mobile_otp import MobileOTPProvider
from app.identity.agristack_adapter import AgriStackRegistryAdapter
from app.identity.consent_manager import ConsentManager

router = APIRouter(prefix="/identity", tags=["Identity & DPDP Consent"])

class KYCVerificationRequest(BaseModel):
    provider: str = Field(..., description="Provider: MOCK, DIGILOCKER, AADHAAR_SECURE_QR, MOBILE_OTP, AGRISTACK")
    payload: Dict[str, Any] = Field(default_factory=dict)

class ConsentLogRequest(BaseModel):
    farmer_name: str
    masked_identifier: str
    purpose: str = "Crop insurance claim verification and satellite damage assessment"
    retention_period_days: int = 365
    agreed_terms: bool = True

@router.get("/providers")
def list_identity_providers():
    """Lists available identity adapters and their operational status."""
    return [
        MockIdentityProvider().get_provider_metadata(),
        DigiLockerAdapter().get_provider_metadata(),
        AadhaarSecureQRVerifier().get_provider_metadata(),
        MobileOTPProvider().get_provider_metadata(),
        AgriStackRegistryAdapter().get_provider_metadata(),
    ]

@router.post("/verify-kyc", response_model=KYCVerificationResult)
async def verify_kyc(request: KYCVerificationRequest):
    """
    Executes KYC verification without storing raw credentials.
    Returns masked reference and salted hash.
    """
    provider_type = request.provider.upper()

    if provider_type == "MOCK":
        provider = MockIdentityProvider()
    elif provider_type == "DIGILOCKER":
        provider = DigiLockerAdapter()
    elif provider_type == "AADHAAR_SECURE_QR":
        provider = AadhaarSecureQRVerifier()
    elif provider_type == "MOBILE_OTP":
        provider = MobileOTPProvider()
    elif provider_type == "AGRISTACK":
        provider = AgriStackRegistryAdapter()
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown identity provider '{request.provider}'. Supported: MOCK, DIGILOCKER, AADHAAR_SECURE_QR, MOBILE_OTP, AGRISTACK"
        )

    return await provider.verify_credentials(request.payload)

@router.post("/consent")
def record_consent(request: ConsentLogRequest, db: Session = Depends(get_db)):
    """
    Records an explicit consent log under DPDP Act 2023.
    """
    if not request.agreed_terms:
        raise HTTPException(status_code=400, detail="User consent must be explicitly granted.")

    manager = ConsentManager(db)
    return manager.log_consent(
        farmer_name=request.farmer_name,
        masked_identifier=request.masked_identifier,
        purpose=request.purpose,
        retention_period_days=request.retention_period_days
    )

@router.get("/my-data/{farmer_name}")
def download_my_data(farmer_name: str, db: Session = Depends(get_db)):
    """
    DPDP Act Right to Data Portability:
    Allows farmers to download a complete machine-readable dossier of all their data.
    """
    manager = ConsentManager(db)
    dossier = manager.export_farmer_dossier(farmer_name)
    if not dossier["claims"] and not dossier["consent_history"]:
        raise HTTPException(status_code=404, detail=f"No personal data found for '{farmer_name}'.")
    return dossier

@router.delete("/my-data/{farmer_name}")
def delete_my_data(farmer_name: str, db: Session = Depends(get_db)):
    """
    DPDP Act Right to Erasure / Purge:
    Anonymizes or permanently removes farmer's personally identifiable data.
    """
    manager = ConsentManager(db)
    result = manager.purge_farmer_personal_data(farmer_name)
    return result

"""
TerraProof Mock Identity Provider
Default adapter for demonstration, testing, and offline classroom evaluation.
Enforces zero raw Aadhaar storage even in mock mode.
"""

import hashlib
from typing import Dict, Any
from app.identity.base import BaseIdentityProvider, KYCVerificationResult

SALT_SECRET = "terraproof_dpdp_identity_salt_v1"

class MockIdentityProvider(BaseIdentityProvider):
    """
    Simulates identity verification for Indian farmers.
    Accepts demo inputs, masks sensitive digits, and returns verifiable KYC results.
    """

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "name": "TerraProof Mock Identity Provider",
            "supported_methods": ["DEMO_AADHAAR", "DEMO_OTP", "DEMO_DIGILOCKER"],
            "privacy_compliance": "DPDP Act 2023 Compliant (Masked + Salted Hash)",
            "is_operational": True,
            "mode": "mock"
        }

    async def verify_credentials(self, payload: Dict[str, Any]) -> KYCVerificationResult:
        method = payload.get("method", "DEMO_AADHAAR")
        farmer_name = payload.get("farmer_name", "Sunita Devi")
        raw_id = str(payload.get("raw_aadhaar") or payload.get("identifier") or "992144321234")

        # Masking: keep only last 4 digits
        last_4 = raw_id[-4:] if len(raw_id) >= 4 else "0000"
        masked_id = f"XXXX-XXXX-{last_4}"

        # Irreversible salted hash
        salted_val = f"{SALT_SECRET}:{raw_id}:{farmer_name.lower().strip()}"
        salted_hash = hashlib.sha256(salted_val.encode("utf-8")).hexdigest()

        return KYCVerificationResult(
            is_verified=True,
            masked_identifier=masked_id,
            salted_hash=salted_hash,
            verification_source="MOCK",
            full_name=farmer_name,
            state=payload.get("state", "Rajasthan"),
            district=payload.get("district", "Alwar"),
            audit_metadata={
                "method_used": method,
                "timestamp": "2026-11-01T00:00:00Z",
                "assurance_level": "Level-2 Mock Verified",
                "raw_pii_stored": False
            }
        )


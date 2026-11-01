"""
TerraProof Identity & Consent Abstraction Layer
Privacy-first identity provider interface complying with India's Digital Personal Data Protection (DPDP) Act.
Zero Raw Aadhaar Storage Policy: Raw 12-digit Aadhaar numbers are never stored in databases, caches, or log outputs.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class KYCVerificationResult(BaseModel):
    is_verified: bool
    masked_identifier: str = Field(..., description="Masked identity reference, e.g. 'XXXX-XXXX-4921' or '+91-98XXXXXX21'")
    salted_hash: str = Field(..., description="Irreversible SHA-256 salted hash for deduplication without storing PII")
    verification_source: str = Field(..., description="Provider source: MOCK, DIGILOCKER, AADHAAR_SECURE_QR, MOBILE_OTP, AGRISTACK")
    full_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    audit_metadata: Dict[str, Any] = Field(default_factory=dict)

class BaseIdentityProvider(ABC):
    """
    Abstract interface for pluggable Indian identity verification adapters.
    Allows testing in Mock mode and dropping in live DigiLocker or UIDAI credentials later.
    """

    @abstractmethod
    async def verify_credentials(self, payload: Dict[str, Any]) -> KYCVerificationResult:
        """Verifies farmer identity credentials while stripping raw identifiers."""
        pass

    @abstractmethod
    def get_provider_metadata(self) -> Dict[str, Any]:
        """Returns provider name, security tier, and operational mode."""
        pass


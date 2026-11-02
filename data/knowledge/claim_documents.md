# Land Documents & Tenancy Verification in Indian Revenue Systems

## 1. Statutory Land Record Types
- **7/12 Extract (Saat-Baara / RoR):** Primary land title extract in western India (Maharashtra, Gujarat) listing ownership, survey numbers, cultivated crops, and encumbrances.
- **Khasra & Khatauni:** Land register in northern/central India (UP, MP, Rajasthan, Haryana, Punjab). The Khasra documents the specific parcel number, soil type, and crop sown; Khatauni documents the proprietary landholder ledger.
- **Jamabandi:** Periodic revenue settlement record in Punjab, Haryana, and Rajasthan recording title ownership, shares, and mortgages.

## 2. Area Reconciliation Hierarchy
When verifying an agricultural insurance claim, area must be harmonized across three data sources:
1. **Document Registered Area:** Legal entitlement recorded in the state land registry.
2. **Submitted Drawn Boundary Area:** User-delineated GIS polygon on the map interface.
3. **Satellite-Observed Damaged Area:** Pixels classified as flooded or stressed within the boundary.

**Core Rule:** Claimed or indemnified area can NEVER exceed the legally registered document area. If a farmer holds title to 3.2 ha but submits a drawn boundary of 7.9 ha, the maximum indemnifiable cap is 3.2 ha, and an area inflation flag is generated.

## 3. Tenancy & Lease Agreement Requirements
- Tenant farmers and sharecroppers (Bataidar) are entitled to PMFBY insurance coverage.
- To claim relief, tenant farmers must provide a registered lease agreement, notarized tenancy declaration, or state land revenue portal endorsement (e.g. Meri Fasal Mera Byora tenant registration).
- If a tenant files a claim without an annexed lease affidavit, the system flags the claim as `NEEDS_TENANCY_REVIEW` for Patwari confirmation.

## 4. Document Tampering & Duplicate Detection
- TerraProof computes SHA-256 cryptographic fingerprints of all uploaded PDFs and images.
- If the exact same document hash is submitted across multiple distinct claimants or disparate land parcels, an automated duplicate collision alert (`FLAGGED_DUPLICATE_OVERLAP`) is raised.

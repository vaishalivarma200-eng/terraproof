import {
  Claim,
  ClaimCreateInput,
  AnalysisJob,
  ProviderStatus,
  SystemHealth,
  GeoJSONGeometry,
} from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.detail || detail;
    } catch {
      detail = errorText || detail;
    }
    throw new Error(detail);
  }
  return response.json();
}

export const api = {
  // Health & Provider Status
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getProviderStatus(): Promise<ProviderStatus> {
    const res = await fetch(`${API_BASE}/provider-status`);
    return handleResponse<ProviderStatus>(res);
  },

  // Agricultural Claims
  async getClaims(statusFilter?: string, damageFilter?: string): Promise<Claim[]> {
    const params = new URLSearchParams();
    if (statusFilter) params.append('claim_status', statusFilter);
    if (damageFilter) params.append('damage_type', damageFilter);
    const res = await fetch(`${API_BASE}/claims?${params.toString()}`);
    return handleResponse<Claim[]>(res);
  },

  async getClaim(id: string): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${id}`);
    return handleResponse<Claim>(res);
  },

  async createClaim(claim: ClaimCreateInput): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    return handleResponse<Claim>(res);
  },

  async reviewClaim(id: string, decision: string, notes: string): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer_decision: decision, reviewer_notes: notes }),
    });
    return handleResponse<Claim>(res);
  },

  // Analyses
  async getAnalyses(): Promise<AnalysisJob[]> {
    const res = await fetch(`${API_BASE}/analyses`);
    return handleResponse<AnalysisJob[]>(res);
  },

  async getAnalysis(id: string): Promise<AnalysisJob> {
    const res = await fetch(`${API_BASE}/analyses/${id}`);
    return handleResponse<AnalysisJob>(res);
  },

  async triggerAnalysis(payload: {
    claim_id?: string;
    analysis_type: string;
    boundary_geojson: GeoJSONGeometry;
    pre_event_date_start: string;
    pre_event_date_end: string;
    post_event_date_start: string;
    post_event_date_end: string;
    max_cloud_cover_percent?: number;
    parameters?: Record<string, any>;
  }): Promise<AnalysisJob> {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<AnalysisJob>(res);
  },

  // Photo EXIF GPS Verification
  async verifyPhoto(photoBase64: string, boundaryGeoJSON: GeoJSONGeometry, filename = 'field_photo.jpg') {
    const res = await fetch(`${API_BASE}/claims/verify-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo_base64: photoBase64,
        boundary_geojson: boundaryGeoJSON,
        filename,
      }),
    });
    return handleResponse<{
      has_gps: boolean;
      latitude?: number;
      longitude?: number;
      capture_time?: string;
      camera_make?: string;
      camera_model?: string;
      is_inside_boundary: boolean;
      distance_to_boundary_meters: number;
      status_label: string;
      explanation: string;
    }>(res);
  },

  // On-ground Adjuster Field Inspections
  async recordInspection(claimId: string, inspection: {
    inspector_name: string;
    inspection_date: string;
    crop_growth_stage: string;
    observed_damage_type: string;
    estimated_ground_damage_percent: number;
    ground_damage_area_ha?: number;
    crop_lodging_observed: boolean;
    submergence_depth_cm?: number;
    inspection_notes: string;
  }): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${claimId}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspection),
    });
    return handleResponse<Claim>(res);
  },

  // Geospatial Geometry Validation
  async validateGeometry(geojson: GeoJSONGeometry) {
    const res = await fetch(`${API_BASE}/geospatial/validate-area`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geojson),
    });
    return handleResponse<{
      is_valid: boolean;
      area_ha: number;
      bbox: { min_lon: number; min_lat: number; max_lon: number; max_lat: number };
      center_lon: number;
      center_lat: number;
      validation_message: string;
    }>(res);
  },

  // --- Phase 7: Identity & DPDP Act API Methods ---
  async verifyKYC(provider: string, payload: Record<string, any>) {
    const res = await fetch(`${API_BASE}/identity/verify-kyc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, payload }),
    });
    return handleResponse<{
      is_verified: boolean;
      masked_identifier: string;
      salted_hash: string;
      verification_source: string;
      full_name?: string;
      state?: string;
      district?: string;
      audit_metadata?: Record<string, any>;
    }>(res);
  },

  async recordConsent(data: {
    farmer_name: string;
    masked_identifier: string;
    purpose?: string;
    retention_period_days?: number;
    agreed_terms: boolean;
  }) {
    const res = await fetch(`${API_BASE}/identity/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async downloadMyData(farmerName: string) {
    const res = await fetch(`${API_BASE}/identity/my-data/${encodeURIComponent(farmerName)}`);
    return handleResponse<any>(res);
  },

  async deleteMyData(farmerName: string) {
    const res = await fetch(`${API_BASE}/identity/my-data/${encodeURIComponent(farmerName)}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(res);
  },

  // --- Phase 7: Land Document OCR & Verification ---
  async verifySampleLandDocument(params: {
    document_text: string;
    document_type?: string;
    claimant_name: string;
    drawn_boundary_ha: number;
    claimed_area_ha: number;
    claim_district?: string;
    tenancy_type?: string;
  }) {
    const res = await fetch(`${API_BASE}/documents/verify-sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<{
      extracted_data: Record<string, any>;
      verification_report: Record<string, any>;
      verification_status: string;
    }>(res);
  },

  async uploadLandDocumentText(params: {
    claim_id: string;
    document_text: string;
    document_type: string;
    filename?: string;
    tenancy_type?: string;
  }) {
    const res = await fetch(`${API_BASE}/documents/upload-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<any>(res);
  },

  async getClaimLandDocuments(claimId: string) {
    const res = await fetch(`${API_BASE}/documents/claim/${claimId}`);
    return handleResponse<any[]>(res);
  },

  // --- Phase 7: Government Interoperability Adapters ---
  async compareWithOfficialData(claimId: string) {
    const res = await fetch(`${API_BASE}/integrations/compare/${claimId}`);
    return handleResponse<any>(res);
  },

  async getDraftGirdawari(claimId: string) {
    const res = await fetch(`${API_BASE}/integrations/girdawari/draft/${claimId}`);
    return handleResponse<any>(res);
  },

  exportGirdawariCsvUrl(claimId: string): string {
    return `${API_BASE}/integrations/girdawari/export-csv/${claimId}`;
  },

  exportPmfbyCsvUrl(claimId: string): string {
    return `${API_BASE}/integrations/pmfby/export-csv/${claimId}`;
  },

  // --- Phase 8: Risk Engine & Land-Use Change ---
  async evaluateClaimRisk(claimId: string) {
    const res = await fetch(`${API_BASE}/risk/claim/${claimId}`);
    return handleResponse<{
      composite_risk_score: number;
      risk_tier: string;
      triage_recommendation: string;
      action_directive: string;
      risk_factors_count: number;
      risk_factors: Array<{
        factor: string;
        score_impact: number;
        severity: string;
        title: string;
        explanation: string;
      }>;
    }>(res);
  },

  async detectLandUseChange(params: {
    claim_id?: string;
    boundary_geojson?: GeoJSONGeometry;
    baseline_date?: string;
    current_date?: string;
  }) {
    const res = await fetch(`${API_BASE}/risk/detect-land-use-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<{
      has_suspected_change: boolean;
      change_classification: string;
      change_description: string;
      change_area_ha: number;
      change_percentage_of_parcel: number;
      total_parcel_area_ha: number;
      confidence_score: number;
      baseline_period: string;
      observation_period: string;
      spectral_evidence: Record<string, any>;
      overlays_geojson: any;
      disclaimer: string;
      inspector_task_directive: string;
    }>(res);
  },

  async checkSpatialOverlap(boundaryGeoJSON: GeoJSONGeometry, excludeClaimId?: string) {
    const res = await fetch(`${API_BASE}/risk/spatial-overlap-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boundary_geojson: boundaryGeoJSON,
        exclude_claim_id: excludeClaimId,
      }),
    });
    return handleResponse<{
      has_overlap: boolean;
      max_overlap_percentage: number;
      overlapping_claims_count: number;
    }>(res);
  },

  async getVillageTriageQueue(district: string, village: string) {
    const res = await fetch(`${API_BASE}/risk/village-triage/${encodeURIComponent(district)}/${encodeURIComponent(village)}`);
    return handleResponse<{
      district: string;
      village: string;
      total_claims: number;
      urgent_audits_count: number;
      triage_queue: any[];
    }>(res);
  },
};


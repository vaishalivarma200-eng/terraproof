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
};


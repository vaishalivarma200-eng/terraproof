export interface BoundingBox {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface Claim {
  id: string;
  reference_no: string;
  farmer_name: string;
  crop_type: string;
  claimed_area_ha: number;
  damage_type: string;
  incident_date_start: string;
  incident_date_end: string;
  latitude: number;
  longitude: number;
  boundary_geojson: GeoJSONGeometry;
  supporting_notes?: string;
  status: 'SUBMITTED' | 'ANALYZING' | 'EVIDENCE_GENERATED' | 'REVIEWED';
  reviewer_decision?: 'APPROVED' | 'PARTIAL' | 'REJECTED' | 'FIELD_INSPECTION';
  reviewer_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimCreateInput {
  reference_no: string;
  farmer_name: string;
  crop_type: string;
  claimed_area_ha: number;
  damage_type: string;
  incident_date_start: string;
  incident_date_end: string;
  boundary_geojson: GeoJSONGeometry;
  supporting_notes?: string;
}

export interface WeatherContext {
  provider: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  total_precipitation_mm: number;
  max_daily_rainfall_mm: number;
  average_soil_moisture_m3_m3?: number;
  daily_timeline?: {
    dates: string[];
    precipitation_mm: number[];
    temperature_max_c: number[];
    temperature_min_c: number[];
  };
}

export interface EvidenceMetrics {
  baseline_index_mean: number;
  post_event_index_mean: number;
  index_delta_mean: number;
  estimated_affected_area_ha: number;
  claimed_area_ha?: number;
  area_discrepancy_percent?: number;
  confidence_score: number;
  confidence_rationale: string;
  weather_context?: WeatherContext;
}

export interface AnalysisResults {
  summary: string;
  verdict_recommendation: string;
  metrics: EvidenceMetrics;
  observations_used: Array<{
    id: string;
    satellite: string;
    datetime: string;
    cloud_cover_percentage?: number;
    thumbnail_url?: string;
    data_provenance: string;
  }>;
  limitations: string[];
  potential_inconsistencies: string[];
  overlays_geojson?: any;
}

export interface AnalysisJob {
  id: string;
  claim_id?: string;
  analysis_type: 'INSURANCE_VERIFICATION' | 'FLOOD_DETECTION' | 'DROUGHT_STRESS' | 'DEFORESTATION_CHANGE';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  execution_mode: 'demo' | 'real';
  parameters: Record<string, any>;
  results?: AnalysisResults;
  report_pdf_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ProviderStatus {
  active_mode: 'demo' | 'real';
  satellite_provider: {
    name: string;
    api_endpoint: string;
    license: string;
    supported_satellites: string[];
    mode: string;
    is_operational: boolean;
    quota_status: string;
  };
  weather_provider: {
    name: string;
    endpoint: string;
    status: string;
    access: string;
  };
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  mode: string;
  database: {
    status: string;
    message: string;
    engine: string;
  };
  storage: {
    status: string;
    output_directory: string;
  };
}


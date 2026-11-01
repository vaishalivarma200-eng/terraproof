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
  state?: string;
  district?: string;
  crop_season?: string;
  cultivated_area_ha?: number;
  claimed_loss_amount?: number;
  sum_insured_per_ha?: number;
  khasra_no?: string;
  khatauni_no?: string;
  tenancy_type?: string;
  masked_aadhaar_ref?: string;
  kyc_status?: string;
  risk_score?: number;
  risk_tier?: string;
  risk_signals?: any;
  land_use_change_flags?: any;
  latitude: number;
  longitude: number;
  boundary_geojson: GeoJSONGeometry;
  supporting_notes?: string;
  field_photos?: Array<{
    url?: string;
    has_gps: boolean;
    latitude?: number;
    longitude?: number;
    capture_time?: string;
    camera_make?: string;
    camera_model?: string;
    status_label?: string;
    distance_to_boundary_meters?: number;
  }>;
  field_inspections?: Array<{
    inspector_name: string;
    inspection_date: string;
    crop_growth_stage: string;
    observed_damage_type: string;
    estimated_ground_damage_percent: number;
    ground_damage_area_ha?: number;
    crop_lodging_observed: boolean;
    submergence_depth_cm?: number;
    inspection_notes: string;
    recorded_at: string;
  }>;
  status: 'SUBMITTED' | 'ANALYZING' | 'EVIDENCE_GENERATED' | 'FIELD_INSPECTION_RECORDED' | 'REVIEWED';
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
  state?: string;
  district?: string;
  crop_season?: string;
  cultivated_area_ha?: number;
  claimed_loss_amount?: number;
  sum_insured_per_ha?: number;
  khasra_no?: string;
  khatauni_no?: string;
  tenancy_type?: string;
  masked_aadhaar_ref?: string;
  kyc_status?: string;
  boundary_geojson: GeoJSONGeometry;
  supporting_notes?: string;
  field_photos?: any[];
}

export interface CompensationScenario {
  sum_insured_per_ha: number;
  assumed_damage_severity_percent: number;
  estimated_affected_area_ha: number;
  claimed_area_ha?: number;
  estimated_scenario_payout_inr: number;
  min_payout_inr?: number;
  max_payout_inr?: number;
  payout_range_formatted?: string;
  uncertainty_margin_percent?: number;
  formula: string;
  disclaimer: string;
}

export interface PhotoVerificationResult {
  has_gps: boolean;
  latitude?: number;
  longitude?: number;
  capture_time?: string;
  camera_make?: string;
  camera_model?: string;
  is_inside_boundary: boolean;
  distance_to_boundary_meters: number;
  status_label: 'INSIDE_BOUNDARY' | 'NEAR_BOUNDARY' | 'OUTSIDE_BOUNDARY' | 'NO_GPS_METADATA' | string;
  explanation: string;
}

export interface FieldInspectionInput {
  inspector_name: string;
  inspection_date: string;
  crop_growth_stage: string;
  observed_damage_type: string;
  estimated_ground_damage_percent: number;
  ground_damage_area_ha?: number;
  crop_lodging_observed: boolean;
  submergence_depth_cm?: number;
  inspection_notes: string;
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
  total_field_area_ha?: number;
  estimated_affected_area_ha: number;
  damaged_area_ha?: number;
  damage_percentage?: number;
  estimated_inundated_area_ha?: number;
  estimated_vegetation_loss_area_ha?: number;
  claimed_area_ha?: number;
  area_discrepancy_percent?: number;
  confidence_score: number;
  confidence_rationale: string;
  confidence_score_100?: number;
  confidence_grade?: string;
  confidence_breakdown?: {
    total_score: number;
    grade: string;
    recommendation: string;
    pillars: Record<string, { score: number; max: number; metric: string }>;
    limitations_disclosed: string[];
  };
  peril_classification?: {
    classified_peril: string;
    confidence: number;
    consistency_with_claim: string;
    spectral_signature: string;
    rationale: string;
    recommended_action: string;
  };
  crop_season_context?: {
    crop_type: string;
    current_season: string;
    phenology_stage: string;
    is_harvest_window: boolean;
    harvest_false_alarm_risk: string;
    advisory_notes: string;
  };
  zoned_damage?: {
    severe_damage_ha: number;
    severe_damage_percent: number;
    moderate_damage_ha: number;
    moderate_damage_percent: number;
    mild_stress_ha: number;
    mild_stress_percent: number;
    healthy_canopy_ha: number;
    healthy_canopy_percent: number;
    dominant_zone: string;
  };
  sensor_fusion_mode?: string;
  weather_context?: WeatherContext;
  compensation_scenario?: CompensationScenario;
}

export interface AnalysisResults {
  summary: string;
  verdict_recommendation: string;
  integrity_hash?: string;
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
  integrity_hash?: string;
  version?: string;
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


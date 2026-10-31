import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Play,
  FileDown,
  UserCheck,
  Calendar,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Camera,
  ClipboardList,
  Calculator,
  Globe2,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';
import { Claim, AnalysisJob, GeoJSONGeometry, PhotoVerificationResult } from '../types';
import { MapViewer } from '../components/MapViewer';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { WeatherCard } from '../components/WeatherCard';
import {
  INDIAN_STATES_DISTRICTS,
  CROP_SEASONS,
  MAJOR_CROPS,
  UI_TRANSLATIONS,
} from '../data/indianAgri';

// Realistic Indian Agricultural Presets (Punjab, Rajasthan, Haryana)
const SAMPLE_PRESETS = [
  {
    name: 'Punjab Rice Plot — Monsoon Overflow (Ludhiana, Kharif, 14.5 ha)',
    state: 'Punjab',
    district: 'Ludhiana',
    season: 'Kharif',
    crop: 'Rice',
    damage: 'Flood',
    cultivatedArea: 16.0,
    claimedArea: 14.5,
    claimedLoss: 175000,
    sumInsured: 38000,
    khasra: '142/2',
    khatauni: '84',
    start: '2026-07-10',
    end: '2026-07-18',
    notes: 'Heavy Sirhind canal breach inundated the northern quadrants of the paddy field for 5 consecutive days.',
    coordinates: [[
      [75.80, 26.90],
      [75.82, 26.90],
      [75.82, 26.92],
      [75.80, 26.92],
      [75.80, 26.90]
    ]]
  },
  {
    name: 'Rajasthan Soybean Plot — Severe Drought (Kota, Kharif, 18.2 ha)',
    state: 'Rajasthan',
    district: 'Kota',
    season: 'Kharif',
    crop: 'Soybean',
    damage: 'Drought',
    cultivatedArea: 20.0,
    claimedArea: 18.2,
    claimedLoss: 220000,
    sumInsured: 42000,
    khasra: '88/1',
    khatauni: '112',
    start: '2026-06-01',
    end: '2026-06-28',
    notes: 'Severe 4-week dry spell resulting in widespread leaf chlorosis, vegetative wilting, and poor pod development.',
    coordinates: [[
      [76.10, 27.20],
      [76.13, 27.20],
      [76.13, 27.23],
      [76.10, 27.23],
      [76.10, 27.20]
    ]]
  },
  {
    name: 'Haryana Wheat Plot — Post-Squall Lodging (Karnal, Rabi, 9.8 ha)',
    state: 'Haryana',
    district: 'Karnal',
    season: 'Rabi',
    crop: 'Wheat',
    damage: 'Hail',
    cultivatedArea: 10.0,
    claimedArea: 9.8,
    claimedLoss: 120000,
    sumInsured: 35000,
    khasra: '203/4',
    khatauni: '49',
    start: '2026-03-12',
    end: '2026-03-14',
    notes: 'Unseasonal hailstorm and high wind gusts caused acute crop lodging during the dough-grain development stage.',
    coordinates: [[
      [76.30, 27.40],
      [76.33, 27.40],
      [76.33, 27.43],
      [76.30, 27.43],
      [76.30, 27.40]
    ]]
  }
];

export const InsurancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('selected');

  // Language state: 'en' | 'hi'
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = UI_TRANSLATIONS[lang];

  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Form State
  const [refNo, setRefNo] = useState(`CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [farmer, setFarmer] = useState('Gurpreet Singh');
  const [selectedState, setSelectedState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [season, setSeason] = useState('Kharif');
  const [crop, setCrop] = useState('Rice');
  const [cultivatedArea, setCultivatedArea] = useState(16.0);
  const [claimedArea, setClaimedArea] = useState(14.5);
  const [claimedLoss, setClaimedLoss] = useState(175000);
  const [sumInsured, setSumInsured] = useState(38000);
  const [khasra, setKhasra] = useState('142/2');
  const [khatauni, setKhatauni] = useState('84');
  const [damageType, setDamageType] = useState('Flood');
  const [startDate, setStartDate] = useState('2026-07-10');
  const [endDate, setEndDate] = useState('2026-07-18');
  const [notes, setNotes] = useState('Heavy Sirhind canal breach inundated paddy field.');
  const [rawGeoJson, setRawGeoJson] = useState(JSON.stringify(SAMPLE_PRESETS[0].coordinates, null, 2));
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Photo Upload & EXIF Verification State
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<PhotoVerificationResult | null>(null);
  const [verifyingPhoto, setVerifyingPhoto] = useState(false);

  // Interactive Compensation Calculator State
  const [simSeverity, setSimSeverity] = useState<number>(80);
  const [simSumInsured, setSimSumInsured] = useState<number>(38000);

  // Reviewer Form State
  const [decision, setDecision] = useState<'APPROVED' | 'PARTIAL' | 'REJECTED' | 'FIELD_INSPECTION'>('APPROVED');
  const [reviewerNotes, setReviewerNotes] = useState('Satellite pre- and post-event spectral differencing corroborates surface inundation across 10.2 hectares.');

  // Field Inspection Form State
  const [inspectorName, setInspectorName] = useState('Rajinder Kumar (Field Adjuster #412)');
  const [inspectionDate, setInspectionDate] = useState('2026-07-20');
  const [growthStage, setGrowthStage] = useState('Vegetative / Tillering');
  const [groundDamageType, setGroundDamageType] = useState('Flood / Standing Water');
  const [groundDamagePct, setGroundDamagePct] = useState(75);
  const [cropLodging, setCropLodging] = useState(true);
  const [waterDepth, setWaterDepth] = useState(28);
  const [inspectionNotes, setInspectionNotes] = useState('Inspected plot boundaries on-site. Found silt deposit and prolonged submergence of root crowns along the northern parcel.');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await api.getClaims();
      setClaims(data);
      if (data.length > 0) {
        const found = selectedId ? data.find((c) => c.id === selectedId) || data[0] : data[0];
        setSelectedClaim(found);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClaim) {
      api.getAnalyses().then((jobs) => {
        const matching = jobs.find((j) => j.claim_id === selectedClaim.id);
        if (matching) {
          setActiveAnalysis(matching);
          if (matching.results?.metrics?.compensation_scenario) {
            setSimSumInsured(matching.results.metrics.compensation_scenario.sum_insured_per_ha);
            setSimSeverity(matching.results.metrics.compensation_scenario.assumed_damage_severity_percent);
          }
        } else {
          setActiveAnalysis(null);
        }
      });
    }
  }, [selectedClaim]);

  const handleSelectPreset = (p: typeof SAMPLE_PRESETS[0]) => {
    setSelectedState(p.state);
    setDistrict(p.district);
    setSeason(p.season);
    setCrop(p.crop);
    setDamageType(p.damage);
    setCultivatedArea(p.cultivatedArea);
    setClaimedArea(p.claimedArea);
    setClaimedLoss(p.claimedLoss);
    setSumInsured(p.sumInsured);
    setKhasra(p.khasra);
    setKhatauni(p.khatauni);
    setStartDate(p.start);
    setEndDate(p.end);
    setNotes(p.notes);
    setRawGeoJson(JSON.stringify(p.coordinates, null, 2));
  };

  const handleCropChange = (selectedCrop: string) => {
    setCrop(selectedCrop);
    const benchmark = MAJOR_CROPS[selectedCrop];
    if (benchmark) {
      setSumInsured(benchmark.benchmarkSumInsured);
      setSeason(benchmark.season);
    }
  };

  // Handle Photo File Upload and live EXIF extraction
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setVerifyingPhoto(true);
      let parsedCoords;
      try {
        parsedCoords = JSON.parse(rawGeoJson);
      } catch {
        setValidationMsg('Please enter valid coordinates before verifying photo.');
        return;
      }

      const boundaryGeom: GeoJSONGeometry = {
        type: 'Polygon',
        coordinates: parsedCoords,
      };

      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = reader.result as string;
        setPhotoBase64(b64);
        try {
          const res = await api.verifyPhoto(b64, boundaryGeom, file.name);
          setPhotoResult(res);
        } catch (err: any) {
          setValidationMsg(`Photo verification failed: ${err.message}`);
        } finally {
          setVerifyingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setValidationMsg(err.message);
      setVerifyingPhoto(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);
    try {
      let parsedCoords;
      try {
        parsedCoords = JSON.parse(rawGeoJson);
      } catch {
        setValidationMsg('Invalid JSON array in coordinates field.');
        return;
      }

      const boundaryGeom: GeoJSONGeometry = {
        type: 'Polygon',
        coordinates: parsedCoords,
      };

      const val = await api.validateGeometry(boundaryGeom);
      if (!val.is_valid) {
        setValidationMsg(`Geometry Error: ${val.validation_message}`);
        return;
      }

      const photosPayload = photoResult ? [{
        has_gps: photoResult.has_gps,
        latitude: photoResult.latitude,
        longitude: photoResult.longitude,
        capture_time: photoResult.capture_time,
        camera_make: photoResult.camera_make,
        camera_model: photoResult.camera_model,
        status_label: photoResult.status_label,
        distance_to_boundary_meters: photoResult.distance_to_boundary_meters,
      }] : [];

      const created = await api.createClaim({
        reference_no: refNo,
        farmer_name: farmer,
        crop_type: crop,
        claimed_area_ha: claimedArea,
        damage_type: damageType,
        incident_date_start: startDate,
        incident_date_end: endDate,
        state: selectedState,
        district,
        crop_season: season,
        cultivated_area_ha: cultivatedArea,
        claimed_loss_amount: claimedLoss,
        sum_insured_per_ha: sumInsured,
        khasra_no: khasra,
        khatauni_no: khatauni,
        boundary_geojson: boundaryGeom,
        supporting_notes: notes,
        field_photos: photosPayload,
      });

      setShowModal(false);
      setClaims([created, ...claims]);
      setSelectedClaim(created);
      setSearchParams({ selected: created.id });
      setPhotoResult(null);
      setPhotoBase64(null);
    } catch (err: any) {
      setValidationMsg(err.message || 'Failed to submit claim.');
    }
  };

  const handleRunVerification = async () => {
    if (!selectedClaim) return;
    try {
      setAnalyzing(true);
      const job = await api.triggerAnalysis({
        claim_id: selectedClaim.id,
        analysis_type: 'INSURANCE_VERIFICATION',
        boundary_geojson: selectedClaim.boundary_geojson,
        pre_event_date_start: selectedClaim.incident_date_start,
        pre_event_date_end: selectedClaim.incident_date_start,
        post_event_date_start: selectedClaim.incident_date_end,
        post_event_date_end: selectedClaim.incident_date_end,
        parameters: {
          crop_type: selectedClaim.crop_type,
          sum_insured_per_ha: selectedClaim.sum_insured_per_ha || 35000,
        }
      });
      setActiveAnalysis(job);
      selectedClaim.status = 'EVIDENCE_GENERATED';
      setClaims([...claims]);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedClaim) return;
    try {
      const updated = await api.reviewClaim(selectedClaim.id, decision, reviewerNotes);
      setSelectedClaim(updated);
      setClaims(claims.map((c) => (c.id === updated.id ? updated : c)));
      setShowReviewModal(false);
    } catch (err: any) {
      alert(`Review submission error: ${err.message}`);
    }
  };

  const handleRecordInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    try {
      const updated = await api.recordInspection(selectedClaim.id, {
        inspector_name: inspectorName,
        inspection_date: inspectionDate,
        crop_growth_stage: growthStage,
        observed_damage_type: groundDamageType,
        estimated_ground_damage_percent: groundDamagePct,
        crop_lodging_observed: cropLodging,
        submergence_depth_cm: waterDepth,
        inspection_notes: inspectionNotes,
      });
      setSelectedClaim(updated);
      setClaims(claims.map((c) => (c.id === updated.id ? updated : c)));
      setShowInspectionModal(false);
    } catch (err: any) {
      alert(`Inspection recording error: ${err.message}`);
    }
  };

  const copyIntegrityHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Calculated Scenario Payout (Real-Time interactive formula)
  const observedHa = activeAnalysis?.results?.metrics?.estimated_affected_area_ha || selectedClaim?.claimed_area_ha || 10.0;
  const interactivePayout = Math.round(simSumInsured * observedHa * (simSeverity / 100.0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Bilingual Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PMFBY Geospatial Decision-Support Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t.claimsTitle}</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Cross-examine reported crop loss with Sentinel-1/2 spectral signatures, Open-Meteo rainfall, and EXIF field photographs.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-400 text-xs text-teal-300 font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'हिन्दी (Hindi)' : 'English (EN)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newClaim}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Split Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Claims List */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Registered Claims ({claims.length})</span>
            <span className="text-[10px] text-slate-400">Select to inspect</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[720px] overflow-y-auto">
            {claims.map((claim) => {
              const isSelected = selectedClaim?.id === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => {
                    setSelectedClaim(claim);
                    setSearchParams({ selected: claim.id });
                  }}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-emerald-400">{claim.reference_no}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      claim.status === 'REVIEWED'
                        ? 'bg-purple-500/10 text-purple-400'
                        : claim.status === 'FIELD_INSPECTION_RECORDED'
                        ? 'bg-sky-500/10 text-sky-400'
                        : claim.status === 'EVIDENCE_GENERATED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {claim.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-200 mt-1">{claim.farmer_name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>{claim.state} ({claim.district || 'Dist'})</span>
                    <span>•</span>
                    <span className="text-emerald-300">{claim.crop_type} ({claim.crop_season || 'Kharif'})</span>
                    <span>•</span>
                    <span>{claim.claimed_area_ha} ha claimed</span>
                  </div>

                  {claim.khasra_no && (
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Khasra: {claim.khasra_no} • Khatauni: {claim.khatauni_no || 'N/A'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Claim Inspection & Verification Engine */}
        <div className="lg:col-span-8 space-y-6">
          {selectedClaim ? (
            <>
              {/* Claim Overview Header Card */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedClaim.reference_no}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedClaim.state || 'India'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {selectedClaim.farmer_name} • {selectedClaim.crop_type} ({selectedClaim.crop_season || 'Season'})
                    </h2>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reported Incident: {selectedClaim.incident_date_start} to {selectedClaim.incident_date_end}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {activeAnalysis?.report_pdf_url && (
                      <a
                        href={activeAnalysis.report_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dossier PDF</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowInspectionModal(true)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                      <span>Field Inspection</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Audit Decision</span>
                    </button>

                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={handleRunVerification}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{analyzing ? 'Analyzing Pixels...' : t.runVerification}</span>
                    </button>
                  </div>
                </div>

                {/* Indian Land Record & Policy Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Location & Land Record</span>
                    <span className="font-semibold text-slate-100 mt-0.5 block">
                      {selectedClaim.district || selectedClaim.state || 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Khasra: {selectedClaim.khasra_no || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Holding & Claimed Area</span>
                    <span className="font-semibold text-slate-100 mt-0.5 block">
                      {selectedClaim.claimed_area_ha} ha claimed
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Cultivated: {selectedClaim.cultivated_area_ha || selectedClaim.claimed_area_ha} ha
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">PMFBY Sum Insured</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block">
                      ₹{selectedClaim.sum_insured_per_ha ? selectedClaim.sum_insured_per_ha.toLocaleString() : '35,000'}/ha
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Claimed Loss: ₹{selectedClaim.claimed_loss_amount ? selectedClaim.claimed_loss_amount.toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Audit Status</span>
                    <span className="font-semibold text-purple-400 mt-0.5 block">
                      {selectedClaim.reviewer_decision || 'Pending Review'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Hazard: {selectedClaim.damage_type}
                    </span>
                  </div>
                </div>

                {/* Photo EXIF Audit Preview if present */}
                {selectedClaim.field_photos && selectedClaim.field_photos.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-teal-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Camera className="w-4 h-4 text-teal-400" />
                      <span>
                        Field Photo GPS: <strong>{selectedClaim.field_photos[0].status_label?.replace(/_/g, ' ')}</strong>
                        {selectedClaim.field_photos[0].distance_to_boundary_meters ? ` (${selectedClaim.field_photos[0].distance_to_boundary_meters}m from boundary)` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-300 font-mono">
                      {selectedClaim.field_photos[0].latitude?.toFixed(4)}, {selectedClaim.field_photos[0].longitude?.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Geospatial Map Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Interactive Satellite Evidence Map
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Green: Field Boundary • Red: Observed Spectral Loss
                  </span>
                </div>

                <MapViewer
                  boundaryGeoJson={selectedClaim.boundary_geojson}
                  overlayGeoJson={activeAnalysis?.results?.overlays_geojson}
                  overlayLayerName="Observed Crop Damage"
                  overlayColor="#ef4444"
                  height="380px"
                />
              </div>

              {/* Satellite Evidence Findings Section */}
              {activeAnalysis && activeAnalysis.results && (
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Forensic Evidence Synthesis</h3>
                    </div>
                    <DiscrepancyBadge verdict={activeAnalysis.results.verdict_recommendation} />
                  </div>

                  {/* Cryptographic SHA-256 Hash Banner */}
                  {activeAnalysis.integrity_hash && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-teal-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-mono text-[11px] text-teal-300 truncate">
                        <span className="text-slate-400 uppercase text-[10px]">SHA-256 Integrity Hash:</span>
                        <span className="truncate">{activeAnalysis.integrity_hash}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyIntegrityHash(activeAnalysis.integrity_hash!)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center space-x-1 shrink-0 ml-2"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
                    {activeAnalysis.results.summary}
                  </p>

                  {/* Four-Area Quantitative Comparison */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Total Field Holding</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">
                        {activeAnalysis.results.metrics.total_field_area_ha || selectedClaim.claimed_area_ha} ha
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Geodesic WGS84</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Claimed Loss Area</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">
                        {selectedClaim.claimed_area_ha} ha
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Farmer declaration</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Observed Affected Area</div>
                      <div className="text-base font-bold text-rose-400 mt-0.5">
                        {activeAnalysis.results.metrics.estimated_affected_area_ha} ha
                      </div>
                      <div className="text-[10px] text-rose-300/80 mt-0.5">Spectral delta</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Area Discrepancy</div>
                      <div className="text-base font-bold text-amber-400 mt-0.5">
                        {activeAnalysis.results.metrics.area_discrepancy_percent ?? 0}%
                      </div>
                      <div className="text-[10px] text-amber-300/80 mt-0.5">|Claimed - Observed|</div>
                    </div>
                  </div>

                  {/* Phase 2: Peril Classification & Sensor Fusion Mode */}
                  {activeAnalysis.results.metrics.peril_classification && (
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Classified Peril:</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                            {activeAnalysis.results.metrics.peril_classification.classified_peril}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            activeAnalysis.results.metrics.peril_classification.consistency_with_claim === 'CONSISTENT'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {activeAnalysis.results.metrics.peril_classification.consistency_with_claim === 'CONSISTENT' ? '✓ Consistent with Claim' : '⚠ Peril Discordance'}
                          </span>
                        </div>
                        {activeAnalysis.results.metrics.sensor_fusion_mode && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                            Sensor: {activeAnalysis.results.metrics.sensor_fusion_mode}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {activeAnalysis.results.metrics.peril_classification.rationale}
                      </p>
                    </div>
                  )}

                  {/* Phase 2: Crop Phenology & Seasonal Harvest Assessment */}
                  {activeAnalysis.results.metrics.crop_season_context && (
                    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Agronomic Season & Phenology Stage</div>
                        <div className="text-slate-200 font-semibold text-xs flex items-center gap-2">
                          <span>{activeAnalysis.results.metrics.crop_season_context.crop_type} ({activeAnalysis.results.metrics.crop_season_context.current_season} Season)</span>
                          <span className="text-emerald-400 text-[11px]">• {activeAnalysis.results.metrics.crop_season_context.phenology_stage}</span>
                        </div>
                      </div>
                      {activeAnalysis.results.metrics.crop_season_context.is_harvest_window && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ⚠ Harvest Window Active (Verification Needed)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Phase 2: Pixel-Level 4-Tier Damage Zoning */}
                  {activeAnalysis.results.metrics.zoned_damage && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Pixel-Level Damage Severity Zoning (10m Resolution)</span>
                        <span className="text-[10px] text-slate-400">Categorized Spatial Mask</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40">
                          <div className="flex items-center space-x-1.5 text-[10px] text-red-300">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>Severe Loss (&gt;50%)</span>
                          </div>
                          <div className="text-sm font-bold text-red-200 mt-1">
                            {activeAnalysis.results.metrics.zoned_damage.severe_damage_ha} ha
                          </div>
                          <div className="text-[10px] text-red-300/70">{activeAnalysis.results.metrics.zoned_damage.severe_damage_percent}% of plot</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/40">
                          <div className="flex items-center space-x-1.5 text-[10px] text-orange-300">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span>Moderate (25-50%)</span>
                          </div>
                          <div className="text-sm font-bold text-orange-200 mt-1">
                            {activeAnalysis.results.metrics.zoned_damage.moderate_damage_ha} ha
                          </div>
                          <div className="text-[10px] text-orange-300/70">{activeAnalysis.results.metrics.zoned_damage.moderate_damage_percent}% of plot</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40">
                          <div className="flex items-center space-x-1.5 text-[10px] text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>Mild Stress (10-25%)</span>
                          </div>
                          <div className="text-sm font-bold text-amber-200 mt-1">
                            {activeAnalysis.results.metrics.zoned_damage.mild_stress_ha} ha
                          </div>
                          <div className="text-[10px] text-amber-300/70">{activeAnalysis.results.metrics.zoned_damage.mild_stress_percent}% of plot</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                          <div className="flex items-center space-x-1.5 text-[10px] text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Healthy Canopy</span>
                          </div>
                          <div className="text-sm font-bold text-emerald-200 mt-1">
                            {activeAnalysis.results.metrics.zoned_damage.healthy_canopy_ha} ha
                          </div>
                          <div className="text-[10px] text-emerald-300/70">{activeAnalysis.results.metrics.zoned_damage.healthy_canopy_percent}% of plot</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phase 2: 5-Pillar Explainable Confidence Breakdown (0-100) */}
                  {activeAnalysis.results.metrics.confidence_breakdown && (
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-teal-500/30 space-y-3 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-teal-400" />
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                            5-Pillar Confidence Score &amp; Limitations Breakdown
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-extrabold text-teal-400">
                            {activeAnalysis.results.metrics.confidence_score_100 ?? Math.round(activeAnalysis.results.metrics.confidence_score * 100)} / 100
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (activeAnalysis.results.metrics.confidence_score_100 || 80) >= 80
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : (activeAnalysis.results.metrics.confidence_score_100 || 80) >= 60
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {activeAnalysis.results.metrics.confidence_grade || 'MODERATE'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                        {Object.entries(activeAnalysis.results.metrics.confidence_breakdown.pillars).map(([key, p]) => (
                          <div key={key} className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex justify-between text-slate-400 text-[10px] capitalize">
                              <span>{key.replace('_', ' ')}</span>
                              <span className="font-bold text-slate-200">{p.score}/{p.max}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-400"
                                style={{ width: `${(p.score / p.max) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">{p.metric}</div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-300 italic pt-1">
                        "{activeAnalysis.results.metrics.confidence_breakdown.recommendation}"
                      </p>
                    </div>
                  )}

                  {/* Interactive PMFBY Compensation Calculator */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/25 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          PMFBY Illustrative Compensation Simulator
                        </h4>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        Interactive Scenario Tool
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      {/* Slider 1: Damage Severity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300 text-[11px]">
                          <span>Assumed Damage Severity:</span>
                          <span className="font-bold text-emerald-400">{simSeverity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={simSeverity}
                          onChange={(e) => setSimSeverity(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <div className="text-[10px] text-slate-400">Loss assessment scale</div>
                      </div>

                      {/* Slider 2: Sum Insured per ha */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300 text-[11px]">
                          <span>Sum Insured / ha:</span>
                          <span className="font-bold text-emerald-400">₹{simSumInsured.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="15000"
                          max="80000"
                          step="1000"
                          value={simSumInsured}
                          onChange={(e) => setSimSumInsured(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <div className="text-[10px] text-slate-400">Notified scheme rate</div>
                      </div>

                      {/* Resulting Payout Box */}
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-center">
                        <div className="text-[10px] text-emerald-300/80 uppercase font-bold">Estimated Scenario Payout</div>
                        <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                          ₹{interactivePayout.toLocaleString()}
                        </div>
                        {activeAnalysis.results.metrics.compensation_scenario?.payout_range_formatted && (
                          <div className="text-[11px] font-semibold text-emerald-300 mt-0.5">
                            Range: {activeAnalysis.results.metrics.compensation_scenario.payout_range_formatted}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          ₹{simSumInsured.toLocaleString()} × {observedHa.toFixed(2)} ha × {simSeverity}%
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      * Disclaimer: This calculation is for decision-support and scenario planning only. Final payout is governed by applicable PMFBY threshold yield rules and survey committee certification.
                    </p>
                  </div>

                  {/* Audit Flags & Inconsistencies */}
                  {activeAnalysis.results.potential_inconsistencies.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Potential Inconsistencies Flagged for Adjuster Review:</span>
                      </div>
                      {activeAnalysis.results.potential_inconsistencies.map((inc, i) => (
                        <p key={i} className="text-amber-200/90 pl-5">• {inc}</p>
                      ))}
                    </div>
                  )}

                  {/* Weather Context Component */}
                  <WeatherCard weather={activeAnalysis.results.metrics.weather_context} />

                  {/* Ground Inspection Findings if recorded */}
                  {selectedClaim.field_inspections && selectedClaim.field_inspections.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-sky-400 font-bold border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5">
                          <ClipboardList className="w-4 h-4" />
                          On-Ground Adjuster Field Report
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Visited: {selectedClaim.field_inspections[0].inspection_date}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                        <div><strong>Adjuster:</strong> {selectedClaim.field_inspections[0].inspector_name}</div>
                        <div><strong>Stage:</strong> {selectedClaim.field_inspections[0].crop_growth_stage}</div>
                        <div><strong>Ground Damage:</strong> {selectedClaim.field_inspections[0].estimated_ground_damage_percent}%</div>
                      </div>
                      <p className="text-slate-400 text-[11px] pt-1">
                        <strong>Notes:</strong> {selectedClaim.field_inspections[0].inspection_notes}
                      </p>
                    </div>
                  )}

                  {/* Limitations Disclosure */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">Methodological Limitations:</span>
                    {activeAnalysis.results.limitations.map((lim, i) => (
                      <p key={i}>• {lim}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-900 text-slate-400 text-xs">
              Select or register a claim to inspect satellite evidence.
            </div>
          )}
        </div>
      </div>

      {/* Claim Registration Modal with Indian Land Records and Photo Upload */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                {t.newClaim} — PMFBY Integrated Form
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Presets Bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">Indian State Presets:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
              {/* Row 1: Reference, Farmer Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Claim Reference</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Insured Farmer Name</label>
                  <input
                    type="text"
                    value={farmer}
                    onChange={(e) => setFarmer(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 2: State, District, Season */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">{t.state}</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      const dists = INDIAN_STATES_DISTRICTS[e.target.value];
                      if (dists && dists.length > 0) setDistrict(dists[0]);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {Object.keys(INDIAN_STATES_DISTRICTS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.district}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {(INDIAN_STATES_DISTRICTS[selectedState] || []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.cropSeason}</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {CROP_SEASONS.map((cs) => (
                      <option key={cs.id} value={cs.id}>{cs.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Crop, Cultivated Area, Claimed Area */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Crop Type</label>
                  <select
                    value={crop}
                    onChange={(e) => handleCropChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    {Object.keys(MAJOR_CROPS).map((cr) => (
                      <option key={cr} value={cr}>{cr} ({MAJOR_CROPS[cr].hindi})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.cultivatedArea}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cultivatedArea}
                    onChange={(e) => setCultivatedArea(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.claimedArea}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={claimedArea}
                    onChange={(e) => setClaimedArea(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 4: Khasra, Khatauni, Sum Insured */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">{t.khasraNo}</label>
                  <input
                    type="text"
                    value={khasra}
                    placeholder="e.g. 142/2"
                    onChange={(e) => setKhasra(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.khatauniNo}</label>
                  <input
                    type="text"
                    value={khatauni}
                    placeholder="e.g. 84"
                    onChange={(e) => setKhatauni(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">{t.sumInsured}</label>
                  <input
                    type="number"
                    step="1000"
                    value={sumInsured}
                    onChange={(e) => setSumInsured(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 5: Hazard and Incident Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Reported Hazard</label>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Flood">Flood / Inundation</option>
                    <option value="Drought">Drought / Heat Stress</option>
                    <option value="Hail">Hailstorm / Squall</option>
                    <option value="Pest">Pest Attack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Incident Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Incident End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              {/* Row 6: Boundary Coordinates */}
              <div>
                <label className="block text-slate-300 mb-1">Boundary Coordinates [ [ [lon, lat], ... ] ]</label>
                <textarea
                  rows={3}
                  value={rawGeoJson}
                  onChange={(e) => setRawGeoJson(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px]"
                />
              </div>

              {/* Row 7: Photo Upload with Live EXIF Geolocation Extraction */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-400" />
                    <span>Upload Field Photograph (EXIF Geolocation Verification)</span>
                  </label>
                  {verifyingPhoto && <span className="text-[10px] text-teal-400 animate-pulse">Extracting GPS...</span>}
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/heic"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-500/20 file:text-teal-300 hover:file:bg-teal-500/30 cursor-pointer"
                />

                {photoResult && (
                  <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                    photoResult.status_label === 'INSIDE_BOUNDARY'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : photoResult.status_label === 'NEAR_BOUNDARY'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : photoResult.status_label === 'OUTSIDE_BOUNDARY'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {photoResult.is_inside_boundary ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{photoResult.status_label.replace(/_/g, ' ')}</span>
                      {photoResult.has_gps && (
                        <span className="font-mono text-[10px] opacity-80">
                          ({photoResult.latitude?.toFixed(4)}, {photoResult.longitude?.toFixed(4)})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{photoResult.explanation}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Supporting Notes & Observation Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              {validationMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {validationMsg}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Register Claim & Validate Geometry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-ground Field Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                Record On-Ground Adjuster Field Inspection
              </h3>
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordInspection} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Adjuster / Surveyor Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Observed Crop Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Seedling / Germination">Seedling / Germination</option>
                    <option value="Vegetative / Tillering">Vegetative / Tillering</option>
                    <option value="Flowering / Heading">Flowering / Heading</option>
                    <option value="Grain Filling / Milking">Grain Filling / Milking</option>
                    <option value="Maturity / Ready to Harvest">Maturity / Ready to Harvest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Ground Damage Type</label>
                  <input
                    type="text"
                    value={groundDamageType}
                    onChange={(e) => setGroundDamageType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Estimated Ground Damage %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={groundDamagePct}
                    onChange={(e) => setGroundDamagePct(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Submergence Water Depth (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={waterDepth}
                    onChange={(e) => setWaterDepth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="lodgingCheck"
                  checked={cropLodging}
                  onChange={(e) => setCropLodging(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-teal-500"
                />
                <label htmlFor="lodgingCheck" className="text-slate-300">
                  Crop Lodging / Flat-falling observed in field
                </label>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Field Observations & Evidence Comparison</label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Commit Field Inspection Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Decision Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-400" />
              {t.humanAuditSignOff}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Audit Determination</label>
                <select
                  value={decision}
                  onChange={(e: any) => setDecision(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                >
                  <option value="APPROVED">APPROVED (Consistent Evidence)</option>
                  <option value="PARTIAL">PARTIAL APPROVAL (Adjusted Area)</option>
                  <option value="FIELD_INSPECTION">FIELD INSPECTION REQUIRED (High Discrepancy)</option>
                  <option value="REJECTED">REJECTED (No Significant Loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Adjuster Justification & Notes</label>
                <textarea
                  rows={4}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Commit Audit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
} from 'lucide-react';
import { api } from '../services/api';
import { Claim, AnalysisJob, GeoJSONGeometry } from '../types';
import { MapViewer } from '../components/MapViewer';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { WeatherCard } from '../components/WeatherCard';
import { MetricCard } from '../components/MetricCard';

// Sample Field Presets for quick student demonstration
const SAMPLE_PRESETS = [
  {
    name: 'Monsoon Flood: Punjab Rice Plot (12.4 ha)',
    crop: 'Rice',
    damage: 'Flood',
    claimedArea: 12.4,
    start: '2026-07-10',
    end: '2026-07-16',
    coordinates: [[
      [75.80, 26.90],
      [75.82, 26.90],
      [75.82, 26.92],
      [75.80, 26.92],
      [75.80, 26.90]
    ]]
  },
  {
    name: 'Drought Desiccation: Rajasthan Soybean (18.0 ha)',
    crop: 'Soybean',
    damage: 'Drought',
    claimedArea: 18.0,
    start: '2026-06-01',
    end: '2026-06-25',
    coordinates: [[
      [76.10, 27.20],
      [76.13, 27.20],
      [76.13, 27.23],
      [76.10, 27.23],
      [76.10, 27.20]
    ]]
  }
];

export const InsurancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('selected');

  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form State
  const [refNo, setRefNo] = useState(`CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [farmer, setFarmer] = useState('Gurpreet Singh');
  const [crop, setCrop] = useState('Rice');
  const [claimedArea, setClaimedArea] = useState(12.4);
  const [damageType, setDamageType] = useState('Flood');
  const [startDate, setStartDate] = useState('2026-07-10');
  const [endDate, setEndDate] = useState('2026-07-16');
  const [notes, setNotes] = useState('Heavy canal breach flooded northern half of field.');
  const [rawGeoJson, setRawGeoJson] = useState(JSON.stringify(SAMPLE_PRESETS[0].coordinates, null, 2));
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Reviewer Form State
  const [decision, setDecision] = useState<'APPROVED' | 'PARTIAL' | 'REJECTED' | 'FIELD_INSPECTION'>('APPROVED');
  const [reviewerNotes, setReviewerNotes] = useState('Satellite pre- and post-event spectral differencing corroborates surface inundation across 10.2 hectares.');

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
      // Find latest analysis if available
      api.getAnalyses().then((jobs) => {
        const matching = jobs.find((j) => j.claim_id === selectedClaim.id);
        if (matching) {
          setActiveAnalysis(matching);
        } else {
          setActiveAnalysis(null);
        }
      });
    }
  }, [selectedClaim]);

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setCrop(preset.crop);
    setDamageType(preset.damage);
    setClaimedArea(preset.claimedArea);
    setStartDate(preset.start);
    setEndDate(preset.end);
    setRawGeoJson(JSON.stringify(preset.coordinates, null, 2));
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

      // Validate geometry
      const val = await api.validateGeometry(boundaryGeom);
      if (!val.is_valid) {
        setValidationMsg(`Geometry Error: ${val.validation_message}`);
        return;
      }

      const created = await api.createClaim({
        reference_no: refNo,
        farmer_name: farmer,
        crop_type: crop,
        claimed_area_ha: claimedArea,
        damage_type: damageType,
        incident_date_start: startDate,
        incident_date_end: endDate,
        boundary_geojson: boundaryGeom,
        supporting_notes: notes,
      });

      setShowModal(false);
      setClaims([created, ...claims]);
      setSelectedClaim(created);
      setSearchParams({ selected: created.id });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Module A • Decision-Support Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agricultural Claim Verification</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Compare reported agricultural losses with pre- and post-incident Sentinel observations and meteorological ground records.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Claim</span>
        </button>
      </div>

      {/* Main Content: Split Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Claims List */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Registered Claims ({claims.length})</span>
            <span className="text-[10px] text-slate-400">Select to inspect</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[640px] overflow-y-auto">
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
                        : claim.status === 'EVIDENCE_GENERATED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-slate-200 mt-1">{claim.farmer_name}</div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                    <span>{claim.crop_type}</span>
                    <span>•</span>
                    <span>{claim.claimed_area_ha} ha claimed</span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{claim.damage_type}</span>
                  </div>
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
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedClaim.reference_no}</span>
                    <h2 className="text-lg font-bold text-white">{selectedClaim.farmer_name} • {selectedClaim.crop_type} Farm</h2>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reported Incident: {selectedClaim.incident_date_start} to {selectedClaim.incident_date_end}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {activeAnalysis?.report_pdf_url && (
                      <a
                        href={activeAnalysis.report_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PDF Report</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Human Audit Decision</span>
                    </button>

                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={handleRunVerification}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{analyzing ? 'Analyzing Pixels...' : 'Run Verification'}</span>
                    </button>
                  </div>
                </div>

                {/* Claim Key Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Reported Hazard</span>
                    <span className="font-semibold text-slate-100 mt-0.5 block">{selectedClaim.damage_type}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Claimed Loss Area</span>
                    <span className="font-semibold text-slate-100 mt-0.5 block">{selectedClaim.claimed_area_ha} ha</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Field Centroid</span>
                    <span className="font-mono text-[11px] text-slate-300 mt-0.5 block">
                      {selectedClaim.latitude.toFixed(4)}, {selectedClaim.longitude.toFixed(4)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Review Decision</span>
                    <span className="font-semibold text-purple-400 mt-0.5 block">
                      {selectedClaim.reviewer_decision || 'Pending Auditor'}
                    </span>
                  </div>
                </div>

                {selectedClaim.supporting_notes && (
                  <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-300">Farmer Notes:</strong> {selectedClaim.supporting_notes}
                  </p>
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
                    Green: Field Boundary • Red: Observed Spectral Damage
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
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Forensic Evidence Synthesis</h3>
                    </div>
                    <DiscrepancyBadge verdict={activeAnalysis.results.verdict_recommendation} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
                    {activeAnalysis.results.summary}
                  </p>

                  {/* Quantitative Comparison Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Claimed Area</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">
                        {selectedClaim.claimed_area_ha} ha
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Observed Loss Area</div>
                      <div className="text-base font-bold text-rose-400 mt-0.5">
                        {activeAnalysis.results.metrics.estimated_affected_area_ha} ha
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Discrepancy Ratio</div>
                      <div className="text-base font-bold text-amber-400 mt-0.5">
                        {activeAnalysis.results.metrics.area_discrepancy_percent ?? 0}%
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Confidence Score</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {Math.round(activeAnalysis.results.metrics.confidence_score * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Audit Flags & Inconsistencies */}
                  {activeAnalysis.results.potential_inconsistencies.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Potential Inconsistencies Requiring Field Audit:</span>
                      </div>
                      {activeAnalysis.results.potential_inconsistencies.map((inc, i) => (
                        <p key={i} className="text-amber-200/90 pl-5">• {inc}</p>
                      ))}
                    </div>
                  )}

                  {/* Weather Context */}
                  <WeatherCard weather={activeAnalysis.results.metrics.weather_context} />

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

      {/* Claim Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Register Agricultural Loss Claim
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
              <span className="text-[11px] font-medium text-slate-400">Quick Test Presets:</span>
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
                  <label className="block text-slate-300 mb-1">Insured Farmer</label>
                  <input
                    type="text"
                    value={farmer}
                    onChange={(e) => setFarmer(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Crop Type</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Claimed Area (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={claimedArea}
                    onChange={(e) => setClaimedArea(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Reported Hazard</label>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Flood">Flood / Inundation</option>
                    <option value="Drought">Drought / Heat Stress</option>
                    <option value="Hail">Hailstorm Loss</option>
                    <option value="Pest">Pest Outbreak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block text-slate-300 mb-1">Boundary Coordinates [ [ [lon, lat], ... ] ]</label>
                <textarea
                  rows={4}
                  value={rawGeoJson}
                  onChange={(e) => setRawGeoJson(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px]"
                />
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
                  Submit & Validate Boundary
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
              Human Auditor Decision Sign-off
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

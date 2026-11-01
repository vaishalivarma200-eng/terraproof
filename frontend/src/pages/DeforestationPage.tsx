import React, { useState } from 'react';
import { Trees, Play, FileDown, Layers } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisJob, GeoJSONGeometry } from '../types';
import { MapViewer } from '../components/MapViewer';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { MetricCard } from '../components/MetricCard';

const SAMPLE_FOREST_AREA = [[
  [76.30, 27.40],
  [76.35, 27.40],
  [76.35, 27.45],
  [76.30, 27.45],
  [76.30, 27.40]
]];

export const DeforestationPage: React.FC = () => {
  const [t1Date, setT1Date] = useState('2025-10-15');
  const [t2Date, setT2Date] = useState('2026-04-20');
  const [rawCoords, setRawCoords] = useState(JSON.stringify(SAMPLE_FOREST_AREA, null, 2));
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null);

  const handleRunChangeDetection = async () => {
    try {
      setAnalyzing(true);
      const coords = JSON.parse(rawCoords);
      const geom: GeoJSONGeometry = { type: 'Polygon', coordinates: coords };

      const job = await api.triggerAnalysis({
        analysis_type: 'DEFORESTATION_CHANGE',
        boundary_geojson: geom,
        pre_event_date_start: t1Date,
        pre_event_date_end: t1Date,
        post_event_date_start: t2Date,
        post_event_date_end: t2Date,
      });

      setAnalysis(job);
    } catch (err: any) {
      alert(`Canopy change analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs text-teal-400 font-semibold mb-1">
            <Trees className="w-4 h-4" />
            <span>Module D • Bi-Temporal Optical Differencing</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Deforestation & Land-Cover Change</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Quantifies severe canopy removal and conversion to bare soil over time. Notes harvest vs deforestation distinctions.
          </p>
        </div>

        {analysis?.report_pdf_url && (
          <a
            href={analysis.report_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 text-teal-400" />
            <span>Download Canopy Loss PDF Dossier</span>
          </a>
        )}
      </div>

      {/* Inputs */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Bi-Temporal Comparison Dates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Epoch T1 (Intact Forest Baseline)</label>
            <input
              type="date"
              value={t1Date}
              onChange={(e) => setT1Date(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Epoch T2 (Recent Observation)</label>
            <input
              type="date"
              value={t2Date}
              onChange={(e) => setT2Date(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunChangeDetection}
              disabled={analyzing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/40 border border-emerald-500/30 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{analyzing ? 'Detecting Canopy Clearance...' : 'Run Change Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {analysis && analysis.results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Estimated Canopy Loss"
              value={`${analysis.results.metrics.estimated_affected_area_ha} ha`}
              subValue="Converted from dense forest to exposed soil"
              variant="rose"
            />
            <MetricCard
              label="T1 Baseline NDVI"
              value={analysis.results.metrics.baseline_index_mean}
              subValue="Dense forest canopy"
              variant="emerald"
            />
            <MetricCard
              label="T2 Recent NDVI"
              value={analysis.results.metrics.post_event_index_mean}
              subValue="Post-clearance reflectance"
              variant="default"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Detected Canopy Removal Overlay
              </span>
              <DiscrepancyBadge verdict={analysis.results.verdict_recommendation} />
            </div>

            <MapViewer
              boundaryGeoJson={analysis.parameters.boundary_geojson}
              overlayGeoJson={analysis.results.overlays_geojson}
              overlayLayerName="Detected Canopy Loss"
              overlayColor="#f43f5e"
              height="400px"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Land-Cover Change Caveats:</span>
            {analysis.results.limitations.map((lim, i) => (
              <p key={i}>• {lim}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


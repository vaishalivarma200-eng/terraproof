import React, { useState } from 'react';
import { Droplets, Play, FileDown, Layers, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisJob, GeoJSONGeometry } from '../types';
import { MapViewer } from '../components/MapViewer';
import { WeatherCard } from '../components/WeatherCard';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { MetricCard } from '../components/MetricCard';

const SAMPLE_FLOOD_AREA = [[
  [75.75, 26.85],
  [75.80, 26.85],
  [75.80, 26.90],
  [75.75, 26.90],
  [75.75, 26.85]
]];

export const FloodPage: React.FC = () => {
  const [preDate, setPreDate] = useState('2026-07-01');
  const [postDate, setPostDate] = useState('2026-07-16');
  const [rawCoords, setRawCoords] = useState(JSON.stringify(SAMPLE_FLOOD_AREA, null, 2));
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null);

  const handleRunFloodDetection = async () => {
    try {
      setAnalyzing(true);
      const coords = JSON.parse(rawCoords);
      const geom: GeoJSONGeometry = { type: 'Polygon', coordinates: coords };

      const job = await api.triggerAnalysis({
        analysis_type: 'FLOOD_DETECTION',
        boundary_geojson: geom,
        pre_event_date_start: preDate,
        pre_event_date_end: preDate,
        post_event_date_start: postDate,
        post_event_date_end: postDate,
      });

      setAnalysis(job);
    } catch (err: any) {
      alert(`Flood detection failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs text-sky-400 font-semibold mb-1">
            <Droplets className="w-4 h-4" />
            <span>Module B • Multi-Spectral & SAR Delineation</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Flood Inundation & Surface Water Monitoring</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Delineates active flood extent using Sentinel-2 McFeeters NDWI and Sentinel-1 synthetic aperture radar backscatter contrast.
          </p>
        </div>

        {analysis?.report_pdf_url && (
          <a
            href={analysis.report_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span>Download Flood PDF Dossier</span>
          </a>
        )}
      </div>

      {/* Inputs Bar */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Study Area & Acquisition Windows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Pre-Event Baseline Date</label>
            <input
              type="date"
              value={preDate}
              onChange={(e) => setPreDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Post-Flood Event Date</label>
            <input
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunFloodDetection}
              disabled={analyzing}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{analyzing ? 'Processing Radar & NDWI...' : 'Run Flood Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {analysis && analysis.results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Inundated Area"
              value={`${analysis.results.metrics.estimated_affected_area_ha} ha`}
              subValue="Classified surface water extent"
              variant="blue"
            />
            <MetricCard
              label="Baseline Mean NDWI"
              value={analysis.results.metrics.baseline_index_mean}
              subValue="Pre-flood dry canopy state"
              variant="default"
            />
            <MetricCard
              label="Post-Event Mean NDWI"
              value={analysis.results.metrics.post_event_index_mean}
              subValue="Post-flood open water response"
              variant="emerald"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Active Flood Inundation Overlay
              </span>
              <DiscrepancyBadge verdict={analysis.results.verdict_recommendation} />
            </div>

            <MapViewer
              boundaryGeoJson={analysis.parameters.boundary_geojson}
              overlayGeoJson={analysis.results.overlays_geojson}
              overlayLayerName="Detected Inundated Area"
              overlayColor="#38bdf8"
              height="400px"
            />
          </div>

          <WeatherCard weather={analysis.results.metrics.weather_context} />

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Radar & Optical Limitations:</span>
            {analysis.results.limitations.map((lim, i) => (
              <p key={i}>• {lim}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

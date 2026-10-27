import React, { useState } from 'react';
import { SunMedium, Play, FileDown, Layers } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisJob, GeoJSONGeometry } from '../types';
import { MapViewer } from '../components/MapViewer';
import { WeatherCard } from '../components/WeatherCard';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { MetricCard } from '../components/MetricCard';

const SAMPLE_DROUGHT_AREA = [[
  [76.10, 27.20],
  [76.15, 27.20],
  [76.15, 27.25],
  [76.10, 27.25],
  [76.10, 27.20]
]];

export const DroughtPage: React.FC = () => {
  const [baseDate, setBaseDate] = useState('2026-05-15');
  const [currentDate, setCurrentDate] = useState('2026-07-20');
  const [rawCoords, setRawCoords] = useState(JSON.stringify(SAMPLE_DROUGHT_AREA, null, 2));
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null);

  const handleRunDroughtAnalysis = async () => {
    try {
      setAnalyzing(true);
      const coords = JSON.parse(rawCoords);
      const geom: GeoJSONGeometry = { type: 'Polygon', coordinates: coords };

      const job = await api.triggerAnalysis({
        analysis_type: 'DROUGHT_STRESS',
        boundary_geojson: geom,
        pre_event_date_start: baseDate,
        pre_event_date_end: baseDate,
        post_event_date_start: currentDate,
        post_event_date_end: currentDate,
      });

      setAnalysis(job);
    } catch (err: any) {
      alert(`Drought analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs text-amber-400 font-semibold mb-1">
            <SunMedium className="w-4 h-4" />
            <span>Module C • Canopy Greenness & Soil Moisture</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Drought & Crop-Stress Monitoring</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Evaluates NDVI vegetation stress anomalies correlated with precipitation deficits and root-zone soil moisture.
          </p>
        </div>

        {analysis?.report_pdf_url && (
          <a
            href={analysis.report_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Download Drought PDF Dossier</span>
          </a>
        )}
      </div>

      {/* Input Form */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Baseline & Target Window</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Baseline Vegetated Date</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Current Observation Date</label>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunDroughtAnalysis}
              disabled={analyzing}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{analyzing ? 'Computing NDVI Anomalies...' : 'Run Stress Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {analysis && analysis.results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Stressed Area"
              value={`${analysis.results.metrics.estimated_affected_area_ha} ha`}
              subValue="Classified severe NDVI drop"
              variant="amber"
            />
            <MetricCard
              label="Baseline Mean NDVI"
              value={analysis.results.metrics.baseline_index_mean}
              subValue="Healthy canopy greenness"
              variant="emerald"
            />
            <MetricCard
              label="Current Mean NDVI"
              value={analysis.results.metrics.post_event_index_mean}
              subValue="Post-desiccation greenness"
              variant="rose"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Vegetation Stress Anomaly Overlay
              </span>
              <DiscrepancyBadge verdict={analysis.results.verdict_recommendation} />
            </div>

            <MapViewer
              boundaryGeoJson={analysis.parameters.boundary_geojson}
              overlayGeoJson={analysis.results.overlays_geojson}
              overlayLayerName="Detected Crop Stress Zone"
              overlayColor="#f59e0b"
              height="400px"
            />
          </div>

          <WeatherCard weather={analysis.results.metrics.weather_context} />

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Drought & Greenness Caveats:</span>
            {analysis.results.limitations.map((lim, i) => (
              <p key={i}>• {lim}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

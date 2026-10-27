import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  FileDown,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Satellite,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisJob } from '../types';
import { MapViewer } from '../components/MapViewer';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';
import { MetricCard } from '../components/MetricCard';
import { WeatherCard } from '../components/WeatherCard';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getAnalysis(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading analysis dossier...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Analysis Job Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not locate the requested dossier record.'}</p>
        <Link to="/overview" className="inline-block text-xs text-emerald-400 hover:underline">
          Return to Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Back */}
      <Link
        to="/overview"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Operations Overview</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono mb-1">
            <span>Dossier ID: {job.id}</span>
            <span>•</span>
            <span className="uppercase">{job.execution_mode} MODE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {job.analysis_type.replace(/_/g, ' ')}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Compiled at {new Date(job.created_at).toLocaleString()} UTC
          </p>
        </div>

        {job.report_pdf_url && (
          <a
            href={job.report_pdf_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <FileDown className="w-4 h-4 fill-current" />
            <span>Download Certified PDF Dossier</span>
          </a>
        )}
      </div>

      {job.results && (
        <div className="space-y-6">
          {/* Executive Verdict Banner */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">Forensic Consistency Assessment</span>
              <p className="text-sm font-medium text-slate-100">{job.results.summary}</p>
            </div>
            <DiscrepancyBadge verdict={job.results.verdict_recommendation} />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              label="Estimated Loss Area"
              value={`${job.results.metrics.estimated_affected_area_ha} ha`}
              subValue="Classified damage zone"
              variant="rose"
            />
            <MetricCard
              label="Confidence Level"
              value={`${Math.round(job.results.metrics.confidence_score * 100)}%`}
              subValue={job.results.metrics.confidence_rationale}
              variant="emerald"
            />
            <MetricCard
              label="Baseline Index Mean"
              value={job.results.metrics.baseline_index_mean}
              subValue="Pre-event radiometric state"
              variant="default"
            />
            <MetricCard
              label="Index Difference"
              value={job.results.metrics.index_delta_mean}
              subValue="Spectral divergence magnitude"
              variant="amber"
            />
          </div>

          {/* Map Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Satellite Change Detection Vector Layer
              </span>
              <span className="text-slate-400 text-[11px]">Dynamic GeoJSON Polygonization</span>
            </div>

            <MapViewer
              boundaryGeoJson={job.parameters.boundary_geojson}
              overlayGeoJson={job.results.overlays_geojson}
              overlayLayerName="Classified Loss Extent"
              overlayColor="#ef4444"
              height="420px"
            />
          </div>

          {/* Weather Context */}
          {job.results.metrics.weather_context && (
            <WeatherCard weather={job.results.metrics.weather_context} />
          )}

          {/* Audit Flags */}
          {job.results.potential_inconsistencies.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Audit Discrepancies Requiring Field Review:</span>
              </div>
              {job.results.potential_inconsistencies.map((inc, i) => (
                <p key={i} className="text-amber-200/90 pl-5">• {inc}</p>
              ))}
            </div>
          )}

          {/* Observations Used */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-emerald-400" />
              <span>Satellite Scene Provenance & Quality</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-2">Scene Identifier</th>
                    <th className="py-2">Sensor</th>
                    <th className="py-2">Acquisition Timestamp</th>
                    <th className="py-2">Cloud Cover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {job.results.observations_used.map((obs, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-emerald-400">{obs.id}</td>
                      <td className="py-2 text-slate-300">{obs.satellite}</td>
                      <td className="py-2 text-slate-400">{obs.datetime}</td>
                      <td className="py-2 text-slate-300">{obs.cloud_cover_percentage ?? 'N/A'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


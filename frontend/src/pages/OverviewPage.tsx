import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Droplets,
  SunMedium,
  Trees,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Database,
  Cloud,
  Satellite,
} from 'lucide-react';
import { api } from '../services/api';
import { Claim, AnalysisJob, ProviderStatus, SystemHealth } from '../types';
import { MetricCard } from '../components/MetricCard';
import { DiscrepancyBadge } from '../components/DiscrepancyBadge';

export const OverviewPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisJob[]>([]);
  const [provider, setProvider] = useState<ProviderStatus | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getClaims(),
      api.getAnalyses(),
      api.getProviderStatus(),
      api.getHealth(),
    ])
      .then(([c, a, p, h]) => {
        setClaims(c);
        setAnalyses(a);
        setProvider(p);
        setHealth(h);
      })
      .catch((err) => console.error('Error loading dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalClaims = claims.length;
  const verifiedClaims = claims.filter((c) => c.status === 'REVIEWED' || c.status === 'EVIDENCE_GENERATED').length;
  const pendingReview = claims.filter((c) => c.status === 'SUBMITTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">Geospatial Operations Overview</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time pipeline monitoring, provider connectivity status, and submitted agricultural loss claims.
          </p>
        </div>

        <Link
          to="/claims"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 border border-emerald-500/30 transition-all self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>New Claim Verification</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Registered Claims"
          value={totalClaims}
          subValue="Agricultural fields in database"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          label="Evidence Dossiers"
          value={verifiedClaims}
          subValue="Spectral analyses generated"
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          label="Pending Audit"
          value={pendingReview}
          subValue="Awaiting human reviewer sign-off"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          label="Satellite Mode"
          value={provider?.active_mode === 'real' ? 'LIVE STAC' : 'DEMO MODE'}
          subValue={provider?.satellite_provider.name ?? 'Connecting...'}
          icon={Satellite}
          variant="blue"
        />
      </div>

      {/* Provider Connectivity & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-200 text-sm font-semibold border-b border-slate-800 pb-2">
            <Satellite className="w-4 h-4 text-emerald-400" />
            <span>Earth Observation Provider</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Provider:</span>
              <span className="font-medium text-slate-200">{provider?.satellite_provider.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoint:</span>
              <span className="font-mono text-[11px] text-slate-300">{provider?.satellite_provider.api_endpoint}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sensors Supported:</span>
              <span className="text-emerald-400 text-right">Sentinel-2 (MSI), Sentinel-1 (SAR)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Catalog Access:</span>
              <span className="text-slate-200">{provider?.satellite_provider.quota_status}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-200 text-sm font-semibold border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Engine & Storage Health</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Core Service:</span>
              <span className="font-medium text-emerald-400">Operational ({health?.version})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-slate-200">{health?.database.engine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Weather Provider:</span>
              <span className="text-sky-400">{provider?.weather_provider.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dossier Storage:</span>
              <span className="text-slate-300 font-mono text-[11px]">{health?.storage.output_directory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Analytical Workflows */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white tracking-tight">Active Analytical Pipelines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/claims"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-100 group-hover:text-emerald-400">
                  Insurance Claim
                </div>
                <div className="text-[11px] text-slate-400">Multi-index loss review</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            to="/flood"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-sky-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-100 group-hover:text-sky-400">
                  Flood Detection
                </div>
                <div className="text-[11px] text-slate-400">NDWI & SAR inundation</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </Link>

          <Link
            to="/drought"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <SunMedium className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-100 group-hover:text-amber-400">
                  Drought Stress
                </div>
                <div className="text-[11px] text-slate-400">Canopy greenness & soil</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            to="/deforestation"
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-100 group-hover:text-teal-400">
                  Land-Cover Change
                </div>
                <div className="text-[11px] text-slate-400">Bi-temporal tree loss</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Recent Claims Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">Recent Claims in Pipeline</h2>
          <Link to="/claims" className="text-xs text-emerald-400 hover:underline">
            View all ({claims.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading registered claims...</div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/40 text-slate-400 text-xs space-y-2">
            <p>No agricultural claims registered yet.</p>
            <Link to="/claims" className="text-emerald-400 hover:underline inline-block">
              Submit the first claim to begin analysis →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Claim Ref</th>
                  <th className="py-3 px-4">Insured Farmer</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Claimed Area</th>
                  <th className="py-3 px-4">Reported Hazard</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {claims.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">{c.reference_no}</td>
                    <td className="py-3 px-4 text-slate-200">{c.farmer_name}</td>
                    <td className="py-3 px-4">{c.crop_type}</td>
                    <td className="py-3 px-4 font-medium">{c.claimed_area_ha} ha</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                        {c.damage_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'REVIEWED'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : c.status === 'EVIDENCE_GENERATED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/claims?selected=${c.id}`}
                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


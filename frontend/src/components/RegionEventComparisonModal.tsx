import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Calendar,
  MapPin,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  FileText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { MapViewer } from './MapViewer';

interface RegionEventComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClaim?: (claimRef: string) => void;
  onOpenSimulator?: () => void;
}

export const RegionEventComparisonModal: React.FC<RegionEventComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectClaim,
  onOpenSimulator,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<'NEWLY_FLOODED' | 'CROPLAND' | 'BUILTUP' | 'ROADS'>('NEWLY_FLOODED');
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100 for before/after swipe
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Morigaon');

  useEffect(() => {
    if (isOpen) {
      loadAssamDemo();
    }
  }, [isOpen]);

  const loadAssamDemo = async () => {
    setLoading(true);
    try {
      const res = await api.getAssamFloodDemo();
      setData(res);
    } catch (e) {
      console.error('Failed to load Assam flood demo:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentOverlay =
    activeLayer === 'CROPLAND'
      ? data?.cropland_mask_geojson
      : activeLayer === 'BUILTUP'
      ? data?.builtup_mask_geojson
      : activeLayer === 'ROADS'
      ? data?.roads_mask_geojson
      : data?.change_mask_geojson;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {data?.event_title || 'Regional Flood Event Comparison'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OFFLINE DEMO BENCHMARK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Copernicus Sentinel-1 SAR & Sentinel-2 MSI Multi-Sensor Evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={api.getExportFloodStatisticsCsvUrl()}
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
              title="Download District Statistics CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Plain-Language Narrative Summary */}
          {data && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start space-x-3">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Regional Event Overview: </strong>
                {data.summary_text}
              </div>
            </div>
          )}

          {/* Core Metric Highlights */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Flooded Area</span>
                <div className="text-xl font-bold text-sky-400 mt-1">
                  {data.total_flooded_ha.toLocaleString()} ha
                </div>
                <span className="text-[10px] text-slate-400">6 Brahmaputra districts</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[11px] text-slate-400">Cropland Submerged</span>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {data.total_cropland_affected_ha.toLocaleString()} ha
                </div>
                <span className="text-[10px] text-amber-300/80">Sali paddy standing crop</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[11px] text-slate-400">Rural Roads Impassable</span>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {data.total_roads_affected_km} km
                </div>
                <span className="text-[10px] text-slate-400">PWD & PMGSY networks</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[11px] text-slate-400">ASDMA Report Match</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {data.asdma_validation?.overall_satellite_concordance_rate_pct}%
                </div>
                <span className="text-[10px] text-emerald-300/80">State bulletin alignment</span>
              </div>
            </div>
          )}

          {/* Map Viewer with Swipe / Layer Toggles */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-400">Layer Overlays:</span>
                <button
                  onClick={() => setActiveLayer('NEWLY_FLOODED')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    activeLayer === 'NEWLY_FLOODED'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Newly Flooded Mask
                </button>
                <button
                  onClick={() => setActiveLayer('CROPLAND')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    activeLayer === 'CROPLAND'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Submerged Cropland
                </button>
                <button
                  onClick={() => setActiveLayer('BUILTUP')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    activeLayer === 'BUILTUP'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Settlement Enclaves
                </button>
                <button
                  onClick={() => setActiveLayer('ROADS')}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                    activeLayer === 'ROADS'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Road Networks
                </button>
              </div>

              {/* Data Source Badge */}
              <div className="flex items-center space-x-1.5 text-[10px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Sensor: Sentinel-1 C-SAR IW GRD (10m) • Date: 2024-07-06 • Copernicus CDSE</span>
              </div>
            </div>

            {/* Interactive Before/After Swipe Slider Bar */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
              <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap">
                Before: 20 June (Pre-Flood Sentinel-2)
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-sky-400 whitespace-nowrap">
                Peak: 06 July (SAR Flood Mask)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                {sliderPos}% Post
              </span>
            </div>

            {/* Map Canvas */}
            <MapViewer
              center={[26.25, 92.15]}
              zoom={10}
              height="380px"
              overlayGeoJson={currentOverlay}
              overlayLayerName={
                activeLayer === 'CROPLAND'
                  ? 'Submerged Paddy Cropland'
                  : activeLayer === 'BUILTUP'
                  ? 'Submerged Settlements'
                  : activeLayer === 'ROADS'
                  ? 'Submerged Roads'
                  : 'Newly Inundated Floodplain'
              }
              overlayColor={
                activeLayer === 'CROPLAND'
                  ? '#eab308'
                  : activeLayer === 'BUILTUP'
                  ? '#ef4444'
                  : activeLayer === 'ROADS'
                  ? '#f97316'
                  : '#3b82f6'
              }
            />
          </div>

          {/* District Breakdown Table & ASDMA Validation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                <span>District & Circle Flood Extent Table</span>
                <span className="text-[10px] font-normal text-slate-400">Ranked by inundated acreage</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-2">District</th>
                      <th className="py-2 px-2">Revenue Circles</th>
                      <th className="py-2 px-2 text-right">Flooded (ha)</th>
                      <th className="py-2 px-2 text-right">Cropland (ha)</th>
                      <th className="py-2 px-2 text-right">Roads (km)</th>
                      <th className="py-2 px-2 text-center">Agreement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {data?.district_breakdown?.map((d: any) => (
                      <tr
                        key={d.district}
                        className={`hover:bg-slate-800/40 cursor-pointer ${
                          selectedDistrict === d.district ? 'bg-slate-800/60 text-white' : ''
                        }`}
                        onClick={() => setSelectedDistrict(d.district)}
                      >
                        <td className="py-2.5 px-2 font-semibold text-white">{d.district}</td>
                        <td className="py-2.5 px-2 text-[11px] text-slate-400">{d.circle_name}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-sky-400">
                          {d.flooded_ha.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-amber-400">
                          {d.cropland_affected_ha.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-rose-400">
                          {d.roads_affected_km}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            {d.satellite_agreement_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ASDMA Official Validation Panel */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ASDMA Ground Validation</span>
              </h4>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                <strong>Verdict: </strong>
                {data?.asdma_validation?.validation_verdict}
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Official Bulletin:</span>
                  <span className="font-medium text-white">{data?.asdma_validation?.source?.split('(')[0]}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Reported Affected Pop:</span>
                  <span className="font-semibold text-amber-300">
                    {data?.asdma_validation?.total_human_population_affected?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Active Relief Camps:</span>
                  <span className="font-semibold text-white">
                    {data?.asdma_validation?.relief_camps_operational} camps
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Concordance Rate:</span>
                  <span className="font-bold text-emerald-400">
                    {data?.asdma_validation?.overall_satellite_concordance_rate_pct}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-400 border border-slate-800">
                <span className="text-slate-300 font-semibold">Insight: </span>
                {data?.asdma_validation?.discrepancy_explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400">
            Source: Copernicus Sentinel-1 C-SAR & Sentinel-2 MSI • ASDMA 2024 Archive
          </span>

          <div className="flex items-center space-x-3">
            {onOpenSimulator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSimulator();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Scenarios on this Basin</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


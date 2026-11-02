import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ShieldCheck,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { api } from '../services/api';
import { MapViewer } from './MapViewer';

interface WhatIfScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskTerraGuide?: (question: string) => void;
}

export const WhatIfScenarioSimulatorModal: React.FC<WhatIfScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAskTerraGuide,
}) => {
  const [scenarioType, setScenarioType] = useState<string>('RIVER_STAGE_RISE');
  const [waterRise, setWaterRise] = useState<number>(2.5);
  const [rainfallMm, setRainfallMm] = useState<number>(180);
  const [breachWidth, setBreachWidth] = useState<number>(75);
  const [reservoirFrl, setReservoirFrl] = useState<number>(86.5);
  const [builtupPct, setBuiltupPct] = useState<number>(25);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      handleRunSimulation();
    }
  }, [isOpen, scenarioType]);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runScenarioSimulation({
        scenario_type: scenarioType,
        water_level_rise_m: waterRise,
        rainfall_mm: rainfallMm,
        breach_width_m: breachWidth,
        full_reservoir_level_m: reservoirFrl,
        builtup_expansion_pct: builtupPct,
      });
      setResult(res);
    } catch (e) {
      console.error('Simulation run failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  What-If Inundation Scenario Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  INDICATIVE PLANNING MODEL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Copernicus DEM 30m Flood-Fill & SCS-CN Hydrologic Modeling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Scientific Disclaimer Banner */}
        <div className="bg-amber-950/20 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-300 flex items-center space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Scientific Disclaimer: </span>
            {result?.disclaimer || 'Indicative scenario, not a certified hydraulic design forecast.'}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Scenario Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <button
              onClick={() => setScenarioType('RIVER_STAGE_RISE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scenarioType === 'RIVER_STAGE_RISE'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold">River Water Rise</div>
              <div className="text-[10px] opacity-75 mt-0.5">+X m Gauge Crest</div>
            </button>
            <button
              onClick={() => setScenarioType('EXTREME_RAINFALL')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scenarioType === 'EXTREME_RAINFALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold">Heavy Rainfall</div>
              <div className="text-[10px] opacity-75 mt-0.5">SCS-CN Runoff</div>
            </button>
            <button
              onClick={() => setScenarioType('EMBANKMENT_BREACH')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scenarioType === 'EMBANKMENT_BREACH'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold">Embankment Breach</div>
              <div className="text-[10px] opacity-75 mt-0.5">Polder Inrush</div>
            </button>
            <button
              onClick={() => setScenarioType('RESERVOIR_SUBMERGENCE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scenarioType === 'RESERVOIR_SUBMERGENCE'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold">Proposed Dam / FRL</div>
              <div className="text-[10px] opacity-75 mt-0.5">Reservoir Backwater</div>
            </button>
            <button
              onClick={() => setScenarioType('LAND_USE_CHANGE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                scenarioType === 'LAND_USE_CHANGE'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-semibold">Urban Land Use</div>
              <div className="text-[10px] opacity-75 mt-0.5">Impervious Runoff</div>
            </button>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Scenario Parameters & Controls</span>
              <button
                onClick={handleRunSimulation}
                disabled={loading}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loading ? 'Simulating...' : 'Recalculate Scenario'}</span>
              </button>
            </div>

            {scenarioType === 'RIVER_STAGE_RISE' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>River Water Level Rise:</span>
                  <span className="font-bold text-cyan-300">+{waterRise} meters</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.5"
                  value={waterRise}
                  onChange={(e) => setWaterRise(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {scenarioType === 'EXTREME_RAINFALL' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>24-Hour Catchment Rainfall:</span>
                  <span className="font-bold text-cyan-300">{rainfallMm} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="10"
                  value={rainfallMm}
                  onChange={(e) => setRainfallMm(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {scenarioType === 'EMBANKMENT_BREACH' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Breach Aperture Width:</span>
                  <span className="font-bold text-cyan-300">{breachWidth} meters</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={breachWidth}
                  onChange={(e) => setBreachWidth(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {scenarioType === 'RESERVOIR_SUBMERGENCE' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Full Reservoir Level (FRL):</span>
                  <span className="font-bold text-cyan-300">{reservoirFrl} m AMSL</span>
                </div>
                <input
                  type="range"
                  min="82.0"
                  max="94.0"
                  step="0.5"
                  value={reservoirFrl}
                  onChange={(e) => setReservoirFrl(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}

            {scenarioType === 'LAND_USE_CHANGE' && (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Built-up Impervious Area Expansion:</span>
                  <span className="font-bold text-cyan-300">+{builtupPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={builtupPct}
                  onChange={(e) => setBuiltupPct(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                <span>Baseline vs. Scenario Comparison Table</span>
                <span className="text-[10px] text-cyan-400 font-mono">ID: {result?.scenario_id}</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-2">Metric</th>
                      <th className="py-2 px-2 text-right">Baseline Water</th>
                      <th className="py-2 px-2 text-right text-cyan-300">Simulated Scenario</th>
                      <th className="py-2 px-2 text-right text-amber-300">Incremental Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {result?.comparison_table?.map((row: any) => (
                      <tr key={row.metric} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-2 font-medium text-white">{row.metric}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                          {typeof row.baseline === 'number' ? row.baseline.toLocaleString() : row.baseline}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-cyan-300 font-semibold">
                          {typeof row.scenario === 'number' ? row.scenario.toLocaleString() : row.scenario}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-amber-300 font-bold">
                          {row.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sensitivity Bounds Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Sensitivity Range (±15% Bound)</span>
              </h4>

              <p className="text-[11px] text-slate-400">
                Accounts for Copernicus DEM vertical RMSE (~1.5m) and soil moisture variability:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Low Estimate (-15%):</span>
                  <span className="font-mono text-slate-200">
                    {result?.sensitivity_range?.low_estimate_ha?.toLocaleString()} ha
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 flex justify-between items-center">
                  <span className="text-cyan-300 font-semibold">Nominal Case:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {result?.sensitivity_range?.nominal_ha?.toLocaleString()} ha
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">High Estimate (+15%):</span>
                  <span className="font-mono text-slate-200">
                    {result?.sensitivity_range?.high_estimate_ha?.toLocaleString()} ha
                  </span>
                </div>
              </div>

              {onAskTerraGuide && (
                <button
                  onClick={() => {
                    onClose();
                    onAskTerraGuide(`What changes if the proposed reservoir level is 5 m lower?`);
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask TerraGuide AI to Analyze</span>
                </button>
              )}
            </div>
          </div>

          {/* Simulated Inundation Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Simulated Inundation Footprint Overlay (Copernicus DEM Flood-Fill)
              </span>
              <span className="text-[10px] text-slate-400">
                Cyan Zone: Additional land flooded under this scenario
              </span>
            </div>

            <MapViewer
              center={[26.28, 92.20]}
              zoom={11}
              height="340px"
              overlayGeoJson={result?.inundation_geojson}
              overlayLayerName="Simulated Inundation Footprint"
              overlayColor="#06b6d4"
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400">
            Engine: TerraProof DEM Flood-Fill • Structured for 2D HEC-RAS / LISFLOOD-FP Import
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};


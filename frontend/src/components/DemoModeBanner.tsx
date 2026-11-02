import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Compass,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  FileCheck2,
  ExternalLink,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { api } from '../services/api';

interface DemoModeBannerProps {
  onStartTour?: () => void;
  onSelectScenario?: (claimRef: string) => void;
  onOpenAssamDemo?: () => void;
  onOpenSimulator?: () => void;
  onTogglePresentationMode?: () => void;
  isPresentationMode?: boolean;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  onStartTour,
  onSelectScenario,
  onOpenAssamDemo,
  onOpenSimulator,
  onTogglePresentationMode,
  isPresentationMode = false,
}) => {
  const [active, setActive] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [liveApis, setLiveApis] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [scenarioInfo, setScenarioInfo] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.getDemoStatus();
      setActive(res.demo_mode_active);
      setLiveApis(res.live_apis_enabled);
      setScenarioInfo(res.scenario);
    } catch (e) {
      console.warn('Could not reach demo status API:', e);
    }
  };

  const handleToggleLive = async () => {
    try {
      const res = await api.toggleDemoLiveApis();
      setLiveApis(res.live_apis_enabled);
    } catch (e) {
      console.error('Failed to toggle live APIs:', e);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await api.resetDemoScenarios();
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset demo scenarios:', e);
      setResetting(false);
    }
  };

  if (!active) return null;

  if (collapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs shadow-xl backdrop-blur-md hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide">DEMO MODE ACTIVE</span>
          <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 text-slate-200 px-4 py-2 text-xs relative z-40 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Badge & Synthetic Disclaimer */}
        <div className="flex items-center space-x-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>
            SYNTHETIC DEMO DATA
          </span>
          <span className="text-slate-300 font-medium">
            Kharif Flood Scenario (Vikrampur Demo District, 12 July)
          </span>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            • Modelled on monsoon riverine flood. Not real farmers or actual claims.
          </span>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Assam Flood Demo Trigger */}
          {onOpenAssamDemo && (
            <button
              onClick={onOpenAssamDemo}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title="Open Assam Brahmaputra Flood (July 2024) Regional Event Comparison"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Assam Flood Demo</span>
            </button>
          )}

          {/* Scenario Simulator Trigger */}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title="Open What-If Scenario Simulator (Water Level, Rainfall, Breach, Dam)"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulator</span>
            </button>
          )}

          {/* Quick Scenario Jumps */}
          {onSelectScenario && (
            <div className="hidden xl:flex items-center space-x-1.5 border-l border-r border-slate-800 px-2.5">
              <span className="text-slate-400 text-[11px]">Jump:</span>
              <button
                onClick={() => onSelectScenario('CLM-DEMO-001')}
                className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px]"
                title="Genuine fast-track approved claim"
              >
                C-001
              </button>
              <button
                onClick={() => onSelectScenario('CLM-DEMO-002')}
                className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 text-[11px]"
                title="Inflated 15 ha claim (DEM upland dry)"
              >
                C-002
              </button>
              <button
                onClick={() => onSelectScenario('CLM-DEMO-005')}
                className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 text-[11px]"
                title="60% boundary overlap and duplicate document"
              >
                C-005
              </button>
              <button
                onClick={() => onSelectScenario('CLM-DEMO-008')}
                className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 text-[11px]"
                title="Suspected unauthorized construction 0.4 ha"
              >
                C-008
              </button>
            </div>
          )}

          {/* Guided Tour Trigger */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-medium text-[11px] shadow-sm transition-all cursor-pointer border border-emerald-500/30"
              title="Launch interactive 3-minute judge walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-200" />
              <span>Tour (3 min)</span>
            </button>
          )}

          {/* Presentation Mode Toggle */}
          {onTogglePresentationMode && (
            <button
              onClick={onTogglePresentationMode}
              className={`flex items-center space-x-1 px-2 py-1 rounded border text-[11px] transition-all cursor-pointer ${
                isPresentationMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Presentation Mode (Larger fonts, cleans clutter for screen/projector)"
            >
              {isPresentationMode ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              <span>{isPresentationMode ? 'Exit Pres' : 'Pres Mode'}</span>
            </button>
          )}

          {/* Live vs Offline Switch */}
          <button
            onClick={handleToggleLive}
            className={`flex items-center space-x-1 px-2 py-1 rounded border text-[11px] transition-all cursor-pointer ${
              liveApis
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle between 100% offline seed data and live APIs"
          >
            {liveApis ? (
              <>
                <Wifi className="w-3 h-3 text-blue-400" />
                <span>Live Data</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-emerald-400" />
                <span>Offline Seed</span>
              </>
            )}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-all cursor-pointer disabled:opacity-50"
            title="Restore pristine 8 demo claims"
          >
            <RotateCcw className={`w-3 h-3 text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-slate-200 p-0.5 ml-0.5"
            title="Minimize banner"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

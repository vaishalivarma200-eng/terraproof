import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';

export const DemoImpactPanel: React.FC = () => {
  const [impact, setImpact] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadImpact();
  }, []);

  const loadImpact = async () => {
    try {
      const data = await api.getDemoImpactSummary();
      setImpact(data);
    } catch (e) {
      console.warn('Could not load demo impact summary:', e);
    }
  };

  if (!impact) return null;

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/90 rounded-xl p-4 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Operational Efficiency & Relief Impact</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                Illustrative • Demo Scenario
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Computed strictly from active Kharif flood verification seed claims
            </p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          {/* Metric 1: Claims Triaged */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Claims Triaged</span>
              <Layers className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {impact.total_claims}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              1 Fast-Track • 7 Prioritized
            </div>
          </div>

          {/* Metric 2: Field Visits Prioritized */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Field Visits Prioritized</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {impact.field_visits_prioritized}
              <span className="text-xs font-normal text-slate-400 ml-1.5">targeted</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {impact.field_visits_avoided} routine visit avoided
            </div>
          </div>

          {/* Metric 3: Hectares Claimed vs Observed */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Hectares Audited</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {impact.total_claimed_ha} ha
            </div>
            <div className="text-[10px] text-rose-300 mt-0.5">
              {impact.total_observed_damaged_ha} ha verified flooded
            </div>
          </div>

          {/* Metric 4: Protected Rupee Discrepancy */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Discrepancy Flagged</span>
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              ₹{impact.rupees_flagged_for_review.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Protected from erroneous disbursement
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

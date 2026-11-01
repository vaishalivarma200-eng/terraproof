import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

interface RiskScoreCardProps {
  claimId: string;
  initialRiskScore?: number;
  initialRiskTier?: string;
  initialSignals?: any;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  claimId,
  initialRiskScore = 15,
  initialRiskTier = 'LOW_RISK',
  initialSignals,
}) => {
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(initialSignals);
  const [score, setScore] = useState<number>(initialRiskScore);
  const [tier, setTier] = useState<string>(initialRiskTier);
  const [expanded, setExpanded] = useState(false);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await api.evaluateClaimRisk(claimId);
      setRiskData(data);
      setScore(data.composite_risk_score);
      setTier(data.risk_tier);
    } catch (e) {
      console.error('Failed to evaluate risk score:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSignals) {
      fetchRisk();
    }
  }, [claimId]);

  const getTierColor = () => {
    if (tier === 'HIGH_RISK') return 'rose';
    if (tier === 'MODERATE_RISK') return 'amber';
    return 'emerald';
  };

  const color = getTierColor();

  return (
    <div className={`p-4 rounded-xl border bg-slate-900 shadow-lg transition-all ${
      color === 'rose'
        ? 'border-rose-500/40 bg-rose-950/10'
        : color === 'amber'
        ? 'border-amber-500/40 bg-amber-950/10'
        : 'border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-lg border ${
            color === 'rose'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : color === 'amber'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {color === 'rose' ? (
              <ShieldAlert className="w-4 h-4" />
            ) : color === 'amber' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-200">
                Claim Risk & Triage Score
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                color === 'rose'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : color === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {tier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {riskData?.triage_recommendation
                ? riskData.triage_recommendation.replace(/_/g, ' ')
                : score <= 30
                ? 'Fast-Track Eligible'
                : score <= 65
                ? 'Desk Review Recommended'
                : 'Physical Audit Required'}
            </p>
          </div>
        </div>

        {/* Score Display & Refresh */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className={`text-xl font-bold font-mono ${
              color === 'rose' ? 'text-rose-400' : color === 'amber' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {score}
            </span>
            <span className="text-xs text-slate-500"> / 100</span>
          </div>

          <button
            type="button"
            onClick={fetchRisk}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Recalculate risk score"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            color === 'rose'
              ? 'bg-rose-500'
              : color === 'amber'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {/* Action Directive */}
      {riskData?.action_directive && (
        <p className="mt-2 text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <strong>Official Directive:</strong> {riskData.action_directive}
        </p>
      )}

      {/* Expanded Factor Breakdown */}
      {expanded && riskData?.risk_factors && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs animate-fade-in">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Risk Factor Discrepancy Breakdown
          </span>
          <div className="space-y-1.5">
            {riskData.risk_factors.map((f: any, idx: number) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border flex items-start justify-between gap-2 ${
                  f.score_impact > 0
                    ? f.severity === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-900/30'
                      : 'bg-amber-950/20 border-amber-900/30'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-200 text-[11px]">{f.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.explanation}</p>
                </div>
                {f.score_impact > 0 ? (
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                    f.severity === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    +{f.score_impact} pts
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono flex-shrink-0">
                    Clean (0 pts)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


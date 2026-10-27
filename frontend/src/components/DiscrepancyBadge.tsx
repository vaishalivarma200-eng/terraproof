import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface DiscrepancyBadgeProps {
  verdict: string;
}

export const DiscrepancyBadge: React.FC<DiscrepancyBadgeProps> = ({ verdict }) => {
  switch (verdict) {
    case 'EVIDENCE_CONSISTENT':
    case 'SIGNIFICANT_INUNDATION_OBSERVED':
    case 'SIGNIFICANT_CANOPY_CLEARING_DETECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Consistent with Reported Event
        </span>
      );

    case 'MANUAL_FIELD_INSPECTION_RECOMMENDED':
    case 'ELEVATED_VEGETATION_STRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Field Inspection Recommended
        </span>
      );

    case 'INCONSISTENT_MINIMAL_CHANGE':
    case 'MINIMAL_INUNDATION_DETECTED':
    case 'STABLE_CANOPY_COVER':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Minimal Satellite Change Observed
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
          <HelpCircle className="w-3.5 h-3.5" />
          {verdict.replace(/_/g, ' ')}
        </span>
      );
  }
};


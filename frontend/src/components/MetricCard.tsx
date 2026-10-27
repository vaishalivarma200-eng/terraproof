import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'emerald' | 'amber' | 'blue' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-slate-800 bg-slate-900/80 text-slate-100',
    emerald: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
    blue: 'border-sky-500/30 bg-sky-950/20 text-sky-400',
    rose: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
  };

  const iconBgStyles = {
    default: 'bg-slate-800 text-slate-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    blue: 'bg-sky-500/20 text-sky-400',
    rose: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${variantStyles[variant]} shadow-sm flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${iconBgStyles[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subValue && <div className="text-[11px] text-slate-400 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};

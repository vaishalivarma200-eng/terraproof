import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  AlertTriangle,
  Sparkles,
  ClipboardCheck,
  Eye,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { MapViewer } from './MapViewer';

interface LandUseChangeViewerProps {
  claimId: string;
  boundaryGeoJson: any;
  khasraNo?: string;
  village?: string;
  district?: string;
  onAssignToInspector?: (directive: string) => void;
}

export const LandUseChangeViewer: React.FC<LandUseChangeViewerProps> = ({
  claimId,
  boundaryGeoJson,
  khasraNo = '142/1',
  village = 'Wadgaon',
  district = 'Akola',
  onAssignToInspector,
}) => {
  const [loading, setLoading] = useState(false);
  const [changeData, setChangeData] = useState<any>(null);
  const [baselineDate, setBaselineDate] = useState('2023-06-01');
  const [currentDate, setCurrentDate] = useState('2024-06-01');
  const [assigned, setAssigned] = useState(false);

  const handleRunDetection = async () => {
    setLoading(true);
    try {
      const res = await api.detectLandUseChange({
        claim_id: claimId,
        baseline_date: baselineDate,
        current_date: currentDate,
      });
      setChangeData(res);
    } catch (e) {
      console.error('Failed to run land use change detection:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (changeData?.inspector_task_directive && onAssignToInspector) {
      onAssignToInspector(changeData.inspector_task_directive);
      setAssigned(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Agricultural Land-Use Change & Construction Detection
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase">
                Section 172 Land Code
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Detects unauthorized built-up structures, concrete plinths, and permanent clearing over time
            </p>
          </div>
        </div>

        {/* Date Selector & Trigger */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={baselineDate}
              onChange={(e) => setBaselineDate(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
              title="Baseline Pre-Construction Date"
            />
            <span className="text-slate-600">→</span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
              title="Observation Date"
            />
          </div>

          <button
            type="button"
            onClick={handleRunDetection}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Scanning Pixels...' : 'Scan Changes'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {changeData ? (
        <div className="space-y-4 animate-fade-in">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Classification</span>
              <span className="font-semibold text-purple-300">
                {changeData.change_classification.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Suspected Change Area</span>
              <span className="font-semibold text-rose-400">
                {changeData.change_area_ha} ha ({changeData.change_percentage_of_parcel}%)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Multi-Sensor Confidence</span>
              <span className="font-semibold text-emerald-400">
                {changeData.confidence_score}% (Optical NDBI + SAR)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status</span>
              <span className="font-semibold text-amber-300">
                Suspected — Needs Audit
              </span>
            </div>
          </div>

          {/* Interactive Map with Suspected Change Polygons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Purple Polygon: Suspected Non-Agricultural Conversion Zone</span>
              <span className="text-[11px] font-mono text-purple-400">
                NDBI: {changeData.spectral_evidence.ndbi_delta} • SAR VV: {changeData.spectral_evidence.sar_backscatter_delta_db}
              </span>
            </div>
            <MapViewer
              boundaryGeoJson={boundaryGeoJson}
              overlayGeoJson={changeData.overlays_geojson}
              overlayLayerName="Suspected Non-Agri Structure"
              overlayColor="#a855f7"
              height="260px"
            />
          </div>

          {/* Directive & Assign Action */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-purple-400" />
                Patwari / Revenue Inspector Task Directive:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {changeData.inspector_task_directive}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAssign}
              disabled={assigned}
              className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                assigned
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
              }`}
            >
              {assigned ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assigned to Patwari</span>
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Assign to Inspector</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 italic">
            * {changeData.disclaimer}
          </p>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          Click <strong>"Scan Changes"</strong> to perform multi-temporal NDBI & SAR backscatter analysis across the multi-month baseline.
        </div>
      )}
    </div>
  );
};

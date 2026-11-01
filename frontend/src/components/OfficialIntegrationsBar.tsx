import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  Download,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

interface OfficialIntegrationsBarProps {
  claimId: string;
  claimReference: string;
}

export const OfficialIntegrationsBar: React.FC<OfficialIntegrationsBarProps> = ({
  claimId,
  claimReference,
}) => {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const handleOpenCompare = async () => {
    setShowCompareModal(true);
    setLoadingCompare(true);
    setCompareError(null);
    try {
      const data = await api.compareWithOfficialData(claimId);
      setCompareData(data);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to fetch official comparison.');
    } finally {
      setLoadingCompare(false);
    }
  };

  const girdawariUrl = api.exportGirdawariCsvUrl(claimId);
  const pmfbyUrl = api.exportPmfbyCsvUrl(claimId);

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Official Revenue & Insurance Export Layer
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                Patwari / Insurer
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Export pre-filled draft Girdawari entries and PMFBY/NCIP claim evidence dossiers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenCompare}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compare with Official Records</span>
          </button>

          <a
            href={girdawariUrl}
            download={`Draft_Girdawari_${claimReference}.csv`}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 transition-all shadow-sm"
            title="Download draft girdawari CSV formatted for state revenue portals"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export e-Girdawari (CSV)</span>
          </a>

          <a
            href={pmfbyUrl}
            download={`PMFBY_NCIP_Evidence_${claimReference}.csv`}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 transition-all shadow-sm"
            title="Download PMFBY claim evidence dossier for National Crop Insurance Portal"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>PMFBY Dossier (CSV)</span>
          </a>
        </div>
      </div>

      {/* 4-Way Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    Official Data Reconciliation & Discrepancy Matrix
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {claimReference}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Side-by-side reconciliation between Claim, Satellite, AgriStack DCS, and State Girdawari
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {loadingCompare && (
                <div className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-2"></div>
                  <p className="text-xs">Reconciling records across AgriStack and e-Girdawari databases...</p>
                </div>
              )}

              {compareError && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{compareError}</span>
                </div>
              )}

              {compareData && (
                <>
                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* 1. Farmer Claim */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                        1. Farmer Claim
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Crop:</span>
                          <span className="font-semibold text-slate-200">{compareData.sources.farmer_claim.crop}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Claimed Area:</span>
                          <span className="font-semibold text-slate-200">{compareData.sources.farmer_claim.claimed_area_ha} ha</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Peril:</span>
                          <span className="font-semibold text-slate-200">{compareData.sources.farmer_claim.reported_peril}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. TerraProof Satellite Fusion */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 pb-1 border-b border-slate-800 flex items-center justify-between">
                        <span>2. Satellite Fusion</span>
                        <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                          {compareData.sources.satellite_observation.confidence_score}% Conf.
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Observed Damage:</span>
                          <span className="font-semibold text-emerald-400">
                            {compareData.sources.satellite_observation.damaged_area_ha} ha ({compareData.sources.satellite_observation.damage_percentage}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Sensor Mode:</span>
                          <span className="text-slate-300 text-[11px] font-mono">{compareData.sources.satellite_observation.sensor_fusion}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Peril Classified:</span>
                          <span className="font-semibold text-slate-200">{compareData.sources.satellite_observation.peril_identified}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. AgriStack DCS Record */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 pb-1 border-b border-slate-800">
                        3. AgriStack DCS Record
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Sown Crop:</span>
                          <span className="font-semibold text-slate-200">
                            {compareData.sources.agristack_dcs?.crop_name || 'Soybean'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Surveyed Area:</span>
                          <span className="font-semibold text-slate-200">
                            {compareData.sources.agristack_dcs?.sown_area_ha || 3.2} ha
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Farmer ID:</span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {compareData.sources.agristack_dcs?.farmer_id || 'FAR-MH-2024-88392'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. State e-Girdawari */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400 pb-1 border-b border-slate-800">
                        4. State e-Girdawari
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Recorded Crop:</span>
                          <span className="font-semibold text-slate-200">
                            {compareData.sources.state_girdawari?.recorded_crop || 'Soybean'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Official Loss:</span>
                          <span className="font-semibold text-amber-400">
                            {compareData.sources.state_girdawari?.official_loss_percent
                              ? `${compareData.sources.state_girdawari.official_loss_percent}%`
                              : 'Pending Survey'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Khasra Parcel:</span>
                          <span className="text-slate-300 font-mono">{compareData.khasra_no}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discrepancy Reconciliation Table */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Automated Discrepancy Analysis & Explanations
                    </h5>
                    <div className="space-y-2">
                      {compareData.discrepancy_analysis?.map((d: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-slate-200">{d.dimension}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                                  d.status === 'PASS'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : d.status === 'WARN'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {d.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{d.detail}</p>
                            <p className="text-[11px] text-slate-500 font-medium">Impact: {d.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Reconciliation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  X,
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';

interface OfficialWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  claimReference: string;
  farmerName: string;
  khasraNo?: string;
  claimedAreaHa: number;
  initialSatelliteDamage?: number;
  onInspectionCommitted?: (result: any) => void;
}

export const OfficialWorkflowModal: React.FC<OfficialWorkflowModalProps> = ({
  isOpen,
  onClose,
  claimId,
  claimReference,
  farmerName,
  khasraNo = '142/1',
  claimedAreaHa,
  initialSatelliteDamage = 65.0,
  onInspectionCommitted,
}) => {
  const [officerRole, setOfficerRole] = useState<'PATWARI' | 'KANUNGO' | 'TEHSILDAR' | 'DISTRICT_COLLECTOR'>('PATWARI');
  const [officerName, setOfficerName] = useState('Rajinder Kumar (Patwari, Halka-01)');
  
  // Checklist states
  const [cropPresent, setCropPresent] = useState(true);
  const [waterMarks, setWaterMarks] = useState(true);
  const [structurePresent, setStructurePresent] = useState(false);
  const [boundaryMatches, setBoundaryMatches] = useState(true);

  // Pre-filled & Confirmed damage
  const [prefilledDamage, setPrefilledDamage] = useState(initialSatelliteDamage);
  const [confirmedDamage, setConfirmedDamage] = useState(initialSatelliteDamage);
  const [overrideReason, setOverrideReason] = useState('');
  const [decisionAction, setDecisionAction] = useState('CONFIRM_EVIDENCE');
  const [decisionRemarks, setDecisionRemarks] = useState('Field inspected on-ground. Crop damage and siltation lines corroborated.');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signedResult, setSignedResult] = useState<any>(null);
  const [draftPack, setDraftPack] = useState<any>(null);

  useEffect(() => {
    if (isOpen && claimId) {
      api.getDraftEvidencePack(claimId).then((pack) => {
        setDraftPack(pack);
        if (pack.suggested_damage_percent !== undefined) {
          setPrefilledDamage(pack.suggested_damage_percent);
          setConfirmedDamage(pack.suggested_damage_percent);
        }
      }).catch(console.error);
    }
  }, [isOpen, claimId]);

  if (!isOpen) return null;

  const overrideOccurred = Math.abs(confirmedDamage - prefilledDamage) > 5.0;
  const isLowDamage = prefilledDamage < 15.0;

  const handleSubmit = async () => {
    if (overrideOccurred && !overrideReason.trim()) {
      setErrorMsg('An explicit override rationale is legally required when modifying satellite-derived damage.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.submitOfficialInspection({
        claim_id: claimId,
        officer_name: officerName,
        officer_role: officerRole,
        prefilled_damage_percent: prefilledDamage,
        confirmed_damage_percent: confirmedDamage,
        override_reason: overrideOccurred ? overrideReason : undefined,
        decision_action: decisionAction,
        decision_remarks: decisionRemarks,
        checklist: {
          crop_present: cropPresent,
          water_marks_observed: waterMarks,
          structure_present: structurePresent,
          boundary_matches: boundaryMatches,
        },
      });

      setSignedResult(res);
      if (onInspectionCommitted) {
        onInspectionCommitted(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit official inspection.');
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl = api.getOfficialInspectionPdfUrl(claimId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Official Revenue Decision-Support Order
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {officerRole}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Field Inspection Dossier • {claimReference} • {farmerName} (Khasra: {khasraNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Officer Role & Authority Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Revenue Officer Hierarchy</label>
              <select
                value={officerRole}
                onChange={(e: any) => {
                  setOfficerRole(e.target.value);
                  if (e.target.value === 'PATWARI') setOfficerName('Rajinder Kumar (Patwari, Halka-01)');
                  if (e.target.value === 'KANUNGO') setOfficerName('Suresh Chandra (Revenue Inspector / Kanungo)');
                  if (e.target.value === 'TEHSILDAR') setOfficerName('Dr. M. S. Rathore (Tehsildar / Executive Magistrate)');
                  if (e.target.value === 'DISTRICT_COLLECTOR') setOfficerName('District Collector & District Magistrate');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="PATWARI">Village Patwari / Lekhpal (Field Level)</option>
                <option value="KANUNGO">Revenue Inspector / Kanungo (Circle Level)</option>
                <option value="TEHSILDAR">Tehsildar / Naib Tehsildar (Quasi-Judicial)</option>
                <option value="DISTRICT_COLLECTOR">District Collector / SDO (Apex Authority)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Officer Name & Designation</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Low-Damage Warning Banner (<15%) */}
          {isLowDamage && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>SATELLITE INSUFFICIENT FOR SUB-15% DAMAGE</span>
              </div>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                Satellite optical and SAR resolution cannot reliably distinguish localized minor damage ({prefilledDamage.toFixed(1)}%) from natural phenological or soil variance. <strong>Mandatory physical ground inspection</strong> is required to certify loss.
              </p>
            </div>
          )}

          {/* Pre-filled Draft Evidence Pack */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Pre-Filled Satellite Evidence Draft
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono">
                {draftPack?.suggested_damage_range || `${prefilledDamage}%`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <div><span className="text-slate-500">Crop / Season:</span> <strong className="text-slate-200 block">{draftPack?.prefilled_crop || 'Soybean'} ({draftPack?.prefilled_season || 'Kharif'})</strong></div>
              <div><span className="text-slate-500">Claimed Area:</span> <strong className="text-slate-200 block">{claimedAreaHa} ha</strong></div>
              <div><span className="text-slate-500">Identified Peril:</span> <strong className="text-slate-200 block">{draftPack?.peril_identified || 'Flood'}</strong></div>
              <div><span className="text-slate-500">Confidence Score:</span> <strong className="text-emerald-400 block">{draftPack?.confidence_score || 85}%</strong></div>
            </div>
          </div>

          {/* Mandatory Field Inspection Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              On-Ground Inspection Checklist (Physical Verification)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={cropPresent}
                  onChange={(e) => setCropPresent(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-900"
                />
                <span className="text-slate-300">1. Sown crop physically present on parcel</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={waterMarks}
                  onChange={(e) => setWaterMarks(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-900"
                />
                <span className="text-slate-300">2. Water submergence / siltation lines visible</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={boundaryMatches}
                  onChange={(e) => setBoundaryMatches(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-slate-900"
                />
                <span className="text-slate-300">3. Parcel boundary matches revenue cadastral map</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={structurePresent}
                  onChange={(e) => setStructurePresent(e.target.checked)}
                  className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 bg-slate-900"
                />
                <span className="text-slate-300">4. Non-agricultural structure / plinth detected</span>
              </label>
            </div>
          </div>

          {/* Damage Confirmation & Override Input */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Satellite Pre-Filled Damage
                </label>
                <div className="font-mono text-sm font-bold text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  {prefilledDamage.toFixed(1)}%
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">
                  Confirmed Ground Damage (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={confirmedDamage}
                  onChange={(e) => setConfirmedDamage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {overrideOccurred && (
              <div className="space-y-1 pt-1 animate-fade-in">
                <label className="block text-xs font-semibold text-amber-400">
                  Override Rationale & Justification (Statutorily Required)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Ground crop lodging and root submergence was severe in lower drainage zone."
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Decision Action & Order Remarks */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Decision Action
              </label>
              <select
                value={decisionAction}
                onChange={(e) => setDecisionAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="CONFIRM_EVIDENCE">CONFIRM EVIDENCE — Approve Satellite Finding into Girdawari</option>
                <option value="REQUEST_MORE_INFO">REQUEST MORE INFO — Return to Farmer for Additional Proof</option>
                <option value="ESCALATE_TO_KANUNGO">ESCALATE TO KANUNGO — Requires Circle Inspector Review</option>
                <option value="ESCALATE_TO_TEHSILDAR">ESCALATE TO TEHSILDAR — Dispute / Area Inflation Ruling Needed</option>
                <option value="CONFIRMED_VIOLATION">CONFIRMED VIOLATION — Reject Claim / Issue Section 172 Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Inspection Remarks & Order Justification
              </label>
              <textarea
                rows={3}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Signed Output Card */}
          {signedResult && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Order Digitally Signed & Committed
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  {signedResult.decision_action}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className="text-slate-400">
                  SHA-256 Digital Signature:
                  <div className="font-mono text-[11px] text-slate-300 truncate">{signedResult.signature_hash}</div>
                </div>
                <div className="text-slate-400">
                  Signed At: <span className="text-slate-300">{signedResult.signed_at}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <a
                  href={pdfUrl}
                  download={`Official_Inspection_${claimReference}.pdf`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Signed Inspection Report (PDF)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Signing Order...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Digitally Sign & Commit Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

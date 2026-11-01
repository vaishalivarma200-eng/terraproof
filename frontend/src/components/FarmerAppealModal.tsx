import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Scale, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

interface FarmerAppealModalProps {
  claimId: string;
  claimReference: string;
  originalDamagePercent: number;
  isOpen: boolean;
  onClose: () => void;
  onAppealSubmitted?: () => void;
}

export const FarmerAppealModal: React.FC<FarmerAppealModalProps> = ({
  claimId,
  claimReference,
  originalDamagePercent,
  isOpen,
  onClose,
  onAppealSubmitted,
}) => {
  const [groundsType, setGroundsType] = useState('CONTESTED_DAMAGE_PCT');
  const [farmerStatement, setFarmerStatement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (farmerStatement.trim().length < 15) {
      setError('Please provide at least a brief 15-character explanation of on-ground conditions.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitFarmerAppeal({
        claim_id: claimId,
        grounds_type: groundsType,
        farmer_statement: farmerStatement,
        original_damage_percent: originalDamagePercent,
      });
      setSuccessResult(res);
      if (onAppealSubmitted) {
        onAppealSubmitted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit statutory appeal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Statutory Grievance & Appeal</h3>
              <p className="text-xs text-slate-400">Claim: {claimReference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Appeal Registered Successfully</h4>
                <p className="text-xs font-mono text-emerald-400">
                  Reference: {successResult.appeal?.reference_no}
                </p>
                <p className="text-sm text-slate-400 max-w-md mx-auto pt-2">
                  Your grievance has been formally assigned to the <strong>Tehsildar</strong> for independent quasi-judicial review pursuant to the Public Services Guarantee Act.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Assigned Appellate Authority:</span>
                  <span className="font-semibold text-white">Tehsildar (Executive Magistrate)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Statutory Turnaround SLA:</span>
                  <span className="font-semibold text-emerald-400">7 Business Days</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Audit Chain Sealed:</span>
                  <span className="font-semibold text-indigo-400 font-mono">APPEAL_FILED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Technical Context Banner */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-300 font-semibold block mb-0.5">
                    Procedural Justice & Honest Technical Limits
                  </strong>
                  Satellite spectral analysis at 10-meter resolution can fail to detect rapid-drain root damage, subterranean rot, or localized squalls. Revenue laws grant you the statutory right to demand independent physical inspection.
                </div>
              </div>

              {/* Preliminary Assessment Notice */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Preliminary Satellite Loss:</span>
                <span className="font-bold text-amber-400 text-sm">
                  {originalDamagePercent.toFixed(1)}% Damage
                </span>
              </div>

              {/* Grounds Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Grounds for Appeal / Disagreement
                </label>
                <select
                  value={groundsType}
                  onChange={(e) => setGroundsType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="CONTESTED_DAMAGE_PCT">Loss Percentage Underestimated by Satellite</option>
                  <option value="WATER_RECESSION_ROOT_ROT">Flood Water Receded Rapidly / Subterranean Root Rot</option>
                  <option value="LOCALIZED_HAIL">Localized Hail / Wind Damage Missed Between Passes</option>
                  <option value="BOUNDARY_MISALIGNMENT">Cadastral Boundary Coordinates Offset</option>
                  <option value="CROP_MISIDENTIFICATION">Intercropping / High-Value Crop Variety Misclassified</option>
                </select>
              </div>

              {/* Narrative Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Farmer's Narrative / Ground Facts
                </label>
                <textarea
                  rows={4}
                  value={farmerStatement}
                  onChange={(e) => setFarmerStatement(e.target.value)}
                  placeholder="Detail the actual on-ground circumstances (e.g. water stayed logged for 48 hours causing collar rot, lodging occurred before satellite pass, etc.)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>

              {/* Independent Review Guarantee */}
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Independent Routing:</strong> Will be adjudicated by <strong>Tehsildar</strong> (strictly independent from original inspecting officer).
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Appeal...' : 'Submit Official Appeal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

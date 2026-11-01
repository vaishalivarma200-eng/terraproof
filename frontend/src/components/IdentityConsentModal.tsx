import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  QrCode,
  FileText,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

interface IdentityConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  onVerified: (maskedId: string, provider: string) => void;
}

export const IdentityConsentModal: React.FC<IdentityConsentModalProps> = ({
  isOpen,
  onClose,
  farmerName,
  onVerified,
}) => {
  const [provider, setProvider] = useState<'MOCK' | 'DIGILOCKER' | 'AADHAAR_SECURE_QR' | 'MOBILE_OTP' | 'AGRISTACK'>('MOCK');
  const [inputVal, setInputVal] = useState('');
  const [otpVal, setOtpVal] = useState('774921');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [dossierDownload, setDossierDownload] = useState<any>(null);
  const [erasureStatus, setErasureStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!agreedTerms) {
      setErrorMsg('You must provide explicit DPDP Act consent before identity verification.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      let payload: Record<string, any> = { farmer_name: farmerName };
      if (provider === 'MOCK') {
        payload.raw_aadhaar = inputVal || '987654321098';
      } else if (provider === 'DIGILOCKER') {
        payload.auth_code = 'DIGI_OAUTH_TOKEN_TEST_2026';
      } else if (provider === 'AADHAAR_SECURE_QR') {
        payload.qr_data = inputVal || 'SIGNED_XML_QR_PAYLOAD_HASH';
      } else if (provider === 'MOBILE_OTP') {
        payload.phone_number = inputVal || '9876543210';
        payload.otp = otpVal;
      } else if (provider === 'AGRISTACK') {
        payload.farmer_id = inputVal || 'FAR-MH-2024-88392';
      }

      const res = await api.verifyKYC(provider, payload);
      setVerificationResult(res);

      // Log DPDP consent to backend
      await api.recordConsent({
        farmer_name: farmerName,
        masked_identifier: res.masked_identifier,
        agreed_terms: true,
      });

      onVerified(res.masked_identifier, provider);
    } catch (err: any) {
      setErrorMsg(err.message || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMyData = async () => {
    try {
      setLoading(true);
      const dossier = await api.downloadMyData(farmerName);
      setDossierDownload(dossier);
      // Trigger JSON file download
      const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DPDP_Data_Dossier_${farmerName.replace(/\s+/g, '_')}.json`;
      a.click();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to download personal data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMyData = async () => {
    if (!confirm(`Are you sure you want to permanently erase and anonymize personal records for '${farmerName}' under DPDP Act Section 12?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.deleteMyData(farmerName);
      setErasureStatus(res.message);
      setVerificationResult(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to erase data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Identity & DPDP Consent Layer
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Raw Aadhaar
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Complies with India's Digital Personal Data Protection (DPDP) Act 2023
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Provider Tabs */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Verification Adapter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'MOCK', label: 'Mock e-KYC', icon: UserCheck, desc: 'Offline Test' },
                { id: 'DIGILOCKER', label: 'DigiLocker', icon: Lock, desc: 'OAuth Stub' },
                { id: 'AADHAAR_SECURE_QR', label: 'Aadhaar QR', icon: QrCode, desc: 'Offline Signed' },
                { id: 'MOBILE_OTP', label: 'Mobile OTP', icon: Smartphone, desc: 'DLT SMS' },
                { id: 'AGRISTACK', label: 'AgriStack ID', icon: FileText, desc: 'Farmer Registry' },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProvider(p.id as any);
                      setVerificationResult(null);
                      setErrorMsg(null);
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 w-full justify-between mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] text-slate-500 uppercase">{p.desc}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input field based on provider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                {provider === 'MOCK' && 'Demo Aadhaar Number (Masked automatically)'}
                {provider === 'DIGILOCKER' && 'DigiLocker OAuth Authorization'}
                {provider === 'AADHAAR_SECURE_QR' && 'Scan / Paste Aadhaar Secure QR Payload'}
                {provider === 'MOBILE_OTP' && 'Aadhaar-Linked Mobile Number'}
                {provider === 'AGRISTACK' && 'AgriStack Farmer ID (DA&FW)'}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {farmerName || 'Beneficiary Farmer'}
              </span>
            </div>

            {provider === 'MOBILE_OTP' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Mobile (10 Digits)</label>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">OTP (Universal test: 774921)</label>
                  <input
                    type="text"
                    value={otpVal}
                    onChange={(e) => setOtpVal(e.target.value)}
                    placeholder="774921"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    provider === 'MOCK'
                      ? 'e.g. 987654321098'
                      : provider === 'AGRISTACK'
                      ? 'e.g. FAR-MH-2024-88392'
                      : 'Enter credential token or payload'
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              <Lock className="w-3 h-3 inline mr-1 text-emerald-400" />
              <strong>Zero Raw Storage Guarantee:</strong> Raw 12-digit Aadhaar numbers and biometric payloads are processed in-memory, converted to a masked token (e.g. <code className="text-emerald-300">XXXX-XXXX-1098</code>), and indexed via salted SHA-256 hash.
            </p>
          </div>

          {/* DPDP Consent Disclosure */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Explicit Consent under DPDP Act 2023:</strong> I authorize TerraProof to verify my field boundary, crop sown records, and satellite damage observations solely for PMFBY insurance claim verification. Data is retained for up to 3 years and will never be monetized or shared.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {erasureStatus && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{erasureStatus}</span>
            </div>
          )}

          {/* Verification Result Card */}
          {verificationResult && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Identity Verified & Bound
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  {verificationResult.verification_source}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Masked Token:</span>
                  <div className="font-mono text-slate-200 font-semibold">{verificationResult.masked_identifier}</div>
                </div>
                <div>
                  <span className="text-slate-400">Salted Fingerprint:</span>
                  <div className="font-mono text-slate-400 truncate text-[11px]">{verificationResult.salted_hash}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadMyData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Download all personal records as portable JSON (DPDP Section 11)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download My Data</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteMyData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40"
              title="Permanently redact and anonymize personal identifiers (DPDP Section 12)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify Identity</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

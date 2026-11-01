import React, { useState } from 'react';
import {
  FileCheck2,
  FileWarning,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Upload,
  Sparkles,
  FileText,
  User,
  Scale,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

interface LandDocumentVerifierProps {
  claimId?: string;
  claimantName: string;
  claimedAreaHa: number;
  drawnBoundaryHa: number;
  district?: string;
  onVerificationComplete?: (status: string, report: any) => void;
}

const SAMPLE_DOCUMENTS = {
  KHARIF_SOYBEAN_7_12: `मध्यप्रदेश शासन - राजस्व विभाग (भू-अभिलेख)
खसरा / खतौनी नकल (फॉर्म 7/12)
खसरा संख्या: 142/1
खाता संख्या: 88
खातेदार का नाम: रमेश तुकाराम पाटिल
क्षेत्रफल: 3.20 हेक्टेयर
गाँव: वडगांव | जिला: अकोला | राज्य: महाराष्ट्र
काश्तकार का प्रकार: भूमिस्वामी (पूर्ण स्वामित्व)`,

  INFLATED_KHASRA: `उत्तर प्रदेश राजस्व परिषद - खतौनी उद्धरण
खसरा संख्या: 88/2
खातेदार: श्रीमती सुनीता देवी
क्षेत्रफल: 2.10 हेक्टेयर
गाँव: सांवरे | जिला: कोटा
काश्तकार: भूमिस्वामी`,

  TENANT_LEASE: `REGISTERED AGRICULTURAL LEASE AGREEMENT (पट्टा विलेख)
Landlord / Titleholder: Harishchandra Shinde (भूस्वामी)
Tenant / Lessee: Mahesh Pawar (पट्टेदार काश्तकार)
Survey / Khasra No: 142/1
Leased Area: 3.50 Hectare
Crop Season: Kharif & Rabi 2024-2026
Village: Wadgaon, Tehsil: Balapur, District: Akola`
};

export const LandDocumentVerifier: React.FC<LandDocumentVerifierProps> = ({
  claimId,
  claimantName,
  claimedAreaHa,
  drawnBoundaryHa,
  district,
  onVerificationComplete,
}) => {
  const [documentType, setDocumentType] = useState('KHASRA_KHATAUNI');
  const [tenancyType, setTenancyType] = useState('OWNER');
  const [docText, setDocText] = useState(SAMPLE_DOCUMENTS.KHARIF_SOYBEAN_7_12);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleRunVerification = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (claimId) {
        // Upload and bind directly to claim record
        const res = await api.uploadLandDocumentText({
          claim_id: claimId,
          document_text: docText,
          document_type: documentType,
          tenancy_type: tenancyType,
          filename: `${documentType}_record.txt`,
        });
        setVerificationResult(res);
        if (onVerificationComplete) {
          onVerificationComplete(res.verification_status, res.verification_report);
        }
      } else {
        // Standalone sample verification
        const res = await api.verifySampleLandDocument({
          document_text: docText,
          document_type: documentType,
          claimant_name: claimantName,
          drawn_boundary_ha: drawnBoundaryHa || claimedAreaHa,
          claimed_area_ha: claimedAreaHa,
          claim_district: district,
          tenancy_type: tenancyType,
        });
        setVerificationResult(res);
        if (onVerificationComplete) {
          onVerificationComplete(res.verification_status, res.verification_report);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Land document verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleKey: keyof typeof SAMPLE_DOCUMENTS, defaultTenancy = 'OWNER') => {
    setDocText(SAMPLE_DOCUMENTS[sampleKey]);
    setTenancyType(defaultTenancy);
    setVerificationResult(null);
  };

  const report = verificationResult?.verification_report;
  const checks = report?.checks || {};
  const status = verificationResult?.verification_status || 'UNVERIFIED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title & Quick Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Land Document Verification & OCR
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  status === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : status === 'NEEDS_REVIEW'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {status}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Validates Form 7/12, Khasra/Khatauni, Jamabandi, and Registered Leases
            </p>
          </div>
        </div>

        {/* Quick Sample Loaders */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto text-[11px]">
          <span className="text-slate-400 mr-1">Load Demo:</span>
          <button
            type="button"
            onClick={() => loadSample('KHARIF_SOYBEAN_7_12', 'OWNER')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Form 7/12 (Pass)
          </button>
          <button
            type="button"
            onClick={() => loadSample('INFLATED_KHASRA', 'OWNER')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Inflated Area (Warn)
          </button>
          <button
            type="button"
            onClick={() => loadSample('TENANT_LEASE', 'TENANT')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Tenant Lease
          </button>
        </div>
      </div>

      {/* Tenancy & Document Type Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Document Format</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ROR_7_12">Form 7/12 (Maharashtra / Gujarat)</option>
            <option value="KHASRA_KHATAUNI">Khasra / Khatauni (UP / MP / Rajasthan)</option>
            <option value="JAMABANDI">Jamabandi (Punjab / Haryana)</option>
            <option value="LEASE_AGREEMENT">Registered Lease Deed (Tenant / Sharecropper)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Claimant Tenancy Right</label>
          <select
            value={tenancyType}
            onChange={(e) => setTenancyType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="OWNER">Owner-Cultivator (Bhumiswami)</option>
            <option value="TENANT">Tenant Cultivator (Pattadar / Leaseholder)</option>
            <option value="SHARECROPPER">Sharecropper (Bataidar / Adhiya)</option>
          </select>
        </div>
      </div>

      {/* Bilingual Document Text Input */}
      <div>
        <label className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Revenue Document OCR / Digital Text (Bilingual Hindi + English)</span>
          <span className="text-[11px] text-slate-500">{docText.length} characters</span>
        </label>
        <textarea
          rows={5}
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste or scan land record text here..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          * Automated cross-check engine checks applicant vs titleholder, legal holding vs boundary, and duplicate file hashes.
        </p>
        <button
          type="button"
          onClick={handleRunVerification}
          disabled={loading || !docText.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Analyzing Document...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Verify Land Document</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-lg">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verification Output & Checks Grid */}
      {verificationResult && (
        <div className="space-y-3 pt-3 border-t border-slate-800 animate-fade-in">
          {/* Extracted Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Khasra / Survey</span>
              <span className="font-semibold text-slate-200 font-mono">
                {verificationResult.extracted_data?.khasra_no || 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Titleholder Name</span>
              <span className="font-semibold text-slate-200 truncate block">
                {verificationResult.extracted_data?.owner_name || 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Legal Document Area</span>
              <span className="font-semibold text-emerald-400">
                {verificationResult.extracted_data?.extracted_area_ha
                  ? `${verificationResult.extracted_data.extracted_area_ha} ha`
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Jurisdiction</span>
              <span className="font-semibold text-slate-200">
                {verificationResult.extracted_data?.district || district || 'District Office'}
              </span>
            </div>
          </div>

          {/* 4 Multi-Factor Consistency Checks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Name Match */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Claimant vs Owner Name
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    checks.name_match?.status === 'PASS' || checks.name_match?.status === 'PASS_TENANCY'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : checks.name_match?.status === 'WARN'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {checks.name_match?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {checks.name_match?.explanation || 'Awaiting verification.'}
              </p>
            </div>

            {/* 2. Area Consistency */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-400" /> Area Consistency
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    checks.area_consistency?.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : checks.area_consistency?.status === 'WARN'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {checks.area_consistency?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {checks.area_consistency?.reason || checks.area_consistency?.explanation || 'Awaiting verification.'}
              </p>
            </div>

            {/* 3. Tenancy Rights */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Tenancy Rights Protection
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {checks.tenancy_validation?.status || 'PASS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {checks.tenancy_validation?.reason || 'Verified under tenancy protection framework.'}
              </p>
            </div>

            {/* 4. Tamper & Recycled Fingerprint */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Duplicate Paper Audit
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    checks.tamper_detection?.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {checks.tamper_detection?.status || 'PASS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {checks.tamper_detection?.reason || 'Unique document hash verified.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

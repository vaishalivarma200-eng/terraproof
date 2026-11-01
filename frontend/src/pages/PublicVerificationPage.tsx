import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Building2, 
  Calendar, 
  MapPin, 
  Hash, 
  ExternalLink,
  Layers,
  ArrowRight,
  Shield
} from 'lucide-react';
import { api } from '../services/api';

export const PublicVerificationPage: React.FC = () => {
  const { identifier: urlIdentifier } = useParams<{ identifier?: string }>();
  const [searchTerm, setSearchTerm] = useState(urlIdentifier || 'CLM-2026-0891');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [auditChainStatus, setAuditChainStatus] = useState<any>(null);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [showLedger, setShowLedger] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async (queryId: string) => {
    if (!queryId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyDocumentPublic(queryId.trim());
      setRecord(data);
    } catch (err: any) {
      setError(err.message || 'Unable to query public registry.');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditChain = async () => {
    try {
      const chain = await api.verifyAuditLedgerChain();
      setAuditChainStatus(chain);
      const blocks = await api.getRecentAuditBlocks(10);
      setRecentBlocks(blocks);
    } catch (err) {
      console.error('Failed to query cryptographic ledger', err);
    }
  };

  useEffect(() => {
    if (urlIdentifier) {
      setSearchTerm(urlIdentifier);
      fetchVerification(urlIdentifier);
    } else {
      fetchVerification('CLM-2026-0891');
    }
    fetchAuditChain();
  }, [urlIdentifier]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(searchTerm);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Official Gov-Tech Style Topbar */}
      <header className="border-b border-emerald-900/40 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  Public Evidence Registry
                </span>
                <span className="text-xs text-slate-400">DPDP Act 2023 Compliant</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TerraProof <span className="text-slate-400 font-normal">| National Agricultural Decision Verification</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/insurance"
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
            >
              Revenue Official Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Search Bar */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Verify Inspection Order or Satellite Dossier</h2>
            <p className="text-sm text-slate-400 mb-5">
              Enter any Claim Reference Number, Inspection Order ID, or SHA-256 Digital Signature Hash to mathematically verify its authenticity.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. CLM-2026-0891, INSP-..., or SHA-256 hash"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Record'}
              </button>
            </form>

            {/* Quick Demo Previews */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span>Quick inspect:</span>
              <button 
                type="button" 
                onClick={() => { setSearchTerm('CLM-2026-0891'); fetchVerification('CLM-2026-0891'); }}
                className="text-emerald-400 hover:underline"
              >
                CLM-2026-0891 (Flood)
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => { setSearchTerm('CLM-2026-1044'); fetchVerification('CLM-2026-1044'); }}
                className="text-amber-400 hover:underline"
              >
                CLM-2026-1044 (Area Inflation)
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => { setSearchTerm('CLM-2026-0312'); fetchVerification('CLM-2026-0312'); }}
                className="text-rose-400 hover:underline"
              >
                CLM-2026-0312 (Plinth Change)
              </button>
            </div>
          </div>
        </section>

        {/* Verification Result Card */}
        {record && record.is_authentic ? (
          <section className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Authenticity Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                      Authentic Government Determination
                    </span>
                    <span className="text-xs text-slate-400">{record.document_type}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                    Record Reference: {record.reference_no}
                  </h3>
                </div>
              </div>

              {record.pdf_download_available && (
                <a
                  href={api.getPublicVerificationPdfUrl(record.inspection_id || record.reference_no)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/40 rounded-xl text-sm font-semibold transition"
                >
                  <Download className="w-4 h-4" />
                  Download Signed Statutory PDF
                </a>
              )}
            </div>

            {/* Structured Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Issuing Administrative Office
                </div>
                <div className="text-sm font-semibold text-white leading-snug">
                  {record.issuing_authority}
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Revenue Jurisdiction
                </div>
                <div className="text-sm font-semibold text-white">
                  Khasra #{record.khasra_no} • {record.district}, {record.state}
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Calamity & Season
                </div>
                <div className="text-sm font-semibold text-white">
                  {record.incident_peril} • {record.crop_type} ({record.crop_season})
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Confirmed Crop Damage</div>
                <div className="text-2xl font-black text-emerald-400">
                  {record.confirmed_damage_percent.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Statutory loss percentage</div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Administrative Action</div>
                <div className="text-sm font-bold text-amber-300">
                  {record.decision_action}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Quasi-judicial order code</div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Attestation Timestamp</div>
                <div className="text-sm font-semibold text-white">
                  {new Date(record.signed_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Fingerprint */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  SHA-256 Cryptographic Signature Fingerprint
                </span>
                <span className="text-[11px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                  Mathematical Tamper Proof
                </span>
              </div>
              <div className="font-mono text-xs text-emerald-300 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                {record.digital_signature_hash}
              </div>
            </div>

            {/* Mandatory DPDP Act Privacy Notice */}
            <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-emerald-300 font-semibold block mb-0.5">
                  Citizen Privacy Shield (Digital Personal Data Protection Act 2023)
                </strong>
                {record.privacy_notice}
              </div>
            </div>
          </section>
        ) : record && !record.is_authentic ? (
          <section className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6 sm:p-8 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Record Verification Failed</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {record.message || 'No registered administrative inspection order matches this identifier.'}
            </p>
          </section>
        ) : null}

        {/* Cryptographic Hash-Chain Ledger View */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Immutable Append-Only Audit Chain</h3>
                <p className="text-xs text-slate-400">
                  Every claim submission, satellite analysis run, and revenue officer sign-off is hashed in linear sequence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {auditChainStatus && (
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1.5 ${
                  auditChainStatus.is_valid 
                    ? 'bg-emerald-950/80 border-emerald-700/50 text-emerald-400' 
                    : 'bg-rose-950/80 border-rose-700/50 text-rose-400'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  {auditChainStatus.is_valid ? `Chain Valid (${auditChainStatus.total_blocks} Blocks)` : 'Chain Compromised'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowLedger(!showLedger)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                {showLedger ? 'Hide Blocks' : 'Inspect Ledger'}
              </button>
            </div>
          </div>

          {showLedger && recentBlocks.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 font-mono">
                Ledger Tip Hash: <span className="text-slate-300">{auditChainStatus?.tip_hash?.slice(0, 32)}...</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {recentBlocks.map((b) => (
                  <div key={b.block_index} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-indigo-400 font-semibold">Block #{b.block_index}</span>
                      <span className="text-[11px]">{new Date(b.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-white">
                        {b.event_type}
                      </span>
                      <span className="text-slate-400 truncate">Actor: {b.actor}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 break-all">
                      Hash: <span className="text-slate-400">{b.block_hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

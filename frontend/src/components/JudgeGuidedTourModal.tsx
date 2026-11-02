import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCheck2,
  FileText,
  Sparkles,
  Bot,
  ShieldCheck,
  Scale,
  Clock,
  Eye,
  Maximize2,
} from 'lucide-react';

interface JudgeGuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClaim?: (claimRef: string) => void;
  onOpenTerraGuide?: () => void;
  onOpenOfficialWorkflow?: () => void;
}

export const JudgeGuidedTourModal: React.FC<JudgeGuidedTourModalProps> = ({
  isOpen,
  onClose,
  onSelectClaim,
  onOpenTerraGuide,
  onOpenOfficialWorkflow,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'The Challenge: Post-Disaster Backlog',
      subtitle: 'Adjusters are 200 km away and cannot inspect thousands of flooded fields for 3+ weeks.',
      icon: Clock,
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description:
        'In rural India, when a major monsoon river breaches its embankment, thousands of crop insurance claims flood in at once. Traditional manual verification is slow, prone to disputes, and delays relief payments to genuine smallholder farmers who need immediate working capital.',
      keyTakeaway: 'TerraProof acts as the objective, satellite-grounded evidence layer between farmers, insurers, banks, and state revenue departments.',
      actionLabel: 'Inspect Inflated Claim C-002',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 2,
      title: 'Multi-Sensor Fusion & Evidence',
      subtitle: 'Sentinel-2 optical + Sentinel-1 SAR radar + Open-Meteo rainfall.',
      icon: Layers,
      badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
      description:
        'TerraProof automatically pulls before/after satellite passes. During overcast monsoon weeks when optical lenses are blinded by clouds, it seamlessly falls back to Sentinel-1 C-band synthetic aperture radar (SAR) to penetrate cloud cover and map standing surface water.',
      keyTakeaway: 'Provides multi-spectral NDVI vegetation loss, NDWI water index, and SAR radar backscatter alongside 7-day rainfall records.',
      actionLabel: 'View Before/After Satellite Mask',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 3,
      title: 'Automated Discrepancy Detection',
      subtitle: 'Claim C-002: Claimed 15.0 ha vs. Observed 6.2 ha (58.7% Divergence).',
      icon: AlertTriangle,
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      description:
        'In claim C-002, farmer Baldev Singh claimed complete loss across 15.0 hectares. Satellite water masks and DEM elevation topography prove that only 6.2 hectares in the low-lying river corridor (<84.5m) were submerged. The upper 8.8 ha remained dry and undamaged.',
      keyTakeaway: 'Protects ₹2,46,400 in premature disbursement, ensuring funds are reserved for genuinely impacted farmers.',
      actionLabel: 'Review Confidence Breakdown',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 4,
      title: 'Confidence Score (0-100) & Honest Limits',
      subtitle: 'Breakdown across image quality, clouds, resolution, freshness, and sensor agreement.',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'Every verification result outputs an explainable 0-100 confidence score with full breakdown. TerraProof is completely transparent about scientific limits: small plots < 1 ha, cloud occlusion (C-006: score 42), or subtle partial damage < 15% (C-007) are explicitly flagged as "satellite insufficient, physical verification required".',
      keyTakeaway: 'Never feigns false precision. Distinguishes high-confidence automated settlements from cases needing ground inspection.',
      actionLabel: 'Compare with Official Data',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 5,
      title: 'Compare with Official Government Data',
      subtitle: 'Side-by-side with AgriStack Digital Crop Survey (DCS) and e-Girdawari.',
      icon: Scale,
      badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      description:
        'TerraProof integrates directly with Indian Gov-Tech infrastructure: AgriStack Farmer ID registry, Digital Crop Survey (DCS), and State Land Records (Bhulekh / Jamabandi). For example, claim C-003 claimed flood damage for wheat in July, but DCS confirmed paddy/fallow was sown.',
      keyTakeaway: 'Eliminates seasonal crop mismatches and verifies cadastral land ownership before claims are processed.',
      actionLabel: 'View Triage Dashboard',
      onAction: () => {},
    },
    {
      step: 6,
      title: 'Claim Triage Queue (GREEN / AMBER / RED)',
      subtitle: 'Automatic segregation of claims across entire flood-impacted regions.',
      icon: CheckCircle2,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'In our 8 demo claims: GREEN (C-001) is fast-tracked in 24 hours with zero paperwork hassle; AMBER (C-003, C-004, C-006, C-007) are routed to relevant revenue officers for document or season checks; RED (C-002, C-005, C-008) trigger targeted on-site inspections for inflation, boundary overlap, or illegal construction.',
      keyTakeaway: 'Reduces claim backlog from 3 weeks to 24 hours while focusing limited field inspectors exactly where discrepancies exist.',
      actionLabel: 'Open Official Decision Support',
      onAction: () => onOpenOfficialWorkflow?.(),
    },
    {
      step: 7,
      title: 'Official Decision-Support (Patwari / Tehsildar)',
      subtitle: 'Officials remain the decision-makers; TerraProof pre-screens and drafts evidence.',
      icon: FileCheck2,
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      description:
        'Revenue officials (Patwari, Kanungo, Tehsildar) receive prioritized inspection queues sorted by risk and SLA deadlines. TerraProof pre-drafts the e-Girdawari entry with crop and damage range. Officials confirm or override on mobile, with every override recorded for auditability.',
      keyTakeaway: 'Fully complies with Indian administrative authority: pre-screens and drafts evidence, but never replaces human statutory officials.',
      actionLabel: 'Ask TerraGuide AI',
      onAction: () => onOpenTerraGuide?.(),
    },
    {
      step: 8,
      title: 'TerraGuide: Grounded AI Assistant',
      subtitle: 'Explains complex geospatial evidence in simple Hindi, English, and Hinglish.',
      icon: Bot,
      badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
      description:
        'Farmers, adjusters, and officials can ask TerraGuide questions in plain language: "Why was C-002 flagged?", "What does 58.7% divergence mean?", or "How much payout is reasonable?". Answers are grounded strictly in the computed claim data and PMFBY guidelines, with every answer citing the exact evidence used.',
      keyTakeaway: 'Works 100% offline with instant template fallback or online with hosted LLM integration.',
      actionLabel: 'View Tamper-Evident Dossier',
      onAction: () => onSelectClaim?.('CLM-DEMO-001'),
    },
    {
      step: 9,
      title: 'Cryptographic Audit Trail & Public QR Verification',
      subtitle: 'SHA-256 tamper-evident ledger and citizen verification portal.',
      icon: FileText,
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description:
        'Every calculation, inspection, and status update generates an immutable SHA-256 block in TerraProof\'s audit chain. A signed PDF evidence dossier with QR code is generated. Any farmer, bank officer, or citizen can scan the QR code to verify the report\'s authenticity on the public portal.',
      keyTakeaway: 'Ensures zero tampering, radical transparency, and alignment with the Digital Personal Data Protection (DPDP) Act 2023.',
      actionLabel: 'Tour Complete - Explore TerraProof',
      onAction: () => onClose(),
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  TerraProof Judge Walkthrough
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">3-Minute Executive Overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          <div className="flex items-start space-x-3.5">
            <div className={`p-3 rounded-xl border ${current.badgeColor} mt-0.5`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{current.title}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            {current.description}
          </div>

          {/* Key Takeaway Callout */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200">
              <strong className="text-emerald-300">Executive Insight: </strong>
              {current.keyTakeaway}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Interactive Action Button for this step */}
          <button
            onClick={() => {
              current.onAction();
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs shadow-lg transition-all cursor-pointer border border-emerald-500/30 flex items-center space-x-2"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

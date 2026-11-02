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
import { useLanguage } from '../context/LanguageContext';

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
  const { lang, isHindi } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stepsEn = [
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

  const stepsHi = [
    {
      step: 1,
      title: 'चुनौती: आपदा के उपरांत दावों का भारी अंबार',
      subtitle: 'सर्वेक्षक 200 किमी दूर हैं और 3+ सप्ताह तक हजारों जलमग्न खेतों का भौतिक निरीक्षण संभव नहीं।',
      icon: Clock,
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description:
        'ग्रामीण भारत में जब मानसूनी नदी का तटबंध टूटता है, तो एक साथ हजारों फसल बीमा दावे आते हैं। पारंपरिक स्थलीय सत्यापन धीमा और विवादों से भरा होता है, जिससे वास्तविक छोटे किसानों को कार्यशील राहत मिलने में भारी देरी होती है।',
      keyTakeaway: 'टेराप्रूफ किसानों, बीमाकर्ताओं, बैंकों और राज्य राजस्व विभागों के बीच वस्तुनिष्ठ, उपग्रह-आधारित साक्ष्य परत के रूप में कार्य करता है।',
      actionLabel: 'अतिशयोक्तिपूर्ण दावा C-002 जांचें',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 2,
      title: 'बहु-संवेदक उपग्रह एकीकरण एवं साक्ष्य',
      subtitle: 'सेंटिनल-2 ऑप्टिकल + सेंटिनल-1 सार (SAR) रडार + ओपन-मेटियो वर्षा अभिलेख।',
      icon: Layers,
      badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
      description:
        'टेराप्रूफ आपदा से पहले और बाद के उपग्रह परिदृश्यों को स्वतः प्राप्त करता है। घने बादलों वाले मानसूनी हफ्तों में जब ऑप्टिकल कैमरे दृष्टिहीन होते हैं, यह निर्बाध रूप से सेंटिनल-1 सी-बैंड सिंथेटिक अपर्चर रडार (SAR) का उपयोग करता है जो बादलों को भेदकर जलभराव का नक्शा बनाता है।',
      keyTakeaway: '7 दिवसीय वर्षा रिकॉर्ड के साथ एनडीवीआई वनस्पति ह्रास, एनडीडब्ल्यूआई जल सूचकांक और सार रडार बैकस्कैटर प्रदान करता है।',
      actionLabel: 'उपग्रह जलभराव मास्क देखें',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 3,
      title: 'स्वचालित विसंगति पहचान (क्षेत्रफल अंतर)',
      subtitle: 'दावा C-002: दावाकृत 15.0 हेक्टेयर बनाम उपग्रह प्रेक्षित 6.2 हेक्टेयर (58.7% विसंगति)।',
      icon: AlertTriangle,
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      description:
        'दावा C-002 में किसान बलदेव सिंह ने 15.0 हेक्टेयर पर पूर्ण फसल बर्बादी का दावा किया। उपग्रह जल मास्क और डिजिटल एलिवेशन मॉडल (DEM) स्थलाकृति सिद्ध करती है कि केवल निचले नदी क्षेत्र (<84.5मी) में स्थित 6.2 हेक्टेयर भूमि जलमग्न हुई थी। ऊपरी 8.8 हेक्टेयर क्षेत्र सूखा और सुरक्षित रहा।',
      keyTakeaway: 'असमय संवितरण से ₹2,46,400 की सरकारी/बीमा धनराशि सुरक्षित करता है, जिससे वास्तविक प्रभावित किसानों हेतु निधि सुरक्षित रहे।',
      actionLabel: 'विश्वास स्कोर विभाजन देखें',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 4,
      title: 'विश्वास स्कोर (0-100) एवं ईमानदार वैज्ञानिक सीमाएं',
      subtitle: 'छवि गुणवत्ता, बादल, विभेदन, ताजगी और संवेदक सहमति के आधार पर पारदर्शी गणना।',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'प्रत्येक सत्यापन परिणाम 0-100 के बीच एक पारदर्शी विश्वास स्कोर प्रदान करता है। टेराप्रूफ अपनी वैज्ञानिक सीमाओं को छुपाता नहीं: 1 हेक्टेयर से छोटे भूखंड, घने बादल (C-006: स्कोर 42), या 15% से कम सूक्ष्म आंशिक क्षति (C-007) को स्पष्ट रूप से "उपग्रह अपर्याप्त, स्थलीय सत्यापन अनिवार्य" के रूप में चिह्नित किया जाता है।',
      keyTakeaway: 'कभी भी झूठी सटीकता का दावा नहीं करता। स्वचालित निपटान और स्थलीय जांच योग्य मामलों को स्पष्ट अलग करता है।',
      actionLabel: 'आधिकारिक सरकारी डेटा से तुलना करें',
      onAction: () => onSelectClaim?.('CLM-DEMO-002'),
    },
    {
      step: 5,
      title: 'आधिकारिक सरकारी डेटा से तुलना',
      subtitle: 'एग्रीस्टैक डिजिटल क्रॉप सर्वे (DCS) और ई-गिरदावरी के साथ आमने-सामने मिलान।',
      icon: Scale,
      badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      description:
        'टेराप्रूफ भारतीय गोव-टेक बुनियादी ढांचे से सीधे जुड़ता है: एग्रीस्टैक फार्मर आईडी, डिजिटल क्रॉप सर्वे (DCS), और राज्य भू-अभिलेख (भूलेख/जमाबंदी)। उदाहरणार्थ, दावा C-003 में जुलाई में गेहूं की बाढ़ क्षति का दावा किया गया था, परंतु डीसीएस रिकॉर्ड ने पुष्टि की कि खेत में धान बोया गया था।',
      keyTakeaway: 'दावों के प्रसंस्करण से पहले मौसमी फसल बेमेल को समाप्त करता है और कैडस्ट्रल भूमि स्वामित्व की पुष्टि करता है।',
      actionLabel: 'दावा छंटाई कतार देखें',
      onAction: () => {},
    },
    {
      step: 6,
      title: 'दावा छंटाई कतार (हरा / पीला / लाल)',
      subtitle: 'बाढ़ प्रभावित क्षेत्रों में दावों का जोखिम-आधारित स्वचालित वर्गीकरण।',
      icon: CheckCircle2,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'हमारे 8 डेमो दावों में: हरा (C-001) बिना किसी कागजी परेशानी के 24 घंटे में फास्ट-ट्रैक स्वीकृत होता है; पीला (C-003, C-004, C-006, C-007) दस्तावेज या मौसम जांच हेतु संबंधित अधिकारियों को भेजा जाता है; लाल (C-002, C-005, C-008) अतिशयोक्ति, सीमा अतिच्छादन या अवैध निर्माण की लक्षित ऑन-साइट जांच को ट्रिगर करता है।',
      keyTakeaway: 'दावा बैकलॉग को 3 सप्ताह से घटाकर 24 घंटे करता है और क्षेत्रीय निरीक्षकों को सटीक विसंगति वाले स्थानों पर केंद्रित करता है।',
      actionLabel: 'आधिकारिक निर्णय समर्थन खोलें',
      onAction: () => onOpenOfficialWorkflow?.(),
    },
    {
      step: 7,
      title: 'आधिकारिक निर्णय-समर्थन (पटवारी / तहसीलदार)',
      subtitle: 'अधिकारी ही निर्णयकर्ता हैं; टेराप्रूफ केवल साक्ष्य तैयार करता है।',
      icon: FileCheck2,
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      description:
        'राजस्व अधिकारियों (पटवारी, कानूनगो, तहसीलदार) को जोखिम और एसएलए समय-सीमा के अनुसार प्राथमिकता प्राप्त निरीक्षण कतार मिलती है। टेराप्रूफ फसल और क्षति सीमा के साथ ई-गिरदावरी प्रविष्टि का पूर्व-प्रारूप तैयार करता है। अधिकारी मोबाइल पर पुष्टि करते हैं या संशोधन करते हैं, जिसमें प्रत्येक संशोधन का ऑडिट रिकॉर्ड दर्ज होता है।',
      keyTakeaway: 'भारतीय प्रशासनिक संप्रभुता के अनुरूप: साक्ष्य प्रस्तुत करता है, परंतु कभी भी मानव सांविधिक अधिकारियों का स्थान नहीं लेता।',
      actionLabel: 'टेरागाइड एआई से पूछें',
      onAction: () => onOpenTerraGuide?.(),
    },
    {
      step: 8,
      title: 'टेरागाइड: जमीनी एआई निर्णय सहायक',
      subtitle: 'जटिल भू-स्थानिक साक्ष्यों को सरल हिंदी, अंग्रेजी और हिंग्लिश में समझाता है।',
      icon: Bot,
      badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
      description:
        'किसान, सर्वेक्षक और अधिकारी टेरागाइड से सीधे प्रश्न पूछ सकते हैं: "C-002 को लाल क्यों चिह्नित किया गया?", "58.7% विसंगति का क्या अर्थ है?", या "कितना मुआवजा उचित है?". उत्तर कड़ाई से संगणित दावा डेटा और पीएमएफबीवाई दिशानिर्देशों पर आधारित होते हैं, और प्रत्येक उत्तर उपयोग किए गए साक्ष्य का उल्लेख करता है।',
      keyTakeaway: '100% ऑफलाइन टेम्पलेट मोड या ऑनलाइन एलएलएम एकीकरण के साथ काम करता है।',
      actionLabel: 'छेड़छाड़-रोधी साक्ष्य डोजियर देखें',
      onAction: () => onSelectClaim?.('CLM-DEMO-001'),
    },
    {
      step: 9,
      title: 'क्रिप्टोग्राफिक ऑडिट ट्रेल एवं सार्वजनिक क्यूआर सत्यापन',
      subtitle: 'SHA-256 ब्लॉकचेन-शैली लेजर और नागरिक सत्यापन पोर्टल।',
      icon: FileText,
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description:
        'प्रत्येक गणना, निरीक्षण और स्थिति अद्यतन टेराप्रूफ की ऑडिट श्रृंखला में एक अपरिवर्तनीय SHA-256 ब्लॉक उत्पन्न करता है। क्यूआर कोड के साथ एक हस्ताक्षरित पीडीएफ साक्ष्य डोजियर तैयार किया जाता है। कोई भी किसान, बैंक अधिकारी या नागरिक सार्वजनिक पोर्टल पर रिपोर्ट की प्रामाणिकता सत्यापित करने के लिए क्यूआर कोड स्कैन कर सकता है।',
      keyTakeaway: 'शून्य छेड़छाड़, पूर्ण पारदर्शिता और डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 का पूर्ण अनुपालन सुनिश्चित करता है।',
      actionLabel: 'दौरा पूरा हुआ - टेराप्रूफ देखें',
      onAction: () => onClose(),
    },
  ];

  const steps = isHindi ? stepsHi : stepsEn;
  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
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
                  {isHindi ? 'टेराप्रूफ मार्गदर्शित दौरा' : 'TerraProof Judge Walkthrough'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isHindi
                    ? `चरण ${currentStep + 1} / ${steps.length}`
                    : `Step ${currentStep + 1} of ${steps.length}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi ? '3-मिनट का सारगर्भित अवलोकन' : '3-Minute Executive Overview'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="grid grid-cols-9 gap-1 px-6 pt-3 pb-1 bg-slate-950/80">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-emerald-400 scale-y-125'
                  : idx < currentStep
                  ? 'bg-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`${isHindi ? 'चरण' : 'Step'} ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Step Category Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-md border ${current.badgeColor}`}>
                <StepIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {isHindi ? `विषय ${current.step}` : `Module ${current.step}`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* Titles */}
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {current.title}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              {current.subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            {current.description}
          </p>

          {/* Key Takeaway Box */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                {isHindi ? 'मुख्य निष्कर्ष' : 'Key Takeaway'}
              </span>
              <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
                {current.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/70">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHindi ? 'पिछला' : 'Previous'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Context Action Button (e.g. Inspect Claim C-002) */}
            {current.actionLabel && (
              <button
                onClick={() => {
                  current.onAction();
                  onClose();
                }}
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                <span>{current.actionLabel}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>
                {currentStep === steps.length - 1
                  ? isHindi
                    ? 'दौरा समाप्त करें'
                    : 'Finish Tour'
                  : isHindi
                  ? 'अगला'
                  : 'Next'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation & Branding
  'nav.brand': { en: 'TerraProof', hi: 'टेराप्रूफ' },
  'nav.tagline': {
    en: 'National Agricultural Decision-Support Layer',
    hi: 'राष्ट्रीय कृषि निर्णय-समर्थन एवं भू-स्थानिक साक्ष्य प्रणाली',
  },
  'nav.home': { en: 'Home', hi: 'मुख्य पृष्ठ' },
  'nav.claims': { en: 'Claims Triage', hi: 'दावा सत्यापन' },
  'nav.overview': { en: 'Overview', hi: 'सिंहावलोकन' },
  'nav.flood': { en: 'Flood', hi: 'बाढ़' },
  'nav.drought': { en: 'Drought', hi: 'सूखा' },
  'nav.forest': { en: 'Forest', hi: 'वन परिवर्तन' },
  'nav.verify': { en: 'Public Verify', hi: 'सार्वजनिक सत्यापन' },
  'nav.about': { en: 'Methodology', hi: 'कार्यप्रणाली' },
  'nav.verifyClaim': { en: 'Verify a claim', hi: 'दावा सत्यापित करें' },
  'nav.startTour': { en: 'Tour (3 min)', hi: 'मार्गदर्शित दौरा (3 मिनट)' },
  'nav.langSwitch': { en: 'हिंदी', hi: 'English' },

  // Demo Banner
  'banner.syntheticData': { en: 'SYNTHETIC DEMO DATA', hi: 'सिंथेटिक डेमो डेटा' },
  'banner.scenario': {
    en: 'Kharif Flood Scenario (Vikrampur Demo District, 12 July)',
    hi: 'खरीफ बाढ़ परिदृश्य (विक्रमपुर डेमो जिला, 12 जुलाई)',
  },
  'banner.disclaimer': {
    en: '• Modelled on monsoon riverine flood. Not real farmers or actual claims.',
    hi: '• मानसूनी नदी बाढ़ पर आधारित। वास्तविक किसान या वास्तविक दावे नहीं।',
  },
  'banner.assamDemo': { en: 'Assam Flood Demo', hi: 'असम बाढ़ डेमो' },
  'banner.simulator': { en: 'Simulator', hi: 'परिदृश्य सिम्युलेटर' },
  'banner.jump': { en: 'Jump:', hi: 'त्वरित दावा:' },
  'banner.tour': { en: 'Tour (3 min)', hi: 'दौरा (3 मिनट)' },
  'banner.presMode': { en: 'Pres Mode', hi: 'प्रस्तुति मोड' },
  'banner.exitPres': { en: 'Exit Pres', hi: 'सामान्य मोड' },
  'banner.reset': { en: 'Reset Demo', hi: 'डेमो रीसेट' },
  'banner.resetting': { en: 'Resetting...', hi: 'रीसेट हो रहा है...' },
  'banner.active': { en: 'DEMO MODE ACTIVE', hi: 'डेमो मोड सक्रिय' },

  // Landing Page Hero
  'landing.heroBadge': {
    en: 'National Agricultural Decision-Support Layer',
    hi: 'राष्ट्रीय कृषि निर्णय-समर्थन एवं उपग्रह साक्ष्य प्रणाली',
  },
  'landing.headline1': {
    en: 'The land writes its history.',
    hi: 'भूमि अपना इतिहास लिखती है।',
  },
  'landing.headline2': {
    en: 'We help you read it.',
    hi: 'हम इसे पढ़ने में आपकी सहायता करते हैं।',
  },
  'landing.subhead': {
    en: 'TerraProof fuses Sentinel-1 SAR and Sentinel-2 optical imagery with meteorological archives into defensible, explainable evidence for revenue officers, PMFBY insurers, and farmers.',
    hi: 'टेराप्रूफ सेंटिनल-1 सार (SAR) और सेंटिनल-2 ऑप्टिकल उपग्रह चित्रों को मौसम संबंधी अभिलेखों के साथ मिलाकर राजस्व अधिकारियों, पीएमएफबीवाई बीमाकर्ताओं और किसानों के लिए अकाट्य, पारदर्शी साक्ष्य तैयार करता है।',
  },
  'landing.ctaVerify': { en: 'Verify a claim', hi: 'दावा सत्यापित करें' },
  'landing.ctaRegistry': { en: 'Public Registry', hi: 'सार्वजनिक रजिस्टर' },
  'landing.ctaTour': { en: 'Start Guided Tour (3 min)', hi: 'मार्गदर्शित दौरा शुरू करें (3 मिनट)' },
  'landing.scroll': { en: 'Scroll to explore modules', hi: 'मॉड्यूल देखने हेतु नीचे स्क्रॉल करें' },

  // Landing Page Stats
  'landing.statClaims': { en: 'Claims Triaged', hi: 'छंटाई किए गए दावे' },
  'landing.statProtected': { en: 'Protected from Premature Payout', hi: 'असमय भुगतान से सुरक्षित राशि' },
  'landing.statResolution': { en: 'Multi-Spectral Resolution', hi: 'उपग्रह स्थानिक विभेदन' },
  'landing.statSensors': { en: 'Active Constellations (S1/S2)', hi: 'सक्रिय उपग्रह संवेदक (S1/S2)' },

  // Landing Page Modules
  'landing.modulesBadge': { en: 'Specialized Geospatial Engines', hi: 'विशेष भू-स्थानिक समाधान' },
  'landing.modulesTitle': {
    en: 'Four Engines. Defensible Evidence at Every Stage.',
    hi: 'चार विशेष प्रणालियाँ। हर स्तर पर अकाट्य उपग्रह साक्ष्य।',
  },
  'landing.modulesSubtitle': {
    en: 'Designed to plug directly into state revenue workflows, PMFBY insurance portals, and AgriStack digital registers.',
    hi: 'राज्य राजस्व कार्यप्रणालियों, पीएमएफबीवाई बीमा पोर्टलों और एग्रीस्टैक डिजिटल रजिस्टरों के साथ सीधे समन्वय हेतु निर्मित।',
  },

  // Positioning Section
  'landing.positioningBadge': { en: 'Administrative Authority', hi: 'प्रशासनिक संप्रभुता एवं नियम' },
  'landing.positioningTitle': {
    en: 'Officials Remain Decision-Makers. TerraProof Pre-Screens & Drafts Evidence.',
    hi: 'अधिकारी ही अंतिम निर्णयकर्ता हैं — टेराप्रूफ केवल साक्ष्य तैयार करता है।',
  },
  'landing.positioningDesc': {
    en: 'TerraProof does NOT replace patwaris, tehsildars, official land records, or insurance committees. It eliminates weeks of post-disaster backlog by pre-screening discrepancies, highlighting physical audit needs, and pre-drafting e-Girdawari entries.',
    hi: 'टेराप्रूफ पटवारी, तहसीलदार, आधिकारिक भू-अभिलेखों या बीमा समितियों का स्थान नहीं लेता। यह विसंगतियों की अग्रिम छंटाई कर, स्थलीय निरीक्षण की प्राथमिक सूची बनाकर और ई-गिरदावरी प्रविष्टियों का मसौदा तैयार कर आपदा के बाद के हफ्तों के विलंब को समाप्त करता है।',
  },

  // Common UI
  'common.close': { en: 'Close', hi: 'बंद करें' },
  'common.next': { en: 'Next', hi: 'अगला' },
  'common.previous': { en: 'Previous', hi: 'पिछला' },
  'common.step': { en: 'Step', hi: 'चरण' },
  'common.of': { en: 'of', hi: 'का' },
  'common.viewClaim': { en: 'Inspect Claim', hi: 'दावा जांचें' },
  'common.rupees': { en: '₹', hi: '₹' },
  'common.hectares': { en: 'ha', hi: 'हेक्टेयर' },
  'common.confidence': { en: 'Confidence', hi: 'विश्वसनीयता' },
  'common.fastTrack': { en: 'Fast-Track Approved', hi: 'फास्ट-ट्रैक स्वीकृत' },
  'common.needsReview': { en: 'Needs Review', hi: 'समीक्षा आवश्यक' },
  'common.flagged': { en: 'Flagged for Audit', hi: 'जांच हेतु ध्वजचिह्नित' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('terraproof_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) {
      // Ignore localStorage error
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('terraproof_lang', newLang);
    } catch (e) {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isHindi: lang === 'hi',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

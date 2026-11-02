import React from 'react';
import { Satellite, Globe2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { isHindi } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-slate-950 via-[#030712] to-black border-t border-slate-800/80 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-emerald-400">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-white tracking-tight">
                Terra<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Proof</span>
              </span>
              <span className="text-[11px] text-slate-400 block font-normal">
                {isHindi
                  ? 'कृषि बीमा एवं राजस्व प्रशासन हेतु विश्वसनीय उपग्रह साक्ष्य प्रणाली।'
                  : 'Calm, credible satellite evidence for agricultural insurance.'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400">
            <span>Copernicus Sentinel-1 SAR</span>
            <span>•</span>
            <span>Sentinel-2 Optical (MSI)</span>
            <span>•</span>
            <span>Open-Meteo Weather Archive</span>
            <span>•</span>
            <span>Planetary Computer STAC</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-start space-x-3 text-[11px] leading-relaxed text-slate-300">
          <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">
              {isHindi ? 'उत्तरदायी निर्णय-समर्थन सूचना:' : 'Responsible Decision-Support Notice:'}
            </strong>{' '}
            {isHindi
              ? 'टेराप्रूफ अनुभवजन्य रेडियोमेट्रिक साक्ष्य (एनडीवीआई, एनडीडब्ल्यूआई, सार बैकस्कैटर अंतर) तैयार करता है। उपग्रह केवल अवलोकन करते हैं; टेराप्रूफ साक्ष्य व्यवस्थित करता है; मानव सांविधिक अधिकारी व बीमा समायोजक अंतिम निर्णय लेते हैं। यह मानव ऑडिट के बिना कानूनी धोखाधड़ी या मुआवजे की अंतिम गारंटी नहीं देता।'
              : 'TerraProof generates empirical radiometric evidence (NDVI, NDWI, SAR backscatter differences). The satellites observe; TerraProof organises the evidence; a human claims adjuster decides what it means. It does not conclusively determine legal fraud or guarantee indemnity payouts without human audit.'}
          </p>
        </div>

        <div className="text-center text-slate-500 text-[11px]">
          TerraProof © {new Date().getFullYear()} • Engineered with React, Three.js, Leaflet & FastAPI Geospatial Remote Sensing.
        </div>
      </div>
    </footer>
  );
};

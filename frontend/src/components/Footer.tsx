import React from 'react';
import { Satellite, Globe2, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#091713] border-t border-teal-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-teal-900/30 pb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-white tracking-tight">
                Terra<span className="text-teal-400">Proof</span>
              </span>
              <span className="text-[11px] text-slate-400 block font-normal">
                Calm, credible satellite evidence for agricultural insurance.
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

        <div className="bg-[#0e241e]/80 p-4 rounded-xl border border-teal-500/15 flex items-start space-x-3 text-[11px] leading-relaxed text-slate-300">
          <ShieldAlert className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Responsible Decision-Support Notice:</strong> TerraProof generates
            empirical radiometric evidence (NDVI, NDWI, SAR backscatter differences). The satellites observe; TerraProof
            organises the evidence; a human claims adjuster decides what it means. It does not conclusively determine legal fraud
            or guarantee indemnity payouts without human audit.
          </p>
        </div>

        <div className="text-center text-slate-500 text-[11px]">
          TerraProof © {new Date().getFullYear()} • Engineered with React, Three.js, Leaflet & FastAPI Geospatial Remote Sensing.
        </div>
      </div>
    </footer>
  );
};

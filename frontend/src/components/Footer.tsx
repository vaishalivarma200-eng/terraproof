import React from 'react';
import { ShieldAlert, Globe2, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">TerraProof Earth Observation System</span>
            <span>• Academic & Environmental Evidence Prototype</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Data Sources: Copernicus Sentinel-1/2 (ESA)</span>
            <span>•</span>
            <span>Weather: Open-Meteo Archive</span>
            <span>•</span>
            <span>STAC: Microsoft Planetary Computer</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 flex items-start space-x-3 text-[11px] leading-relaxed text-slate-400">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Responsible Decision-Support Notice:</strong> TerraProof generates
            radiometric consistency indicators (NDVI, NDWI, bi-temporal change deltas). It does not conclusively
            adjudicate legal fraud or automatically determine insurance claim indemnity without accredited human field audit.
          </p>
        </div>

        <div className="text-center text-slate-500 text-[10px]">
          TerraProof © {new Date().getFullYear()} • Designed and engineered with React, Leaflet, FastAPI & Geospatial Python.
        </div>
      </div>
    </footer>
  );
};

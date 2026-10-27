import React from 'react';
import { Link } from 'react-router-dom';
import {
  Satellite,
  ShieldCheck,
  Droplets,
  SunMedium,
  Trees,
  ArrowRight,
  FileCheck2,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Geospatial Decision-Support Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Satellite Evidence for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Agricultural Claim Verification
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            TerraProof combines multi-spectral Sentinel-2 optical imagery, Sentinel-1 synthetic aperture radar,
            and historical weather records to verify environmental loss objectively and empower human adjusters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/claims"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 group"
            >
              <span>Verify an Insurance Claim</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/overview"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              Explore Operations Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Evidence-First Verification Architecture
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A transparent four-step forensic remote-sensing workflow designed to provide defensible evidence, not black-box automated verdicts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Claim Registration</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Accepts farm cadastral boundary polygons, reported crop types, loss categories, and incident date windows.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Multi-Sensor Ingestion</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Queries open STAC catalogs to locate cloud-free pre- and post-incident Sentinel-1/2 acquisitions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Spectral Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Computes NDVI vegetation loss, NDWI water inundation, and correlates findings with local Open-Meteo rainfall.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Dossier & Audit</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generates a signed PDF dossier with vector map overlays and explicit limitations for human adjusters.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Four Specialized Earth Observation Modules
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Comprehensive environmental monitoring tailored for agricultural underwriters, risk auditors, and conservation researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/claims"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 hover:border-emerald-500/40 transition-all space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Primary Module
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Agricultural Insurance Claim Verification
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Corroborates claimed crop damage against pre- and post-disaster spectral indices. Quantifies discrepancy between claimed and observed loss hectares.
              </p>
            </div>
          </Link>

          <Link
            to="/flood"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 hover:border-sky-500/40 transition-all space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                Flood Inundation & Surface Water Delineation
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Applies McFeeters NDWI and Sentinel-1 synthetic aperture radar backscatter thresholding to map active flood extent across cloudy skies.
              </p>
            </div>
          </Link>

          <Link
            to="/drought"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 hover:border-amber-500/40 transition-all space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <SunMedium className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Drought & Crop-Stress Monitoring
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Tracks temporal NDVI trajectories and topsoil moisture deficits to identify sustained agricultural drought while accounting for harvesting calendars.
              </p>
            </div>
          </Link>

          <Link
            to="/deforestation"
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 hover:border-teal-500/40 transition-all space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                Deforestation & Land-Cover Change Detection
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Measures bi-temporal forest canopy loss, distinguishes timber clearance from seasonal leaf shedding, and generates vector polygon overlays.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};


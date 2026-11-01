import React from 'react';
import { Link } from 'react-router-dom';
import {
  Satellite,
  ShieldCheck,
  Droplets,
  SunMedium,
  Trees,
  ArrowRight,
  Radio,
  Eye,
  LineChart,
  CloudRain,
  Activity,
  MapPin,
  Sparkles,
  CheckCircle2,
  Building2,
  Scale
} from 'lucide-react';
import { ThreeCanvas3D } from '../components/ThreeCanvas3D';
import { MotionText3D, FloatingCard3D } from '../components/MotionText3D';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 font-sans min-h-screen selection:bg-emerald-500/30 selection:text-white">
      {/* =========================================================================
          SECTION 1: HERO
          Formal dark atmospheric landscape, Three.js 3D depth, editorial typography
         ========================================================================= */}
      <section className="relative min-h-[94vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#080d19] via-[#050811] to-slate-950">
        {/* Landscape photo with formal deep monochrome / slate grading */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=2000&q=85')`,
          }}
        />

        {/* Formal Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-[#080d19]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />

        {/* Three.js 3D Orbital Canvas (Rotating Wireframe Earth & Satellite Constellation) */}
        <ThreeCanvas3D />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 3D Animated Headline & Actions */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category Pill */}
              <MotionText3D delay={0.1} depth={-20}>
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-emerald-400 font-medium tracking-wide shadow-lg backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>National Agricultural Decision-Support Layer</span>
                </div>
              </MotionText3D>

              {/* Editorial Headline with Formal Gradient Accent */}
              <MotionText3D delay={0.25} depth={-60}>
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.25rem] text-white font-medium tracking-tight leading-[1.06]">
                  The land writes its <br />
                  history. <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent italic font-normal drop-shadow-sm">
                    We help you read it.
                  </span>
                </h1>
              </MotionText3D>

              {/* Subtitle */}
              <MotionText3D delay={0.4} depth={-30}>
                <p className="max-w-xl text-base sm:text-lg text-slate-300/90 font-light leading-relaxed">
                  TerraProof fuses Sentinel-1 SAR and Sentinel-2 optical imagery with meteorological archives into defensible, explainable evidence for revenue officers, PMFBY insurers, and farmers.
                </p>
              </MotionText3D>

              {/* CTA Buttons & Subtle Scroll Indicator */}
              <MotionText3D delay={0.55} depth={-20}>
                <div className="flex flex-wrap items-center justify-between gap-6 pt-3 max-w-xl">
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/claims"
                      className="px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-sm shadow-xl shadow-emerald-950/60 border border-emerald-500/30 transition-all flex items-center space-x-2 group"
                    >
                      <span>Verify a claim</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/verify"
                      className="px-6 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-medium text-sm backdrop-blur-md transition-all flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Public Registry</span>
                    </Link>
                  </div>

                  {/* Formal Scroll Indicator */}
                  <div className="hidden sm:flex items-center space-x-2 text-[10px] tracking-widest text-slate-400 font-mono uppercase">
                    <span>EXPLORE</span>
                    <div className="w-3.5 h-5 rounded-full border border-slate-600 flex items-start justify-center p-0.5">
                      <div className="w-1 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              </MotionText3D>
            </div>

            {/* Right Column: Floating Live-Data Badges */}
            <div className="lg:col-span-4 relative h-64 lg:h-96 hidden sm:flex flex-col justify-center space-y-4">
              {/* Top Floating Badge: Flood Extent */}
              <FloatingCard3D delay={0.6} floatY={8} className="self-end">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-left shadow-2xl text-xs space-y-1 w-68 hover:border-slate-700 transition-colors">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Radio className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>Flood extent · 412 ha (est.)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-7 font-mono">
                    Sentinel-1 SAR · VV/VH Dual-Pol
                  </div>
                </div>
              </FloatingCard3D>

              {/* Middle Floating Badge: NDVI Crop Stress */}
              <FloatingCard3D delay={0.8} floatY={6} className="self-start ml-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-left shadow-2xl text-xs space-y-1 w-68 hover:border-slate-700 transition-colors">
                  <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-teal-300 text-xs">🍃</span>
                    </div>
                    <span>NDVI −0.31 vs. baseline</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-7 font-mono">
                    Phenological drop · Patwari audit
                  </div>
                </div>
              </FloatingCard3D>

              {/* Lower Floating Badge: Pass Matched */}
              <FloatingCard3D delay={1.0} floatY={7} className="self-end mr-4">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-left shadow-2xl text-xs space-y-1 w-68 hover:border-slate-700 transition-colors">
                  <div className="flex items-center space-x-2 text-sky-400 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <Satellite className="w-3 h-3 text-sky-400" />
                    </div>
                    <span>STAC Pass · 06:42 UTC</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-7 font-mono">
                    Planetary Computer · 10m L2A
                  </div>
                </div>
              </FloatingCard3D>
            </div>
          </div>
        </div>

        {/* Formal Architectural Gradient Rule */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent z-10" />
      </section>

      {/* =========================================================================
          SECTION 2: FEATURE TICKER BAR
         ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 border-b border-slate-800/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Sentinel-1 SAR Radar</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Sentinel-2 Optical (10m)</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <span>NDVI / NDWI Differencing</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors">
              <CloudRain className="w-4 h-4 text-emerald-400" />
              <span>Open-Meteo Rainfall Archive</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Immutable Cryptographic Ledger</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FOUR MODULES — "FOUR LENSES ON THE SAME LAND"
         ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Header */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400">
              FOUR CORE DOMAINS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
              Four lenses on the same land
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Every analysis is decision support. The satellites observe; TerraProof drafts the evidence; designated human revenue officials make the quasi-judicial determination.
            </p>
          </div>

          {/* Formal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Insurance Claim Verification (Core) */}
            <Link
              to="/claims"
              className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start space-y-5 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CORE
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Claim verification
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Correlate reported crop damage against pre- and post-disaster spectral signatures. Quantifies claimed vs. observed area discrepancy.
                </p>
              </div>
            </Link>

            {/* Card 2: Flood Monitoring */}
            <Link
              to="/flood"
              className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-950/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start space-y-5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Droplets className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold text-white group-hover:text-sky-400 transition-colors">
                  Flood monitoring
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Radar-first inundation mapping with Sentinel-1 SAR and optical NDWI. Delineates standing water extent through dense monsoon clouds.
                </p>
              </div>
            </Link>

            {/* Card 3: Drought & Crop Stress */}
            <Link
              to="/drought"
              className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-950/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start space-y-5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <SunMedium className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Drought & crop stress
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Vegetation-greenness trends, soil moisture deficits, and meteorological precipitation integration across growing seasons.
                </p>
              </div>
            </Link>

            {/* Card 4: Forest & Land-Cover Change */}
            <Link
              to="/deforestation"
              className="p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-950/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start space-y-5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Trees className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold text-white group-hover:text-teal-400 transition-colors">
                  Land-cover change
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Multi-temporal differencing detecting unauthorized construction, plinths, and forest clearing on agricultural parcels.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE WORKFLOW
          "From orbit to evidence, in four calm steps"
         ========================================================================= */}
      <section id="workflow" className="py-24 bg-gradient-to-b from-slate-950 via-[#070c18] to-slate-950 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400">
              AUDIT WORKFLOW
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
              From orbit to evidence, in four calm steps
            </h2>
          </div>

          {/* 4 Connected Circular Step Cards on a horizontal timeline */}
          <div className="relative">
            {/* Horizontal Line connecting nodes (desktop) */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[1px] bg-slate-800 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-emerald-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    1
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Define the land
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Draw field boundary or enter Khasra coordinates. TerraProof validates geometry and builds the minimum bounding study envelope.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-emerald-400">
                    <Satellite className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    2
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Match the passes
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    The engine finds Sentinel-1 SAR and Sentinel-2 optical observations before and after the incident with exact timestamps.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-emerald-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    3
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Run the analysis
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Radar flood mapping, vegetation indices, change detection — with methods, thresholds, and sensor provenance transparently exposed.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    4
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    Quasi-judicial order
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Evidence pack with SLA tracking, override logging, and cryptographic SHA-256 digital stamp for Patwari / Tehsildar adjudication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LIVE TEST DRIVE CALLOUT
         ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-black border-t border-slate-800/80 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400">
            QUICK EVALUATION ARCHETYPES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
            Ready to inspect satellite evidence on real farm parcels?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-light">
            Review live claims, inspect cadastral boundaries, evaluate NDBI land-use change, or verify signed statutory inspection orders on the public ledger.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/claims"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-sm shadow-xl shadow-emerald-950/40 border border-emerald-500/30 transition-all inline-flex items-center space-x-2"
            >
              <span>Launch Claims Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/verify"
              className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all inline-flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Public Verification Portal</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

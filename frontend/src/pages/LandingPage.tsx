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
} from 'lucide-react';
import { ThreeCanvas3D } from '../components/ThreeCanvas3D';
import { MotionText3D, FloatingCard3D } from '../components/MotionText3D';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#eef7f4] text-slate-800 font-sans min-h-screen selection:bg-teal-300 selection:text-slate-950">
      {/* =========================================================================
          SECTION 1: HERO (Image 1)
          Atmospheric landscape, Three.js 3D depth, editorial typography & floating data pills
         ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#0c201a]">
        {/* Landscape Photo with Dark Green / Teal Film Grading */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2000&q=85')`,
          }}
        />

        {/* Ambient Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c201a] via-[#0c201a]/70 to-[#071713]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c201a]/90 via-[#0c201a]/50 to-transparent" />

        {/* Three.js 3D Orbital Canvas (Rotating Wireframe Earth & Satellite Constellation) */}
        <ThreeCanvas3D />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20 w-full flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 3D Animated Headline & Actions */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category Pill */}
              <MotionText3D delay={0.1} depth={-20}>
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#16352c]/90 border border-teal-400/30 text-xs text-teal-300 font-medium tracking-wide shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Satellite environmental intelligence</span>
                </div>
              </MotionText3D>

              {/* Editorial Headline */}
              <MotionText3D delay={0.25} depth={-60}>
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.25rem] text-white font-medium tracking-tight leading-[1.06]">
                  The land writes its <br />
                  history. <br />
                  <span className="text-[#2dd4bf] italic font-normal tracking-normal drop-shadow-sm">
                    We help you read it.
                  </span>
                </h1>
              </MotionText3D>

              {/* Subtitle */}
              <MotionText3D delay={0.4} depth={-30}>
                <p className="max-w-xl text-base sm:text-lg text-slate-300/90 font-light leading-relaxed">
                  TerraProof reads satellite observations of floods, droughts and forest change — and turns them into calm, credible evidence for the people verifying crop-insurance claims.
                </p>
              </MotionText3D>

              {/* CTA Buttons */}
              <MotionText3D delay={0.55} depth={-20}>
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    to="/claims"
                    className="px-6 py-3.5 rounded-full bg-[#0d9488] hover:bg-[#14b8a6] text-white font-semibold text-sm shadow-xl shadow-teal-950/60 transition-all flex items-center space-x-2 group"
                  >
                    <span>Verify a claim</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#workflow"
                    className="px-6 py-3.5 rounded-full bg-[#16352c]/80 hover:bg-[#1a3e34] text-slate-300 hover:text-white border border-teal-500/20 font-medium text-sm backdrop-blur-md transition-all"
                  >
                    How it works
                  </a>
                </div>
              </MotionText3D>
            </div>

            {/* Right Column: Floating Live-Data Badges (Exactly as in Image 1) */}
            <div className="lg:col-span-4 relative h-64 lg:h-96 hidden sm:flex flex-col justify-center space-y-4">
              {/* Top Floating Badge: Flood Extent */}
              <FloatingCard3D delay={0.6} floatY={8} className="self-end">
                <div className="p-3.5 rounded-2xl bg-[#122b24]/85 backdrop-blur-md border border-teal-500/25 text-left shadow-2xl text-xs space-y-1 w-60">
                  <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                    <Radio className="w-4 h-4 text-teal-400" />
                    <span>Flood extent · 412 ha (est.)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sentinel-1 · IW · VV/VH polarisation
                  </div>
                </div>
              </FloatingCard3D>

              {/* Middle Floating Badge: NDVI Crop Stress */}
              <FloatingCard3D delay={0.8} floatY={6} className="self-start ml-4">
                <div className="p-3.5 rounded-2xl bg-[#122b24]/85 backdrop-blur-md border border-teal-500/25 text-left shadow-2xl text-xs space-y-1 w-64">
                  <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                    <span className="text-teal-400 text-sm">🍃</span>
                    <span>NDVI −0.31 vs. baseline</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    crop-stress flag · pending review
                  </div>
                </div>
              </FloatingCard3D>

              {/* Lower Floating Badge: Pass Matched */}
              <FloatingCard3D delay={1.0} floatY={7} className="self-end mr-6">
                <div className="p-3.5 rounded-2xl bg-[#122b24]/85 backdrop-blur-md border border-teal-500/25 text-left shadow-2xl text-xs space-y-1 w-64">
                  <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                    <Satellite className="w-4 h-4 text-teal-400" />
                    <span>Pass matched · 06:42 UTC</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    cloud-free · 10 m spatial resolution
                  </div>
                </div>
              </FloatingCard3D>
            </div>
          </div>
        </div>

        {/* Organic Curved Wave Divider Transitioning into Light Mint Content */}
        <div className="relative w-full overflow-hidden leading-none z-10">
          <svg
            className="relative block w-full h-16 sm:h-24 text-[#eef7f4]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURE TICKER BAR (Image 2)
         ========================================================================= */}
      <section className="bg-[#eef7f4] border-b border-teal-900/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-2 hover:text-teal-800 transition-colors">
              <Radio className="w-4 h-4 text-teal-700" />
              <span>Sentinel-1 radar</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-teal-800 transition-colors">
              <Eye className="w-4 h-4 text-teal-700" />
              <span>Sentinel-2 optical</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-teal-800 transition-colors">
              <LineChart className="w-4 h-4 text-teal-700" />
              <span>NDVI time series</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-teal-800 transition-colors">
              <CloudRain className="w-4 h-4 text-teal-700" />
              <span>Rainfall context</span>
            </div>

            <div className="flex items-center space-x-2 hover:text-teal-800 transition-colors">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>Change detection</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FOUR MODULES — "FOUR LENSES ON THE SAME LAND" (Image 2)
         ========================================================================= */}
      <section className="py-20 bg-[#eef7f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-teal-800">
              FOUR MODULES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight">
              Four lenses on the same land
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every analysis is decision support. The satellites observe; TerraProof organises the evidence; a human decides what it means.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Insurance Claim Verification (Core) */}
            <Link
              to="/claims"
              className="p-6 rounded-2xl bg-white border border-teal-900/10 hover:border-teal-600/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-800 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100/80 text-teal-800 border border-teal-200">
                    CORE
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                    Insurance claim verification
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Correlate reported crop damage against pre- and post-disaster spectral signatures. Quantifies claimed vs. observed area discrepancy.
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-teal-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Verify claims</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 2: Flood Monitoring */}
            <Link
              to="/flood"
              className="p-6 rounded-2xl bg-white border border-teal-900/10 hover:border-teal-600/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-800 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Droplets className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-sky-800 transition-colors">
                    Flood monitoring
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Radar-first inundation mapping with Sentinel-1 SAR and optical NDWI. Delineates standing water extent through cloud decks.
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-sky-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore flood extent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 3: Drought & Crop Stress */}
            <Link
              to="/drought"
              className="p-6 rounded-2xl bg-white border border-teal-900/10 hover:border-teal-600/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <SunMedium className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                    Drought & crop stress
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Vegetation-greenness trends, soil moisture deficits and meteorological precipitation integration across growing seasons.
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-amber-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Evaluate stress trends</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Card 4: Forest & Land-Cover Change */}
            <Link
              to="/deforestation"
              className="p-6 rounded-2xl bg-white border border-teal-900/10 hover:border-teal-600/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Trees className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Forest & land-cover change
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Bi-temporal optical canopy loss detection distinguishing timber clearance, wildfires, and seasonal deciduous variation.
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Detect canopy loss</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE WORKFLOW (Image 3)
          "From orbit to evidence, in four calm steps"
         ========================================================================= */}
      <section id="workflow" className="py-20 bg-[#e4f1ed] border-t border-teal-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-teal-800">
              THE WORKFLOW
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight">
              From orbit to evidence, in four calm steps
            </h2>
          </div>

          {/* 4 Connected Circular Step Cards on a horizontal timeline */}
          <div className="relative">
            {/* Horizontal Line connecting nodes (desktop) */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[2px] bg-teal-600/20 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-teal-300/60 shadow-md flex items-center justify-center text-teal-700">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0d9488] text-white text-[11px] font-bold flex items-center justify-center shadow">
                    1
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Define the land
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Draw a field boundary or enter coordinates. TerraProof validates the geometry and builds the smallest useful study area.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-teal-300/60 shadow-md flex items-center justify-center text-teal-700">
                    <Satellite className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0d9488] text-white text-[11px] font-bold flex items-center justify-center shadow">
                    2
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Match the passes
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The engine finds Sentinel-1 and Sentinel-2 observations before and after the event, and records every acquisition date.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-teal-300/60 shadow-md flex items-center justify-center text-teal-700">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0d9488] text-white text-[11px] font-bold flex items-center justify-center shadow">
                    3
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Run the analysis
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Radar flood mapping, vegetation indices, change detection — each with its method, thresholds and parameters documented.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-teal-300/60 shadow-md flex items-center justify-center text-teal-700">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0d9488] text-white text-[11px] font-bold flex items-center justify-center shadow">
                    4
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Human review
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    An evidence report with confidence notes, limitations and uncertainties. A person — not an algorithm — makes the call.
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
      <section className="py-16 bg-[#0c201a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-teal-400">
            TRY THE LIVE ENGINE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
            Ready to inspect satellite evidence on real farm plots?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Register a claim, draw or pick pre-calibrated field boundaries, and compute NDVI / NDWI spectral deltas with one click.
          </p>
          <div className="pt-2">
            <Link
              to="/claims"
              className="px-8 py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition-all inline-flex items-center space-x-2"
            >
              <span>Launch Claim Verification</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

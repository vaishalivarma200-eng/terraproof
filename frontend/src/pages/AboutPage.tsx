import React from 'react';
import {
  Satellite,
  ShieldCheck,
  Compass,
  FileText,
  AlertTriangle,
  ExternalLink,
  Code2,
  BookOpen,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400">
          <BookOpen className="w-4 h-4" />
          <span>Technical Whitepaper & System Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Methodology & Responsible Remote-Sensing Principles
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          TerraProof is an Earth observation evidence-support platform engineered to bring empirical transparency to agricultural insurance claim audits.
        </p>
      </div>

      {/* Core Principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          1. Decision-Support vs. Automated Adjudication
        </h2>
        <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <p>
            Agricultural insurance claims often present difficult evidentiary trade-offs. Traditional loss assessment
            relies on manual field surveyors visiting isolated rural locations weeks after an extreme weather event has occurred.
            By that time, mud may have dried, crops may have rotted, or surviving plants may have partially compensated.
          </p>
          <p>
            Conversely, treating raw satellite indices as conclusive automated verdicts of fraud or guaranteed payouts is technically
            flawed and ethically irresponsible. Single-pixel anomalies can arise from atmospheric haze, intermittent cloud shadows,
            unregistered crop rotation, or normal harvest activities. TerraProof is strictly engineered as an <strong>evidence-corroboration
            instrument</strong> that presents calibrated findings alongside explicit uncertainty bounds to accredited human adjusters.
          </p>
        </div>
      </section>

      {/* Mathematical Formulations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-sky-400" />
          2. Mathematical Formulations & Spectral Indices
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
            <h3 className="font-semibold text-emerald-400 text-sm">Normalized Difference Vegetation Index (NDVI)</h3>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
              NDVI = (NIR - RED) / (NIR + RED + ε)
            </p>
            <p className="text-slate-400 leading-relaxed">
              Leverages the sharp contrast between chlorophyll absorption in the Red spectrum (Sentinel-2 Band 4, 665nm)
              and intense cellular leaf scattering in the Near-Infrared (Band 8, 842nm). Typical healthy agricultural canopies yield values between 0.40 and 0.85.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
            <h3 className="font-semibold text-sky-400 text-sm">Normalized Difference Water Index (NDWI)</h3>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
              NDWI = (GREEN - NIR) / (GREEN + NIR + ε)
            </p>
            <p className="text-slate-400 leading-relaxed">
              McFeeters (1996) formulation maximizing reflectance of surface water bodies in Green (Sentinel-2 Band 3, 560nm)
              while exploiting total absorption in Near-Infrared. Open standing floodwaters produce positive values (&gt; 0.0).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
            <h3 className="font-semibold text-amber-400 text-sm">Bi-Temporal Change Delta (dNDVI)</h3>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
              dNDVI = NDVI_pre - NDVI_post
            </p>
            <p className="text-slate-400 leading-relaxed">
              Differencing pre-incident baseline from post-incident acquisitions filters out persistent background soil variation.
              Severe catastrophic crop damage manifests as sudden drops where dNDVI &gt; 0.25.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-2">
            <h3 className="font-semibold text-purple-400 text-sm">Ellipsoidal Geodesic Area (Shoelace on Sphere)</h3>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
              Area = R² · |∑ Δλ_i · (2 + sin φ_i + sin φ_i+1)| / 2
            </p>
            <p className="text-slate-400 leading-relaxed">
              Calculates genuine ground surface area in hectares directly on the WGS84 authalic ellipsoid (R ≈ 6,371,007m),
              completely avoiding Euclidean distortion errors that occur when treating longitude/latitude degrees as flat meters.
            </p>
          </div>
        </div>
      </section>

      {/* Earth Observation Data Providers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Satellite className="w-5 h-5 text-teal-400" />
          3. Data Provenance & Satellite Sensor Specifications
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Sensor / Provider</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Spatial Resolution</th>
                <th className="py-3 px-4">Revisit Cycle</th>
                <th className="py-3 px-4">Access Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-100">Sentinel-2 MSI (Level-2A)</td>
                <td className="py-3 px-4">13-band Multi-Spectral Optical</td>
                <td className="py-3 px-4 font-mono text-emerald-400">10m (B2, B3, B4, B8)</td>
                <td className="py-3 px-4">5 days (constellation)</td>
                <td className="py-3 px-4">Copernicus Open Access / Public</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-100">Sentinel-1 C-Band SAR</td>
                <td className="py-3 px-4">Synthetic Aperture Radar (VV/VH)</td>
                <td className="py-3 px-4 font-mono text-emerald-400">10m (GRD)</td>
                <td className="py-3 px-4">6-12 days</td>
                <td className="py-3 px-4">Copernicus Open Access / Public</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-100">Open-Meteo Historical Archive</td>
                <td className="py-3 px-4">Reanalysis Precipitation & Soil</td>
                <td className="py-3 px-4 font-mono text-sky-400">Hourly / Daily 0.1°</td>
                <td className="py-3 px-4">Continuous</td>
                <td className="py-3 px-4">Non-commercial Open Domain</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Limitations Notice */}
      <section className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Known Limitations & Forensic Disclaimers</span>
        </div>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Cloud Obstruction:</strong> Severe cloud decks block optical Sentinel-2 acquisitions. When cloud cover exceeds 30%, optical evidence must be supplemented by Sentinel-1 radar or deemed temporarily inconclusive.
          </li>
          <li>
            <strong>Spatial Resolution Limits:</strong> At 10m Ground Sampling Distance (GSD), small boundary borders (&lt; 0.2 ha) exhibit mixed-pixel edge effects. Area estimates carry an inherent ±8% boundary variance.
          </li>
          <li>
            <strong>Harvest vs. Hazard:</strong> Routine mechanical harvesting produces an abrupt drop in NDVI indistinguishable from flood or pest destruction without cross-referencing planting and crop-type schedules.
          </li>
        </ul>
      </section>
    </div>
  );
};


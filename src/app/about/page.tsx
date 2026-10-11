'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Cloud, 
  ShieldCheck, 
  Leaf, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Award
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Cloud className="w-3.5 h-3.5 text-amber-500" />
          <span>WeMakeDevs × AWS Environmental Hacks • Track 03</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About EcoVision AI
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Building the next generation of intelligent waste segregation infrastructure to close the loop between consumer habits and industrial circular recycling.
        </p>
      </div>

      {/* Mission Section */}
      <section className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Our Purpose
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Project Mission: Eliminating Recycling Contamination at the Source
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every year, human civilization generates over <strong className="text-slate-900">2.1 billion tons of municipal solid waste</strong>. While millions of citizens genuinely wish to recycle, the reality of modern packaging is rife with ambiguity:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              The &quot;Wishcycling&quot; Trap
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              30%+ Contamination Rates
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Well-intentioned people toss soiled pizza boxes, composite chip wrappers, and incompatible plastic resins into recycling bins, causing entire truckloads to be condemned to landfills.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Methane & Emissions
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              Landfill Greenhouse Impact
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organic waste decomposing anaerobically in landfills is one of the single largest anthropogenic sources of methane—a greenhouse gas 28× more potent than CO₂.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Massive Energy Waste
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              Virgin Resource Depletion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Producing aluminum from recycled scrap consumes <strong className="text-emerald-700">95% less energy</strong> than mining bauxite ore. Recycling plastics saves up to 70% of crude petroleum energy.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-sm text-slate-700 space-y-2">
          <h4 className="font-bold text-emerald-900 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-700" />
            <span>The EcoVision AI Solution</span>
          </h4>
          <p className="leading-relaxed">
            EcoVision AI places a precision environmental sorting assistant in every pocket. By leveraging multimodal AI computer vision, the platform identifies material compositions, flags non-recyclable contaminants, outputs crystal-clear step-by-step disposal procedures, and audits avoided carbon metrics in real time.
          </p>
        </div>
      </section>

      {/* How The Technology Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How the Technology Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Engineered with modern full-stack web standards, multimodal vision intelligence, and an AWS cloud architecture roadmap.
          </p>
        </div>

        {/* Architecture Flow Chart Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Layer 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Client & Ingestion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Next.js 15 App Router with React 19. Client-side drag-and-drop image normalization, instant previews, and zero-auth local session state.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-700">
              Next.js 15 • Tailwind CSS
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Edge API Route
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Serverless route <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/analyze</code> handles payload validation, extracts base64 streams, and checks API credentials.
            </p>
            <div className="pt-2 text-[11px] font-mono text-teal-700">
              Next.js Route Handlers
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Multimodal Vision AI
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini Vision model extracts resin identification codes (PET #1, HDPE #2), contamination alerts, and structured JSON output schema.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-700">
              Gemini 1.5 Flash Vision
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              AWS Cloud Infrastructure
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cloud roadmap: Amazon S3 for encrypted image lake, AWS Lambda for image pre-processing, and DynamoDB for aggregated municipal metrics.
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-700">
              AWS S3 • Lambda • DynamoDB
            </div>
          </div>
        </div>
      </section>

      {/* AWS Hackathon Section */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 space-y-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold border border-slate-700">
              <Award className="w-3.5 h-3.5" />
              <span>Hackathon Submission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              WeMakeDevs × AWS Environmental Hacks Hackathon
            </h2>
            <p className="text-slate-400 text-sm">
              Track 03: Waste and Energy • Innovating for planetary resilience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-300">
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Why Track 03: Waste and Energy?</span>
            </h3>
            <p className="leading-relaxed text-slate-400">
              Track 03 challenges developers to engineer high-impact technical interventions that tackle industrial and domestic waste while optimizing energy recovery. EcoVision AI addresses both fronts:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Waste Minimization:</strong> Drives blue-bin contamination below 5% through instant point-of-disposal guidance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Energy Conservation:</strong> Recovers embodied energy by ensuring aluminum, plastics, and glass re-enter circular manufacturing streams.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Hackathon Compliance & Design Ethics</span>
            </h3>
            <p className="leading-relaxed text-slate-400">
              EcoVision AI was architected strictly according to competition requirements:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Zero Simulated/Fake AI:</strong> If an API is offline or unconfigured, the app transparently communicates setup needs rather than hallucinating outputs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Frictionless UX:</strong> No Firebase or mandatory logins—inspectors can test the app instantly on any device.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Phase 1 MVP Release • Next.js 15 App Router & TypeScript
          </span>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
          >
            <span>Launch Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

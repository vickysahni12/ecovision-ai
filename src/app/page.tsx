'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Camera, 
  ArrowRight, 
  Recycle, 
  ShieldCheck, 
  BarChart3, 
  Leaf, 
  Zap, 
  CheckCircle2, 
  Globe2, 
  Cpu
} from 'lucide-react';
import { SAMPLE_WASTE_ITEMS } from '@/lib/sampleImages';

export default function LandingPage() {
  const sampleBottle = SAMPLE_WASTE_ITEMS[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/40">
        {/* Soft background ambient gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-emerald-300/20 via-teal-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Hackathon Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs md:text-sm font-semibold shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>WeMakeDevs × AWS Environmental Hacks</span>
                <span className="text-emerald-400 font-bold">•</span>
                <span className="text-emerald-700">Track 03: Waste & Energy</span>
              </div>

              {/* Main Hero Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Smarter Waste. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Greener Future.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Empower your recycling decisions with AI multimodal computer vision. Instantly identify materials, eliminate contamination in blue bins, and unlock real-time carbon diversion analytics.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/scan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Camera className="w-5 h-5 text-emerald-950" />
                  <span>Start Scanning Waste</span>
                  <ArrowRight className="w-4 h-4 text-emerald-950" />
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>View Dashboard</span>
                </Link>
              </div>

              {/* Value props bullets */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No login required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero fake classifications</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Gemini Vision ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive UI Showcase Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/60 border border-emerald-100">
                {/* Header of card */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Vision Detection Feed
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Confidence: 98%
                  </span>
                </div>

                {/* Simulated preview image */}
                <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 aspect-4/3 flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sampleBottle.dataUrl}
                    alt="Sample Bottle"
                    className="w-full h-full object-contain"
                  />
                  {/* Overlay bounding box badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-md font-mono flex items-center gap-1.5 border border-white/20">
                    <Recycle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PET #1 Plastic Bottle</span>
                  </div>
                </div>

                {/* Simulated AI Result Breakdown */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Recyclable Plastic Container
                      </h4>
                      <p className="text-xs text-slate-700">
                        Polyethylene Terephthalate
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-xs">
                      Recyclable
                    </span>
                  </div>

                  {/* Checklist preview */}
                  <div className="space-y-1.5 rounded-lg bg-emerald-50/70 p-2.5 border border-emerald-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Rinse residue & replace tethered cap</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Compress bottle to conserve collection space</span>
                    </div>
                  </div>

                  {/* Carbon Metric Bar */}
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Est. Carbon Diverted:
                    </span>
                    <span className="font-bold text-emerald-700">
                      +0.32 kg CO₂ Saved
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating ambient pill */}
              <div className="hidden sm:flex absolute -bottom-4 -left-6 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-emerald-100 shadow-lg items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Circular Economy
                  </div>
                  <div className="text-[10px] text-slate-700 font-medium">
                    Reduces landfill methane
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-slate-900 text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                2.1B Tons
              </p>
              <p className="text-xs text-slate-400">Annual global solid waste</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">
                30%+
              </p>
              <p className="text-xs text-slate-400">Recycling bin contamination</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                95%
              </p>
              <p className="text-xs text-slate-400">Energy saved recycling metal</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                &lt; 1 Second
              </p>
              <p className="text-xs text-slate-400">AI identification speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How EcoVision AI Works
            </h2>
            <p className="text-slate-600 text-base">
              From snapping a quick picture to executing verified disposal instructions, EcoVision AI transforms the way humans interact with discarded materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Snap or Upload
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a photo directly with your phone camera or drag and drop any image of packaging, food waste, bottles, or batteries into the scanner.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Multimodal AI Analysis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Google Gemini multimodal vision detects the item, pinpoints resin identification codes, checks contamination flags, and calculates recyclability viability.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Divert & Track Impact
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive practical preparation steps (rinse, separate caps) and track cumulative diverted waste and avoided carbon emissions on your dashboard.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>Try the scanner now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50/60 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Real-World Environmental Impact
            </h2>
            <p className="text-slate-600 text-base">
              A comprehensive toolkit combining computer vision, environmental metrics, and intelligent waste workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Multimodal Vision Recognition
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                State-of-the-art vision models distinguish complex composite materials, translucent plastics, and organic matter with zero guesswork.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Contamination Prevention
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prevents &quot;wishcycling&quot; by alerting users to greasy pizza boxes, non-recyclable straws, and hazardous e-waste before they ruin entire batches.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Carbon & Energy Accounting
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Calculates the direct embodied energy and greenhouse gas emissions conserved by diverting each kilogram of paper, metal, or plastic.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Circular Upcycling Guides
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provides actionable ideas to reuse jars, repurpose cardboard shipping materials, and compost organic peels at home.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cloud & Edge Ready
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Engineered for AWS serverless architecture (S3 image buckets, Lambda endpoints, DynamoDB analytics), ready for enterprise deployment.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Personalized Impact Dashboard
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual category distribution breakdowns, diversion percentage milestones, and complete scan audit history saved locally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Mission & Hackathon Track Section */}
      <section className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Our Environmental Mission</span>
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Addressing the Global Waste Crisis at the Point of Decision
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                Most recycling failures happen not at industrial sorting plants, but right at the consumer bin. Over 30% of materials placed in blue recycling bins are contaminated, causing entire truckloads to be rerouted straight to landfills.
              </p>

              <p className="text-slate-300 text-base leading-relaxed">
                Built specifically for <strong className="text-white">WeMakeDevs × AWS Environmental Hacks Track 03: Waste and Energy</strong>, EcoVision AI turns every smartphone into an intelligent sorting advisor, closing the loop between consumer habits and industrial circularity.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-800 text-left">
                  <div className="text-2xl font-bold text-emerald-400">85%</div>
                  <div className="text-xs text-slate-300 mt-1 font-medium">Target diversion rate for household recyclables</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-800 text-left">
                  <div className="text-2xl font-bold text-teal-400">0.35 kg</div>
                  <div className="text-xs text-slate-300 mt-1 font-medium">Average CO₂ avoided per properly diverted item</div>
                </div>
              </div>
            </div>

            {/* Waste Stream Categories Visual Card */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-emerald-800/80 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <span>Standardized Waste Streams Managed</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-900/40 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Recyclables</h4>
                    <p className="text-xs text-slate-400">Clean paper, cardboard, PET/HDPE rigid plastics, aluminum and tin cans, glass bottles.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-amber-900/40 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">Organics & Compost</h4>
                    <p className="text-xs text-slate-400">Fruit and vegetable scraps, coffee grounds, eggshells, garden trimmings, BPI-certified packaging.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-rose-900/40 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">Hazardous & E-Waste</h4>
                    <p className="text-xs text-slate-400">Batteries, electronics, CFL lights, motor oil, household chemical containers requiring specialized depot drop-offs.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/40 flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">Residual Landfill</h4>
                    <p className="text-xs text-slate-400">Soiled packaging, metallized crisp packets, styrofoam containers, multi-material pouches.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto shadow-sm">
            <Recycle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Scan Your First Waste Item?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
            Experience the instant accuracy of AI waste sorting. Upload a photo or pick one of our sample items to test the system immediately.
          </p>
          <div className="pt-2">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Camera className="w-5 h-5 text-emerald-950" />
              <span>Launch AI Waste Scanner</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

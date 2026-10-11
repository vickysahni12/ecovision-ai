'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Recycle, 
  Leaf, 
  ShieldCheck, 
  Cpu, 
  Cloud 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                EcoVision<span className="text-emerald-400">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-driven intelligent waste sorting platform designed to eliminate recycling contamination, quantify carbon diversion, and accelerate municipal circular economies.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-emerald-300">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>WeMakeDevs × AWS Environmental Hacks</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Overview & Features
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-emerald-400 transition-colors">
                  AI Waste Scanner
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About & Tech Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon Track Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Track 03: Waste & Energy
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Targeting the 2.1 billion tons of global annual waste by empowering individuals and facilities with real-time multimodal material recognition and clean diversion habits.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Hallucination / Honest AI state</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                <span>Gemini Multimodal Vision Ready</span>
              </div>
            </div>
          </div>

          {/* Environmental Mission */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Environmental Pledge
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every item correctly sorted prevents methane release in landfills and conserves up to 95% of embodied energy required to fabricate virgin metals and plastics.
            </p>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
              <p className="font-semibold text-emerald-200">Action Matters</p>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                Proper sorting increases municipal recycling purity from 68% to over 96%.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
          <p className="text-slate-400">
            © 2026 EcoVision AI. Built for WeMakeDevs × AWS Environmental Hacks Hackathon.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1">
              Developed with <Leaf className="w-3.5 h-3.5 text-emerald-500" /> for Planet Earth
            </span>
            <Link href="/about" className="hover:text-emerald-400 transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

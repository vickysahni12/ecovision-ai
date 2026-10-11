'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Recycle, 
  Trash2, 
  Camera, 
  Leaf, 
  Zap, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Clock,
  Cloud,
  Info
} from 'lucide-react';
import { WasteScanRecord } from '@/types';
import { getStoredScans, removeScanRecord, clearAllScans, calculateStats, saveScanRecord } from '@/lib/storage';
import { SAMPLE_WASTE_ITEMS } from '@/lib/sampleImages';
import ScanThumbnail from '@/components/ScanThumbnail';

const emptyScans: WasteScanRecord[] = [];

function subscribeScans(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('ecovision-history-updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('ecovision-history-updated', callback);
    window.removeEventListener('storage', callback);
  };
}

export default function DashboardPage() {
  const scans = useSyncExternalStore(
    subscribeScans,
    () => getStoredScans(),
    () => emptyScans
  );

  const stats = calculateStats(scans);
  const liveAiCount = scans.filter((s) => s.scanType === 'live_ai' || s.isRealAiScan).length;
  const demoCount = scans.filter((s) => s.scanType === 'sample_demo').length;

  const handleDelete = (id: string) => {
    removeScanRecord(id);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local scan history?')) {
      clearAllScans();
    }
  };

  const handleLoadDemoData = () => {
    const demoItems: WasteScanRecord[] = [
      {
        id: 'demo-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        scanDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        itemName: 'PET Plastic Water Bottle',
        category: 'recyclable',
        categoryLabel: 'Recyclable Plastics (PET #1)',
        confidence: 98,
        material: 'Polyethylene Terephthalate',
        recyclability: 'High',
        carbonOffsetEstimate: '0.32 kg CO₂ saved',
        disposalSteps: ['Rinse container thoroughly', 'Leave cap attached', 'Flatten to conserve bin volume'],
        preparationTips: ['Do not place in plastic bags'],
        upcyclingIdeas: ['Use as a seedling waterer'],
        imageUrl: SAMPLE_WASTE_ITEMS[0].dataUrl,
        scanType: 'sample_demo',
        isRealAiScan: false,
      },
      {
        id: 'demo-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        scanDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        itemName: 'Aluminum Soda Can',
        category: 'recyclable',
        categoryLabel: 'Recyclable Metals',
        confidence: 96,
        material: 'Aluminum 3004 Alloy',
        recyclability: 'High',
        carbonOffsetEstimate: '0.45 kg CO₂ saved',
        disposalSteps: ['Empty liquid contents', 'Place in metals bin'],
        preparationTips: ['Infinitely recyclable without degradation'],
        upcyclingIdeas: ['Repurpose as desk pen holder'],
        imageUrl: SAMPLE_WASTE_ITEMS[1].dataUrl,
        scanType: 'sample_demo',
        isRealAiScan: false,
      },
      {
        id: 'demo-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        scanDate: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        itemName: 'Organic Banana Peel',
        category: 'organic',
        categoryLabel: 'Compostable Organic Matter',
        confidence: 94,
        material: 'Cellulose / Biomass',
        recyclability: 'High',
        carbonOffsetEstimate: '0.20 kg CO₂ saved',
        disposalSteps: ['Place in green compost bin or home compost pile'],
        preparationTips: ['Remove any fruit stickers or plastic tags'],
        upcyclingIdeas: ['Use peel water as plant potassium fertilizer'],
        imageUrl: SAMPLE_WASTE_ITEMS[2].dataUrl,
        scanType: 'sample_demo',
        isRealAiScan: false,
      },
      {
        id: 'demo-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
        scanDate: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
        itemName: 'Alkaline AA Battery Cell',
        category: 'hazardous',
        categoryLabel: 'Heavy Metal E-Waste',
        confidence: 99,
        material: 'Zinc-Manganese Dioxide',
        recyclability: 'Low',
        carbonOffsetEstimate: '0.15 kg CO₂ saved',
        disposalSteps: ['Tape terminal ends with electrical tape', 'Bring to certified e-waste or hazard depot'],
        preparationTips: ['Never dispose of in regular curbside trash'],
        upcyclingIdeas: ['Safe recycling at retail battery drop-offs'],
        imageUrl: SAMPLE_WASTE_ITEMS[4].dataUrl,
        scanType: 'sample_demo',
        isRealAiScan: false,
      },
    ];

    demoItems.forEach((item) => saveScanRecord(item));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'recyclable':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          name: 'Recyclable',
        };
      case 'organic':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          name: 'Organic',
        };
      case 'hazardous':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          name: 'Hazardous',
        };
      case 'landfill':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          name: 'Landfill',
        };
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Impact & Material Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Waste Segregation Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time diversion metrics, materials audit, and avoided greenhouse emissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>New Scan</span>
          </Link>

          {scans.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              title="Clear all scans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset History</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State for first-time users */}
      {scans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
            <Recycle className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              No Waste Scans Recorded Yet
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Your circular economy journey begins with your first scan. Upload an item in the AI Scanner to track landfill diversion percentages, category distribution, and avoided carbon footprint.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Start Your First Scan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleLoadDemoData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        /* Populated Dashboard Content */
        <div className="space-y-10">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Items Scanned</span>
                <Camera className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {stats.total}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="text-emerald-700 font-semibold">{liveAiCount} Live AI</span>
                <span>•</span>
                <span className="text-slate-500">{demoCount} Sample</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Landfill Diversion Rate</span>
                <Recycle className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-extrabold text-teal-700">
                {stats.divertedPercentage}%
              </p>
              <span className="text-[11px] text-slate-500">
                {stats.divertedCount} of {stats.total} items diverted
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Estimated Avoided CO₂*</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">
                {stats.co2SavedKg} <span className="text-sm font-semibold text-slate-500">kg</span>
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>EPA WARM benchmark model estimate</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Primary Stream</span>
                <Leaf className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-slate-800 capitalize truncate">
                {stats.recyclable >= stats.organic ? 'Recyclables' : 'Compostables'}
              </p>
              <span className="text-[11px] text-slate-500">
                Leading household category
              </span>
            </div>
          </div>

          {/* Category Distribution Section */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Category Distribution Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Proportion of materials sorted across municipal waste streams.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                {stats.total} Total Classified
              </span>
            </div>

            {/* Combined Segmented Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
              {stats.recyclable > 0 && (
                <div
                  style={{ width: `${(stats.recyclable / stats.total) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Recyclable: ${stats.recyclable}`}
                />
              )}
              {stats.organic > 0 && (
                <div
                  style={{ width: `${(stats.organic / stats.total) * 100}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Organic: ${stats.organic}`}
                />
              )}
              {stats.hazardous > 0 && (
                <div
                  style={{ width: `${(stats.hazardous / stats.total) * 100}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Hazardous: ${stats.hazardous}`}
                />
              )}
              {stats.landfill > 0 && (
                <div
                  style={{ width: `${(stats.landfill / stats.total) * 100}%` }}
                  className="bg-slate-500 transition-all duration-500"
                  title={`Landfill: ${stats.landfill}`}
                />
              )}
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Recyclables */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">Recyclables</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-800">
                  {stats.recyclable}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {Math.round((stats.recyclable / stats.total) * 100)}% of total
                </span>
              </div>

              {/* Organics */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-700">Compost / Organics</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-800">
                  {stats.organic}
                </div>
                <span className="text-[11px] text-amber-700 font-medium">
                  {Math.round((stats.organic / stats.total) * 100)}% of total
                </span>
              </div>

              {/* Hazardous */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-slate-700">Hazardous / E-Waste</span>
                </div>
                <div className="text-2xl font-extrabold text-rose-800">
                  {stats.hazardous}
                </div>
                <span className="text-[11px] text-rose-700 font-medium">
                  {Math.round((stats.hazardous / stats.total) * 100)}% of total
                </span>
              </div>

              {/* Landfill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Residual Landfill</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  {stats.landfill}
                </div>
                <span className="text-[11px] text-slate-600 font-medium">
                  {Math.round((stats.landfill / stats.total) * 100)}% of total
                </span>
              </div>
            </div>
          </div>

          {/* Recent Scans Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Waste Scans ({scans.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Audit trail of inspected packaging and materials with AI verification tags.
                </p>
              </div>
              <Link
                href="/scan"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <span>Add Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scans.map((scan) => {
                const badge = getCategoryBadge(scan.category);
                const isAi = scan.scanType === 'live_ai' || scan.isRealAiScan;

                return (
                  <div
                    key={scan.id}
                    className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Bar with Thumbnail and Category */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ScanThumbnail
                            scanId={scan.id}
                            itemName={scan.itemName}
                            initialUrl={scan.imageUrl}
                            s3Key={scan.s3Key}
                          />

                          <div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.name}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(scan.scanDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(scan.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete scan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Source tag: Distinguishes Live AI vs Demo Sample and S3 Storage */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isAi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Live Gemini AI Scan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Demo Sample</span>
                          </span>
                        )}
                        {scan.s3Key && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-teal-800 bg-teal-50 border border-teal-200">
                            <Cloud className="w-2.5 h-2.5 text-teal-600" />
                            <span>S3 Archived</span>
                          </span>
                        )}
                        {scan.sourceModel && (
                          <span className="text-[9px] font-mono text-slate-400">
                            {scan.sourceModel}
                          </span>
                        )}
                      </div>

                      {/* Item Title and Details */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {scan.itemName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {scan.material} • {scan.recyclability} Viability
                        </p>
                      </div>

                      {/* Carbon Offset & Confidence */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {scan.carbonOffsetEstimate}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {scan.confidence}% match
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

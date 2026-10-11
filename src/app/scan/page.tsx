'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Key, 
  Zap, 
  Recycle, 
  Leaf, 
  Info,
  Check,
  BarChart3,
  ShieldCheck,
  Cloud
} from 'lucide-react';
import { WasteAnalysisResult, ApiStatusResponse, AnalysisApiResponse, UploadApiResponse } from '@/types';
import { saveScanRecord } from '@/lib/storage';
import { SAMPLE_WASTE_ITEMS, SampleWasteItem } from '@/lib/sampleImages';

export default function ScannerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  
  // API & Analysis State
  const [apiStatus, setApiStatus] = useState<ApiStatusResponse | null>(null);
  const [checkingApi, setCheckingApi] = useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WasteAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<{ code: string; message: string } | null>(null);
  const [savedToDashboard, setSavedToDashboard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const checkBackendApiStatus = useCallback(async () => {
    setCheckingApi(true);
    try {
      const res = await fetch('/api/status', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data: ApiStatusResponse = await res.json();
        setApiStatus(data);
      }
    } catch (err: unknown) {
      console.error('Failed to check API status:', err);
    } finally {
      setCheckingApi(false);
    }
  }, []);

  // Check API status on mount asynchronously
  useEffect(() => {
    let isMounted = true;
    fetch('/api/status', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ApiStatusResponse) => {
        if (isMounted) setApiStatus(data);
      })
      .catch((err) => console.error('Failed to check API status on mount:', err))
      .finally(() => {
        if (isMounted) setCheckingApi(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle file selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit. Please select an image under 5MB.');
      return;
    }

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setImageMeta({
      name: file.name,
      size: sizeStr,
      type: file.type,
    });
    setIsSampleLoaded(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setAnalysisResult(null);
      setAnalysisError(null);
      setSavedToDashboard(false);
      setSaveError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Load sample item
  const loadSampleItem = (sample: SampleWasteItem) => {
    setSelectedImage(sample.dataUrl);
    setImageMeta({
      name: sample.fileName,
      size: 'Sample Vector',
      type: 'image/png',
    });
    setIsSampleLoaded(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSavedToDashboard(false);
    setSaveError(null);
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setIsSampleLoaded(false);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSavedToDashboard(false);
    setSaveError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run Waste Analysis
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSavedToDashboard(false);
    setSaveError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: imageMeta?.type || 'image/jpeg',
        }),
      });

      const responseData: AnalysisApiResponse = await res.json();

      if (!res.ok || !responseData.success) {
        setAnalysisError({
          code: responseData.code || 'ANALYSIS_FAILED',
          message: responseData.message || responseData.error || 'Failed to analyze waste item.',
        });
      } else if (responseData.data) {
        setAnalysisResult(responseData.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error occurred while contacting analysis service.';
      setAnalysisError({
        code: 'NETWORK_ERROR',
        message: msg,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save result to dashboard
  const handleSaveToDashboard = async () => {
    if (!analysisResult || savedToDashboard || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedRecord: WasteAnalysisResult = { ...analysisResult };

      // If AWS S3 is configured, upload image to private S3 bucket to save object key reference
      if (selectedImage && apiStatus?.aws?.configured && !updatedRecord.s3Key) {
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: selectedImage,
              mimeType: imageMeta?.type || 'image/jpeg',
              scanId: updatedRecord.id,
              originalName: imageMeta?.name,
            }),
          });
          if (uploadRes.ok) {
            const uploadData: UploadApiResponse = await uploadRes.json();
            if (uploadData.success && uploadData.s3Key) {
              updatedRecord.s3Key = uploadData.s3Key;
              updatedRecord.s3Bucket = uploadData.bucket;
              updatedRecord.s3Region = uploadData.region;
            }
          }
        } catch (uploadErr) {
          console.warn('S3 private upload notice:', uploadErr);
        }
      }

      const res = saveScanRecord(updatedRecord);
      if (res.success) {
        setAnalysisResult(updatedRecord);
        setSavedToDashboard(true);
      } else {
        setSaveError(
          res.error || 'Failed to save scan to dashboard. Browser storage quota may be exceeded.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage write failed';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'recyclable':
        return {
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badgeText: 'text-white',
          label: 'Recyclable Stream',
        };
      case 'organic':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badgeText: 'text-white',
          label: 'Compostable / Organic',
        };
      case 'hazardous':
        return {
          bg: 'bg-rose-500',
          lightBg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badgeText: 'text-white',
          label: 'Hazardous / E-Waste',
        };
      case 'landfill':
      default:
        return {
          bg: 'bg-slate-600',
          lightBg: 'bg-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-700',
          badgeText: 'text-white',
          label: 'Residual Landfill',
        };
    }
  };

  const isAiConfigured = Boolean(apiStatus?.configured);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Multimodal Vision Scanner • Phase 2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Waste Item Analysis
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Upload any photograph or packaging image to identify material composition, determine bin segregation, and get step-by-step contamination prevention tips.
        </p>
      </div>

      {/* Honest API Status Indicator */}
      <div className="mb-8">
        {checkingApi && apiStatus === null ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Connecting to AI Engine...
                </span>
                <p className="text-[11px] text-slate-500">
                  Checking server configuration for Google Gemini Vision API...
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              Verifying...
            </span>
          </div>
        ) : !isAiConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <span>AI Engine Status: Gemini API Key Not Detected</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-200/70 text-amber-800">
                      Setup Required
                    </span>
                  </h3>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Image preview and file selection are fully functional. To enable live AI classifications, configure <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-amber-900">GEMINI_API_KEY</code> in your Vercel Project Settings (Environment Variables) or local <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-amber-900">.env.local</code> file.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => checkBackendApiStatus()}
                  disabled={checkingApi}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors shadow-xs"
                  title="Refresh API Status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingApi ? 'animate-spin' : ''}`} />
                  <span>{checkingApi ? 'Checking...' : 'Refresh Status'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google GenAI Multimodal Vision Active</span>
                </span>
                <p className="text-[11px] text-emerald-700">
                  Model: <span className="font-mono font-semibold">{apiStatus?.model || 'gemini-flash-latest'}</span> • Official Google GenAI SDK Ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Live AI Ready
              </span>
              <button
                type="button"
                onClick={() => checkBackendApiStatus()}
                disabled={checkingApi}
                className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100/50 transition-colors"
                title="Verify Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingApi ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Amazon S3 Cloud Storage Status Banner */}
      <div className="mb-8">
        {apiStatus?.aws?.configured ? (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Amazon S3 Cloud Storage Active</span>
                </span>
                <p className="text-[11px] text-teal-700">
                  Bucket: <span className="font-mono font-semibold">{apiStatus.aws.bucket}</span> • Region: <span className="font-mono">{apiStatus.aws.region}</span> • AES256 Encrypted
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              S3 Connected
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800">AWS S3 Cloud Storage:</span>{' '}
                <span className="text-slate-500">
                  Setup Required for cloud backup. Scan metadata persists safely to your local dashboard. Add AWS credentials to <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">.env.local</code> to activate private S3 archiving.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700 shrink-0">
              Local Storage Active
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Sample Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hidden native input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {/* Upload Area / Dropzone */}
          {!selectedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Drag and drop your waste image here
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Support for JPG, PNG, WebP up to 5MB. Or click to browse your local device files.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Browse Device Files</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Image Preview Card */
            <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Image Preview
                  </span>
                  {isSampleLoaded && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Preset Sample
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Preview image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900/5 aspect-4/3 flex items-center justify-center border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Waste to analyze"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Image Metadata Bar */}
              {imageMeta && (
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 py-1">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {imageMeta.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{imageMeta.size}</span>
                    <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {imageMeta.type.split('/')[1] || 'image'}
                    </span>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-bold text-white transition-all duration-200 shadow-md ${
                    isAnalyzing
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      <span>Classifying with Gemini Vision AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                      <span>Analyze Waste with Gemini AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Sample Waste Selector */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Try With A Preset Sample Item
              </span>
              <span className="text-[11px] text-slate-500">Loads into preview for AI test</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SAMPLE_WASTE_ITEMS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSampleItem(sample)}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-all text-xs group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-700 truncate w-full">
                    {sample.name}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize mt-0.5">
                    {sample.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Result Card & States (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* State 1: Analysis Error or API Key Missing Message */}
          {analysisError && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900">
                    {analysisError.code === 'API_KEY_NOT_CONFIGURED'
                      ? 'AI API Setup Required'
                      : 'AI Classification Failed'}
                  </h3>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {analysisError.message}
                  </p>
                </div>
              </div>

              {analysisError.code === 'API_KEY_NOT_CONFIGURED' ? (
                <div className="p-4 rounded-2xl bg-white border border-rose-200/80 text-xs space-y-3 text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>How to enable live classification:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Get an API key from Google AI Studio.</li>
                    <li>
                      Add <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY=your_key</code> in{' '}
                      <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env.local</code>.
                    </li>
                    <li>Restart or apply a session key above.</li>
                  </ol>
                  <p className="text-[11px] text-slate-500 italic">
                    Per hackathon guidelines, EcoVision AI never presents synthetic or falsified AI responses when an API is offline.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-rose-200 text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-800">Honest Error Policy:</p>
                  <p className="text-[11px] text-slate-500">
                    EcoVision AI refuses to hallucinate classifications. Please verify your connection or try another clear image.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setAnalysisError(null)}
                className="w-full py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-800 hover:bg-rose-100/50 transition-colors"
              >
                Dismiss Notice
              </button>
            </div>
          )}

          {/* State 2: Real Result Card */}
          {analysisResult && (
            <div className="rounded-3xl bg-white border border-emerald-200 p-6 shadow-md space-y-5">
              {/* Live AI Verification Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Gemini AI Classification</span>
                </div>
                <div className="flex items-center gap-2">
                  {analysisResult.s3Key && (
                    <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-teal-600" />
                      <span>S3 Secured</span>
                    </span>
                  )}
                  {analysisResult.sourceModel && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {analysisResult.sourceModel}
                    </span>
                  )}
                </div>
              </div>

              {/* Category & Status Banner */}
              {(() => {
                const styles = getCategoryStyles(analysisResult.category);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.badgeText} shadow-xs`}>
                        {styles.label}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ~{analysisResult.confidence}% AI Confidence (Estimate)
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      {analysisResult.itemName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {analysisResult.categoryLabel}
                    </p>
                  </div>
                );
              })()}

              {/* Material & Viability Pill grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Material
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {analysisResult.material}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Recyclability
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {analysisResult.recyclability} Viability
                  </span>
                </div>
              </div>

              {/* Carbon Offset Metric (Educational Benchmark) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-emerald-900">
                    Estimated Avoided Footprint*
                  </span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">
                  {analysisResult.carbonOffsetEstimate}
                </span>
              </div>

              {/* Ecological or Food Edibility Advisory Notes */}
              {analysisResult.notes && (
                <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-start gap-2.5 text-xs text-sky-900">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sky-950">Advisory: </span>
                    <span className="text-sky-800 leading-relaxed">{analysisResult.notes}</span>
                  </div>
                </div>
              )}

              {/* Disposal Steps Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proper Disposal Instructions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {analysisResult.disposalSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upcycling or Environmental Tips */}
              {analysisResult.upcyclingIdeas && analysisResult.upcyclingIdeas.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-teal-600" />
                    <span>Circular Upcycling Ideas</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {analysisResult.upcyclingIdeas.map((idea, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scientific Disclosure Footnote */}
              <p className="text-[10px] text-slate-500 italic pt-1 text-center">
                *Approximate educational model estimate based on EPA WARM / DEFRA benchmark emission factors, not a laboratory-verified Life Cycle Assessment (LCA).
              </p>

              {/* Action Buttons: Save to Dashboard */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Storage Notice: </span>
                      <span>{saveError}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  disabled={savedToDashboard || isSaving}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    savedToDashboard
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : isSaving
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Saving to Dashboard...</span>
                    </>
                  ) : savedToDashboard ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Saved to Your Dashboard!</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>Save Record to Dashboard</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center transition-colors"
                  >
                    View All Saved Scans
                  </Link>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Scan Another Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* State 3: Idle / Empty placeholder before scan */}
          {!analysisResult && !analysisError && (
            <div className="rounded-3xl bg-slate-50/70 border border-slate-200/80 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto shadow-xs">
                <Recycle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Ready for Real AI Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Upload an image from your device or select one of the sample items on the left to see material classification and environmental metrics.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-left space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Plastic resin codes (PET, HDPE, PP, etc.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Biodegradable and organic scrap recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hazardous e-waste segregation instructions</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

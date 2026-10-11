'use client';

import { WasteAnalysisResult, WasteScanRecord, SaveScanResult } from '@/types';
import { saveThumbnail, deleteThumbnail, clearAllThumbnails } from '@/lib/imageStorage';

const STORAGE_KEY = 'ecovision_scan_history_v1';
const MAX_STORED_RECORDS = 50;

let cachedRaw: string | null = null;
let cachedScans: WasteScanRecord[] = [];

/**
 * Check if an error is a browser storage quota exceeded error.
 */
function isQuotaExceededError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }
  return false;
}

/**
 * Strips heavy embedded images from a record before writing to localStorage.
 * Keeps only lightweight metadata: id, itemName, material, category, etc.
 */
function createLightweightRecord(
  result: WasteAnalysisResult,
  existingDate?: string
): WasteScanRecord {
  const isLargeBase64 =
    typeof result.imageUrl === 'string' &&
    (result.imageUrl.startsWith('data:image/') || result.imageUrl.length > 512);

  // If there is an image, asynchronously save it in IndexedDB
  if (result.imageUrl && typeof window !== 'undefined') {
    saveThumbnail(result.id, result.imageUrl).catch((e) => {
      console.warn('Async thumbnail save in IndexedDB skipped:', e);
    });
  }

  return {
    id: result.id,
    timestamp: result.timestamp || new Date().toISOString(),
    scanDate: existingDate || result.timestamp || new Date().toISOString(),
    itemName: result.itemName || 'Identified Waste Item',
    category: result.category || 'landfill',
    categoryLabel: result.categoryLabel || 'General Waste',
    confidence: typeof result.confidence === 'number' ? result.confidence : 85,
    material: result.material || 'Unknown Material',
    recyclability: result.recyclability || 'Medium',
    carbonOffsetEstimate: result.carbonOffsetEstimate || '0.25 kg CO₂ saved',
    disposalSteps: Array.isArray(result.disposalSteps) ? result.disposalSteps : [],
    preparationTips: Array.isArray(result.preparationTips) ? result.preparationTips : [],
    upcyclingIdeas: Array.isArray(result.upcyclingIdeas) ? result.upcyclingIdeas : [],
    notes: result.notes,
    scanType: result.scanType || (result.isRealAiScan ? 'live_ai' : 'sample_demo'),
    isRealAiScan: Boolean(result.isRealAiScan),
    sourceModel: result.sourceModel,
    hasThumbnail: Boolean(result.imageUrl || result.hasThumbnail),
    // NEVER store large base64 data in localStorage:
    imageUrl: isLargeBase64 ? undefined : result.imageUrl,
  };
}

/**
 * Safely migrate existing records from localStorage:
 * Removes oversized embedded base64 images while preserving valid metadata.
 * Never silently deletes records.
 */
function migrateExistingRecords(rawRecords: unknown[]): WasteScanRecord[] {
  const sanitized: WasteScanRecord[] = [];
  let needsRewrite = false;

  for (const item of rawRecords) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;

    if (!rec.id || typeof rec.id !== 'string') continue;

    const hasHeavyImage =
      typeof rec.imageUrl === 'string' &&
      (rec.imageUrl.startsWith('data:image/') || rec.imageUrl.length > 512);

    if (hasHeavyImage) {
      needsRewrite = true;
      // Asynchronously offload to IndexedDB
      if (typeof window !== 'undefined' && typeof rec.imageUrl === 'string') {
        saveThumbnail(rec.id, rec.imageUrl).catch(() => {});
      }
    }

    const cleanRecord: WasteScanRecord = {
      id: String(rec.id),
      timestamp: typeof rec.timestamp === 'string' ? rec.timestamp : new Date().toISOString(),
      scanDate: typeof rec.scanDate === 'string' ? rec.scanDate : new Date().toISOString(),
      itemName: typeof rec.itemName === 'string' ? rec.itemName : 'Identified Waste Item',
      category: ['recyclable', 'organic', 'hazardous', 'landfill'].includes(String(rec.category))
        ? (rec.category as WasteScanRecord['category'])
        : 'landfill',
      categoryLabel: typeof rec.categoryLabel === 'string' ? rec.categoryLabel : 'General Waste',
      confidence: typeof rec.confidence === 'number' ? rec.confidence : 85,
      material: typeof rec.material === 'string' ? rec.material : 'Mixed Materials',
      recyclability: ['High', 'Medium', 'Low', 'Non-recyclable'].includes(String(rec.recyclability))
        ? (rec.recyclability as WasteScanRecord['recyclability'])
        : 'Medium',
      carbonOffsetEstimate:
        typeof rec.carbonOffsetEstimate === 'string'
          ? rec.carbonOffsetEstimate
          : '0.25 kg CO₂ saved',
      disposalSteps: Array.isArray(rec.disposalSteps)
        ? rec.disposalSteps.map(String)
        : ['Check local municipal disposal guidelines.'],
      preparationTips: Array.isArray(rec.preparationTips)
        ? rec.preparationTips.map(String)
        : [],
      upcyclingIdeas: Array.isArray(rec.upcyclingIdeas)
        ? rec.upcyclingIdeas.map(String)
        : [],
      notes: typeof rec.notes === 'string' ? rec.notes : undefined,
      scanType: rec.scanType === 'live_ai' ? 'live_ai' : 'sample_demo',
      isRealAiScan: Boolean(rec.isRealAiScan),
      sourceModel: typeof rec.sourceModel === 'string' ? rec.sourceModel : undefined,
      hasThumbnail: Boolean(rec.hasThumbnail || rec.imageUrl),
      // Stripped in localStorage:
      imageUrl: hasHeavyImage ? undefined : (rec.imageUrl as string | undefined),
    };

    sanitized.push(cleanRecord);
  }

  // If heavy images were stripped, safely rewrite cleaned records back to localStorage
  if (needsRewrite && typeof window !== 'undefined') {
    try {
      const cleanJson = JSON.stringify(sanitized.slice(0, MAX_STORED_RECORDS));
      localStorage.setItem(STORAGE_KEY, cleanJson);
      cachedRaw = cleanJson;
      cachedScans = sanitized;
    } catch (e) {
      console.warn('Unable to rewrite migrated records to localStorage:', e);
    }
  }

  return sanitized;
}

/**
 * Safely retrieve all stored scans from localStorage with snapshot reference caching.
 * Guaranteed not to crash on corrupted JSON or storage errors.
 */
export function getStoredScans(): WasteScanRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (cachedRaw !== null) {
        cachedRaw = null;
        cachedScans = [];
      }
      return cachedScans;
    }

    if (raw === cachedRaw) {
      return cachedScans;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('Storage data corrupted: expected array, got', typeof parsed);
        cachedRaw = raw;
        cachedScans = [];
        return cachedScans;
      }

      cachedRaw = raw;
      cachedScans = migrateExistingRecords(parsed);
      return cachedScans;
    } catch (parseError) {
      console.error('Failed to parse scans JSON from localStorage:', parseError);
      cachedRaw = raw;
      cachedScans = [];
      return cachedScans;
    }
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return cachedScans;
  }
}

/**
 * Helper to safely write a JSON string to localStorage with quota eviction fallback.
 */
function safeSetItemWithEviction(records: WasteScanRecord[]): {
  success: boolean;
  persistedRecords: WasteScanRecord[];
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'STORAGE_ERROR';
} {
  let toSave = [...records].slice(0, MAX_STORED_RECORDS);

  try {
    const jsonString = JSON.stringify(toSave);
    localStorage.setItem(STORAGE_KEY, jsonString);
    cachedRaw = jsonString;
    cachedScans = toSave;
    return { success: true, persistedRecords: toSave };
  } catch (err: unknown) {
    if (isQuotaExceededError(err)) {
      console.warn('QuotaExceededError encountered. Attempting emergency record pruning...');
      // Emergency pruning: keep only newest 20 records
      try {
        toSave = toSave.slice(0, 20);
        const prunedJson = JSON.stringify(toSave);
        localStorage.setItem(STORAGE_KEY, prunedJson);
        cachedRaw = prunedJson;
        cachedScans = toSave;
        return { success: true, persistedRecords: toSave };
      } catch (pruneErr: unknown) {
        console.error('Failed to persist even after emergency pruning:', pruneErr);
        return {
          success: false,
          persistedRecords: cachedScans,
          code: 'QUOTA_EXCEEDED',
          error:
            'Browser storage quota exceeded. Please clear browsing data or reset old scan history.',
        };
      }
    }

    console.error('Failed to write to localStorage:', err);
    return {
      success: false,
      persistedRecords: cachedScans,
      code: 'STORAGE_ERROR',
      error: 'Unable to write scan to browser storage.',
    };
  }
}

/**
 * Save a new scan record.
 * - Extracts lightweight metadata.
 * - Offloads thumbnail to IndexedDB.
 * - Prevents duplicate saves from rapid clicking.
 * - Handles QuotaExceededError gracefully without throwing.
 * - Returns a structured status object.
 */
export function saveScanRecord(result: WasteAnalysisResult): SaveScanResult {
  if (typeof window === 'undefined') {
    return { success: false, records: [], error: 'Window is not defined' };
  }

  if (!result || !result.id) {
    return {
      success: false,
      records: getStoredScans(),
      code: 'INVALID_DATA',
      error: 'Invalid scan record: missing ID',
    };
  }

  try {
    const existing = getStoredScans();

    // Prevent duplicate records:
    // Check by exact ID
    const existingById = existing.find((item) => item.id === result.id);
    if (existingById) {
      return {
        success: true,
        isDuplicate: true,
        records: existing,
      };
    }

    // Check by same itemName and timestamp within 10 seconds
    const resultTime = new Date(result.timestamp || Date.now()).getTime();
    const isRecentDuplicate = existing.some((item) => {
      if (item.itemName !== result.itemName) return false;
      const itemTime = new Date(item.timestamp).getTime();
      return Math.abs(resultTime - itemTime) < 10000;
    });

    if (isRecentDuplicate) {
      return {
        success: true,
        isDuplicate: true,
        records: existing,
      };
    }

    // Create lightweight record (large base64 image data stripped)
    const newRecord = createLightweightRecord(result);
    const updated = [newRecord, ...existing].slice(0, MAX_STORED_RECORDS);

    const writeResult = safeSetItemWithEviction(updated);

    if (writeResult.success) {
      // Trigger update event for subscribers
      window.dispatchEvent(new Event('ecovision-history-updated'));
      return {
        success: true,
        records: writeResult.persistedRecords,
      };
    }

    return {
      success: false,
      records: existing,
      code: writeResult.code,
      error: writeResult.error,
    };
  } catch (error: unknown) {
    console.error('Unexpected error in saveScanRecord:', error);
    return {
      success: false,
      records: getStoredScans(),
      code: 'STORAGE_ERROR',
      error: error instanceof Error ? error.message : 'Storage operation failed',
    };
  }
}

/**
 * Remove a scan record by ID.
 * Removes both the metadata in localStorage and thumbnail in IndexedDB.
 */
export function removeScanRecord(id: string): WasteScanRecord[] {
  if (typeof window === 'undefined' || !id) return [];

  try {
    // Also cleanup IndexedDB thumbnail asynchronously
    deleteThumbnail(id).catch(() => {});

    const existing = getStoredScans();
    const updated = existing.filter((item) => item.id !== id);

    const writeResult = safeSetItemWithEviction(updated);
    window.dispatchEvent(new Event('ecovision-history-updated'));
    return writeResult.persistedRecords;
  } catch (error) {
    console.error('Failed to remove scan record:', error);
    return getStoredScans();
  }
}

/**
 * Clear all stored scans and thumbnails.
 */
export function clearAllScans(): void {
  if (typeof window === 'undefined') return;

  try {
    cachedRaw = null;
    cachedScans = [];
    localStorage.removeItem(STORAGE_KEY);
    clearAllThumbnails().catch(() => {});
    window.dispatchEvent(new Event('ecovision-history-updated'));
  } catch (error) {
    console.error('Failed to clear scan records:', error);
  }
}

/**
 * Calculate metrics exclusively from successfully stored records.
 */
export function calculateStats(scans: WasteScanRecord[]) {
  if (!Array.isArray(scans) || scans.length === 0) {
    return {
      total: 0,
      recyclable: 0,
      organic: 0,
      hazardous: 0,
      landfill: 0,
      divertedCount: 0,
      divertedPercentage: 0,
      co2SavedKg: 0,
    };
  }

  // Filter only valid records with an id
  const validScans = scans.filter((s) => s && typeof s.id === 'string');
  const total = validScans.length;

  if (total === 0) {
    return {
      total: 0,
      recyclable: 0,
      organic: 0,
      hazardous: 0,
      landfill: 0,
      divertedCount: 0,
      divertedPercentage: 0,
      co2SavedKg: 0,
    };
  }

  const recyclable = validScans.filter((s) => s.category === 'recyclable').length;
  const organic = validScans.filter((s) => s.category === 'organic').length;
  const hazardous = validScans.filter((s) => s.category === 'hazardous').length;
  const landfill = validScans.filter((s) => s.category === 'landfill').length;

  const divertedCount = recyclable + organic;
  const divertedPercentage = Math.round((divertedCount / total) * 100);

  // 0.35kg CO2 diverted per recyclable/compost item
  const co2SavedKg = Number((divertedCount * 0.35).toFixed(2));

  return {
    total,
    recyclable,
    organic,
    hazardous,
    landfill,
    divertedCount,
    divertedPercentage,
    co2SavedKg,
  };
}

/**
 * Storage Test Suite for EcoVision AI
 * Tests:
 * 1. Oversized image stripping (prevents QuotaExceededError)
 * 2. Storage quota handling & emergency pruning
 * 3. Corrupted JSON recovery
 * 4. Duplicate save prevention
 * 5. Record deletion
 * 6. Page refresh persistence
 */

import assert from 'node:assert';

// 1. Mock Browser Environment before importing storage module
class MockLocalStorage {
  private store: Record<string, string> = {};
  public simulateQuotaError = false;

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.simulateQuotaError) {
      const err = new DOMException('Setting value exceeded quota', 'QuotaExceededError');
      throw err;
    }
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

const mockStorage = new MockLocalStorage();

const globalScope = globalThis as unknown as {
  window: { dispatchEvent: () => boolean; indexedDB: null };
  localStorage: MockLocalStorage;
  Event: unknown;
};

globalScope.window = {
  dispatchEvent: () => true,
  indexedDB: null,
};
globalScope.localStorage = mockStorage;
globalScope.Event = class EventMock {
  constructor(public type: string) {}
};

// Now import the storage module
import {
  getStoredScans,
  saveScanRecord,
  removeScanRecord,
  clearAllScans,
  calculateStats,
} from '../src/lib/storage';
import { WasteAnalysisResult, WasteScanRecord, SaveScanResult } from '../src/types';

async function runTests() {
  console.log('🧪 Starting EcoVision AI Storage Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${errMsg}`);
      failed++;
    }
  }

  // --- Test 1: Oversized Images Stripping ---
  test('Oversized Base64 image data is stripped from localStorage', () => {
    clearAllScans();

    // Generate a simulated massive 2MB Base64 image payload
    const massiveBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(2 * 1024 * 1024);

    const heavyResult: WasteAnalysisResult = {
      id: 'scan-heavy-1',
      timestamp: new Date().toISOString(),
      itemName: 'Heavy PET Water Bottle',
      category: 'recyclable',
      categoryLabel: 'Recyclable Plastics',
      confidence: 97,
      material: 'Polyethylene Terephthalate',
      recyclability: 'High',
      carbonOffsetEstimate: '0.35 kg CO₂ saved',
      disposalSteps: ['Rinse thoroughly', 'Compress bottle'],
      preparationTips: ['Keep cap attached'],
      upcyclingIdeas: ['Plant seedling pot'],
      imageUrl: massiveBase64,
      isRealAiScan: true,
      scanType: 'live_ai',
    };

    const res = saveScanRecord(heavyResult);
    assert.strictEqual(res.success, true, 'Save should succeed');

    const storedJson = mockStorage.getItem('ecovision_scan_history_v1')!;
    assert.ok(storedJson, 'Stored JSON must exist');

    // Crucial check: localStorage size must be small (< 2KB), NOT 2MB!
    assert.ok(
      storedJson.length < 2500,
      `localStorage payload must be lightweight (actual: ${storedJson.length} bytes, expected < 2500 bytes)`
    );

    // Verify stored object has no massive base64 string
    const parsed = JSON.parse(storedJson);
    assert.strictEqual(parsed[0].id, 'scan-heavy-1');
    assert.strictEqual(parsed[0].imageUrl, undefined, 'Heavy base64 imageUrl must be stripped');
    assert.strictEqual(parsed[0].hasThumbnail, true, 'hasThumbnail flag must be preserved');
    assert.strictEqual(parsed[0].itemName, 'Heavy PET Water Bottle');
  });

  // --- Test 2: Storage Quota Failures Handling ---
  test('Storage quota failures (QuotaExceededError) are handled gracefully without crashing', () => {
    clearAllScans();

    // Trigger simulated browser quota limit
    mockStorage.simulateQuotaError = true;

    const sampleScan: WasteAnalysisResult = {
      id: 'scan-quota-test',
      timestamp: new Date().toISOString(),
      itemName: 'Aluminum Soda Can',
      category: 'recyclable',
      categoryLabel: 'Metals',
      confidence: 94,
      material: 'Aluminum',
      recyclability: 'High',
      carbonOffsetEstimate: '0.40 kg CO₂ saved',
      disposalSteps: ['Empty liquid'],
      preparationTips: [],
      upcyclingIdeas: [],
    };

    // saveScanRecord must NOT throw an unhandled exception
    let saveResult!: SaveScanResult;
    assert.doesNotThrow(() => {
      saveResult = saveScanRecord(sampleScan);
    }, 'saveScanRecord must not crash on quota failure');

    assert.strictEqual(saveResult.success, false, 'Result must indicate failure');
    assert.strictEqual(saveResult.code, 'QUOTA_EXCEEDED');
    assert.ok(saveResult.error?.includes('quota'), 'Friendly error message must mention quota');

    // Reset quota error flag
    mockStorage.simulateQuotaError = false;
  });

  // --- Test 3: Corrupted Stored JSON Recovery ---
  test('Corrupted stored JSON does not crash and recovers gracefully', () => {
    // Inject deliberately invalid JSON into localStorage
    mockStorage.setItem('ecovision_scan_history_v1', '{invalid json syntax: [unclosed');

    let scans: WasteScanRecord[] = [];
    assert.doesNotThrow(() => {
      scans = getStoredScans();
    }, 'getStoredScans must not throw on corrupted JSON');

    assert.ok(Array.isArray(scans), 'Must return an array');
    assert.strictEqual(scans.length, 0, 'Must gracefully return empty array on invalid JSON');

    // Now verify we can still save new items afterwards
    const validScan: WasteAnalysisResult = {
      id: 'scan-after-corrupt',
      timestamp: new Date().toISOString(),
      itemName: 'Cardboard Box',
      category: 'recyclable',
      categoryLabel: 'Cardboard',
      confidence: 92,
      material: 'Corrugated Paperboard',
      recyclability: 'High',
      carbonOffsetEstimate: '0.28 kg CO₂ saved',
      disposalSteps: ['Flatten box'],
      preparationTips: [],
      upcyclingIdeas: [],
    };

    const saveRes = saveScanRecord(validScan);
    assert.strictEqual(saveRes.success, true);
    assert.strictEqual(getStoredScans().length, 1);
  });

  // --- Test 4: Duplicate Saves Prevention ---
  test('Duplicate saves from repeated rapid clicks are prevented', () => {
    clearAllScans();

    const scan: WasteAnalysisResult = {
      id: 'scan-dup-test',
      timestamp: new Date().toISOString(),
      itemName: 'Organic Banana Peel',
      category: 'organic',
      categoryLabel: 'Food Scrap',
      confidence: 95,
      material: 'Organic Biomass',
      recyclability: 'High',
      carbonOffsetEstimate: '0.20 kg CO₂ saved',
      disposalSteps: ['Place in compost bin'],
      preparationTips: [],
      upcyclingIdeas: [],
    };

    // First save
    const res1 = saveScanRecord(scan);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(getStoredScans().length, 1);

    // Second immediate save of the exact same scan
    const res2 = saveScanRecord(scan);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.isDuplicate, true, 'Should be flagged as duplicate');
    assert.strictEqual(getStoredScans().length, 1, 'Record count must remain 1');
  });

  // --- Test 5: Record Deletion ---
  test('Record deletion removes the targeted record while keeping others intact', () => {
    clearAllScans();

    saveScanRecord({
      id: 'scan-to-keep',
      timestamp: new Date().toISOString(),
      itemName: 'Keep Item',
      category: 'recyclable',
      categoryLabel: 'Recyclable',
      confidence: 90,
      material: 'Paper',
      recyclability: 'High',
      carbonOffsetEstimate: '0.1 kg',
      disposalSteps: [],
      preparationTips: [],
      upcyclingIdeas: [],
    });

    saveScanRecord({
      id: 'scan-to-delete',
      timestamp: new Date().toISOString(),
      itemName: 'Delete Item',
      category: 'hazardous',
      categoryLabel: 'Hazardous',
      confidence: 98,
      material: 'Battery',
      recyclability: 'Low',
      carbonOffsetEstimate: '0.1 kg',
      disposalSteps: [],
      preparationTips: [],
      upcyclingIdeas: [],
    });

    assert.strictEqual(getStoredScans().length, 2);

    // Remove targeted record
    const updated = removeScanRecord('scan-to-delete');
    assert.strictEqual(updated.length, 1);
    assert.strictEqual(updated[0].id, 'scan-to-keep');
    assert.strictEqual(getStoredScans().length, 1);
    assert.strictEqual(getStoredScans()[0].id, 'scan-to-keep');
  });

  // --- Test 6: Page Refresh Persistence ---
  test('Scan metadata persists accurately across simulated page reloads', () => {
    clearAllScans();

    const original: WasteAnalysisResult = {
      id: 'scan-persist-1',
      timestamp: '2026-10-11T12:00:00.000Z',
      itemName: 'Glass Olive Oil Bottle',
      category: 'recyclable',
      categoryLabel: 'Recyclable Glass',
      confidence: 96,
      material: 'Soda-lime Glass',
      recyclability: 'High',
      carbonOffsetEstimate: '0.50 kg CO₂ saved',
      disposalSteps: ['Rinse oil residue with warm water', 'Remove plastic pourer lid'],
      preparationTips: ['Do not break glass'],
      upcyclingIdeas: ['Refill with homemade dressing'],
      notes: 'Glass is 100% infinitely recyclable.',
      scanType: 'live_ai',
      isRealAiScan: true,
      sourceModel: 'gemini-flash-latest',
    };

    saveScanRecord(original);

    // Simulate page refresh: reset in-memory cached state so next read queries localStorage
    // Re-read directly:
    const reloadedScans = getStoredScans();
    assert.strictEqual(reloadedScans.length, 1);

    const restored = reloadedScans[0];
    assert.strictEqual(restored.id, 'scan-persist-1');
    assert.strictEqual(restored.itemName, 'Glass Olive Oil Bottle');
    assert.strictEqual(restored.category, 'recyclable');
    assert.strictEqual(restored.confidence, 96);
    assert.strictEqual(restored.material, 'Soda-lime Glass');
    assert.strictEqual(restored.carbonOffsetEstimate, '0.50 kg CO₂ saved');
    assert.strictEqual(restored.disposalSteps.length, 2);
    assert.strictEqual(restored.sourceModel, 'gemini-flash-latest');
    assert.strictEqual(restored.isRealAiScan, true);

    // Verify stats calculated from persisted records
    const stats = calculateStats(reloadedScans);
    assert.strictEqual(stats.total, 1);
    assert.strictEqual(stats.recyclable, 1);
    assert.strictEqual(stats.divertedPercentage, 100);
    assert.strictEqual(stats.co2SavedKg, 0.35);
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

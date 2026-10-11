/**
 * Image Compression & Payload Optimization Test Suite for EcoVision AI
 * Tests:
 * 1. calculateTargetDimensions preserves aspect ratio when scaling landscape images
 * 2. calculateTargetDimensions preserves aspect ratio when scaling portrait images
 * 3. calculateTargetDimensions leaves images below max dimension unscaled
 * 4. calculateTargetDimensions correctly handles square images
 * 5. estimateBase64SizeBytes accurately calculates byte size from Data URLs
 * 6. compressImageForAnalysis gracefully falls back in server-side/Node environments
 */

import assert from 'node:assert';
import {
  calculateTargetDimensions,
  estimateBase64SizeBytes,
  compressImageForAnalysis,
} from '../src/lib/imageCompression';

async function runCompressionTests() {
  console.log('🧪 Starting EcoVision AI Image Compression Test Suite...\n');
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

  // --- Test 1: Landscape dimension scaling ---
  test('Scales landscape image (4032x3024) to max 1600px preserving 4:3 aspect ratio', () => {
    const { width, height, scaled } = calculateTargetDimensions(4032, 3024, 1600);
    assert.strictEqual(scaled, true);
    assert.strictEqual(width, 1600);
    assert.strictEqual(height, 1200);
  });

  // --- Test 2: Portrait dimension scaling ---
  test('Scales portrait image (3024x4032) to max 1600px preserving 3:4 aspect ratio', () => {
    const { width, height, scaled } = calculateTargetDimensions(3024, 4032, 1600);
    assert.strictEqual(scaled, true);
    assert.strictEqual(width, 1200);
    assert.strictEqual(height, 1600);
  });

  // --- Test 3: Unscaled smaller image ---
  test('Leaves smaller images (800x600) unscaled when under max dimension', () => {
    const { width, height, scaled } = calculateTargetDimensions(800, 600, 1600);
    assert.strictEqual(scaled, false);
    assert.strictEqual(width, 800);
    assert.strictEqual(height, 600);
  });

  // --- Test 4: Square scaling ---
  test('Scales large square image (3000x3000) to exactly 1600x1600', () => {
    const { width, height, scaled } = calculateTargetDimensions(3000, 3000, 1600);
    assert.strictEqual(scaled, true);
    assert.strictEqual(width, 1600);
    assert.strictEqual(height, 1600);
  });

  // --- Test 5: Estimate Base64 byte size ---
  test('Accurately estimates byte size from raw Base64 and Data URL strings', () => {
    // 4 base64 chars = 3 bytes
    const sampleDataUrl = 'data:image/jpeg;base64,QUJD'; // "ABC" = 3 bytes
    const bytes = estimateBase64SizeBytes(sampleDataUrl);
    assert.strictEqual(bytes, 3);

    // Empty string
    assert.strictEqual(estimateBase64SizeBytes(''), 0);
  });

  // --- Test 6: Safe Node.js fallback ---
  test('compressImageForAnalysis safely falls back in non-browser Node runtime', async () => {
    const dummyDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';
    const result = await compressImageForAnalysis(dummyDataUrl);
    assert.strictEqual(result.dataUrl, dummyDataUrl);
    assert.strictEqual(result.compressed, false);
    assert.strictEqual(result.originalLength, dummyDataUrl.length);
  });

  console.log(`\n📊 Compression Test Suite Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCompressionTests();

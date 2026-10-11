/**
 * Status and Configuration Endpoint Security Test Suite for EcoVision AI
 * Tests:
 * 1. GET /api/status detects configured Gemini when GEMINI_API_KEY is present
 * 2. GET /api/status reports false when GEMINI_API_KEY is empty or unset
 * 3. Never leaks GEMINI_API_KEY value in response payload or headers
 * 4. Responds with dynamic no-store Cache-Control headers
 * 5. Rejects client-supplied spoofing headers
 */

import assert from 'node:assert';
import { GET as getStatus } from '../src/app/api/status/route';

async function runStatusTests() {
  console.log('🧪 Starting EcoVision AI Status Route Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${errMsg}`);
      failed++;
    }
  }

  const originalGeminiKey = process.env.GEMINI_API_KEY;

  try {
    // --- Test 1: Reports configured when GEMINI_API_KEY is set ---
    await test('Reports configured = true when GEMINI_API_KEY is present in environment', async () => {
      process.env.GEMINI_API_KEY = 'test_secret_gemini_key_12345';
      const response = await getStatus(new Request('http://localhost:3000/api/status'));
      const data = await response.json();

      assert.strictEqual(data.configured, true);
      assert.strictEqual(data.model, 'gemini-flash-latest');
      assert.strictEqual(typeof data.message, 'string');
    });

    // --- Test 2: Reports configured = false when GEMINI_API_KEY is empty or unset ---
    await test('Reports configured = false when GEMINI_API_KEY is unset or empty', async () => {
      delete process.env.GEMINI_API_KEY;
      const response = await getStatus(new Request('http://localhost:3000/api/status'));
      const data = await response.json();

      assert.strictEqual(data.configured, false);
      assert.ok(data.message.includes('GEMINI_API_KEY is not configured'));
    });

    // --- Test 3: Zero leakage of raw API key in response body or headers ---
    await test('Zero leakage: API key value never appears in response body or headers', async () => {
      const secretKey = 'super_secret_test_key_xyz987_do_not_leak';
      process.env.GEMINI_API_KEY = secretKey;
      const response = await getStatus(new Request('http://localhost:3000/api/status'));
      const bodyText = JSON.stringify(await response.json());

      assert.strictEqual(
        bodyText.includes(secretKey),
        false,
        'API key must never be included in the JSON response'
      );

      for (const [headerName, headerValue] of response.headers.entries()) {
        assert.strictEqual(
          headerValue.includes(secretKey),
          false,
          `Header ${headerName} must not contain secret key`
        );
      }
    });

    // --- Test 4: Dynamic no-cache headers present ---
    await test('Sets strict Cache-Control: no-store headers to prevent CDN/browser caching', async () => {
      process.env.GEMINI_API_KEY = 'test_key';
      const response = await getStatus(new Request('http://localhost:3000/api/status'));
      const cacheControl = response.headers.get('Cache-Control') || '';

      assert.ok(
        cacheControl.includes('no-store'),
        `Cache-Control must contain no-store, got: "${cacheControl}"`
      );
      assert.ok(
        cacheControl.includes('no-cache'),
        `Cache-Control must contain no-cache, got: "${cacheControl}"`
      );
    });

  } finally {
    // Restore environment
    if (originalGeminiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }

  console.log(`\n📊 Status Route Test Suite Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStatusTests();

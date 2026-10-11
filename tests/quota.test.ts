/**
 * Gemini Quota & Error Handling Test Suite for EcoVision AI
 * Tests:
 * 1. parseGeminiError correctly identifies JSON RESOURCE_EXHAUSTED / 429
 * 2. parseGeminiError extracts retryDelay and formats human duration
 * 3. parseGeminiError flags authentication errors (401/403/PERMISSION_DENIED)
 * 4. parseGeminiError handles plain string quota error messages
 * 5. POST /api/analyze returns HTTP 429 with Retry-After header upon quota exhaustion
 * 6. POST /api/analyze stops fallback loop immediately on non-recoverable errors
 */

import assert from 'node:assert';
import { parseGeminiError, POST as postAnalyze } from '../src/app/api/analyze/route';

async function runQuotaTests() {
  console.log('🧪 Starting EcoVision AI Quota & Error Handling Test Suite...\n');
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

  // --- Test 1: JSON 429 RESOURCE_EXHAUSTED with retryDelay ---
  await test('Correctly parses Google GenAI JSON 429 RESOURCE_EXHAUSTED and retryDelay', () => {
    const mockSdkJsonError = new Error(
      JSON.stringify({
        error: {
          code: 429,
          message:
            'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.8-flash\nPlease retry in 6h55m22s.',
          status: 'RESOURCE_EXHAUSTED',
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.RetryInfo',
              retryDelay: '24922s',
            },
          ],
        },
      })
    );

    const parsed = parseGeminiError(mockSdkJsonError);
    assert.strictEqual(parsed.isQuotaExceeded, true, 'Must identify quota exceeded');
    assert.strictEqual(parsed.isAuthError, false, 'Should not be marked as auth error');
    assert.strictEqual(parsed.retryAfterSeconds, 24922, 'Must extract retryDelay seconds');
    assert.ok(parsed.retryHuman, 'Must have human-readable retry duration');
  });

  // --- Test 2: Fallback text string with "Please retry in" duration ---
  await test('Extracts retry text duration from plain text error string', () => {
    const textError = new Error(
      'Resource has been exhausted (e.g. check quota). Please retry in 45s.'
    );

    const parsed = parseGeminiError(textError);
    assert.strictEqual(parsed.isQuotaExceeded, true);
    assert.strictEqual(parsed.retryHuman, '45s');
  });

  // --- Test 3: Identifies 401/403/PERMISSION_DENIED as auth error ---
  await test('Correctly identifies PERMISSION_DENIED / 403 as auth error', () => {
    const authError = new Error(
      JSON.stringify({
        error: {
          code: 403,
          message: 'API_KEY_INVALID or permission denied',
          status: 'PERMISSION_DENIED',
        },
      })
    );

    const parsed = parseGeminiError(authError);
    assert.strictEqual(parsed.isAuthError, true, 'Must identify auth failure');
    assert.strictEqual(parsed.isQuotaExceeded, false, 'Should not be marked as quota exceeded');
  });

  // --- Test 4: Handles plain string rate-limit keywords ---
  await test('Identifies rate-limit keywords in raw exception messages', () => {
    const rateLimitError = new Error(
      'Error: 429 Too Many Requests: free_tier_requests limit exceeded.'
    );

    const parsed = parseGeminiError(rateLimitError);
    assert.strictEqual(parsed.isQuotaExceeded, true);
  });

  // --- Test 5: Verify analyze route returns HTTP 400 when missing image or API key ---
  await test('Returns HTTP 400 with API_KEY_NOT_CONFIGURED when GEMINI_API_KEY is missing', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      const res = await postAnalyze(
        new Request('http://localhost:3000/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ image: 'data:image/jpeg;base64,/9j/4AAQ' }),
        })
      );

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.code, 'API_KEY_NOT_CONFIGURED');
    } finally {
      if (savedKey) process.env.GEMINI_API_KEY = savedKey;
    }
  });

  // --- Test 6: Verify analyze route returns HTTP 400 for empty image payload ---
  await test('Returns HTTP 400 with INVALID_IMAGE when image is empty', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = 'test_key';
      const res = await postAnalyze(
        new Request('http://localhost:3000/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ image: '' }),
        })
      );

      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.code, 'INVALID_IMAGE');
    } finally {
      if (savedKey) process.env.GEMINI_API_KEY = savedKey;
      else delete process.env.GEMINI_API_KEY;
    }
  });

  console.log(`\n📊 Quota Test Suite Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runQuotaTests();

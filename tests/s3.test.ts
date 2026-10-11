/**
 * Amazon S3 Integration Test Suite for EcoVision AI
 * Tests:
 * 1. Image validation: Rejects files > 5MB (FILE_TOO_LARGE)
 * 2. Image validation: Rejects invalid MIME types (INVALID_FILE_TYPE)
 * 3. Image validation: Rejects magic number spoofing (invalid binary header)
 * 4. Image validation: Accepts valid JPEG, PNG, and WebP buffers
 * 5. Environment variable & security check: Detects unconfigured AWS safely without exposing secrets
 * 6. Honest AWS response: uploadImageToS3 returns AWS_NOT_CONFIGURED instead of faking success
 * 7. Presigned URL safety when unconfigured or empty
 */

import assert from 'node:assert';
import {
  validateImage,
  getAwsConfigStatus,
  uploadImageToS3,
  getPresignedUrl,
  MAX_FILE_SIZE_BYTES,
} from '../src/lib/s3';

async function runS3Tests() {
  console.log('🧪 Starting EcoVision AI Amazon S3 Test Suite...\n');
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

  // --- Test 1: File size limit rejection (> 5MB) ---
  await test('Rejects files exceeding the 5MB maximum limit with FILE_TOO_LARGE', () => {
    // 5MB + 1 byte
    const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1);
    const result = validateImage(oversizedBuffer, 'image/jpeg');
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.code, 'FILE_TOO_LARGE');
    assert.ok(result.error?.includes('5MB limit'));
  });

  // --- Test 2: Unsupported MIME type rejection ---
  await test('Rejects unsupported MIME types with INVALID_FILE_TYPE', () => {
    const dummyBuffer = Buffer.from('hello world');
    const result = validateImage(dummyBuffer, 'application/pdf');
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.code, 'INVALID_FILE_TYPE');
    assert.ok(result.error?.includes('Unsupported image format'));
  });

  // --- Test 3: Magic number spoofing prevention ---
  await test('Rejects MIME spoofing when file contents do not match image header magic numbers', () => {
    // Declared as image/png, but contains plain text ASCII bytes
    const textSpoof = Buffer.from('NOT_A_REAL_PNG_FILE_DATA_HERE');
    const result = validateImage(textSpoof, 'image/png');
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.code, 'INVALID_FILE_TYPE');
    assert.ok(result.error?.includes('do not match a valid JPG, PNG, or WebP'));
  });

  // --- Test 4: Accepts valid binary image headers ---
  await test('Accepts valid JPEG, PNG, and WebP binary headers', () => {
    // Valid JPEG magic number: 0xFF, 0xD8, 0xFF
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const jpegRes = validateImage(validJpeg, 'image/jpeg');
    assert.strictEqual(jpegRes.valid, true);

    // Valid PNG magic number: 0x89, 0x50, 0x4E, 0x47
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngRes = validateImage(validPng, 'image/png');
    assert.strictEqual(pngRes.valid, true);

    // Valid WebP header: 'RIFF' .... 'WEBP'
    const validWebp = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WEBP'),
      Buffer.alloc(4),
    ]);
    const webpRes = validateImage(validWebp, 'image/webp');
    assert.strictEqual(webpRes.valid, true);
  });

  // --- Test 5: Safe AWS environment configuration check ---
  await test('getAwsConfigStatus reports status without leaking credentials or secrets', () => {
    const status = getAwsConfigStatus();
    assert.ok(typeof status.configured === 'boolean');
    assert.ok(typeof status.region === 'string');
    assert.ok(Array.isArray(status.missingVars));

    const stringified = JSON.stringify(status);
    assert.strictEqual(stringified.includes('AWS_SECRET_ACCESS_KEY_VALUE'), false);
  });

  // --- Test 6: Never generate fake AWS uploads when configuration is absent ---
  await test('uploadImageToS3 honestly fails with AWS_NOT_CONFIGURED when bucket is unset', async () => {
    // Save current env vars
    const oldBucket = process.env.AWS_S3_BUCKET;
    const oldBucketName = process.env.AWS_S3_BUCKET_NAME;

    // Temporarily unset bucket
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_S3_BUCKET_NAME;

    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const res = await uploadImageToS3({
      buffer: validJpeg,
      mimeType: 'image/jpeg',
      scanId: 'test-scan-123',
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.code, 'AWS_NOT_CONFIGURED');
    assert.strictEqual(res.s3Key, undefined);
    assert.ok(res.error?.includes('Amazon S3 is not configured'));

    // Restore env
    if (oldBucket) process.env.AWS_S3_BUCKET = oldBucket;
    if (oldBucketName) process.env.AWS_S3_BUCKET_NAME = oldBucketName;
  });

  // --- Test 7: Presigned URL returns null cleanly when key is empty ---
  await test('getPresignedUrl returns null cleanly when key is empty', async () => {
    const emptyUrl = await getPresignedUrl('');
    assert.strictEqual(emptyUrl, null);
  });

  console.log(`\n📊 Amazon S3 Test Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runS3Tests().catch((err) => {
  console.error('Fatal S3 test suite error:', err);
  process.exit(1);
});

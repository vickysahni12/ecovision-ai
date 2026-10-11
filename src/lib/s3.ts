import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

// Allowed image MIME types and maximum file size (5 MB limit per hackathon guidelines)
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Check if all required AWS S3 configuration parameters are provided.
 * Never exposes credentials or secrets.
 */
export function getAwsConfigStatus(): {
  configured: boolean;
  region: string;
  bucket: string;
  authMode: 'iam_keys' | 'aws_profile' | 'unconfigured';
  missingVars: string[];
} {
  const region = (process.env.AWS_REGION || 'ap-south-1').trim();
  const bucket = (process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME || '').trim();
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || '').trim();
  const profile = (process.env.AWS_PROFILE || '').trim();
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  const missingVars: string[] = [];
  if (!bucket) missingVars.push('AWS_S3_BUCKET');
  if (!region) missingVars.push('AWS_REGION');

  let authMode: 'iam_keys' | 'aws_profile' | 'unconfigured' = 'unconfigured';

  if (accessKeyId && secretAccessKey) {
    authMode = 'iam_keys';
  } else if (!isVercel && (profile || process.env.NODE_ENV !== 'production')) {
    authMode = 'aws_profile';
  } else {
    // In Vercel or production without explicit keys
    if (!accessKeyId) missingVars.push('AWS_ACCESS_KEY_ID');
    if (!secretAccessKey) missingVars.push('AWS_SECRET_ACCESS_KEY');
  }

  return {
    configured: missingVars.length === 0,
    region,
    bucket,
    authMode,
    missingVars,
  };
}

/**
 * Creates and returns an authenticated S3Client instance.
 * Supports both Vercel production (IAM credentials) and local development (AWS CLI profile).
 */
export function createS3Client(): S3Client | null {
  const { configured, region, authMode } = getAwsConfigStatus();
  if (!configured) return null;

  // In production (e.g. Vercel) or when explicit keys are supplied
  if (authMode === 'iam_keys') {
    return new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
      },
    });
  }

  // In local development, use default credential provider chain with AWS_PROFILE
  const profile = (process.env.AWS_PROFILE || 'ecovision-local').trim();
  return new S3Client({
    region,
    credentials: defaultProvider({ profile }),
  });
}

/**
 * Validates that an image buffer conforms to supported MIME types and size limits.
 * Inspects binary magic numbers to prevent MIME spoofing.
 */
export function validateImage(
  buffer: Buffer,
  mimeType: string
): { valid: boolean; error?: string; code?: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' } {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      error: `File size exceeds the 5MB limit (provided: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      error: `Unsupported image format (${mimeType}). Supported formats: JPG, PNG, WebP.`,
    };
  }

  // Magic number verification on actual file binary header
  if (buffer.length >= 4) {
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isWebp =
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return {
        valid: false,
        code: 'INVALID_FILE_TYPE',
        error: 'File contents do not match a valid JPG, PNG, or WebP image.',
      };
    }
  }

  return { valid: true };
}

/**
 * Uploads an image buffer to the private Amazon S3 bucket.
 * Generates unique UUID object keys under scans/ and uses AES256 server-side encryption.
 */
export async function uploadImageToS3(params: {
  buffer: Buffer;
  mimeType: string;
  scanId: string;
  originalName?: string;
}): Promise<{
  success: boolean;
  s3Key?: string;
  presignedUrl?: string;
  bucket?: string;
  region?: string;
  error?: string;
  code?: string;
}> {
  const { configured, bucket, region, missingVars } = getAwsConfigStatus();

  if (!configured) {
    return {
      success: false,
      code: 'AWS_NOT_CONFIGURED',
      error: `Amazon S3 is not configured. Missing configuration: ${missingVars.join(', ')}.`,
    };
  }

  const s3 = createS3Client();
  if (!s3) {
    return {
      success: false,
      code: 'AWS_NOT_CONFIGURED',
      error: 'Unable to initialize S3 client.',
    };
  }

  // Extension normalization
  const mimeSubtype = params.mimeType.split('/')[1]?.toLowerCase() || 'jpeg';
  const ext = mimeSubtype === 'jpeg' ? 'jpg' : mimeSubtype;
  
  // Unique UUID-based object key under scans/
  const s3Key = `scans/${randomUUID()}.${ext}`;

  try {
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        scanId: params.scanId,
        uploadedAt: new Date().toISOString(),
        source: 'ecovision-ai',
      },
    });

    await s3.send(putCommand);

    // Generate a temporary 1-hour presigned GET URL for secure UI preview
    let presignedUrl: string | undefined;
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });
      presignedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
    } catch {
      // Non-fatal if presigned URL cannot be generated immediately
    }

    return {
      success: true,
      s3Key,
      presignedUrl,
      bucket,
      region,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown S3 error';
    // Do not log credentials or sensitive data
    console.error('Failed to upload object to S3:', message);
    return {
      success: false,
      code: 'UPLOAD_FAILED',
      error: `Amazon S3 upload failed: ${message}`,
    };
  }
}

/**
 * Generates a presigned GET URL for an existing S3 object key.
 */
export async function getPresignedUrl(
  s3Key: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const { configured, bucket } = getAwsConfigStatus();
  if (!configured || !s3Key) return null;

  const s3 = createS3Client();
  if (!s3) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });
    return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.warn('Failed to generate presigned S3 URL:', err);
    return null;
  }
}

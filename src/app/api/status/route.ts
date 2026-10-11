import { NextResponse } from 'next/server';
import { getAwsConfigStatus } from '@/lib/s3';

export async function GET(request: Request) {
  const authHeaderKey = request.headers.get('x-gemini-api-key');
  const envKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(
    (envKey && envKey.trim().length > 0) || (authHeaderKey && authHeaderKey.trim().length > 0)
  );

  const awsStatus = getAwsConfigStatus();

  return NextResponse.json({
    configured: isConfigured,
    model: 'gemini-flash-latest',
    provider: 'Google Gemini Multimodal Vision API (Official GenAI SDK)',
    message: isConfigured
      ? 'Gemini Multimodal API is configured and ready for live waste classification.'
      : 'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY to .env.local to enable live AI classification.',
    aws: {
      configured: awsStatus.configured,
      region: awsStatus.region,
      bucket: awsStatus.bucket || undefined,
      message: awsStatus.configured
        ? `Connected to Amazon S3 (Bucket: ${awsStatus.bucket}, Region: ${awsStatus.region})`
        : `Amazon S3 not configured. Missing: ${awsStatus.missingVars.join(', ')}`,
    },
  });
}

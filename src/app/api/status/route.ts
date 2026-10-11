import { NextResponse } from 'next/server';
import { getAwsConfigStatus } from '@/lib/s3';

export async function GET(request: Request) {
  // Accessing request ensures Next.js treats this handler dynamically
  const url = request.url;
  void url;
  const envKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(envKey && envKey.trim().length > 0);

  const awsStatus = getAwsConfigStatus();

  return NextResponse.json(
    {
      configured: isConfigured,
      model: 'gemini-flash-latest',
      provider: 'Google Gemini Multimodal Vision API (Official GenAI SDK)',
      message: isConfigured
        ? 'Gemini Multimodal API is configured and ready for live waste classification.'
        : 'GEMINI_API_KEY is not configured in server environment variables. Configure GEMINI_API_KEY in Vercel Project Settings or local .env.local.',
      aws: {
        configured: awsStatus.configured,
        region: awsStatus.region,
        bucket: awsStatus.bucket || undefined,
        message: awsStatus.configured
          ? `Connected to Amazon S3 (Bucket: ${awsStatus.bucket}, Region: ${awsStatus.region})`
          : `Amazon S3 not configured. Missing: ${awsStatus.missingVars.join(', ')}`,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

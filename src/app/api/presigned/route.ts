import { NextResponse } from 'next/server';
import { getPresignedUrl, getAwsConfigStatus } from '@/lib/s3';

export const maxDuration = 15;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing object key parameter' },
        { status: 400 }
      );
    }

    // Security: Validate key prefix and prevent path traversal
    if (key.includes('..') || !key.startsWith('scans/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or unauthorized S3 object key' },
        { status: 400 }
      );
    }

    const awsStatus = getAwsConfigStatus();
    if (!awsStatus.configured) {
      return NextResponse.json(
        {
          success: false,
          code: 'AWS_NOT_CONFIGURED',
          error: 'Amazon S3 is not configured.',
        },
        { status: 503 }
      );
    }

    const presignedUrl = await getPresignedUrl(key, 3600); // 1 hour validity

    if (!presignedUrl) {
      return NextResponse.json(
        { success: false, error: 'Could not generate presigned URL for this object' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      presignedUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

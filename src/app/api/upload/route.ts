import { NextResponse } from 'next/server';
import { validateImage, uploadImageToS3, getAwsConfigStatus } from '@/lib/s3';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const awsStatus = getAwsConfigStatus();

    // 1. Check if S3 credentials and bucket are configured
    if (!awsStatus.configured) {
      return NextResponse.json(
        {
          success: false,
          code: 'AWS_NOT_CONFIGURED',
          error: 'Amazon S3 is not configured.',
          message:
            'S3 integration requires AWS_S3_BUCKET, AWS_REGION, and AWS_PROFILE (or credentials) in .env.local.',
          missingVars: awsStatus.missingVars,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { image, mimeType = 'image/jpeg', scanId, originalName } = body;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_FILE_TYPE',
          error: 'No image payload received.',
          message: 'Please provide an image payload to upload.',
        },
        { status: 400 }
      );
    }

    // Extract base64 buffer
    let base64Data = image;
    let actualMimeType = mimeType;

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) actualMimeType = match[1];
      base64Data = parts[1] || '';
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Validate file size and type
    const validation = validateImage(buffer, actualMimeType);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          code: validation.code,
          error: validation.error,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // 3. Upload to private S3 bucket
    const uploadResult = await uploadImageToS3({
      buffer,
      mimeType: actualMimeType,
      scanId: scanId || `scan-${Date.now()}`,
      originalName,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: uploadResult.code || 'UPLOAD_FAILED',
          error: uploadResult.error || 'Failed to upload object to S3',
          message: uploadResult.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      s3Key: uploadResult.s3Key,
      presignedUrl: uploadResult.presignedUrl,
      bucket: uploadResult.bucket,
      region: uploadResult.region,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in S3 upload route:', err);
    return NextResponse.json(
      {
        success: false,
        code: 'UPLOAD_FAILED',
        error: errorMsg,
        message: 'An unexpected error occurred during S3 upload.',
      },
      { status: 500 }
    );
  }
}

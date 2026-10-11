/**
 * Client-Side Image Compression & Optimization Utility for EcoVision AI
 *
 * Prevents Vercel Serverless Function HTTP 413 ("Request Entity Too Large")
 * errors by scaling large multi-megapixel device camera photos down to an
 * optimal resolution (max 1600px) and quality (JPEG 0.85) prior to transmission.
 *
 * 1600px provides high classification accuracy for Google Gemini Multimodal
 * Vision while keeping raw base64 payload size under 1MB-2MB (well below
 * Vercel's 4.5MB serverless body limit).
 */

export interface CompressionOptions {
  /** Maximum width or height in pixels. Default: 1600 */
  maxDimension?: number;
  /** Initial compression quality between 0.1 and 1.0. Default: 0.85 */
  initialQuality?: number;
  /** Maximum allowable data URL character length. Default: 3.5MB (approx ~2.6MB binary) */
  maxCharacterLength?: number;
}

export interface CompressionResult {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  originalLength: number;
  compressedLength: number;
  compressed: boolean;
}

/**
 * Calculates scaled dimensions preserving aspect ratio.
 */
export function calculateTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number; scaled: boolean } {
  if (originalWidth <= 0 || originalHeight <= 0 || maxDimension <= 0) {
    return { width: originalWidth, height: originalHeight, scaled: false };
  }

  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight, scaled: false };
  }

  if (originalWidth >= originalHeight) {
    const width = maxDimension;
    const height = Math.max(1, Math.round((originalHeight * maxDimension) / originalWidth));
    return { width, height, scaled: true };
  } else {
    const height = maxDimension;
    const width = Math.max(1, Math.round((originalWidth * maxDimension) / originalHeight));
    return { width, height, scaled: true };
  }
}

/**
 * Estimates binary byte size from a base64 string or data URL.
 */
export function estimateBase64SizeBytes(base64OrDataUrl: string): number {
  if (!base64OrDataUrl) return 0;
  const commaIdx = base64OrDataUrl.indexOf(',');
  const rawBase64 = commaIdx >= 0 ? base64OrDataUrl.slice(commaIdx + 1) : base64OrDataUrl;
  const padding = (rawBase64.match(/=+$/) || [''])[0].length;
  return Math.max(0, Math.floor((rawBase64.length * 3) / 4) - padding);
}

/**
 * Compresses and scales an image Data URL using HTML Canvas in the browser.
 * Falls back safely to original Data URL in non-browser environments or on error.
 */
export async function compressImageForAnalysis(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1600,
    initialQuality = 0.85,
    maxCharacterLength = 3.5 * 1024 * 1024, // ~3.5M characters (~2.6MB binary)
  } = options;

  const originalLength = dataUrl.length;

  // Safe fallback if not running in a browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      dataUrl,
      mimeType: 'image/jpeg',
      width: 0,
      height: 0,
      originalLength,
      compressedLength: originalLength,
      compressed: false,
    };
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const naturalWidth = img.naturalWidth || img.width;
          const naturalHeight = img.naturalHeight || img.height;

          const { width, height, scaled } = calculateTargetDimensions(
            naturalWidth,
            naturalHeight,
            maxDimension
          );

          // If image is already smaller than maxDimension and under character limit, use as is
          if (!scaled && originalLength <= maxCharacterLength) {
            return resolve({
              dataUrl,
              mimeType: dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              width: naturalWidth,
              height: naturalHeight,
              originalLength,
              compressedLength: originalLength,
              compressed: false,
            });
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.warn('Canvas 2D context not available for compression');
            return resolve({
              dataUrl,
              mimeType: 'image/jpeg',
              width: naturalWidth,
              height: naturalHeight,
              originalLength,
              compressedLength: originalLength,
              compressed: false,
            });
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt compression with initialQuality
          let quality = initialQuality;
          let compressedUrl = canvas.toDataURL('image/jpeg', quality);

          // If still over character limit, progressively reduce quality
          while (compressedUrl.length > maxCharacterLength && quality > 0.45) {
            quality -= 0.15;
            compressedUrl = canvas.toDataURL('image/jpeg', Math.max(0.4, quality));
          }

          resolve({
            dataUrl: compressedUrl,
            mimeType: 'image/jpeg',
            width,
            height,
            originalLength,
            compressedLength: compressedUrl.length,
            compressed: true,
          });
        } catch (canvasErr) {
          console.warn('Canvas compression error:', canvasErr);
          resolve({
            dataUrl,
            mimeType: 'image/jpeg',
            width: 0,
            height: 0,
            originalLength,
            compressedLength: originalLength,
            compressed: false,
          });
        }
      };

      img.onerror = (imgErr) => {
        console.warn('Failed to load image for compression:', imgErr);
        resolve({
          dataUrl,
          mimeType: 'image/jpeg',
          width: 0,
          height: 0,
          originalLength,
          compressedLength: originalLength,
          compressed: false,
        });
      };

      img.src = dataUrl;
    } catch (err) {
      console.warn('Image compression initialization failed:', err);
      resolve({
        dataUrl,
        mimeType: 'image/jpeg',
        width: 0,
        height: 0,
        originalLength,
        compressedLength: originalLength,
        compressed: false,
      });
    }
  });
}

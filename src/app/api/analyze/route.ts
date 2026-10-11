import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { WasteAnalysisResult } from '@/types';

export const maxDuration = 45; // 45 seconds max duration for multimodal vision inference

// Officially supported models available to this project
const SUPPORTED_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

export interface ParsedGeminiError {
  isQuotaExceeded: boolean;
  isAuthError: boolean;
  isClientError: boolean;
  retryAfterSeconds?: number;
  retryHuman?: string;
  rawMessage: string;
}

export function parseGeminiError(err: Error | unknown): ParsedGeminiError {
  const errMsg = err instanceof Error ? err.message : String(err);
  let isQuotaExceeded = false;
  let isAuthError = false;
  let isClientError = false;
  let retryAfterSeconds: number | undefined;
  let retryHuman: string | undefined;

  // 1. Try parsing JSON error structure from Google GenAI SDK
  try {
    const jsonMatch = errMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const errorObj = parsed.error || parsed;
      const code = Number(errorObj.code || errorObj.status);
      const statusStr = String(errorObj.status || '');

      if (
        code === 429 ||
        statusStr === 'RESOURCE_EXHAUSTED' ||
        String(errorObj.message || '').includes('Quota exceeded')
      ) {
        isQuotaExceeded = true;
      }

      if (
        code === 401 ||
        code === 403 ||
        statusStr === 'PERMISSION_DENIED' ||
        statusStr === 'UNAUTHENTICATED'
      ) {
        isAuthError = true;
      }

      if (code === 400 || statusStr === 'INVALID_ARGUMENT') {
        isClientError = true;
      }

      if (Array.isArray(errorObj.details)) {
        for (const detail of errorObj.details) {
          if (detail.retryDelay) {
            const sec = parseInt(String(detail.retryDelay), 10);
            if (!isNaN(sec) && sec > 0) {
              retryAfterSeconds = sec;
            }
          }
        }
      }
    }
  } catch {
    // Non-JSON error message
  }

  // 2. String heuristics fallback
  const lowerMsg = errMsg.toLowerCase();
  if (!isQuotaExceeded) {
    if (
      lowerMsg.includes('429') ||
      lowerMsg.includes('resource_exhausted') ||
      lowerMsg.includes('exhausted') ||
      lowerMsg.includes('quota') ||
      lowerMsg.includes('rate_limit') ||
      lowerMsg.includes('rate-limit') ||
      lowerMsg.includes('free_tier_requests')
    ) {
      isQuotaExceeded = true;
    }
  }

  if (!isAuthError) {
    if (
      lowerMsg.includes('api_key_invalid') ||
      lowerMsg.includes('permission_denied') ||
      lowerMsg.includes('unauthenticated') ||
      lowerMsg.includes('403') ||
      lowerMsg.includes('401')
    ) {
      isAuthError = true;
    }
  }

  if (!isClientError && (lowerMsg.includes('invalid_argument') || lowerMsg.includes('400'))) {
    isClientError = true;
  }

  // 3. Extract human retry text
  const retryMatch = errMsg.match(/Please retry in\s+([0-9]+[hms0-9\.]+)/i);
  if (retryMatch) {
    retryHuman = retryMatch[1].replace(/\.$/, '');
  }

  // 4. Format retryHuman from retryAfterSeconds if not parsed from string
  if (retryAfterSeconds && (!retryHuman || retryHuman.length > 25)) {
    const hours = Math.floor(retryAfterSeconds / 3600);
    const mins = Math.floor((retryAfterSeconds % 3600) / 60);
    const secs = retryAfterSeconds % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 && hours === 0) parts.push(`${secs}s`);
    retryHuman = parts.join(' ') || `${retryAfterSeconds}s`;
  }

  return {
    isQuotaExceeded,
    isAuthError,
    isClientError,
    retryAfterSeconds,
    retryHuman,
    rawMessage: errMsg,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    // 1. Strictly verify server-side API Key presence
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          code: 'API_KEY_NOT_CONFIGURED',
          error: 'Gemini API key is not configured.',
          message:
            'AI analysis cannot run because GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your Vercel Project Settings or local .env.local file.',
        },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const body = await request.json();
    const { image, mimeType = 'image/jpeg' } = body;

    // 2. Validate input image
    if (!image) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_IMAGE',
          error: 'No image provided.',
          message: 'Please provide a valid image file or data URI to analyze.',
        },
        { status: 400 }
      );
    }

    // Extract raw base64 data and clean MIME type
    let base64Data = image;
    let actualMimeType = mimeType;

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) actualMimeType = match[1];
      base64Data = parts[1] || '';
    }

    if (!base64Data) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_IMAGE',
          error: 'Image data is empty.',
          message: 'Unable to extract base64 image data from payload.',
        },
        { status: 400 }
      );
    }

    // Initialize official Google GenAI SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert environmental engineer and waste sorting vision system for EcoVision AI, built for the WeMakeDevs × AWS Environmental Hacks Hackathon (Track 03: Waste and Energy).
Analyze the provided image of a waste or recyclable item.
Identify the object, inspect material composition, resin codes (e.g. PET #1, HDPE #2), contamination indicators, and classify it into one of four standard waste categories:
- "recyclable" (clean plastics, clean paper, cardboard cartons, aluminum/tin beverage and food cans, glass bottles/jars)
- "organic" (food scraps, vegetable/fruit peelings, coffee grounds, compostable packaging)
- "hazardous" (electronics, e-waste, lithium or alkaline batteries, lamps, CFL bulbs, chemicals, medical waste)
- "landfill" (soiled items, grease-soaked paper, styrofoam/polystyrene, multi-layer foil pouches, chip bags, composite plastic wrappers)

CRITICAL RULE 1 — FOOD WASTE VS EDIBLE FOOD AMBIGUITY:
When the image alone is ambiguous and displays food that appears fresh, whole, intact, or potentially edible (such as a whole apple, uneaten bakery item, unopened packaged snack, or intact sandwich):
- Do NOT prematurely treat it as discarded garbage!
- In "itemName", clarify the item state (e.g., "Whole Red Apple (Edible Food / Not Waste)").
- In "disposalSteps", list edible food preservation and donation FIRST:
  1. "Prioritize eating while fresh or refrigerating/preserving leftovers."
  2. "If wholesome, safe, and unconsumed, consider donating to a community fridge or food rescue organization."
  3. "Only place in organic/compost stream if spoiled, contaminated, or inedible scraps."
- In "notes", include a clear edibility advisory: "Edibility Advisory: Avoid wasting edible food. Prioritize human consumption, proper storage, or donation before considering composting."

CRITICAL RULE 2 — SCIENTIFIC ESTIMATE INTEGRITY:
- "carbonOffsetEstimate": Provide an approximate educational estimate benchmarked against EPA WARM and DEFRA diversion factors (e.g. "~0.32 kg CO₂e avoided"). Do NOT claim this is a certified laboratory Life Cycle Assessment (LCA).
- "confidence": Provide an integer percentage between 70 and 99 reflecting model visual classification certainty.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "itemName": "string (clear specific name, e.g. PET Plastic Water Bottle)",
  "category": "recyclable" | "organic" | "hazardous" | "landfill",
  "categoryLabel": "string (e.g. Recyclable Plastics (PET #1))",
  "confidence": number (integer between 70 and 99),
  "material": "string (e.g. Polyethylene Terephthalate (PET))",
  "recyclability": "High" | "Medium" | "Low" | "Non-recyclable",
  "carbonOffsetEstimate": "string (e.g. ~0.32 kg CO₂e avoided)",
  "disposalSteps": ["step 1", "step 2", "step 3"],
  "preparationTips": ["tip 1 to avoid contamination", "tip 2"],
  "upcyclingIdeas": ["creative circular reuse idea 1", "idea 2"],
  "notes": "string (brief practical eco advice, edibility advisory if food, or municipal sorting note)"
}`;

    // Attempt generation across officially supported models
    let candidateText: string | null = null;
    let modelUsed = '';
    let lastError: Error | null = null;
    let nonRecoverableError: ParsedGeminiError | null = null;

    for (const model of SUPPORTED_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: actualMimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        if (response.text) {
          candidateText = response.text;
          modelUsed = model;
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const parsed = parseGeminiError(lastError);
        console.warn(
          `Model ${model} execution error:`,
          parsed.isQuotaExceeded ? 'Quota Exceeded (HTTP 429)' : lastError.message
        );

        // Immediately STOP fallback attempts on quota exhaustion, auth failure, or invalid input
        if (parsed.isQuotaExceeded || parsed.isAuthError || parsed.isClientError) {
          nonRecoverableError = parsed;
          break;
        }
      }
    }

    if (!candidateText) {
      const errorDetails = nonRecoverableError || (lastError ? parseGeminiError(lastError) : null);

      // Return HTTP 429 if quota is exhausted
      if (errorDetails?.isQuotaExceeded) {
        const retrySec = errorDetails.retryAfterSeconds || 60;
        const retryGuidance = errorDetails.retryHuman
          ? `Expected reset in ~${errorDetails.retryHuman}.`
          : 'Please wait before retrying.';

        return NextResponse.json(
          {
            success: false,
            code: 'QUOTA_EXCEEDED',
            error: 'Google Gemini daily request quota reached.',
            message: `Gemini API free-tier daily usage limit (20 requests/day) has been reached for this project. ${retryGuidance} You can continue testing by selecting a preset sample waste item.`,
            retryAfter: retrySec,
            retryHuman: errorDetails.retryHuman,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retrySec),
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      }

      // Return HTTP 401 if authentication failed
      if (errorDetails?.isAuthError) {
        return NextResponse.json(
          {
            success: false,
            code: 'AUTH_ERROR',
            error: 'Gemini API authentication failed.',
            message:
              'The configured GEMINI_API_KEY is invalid or lacks necessary permissions. Please check the key in Vercel Project Settings.',
          },
          {
            status: 401,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      // Otherwise return HTTP 502 for actual model service failure
      return NextResponse.json(
        {
          success: false,
          code: 'ANALYSIS_FAILED',
          error: lastError?.message || 'Gemini models were unavailable.',
          message:
            'Google Gemini Multimodal Vision API was unable to classify this image. Please try again with a clearer image.',
        },
        {
          status: 502,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // Clean JSON text if wrapped in markdown
    let cleanJson = candidateText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    // Form final strongly-typed result with explicit live_ai indicators
    const result: WasteAnalysisResult = {
      id: `ai-scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      itemName: parsed.itemName || 'Identified Waste Item',
      category: ['recyclable', 'organic', 'hazardous', 'landfill'].includes(parsed.category)
        ? parsed.category
        : 'landfill',
      categoryLabel: parsed.categoryLabel || 'General Waste',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 88,
      material: parsed.material || 'Mixed Materials',
      recyclability: parsed.recyclability || 'Medium',
      carbonOffsetEstimate: parsed.carbonOffsetEstimate || '0.25 kg CO₂ saved',
      disposalSteps: Array.isArray(parsed.disposalSteps) && parsed.disposalSteps.length > 0
        ? parsed.disposalSteps
        : ['Check local municipal disposal guidelines.'],
      preparationTips: Array.isArray(parsed.preparationTips) && parsed.preparationTips.length > 0
        ? parsed.preparationTips
        : ['Ensure item is clean and dry before disposal.'],
      upcyclingIdeas: Array.isArray(parsed.upcyclingIdeas) && parsed.upcyclingIdeas.length > 0
        ? parsed.upcyclingIdeas
        : ['Consider repurposing for storage or gardening.'],
      imageUrl: image.startsWith('data:') ? image : undefined,
      notes: parsed.notes,
      scanType: 'live_ai',
      isRealAiScan: true,
      sourceModel: modelUsed,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error during waste analysis route:', error);
    return NextResponse.json(
      {
        success: false,
        code: 'SERVER_ERROR',
        error: errorMsg,
        message: 'An unexpected error occurred while communicating with Gemini Vision.',
      },
      { status: 500 }
    );
  }
}

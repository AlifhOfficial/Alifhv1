/**
 * API: Listing Image Upload with WebP Conversion (Thumb + Full)
 * POST /api/storage/upload-listing-image
 * 
 * Purpose: Upload listing images with automatic WebP conversion and dual-size output
 * Authentication: Required (user must be logged in)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC, HEIF, GIF)
 * - vin: Vehicle VIN (required for organizing images)
 * 
 * Processing:
 * - Validates file size (max 20MB) and megapixels (max 40MP)
 * - Auto-detects HEIC/HEIF by magic bytes (handles mobile mislabeling)
 * - Converts HEIC/HEIF to JPEG first using heic-convert
 * - Generates TWO WebP outputs:
 *   - thumb: 480w max, quality 75. ~30-90KB (for grid cards)
 *   - full: 1600w max, quality 82, ~120-350KB (for detail page)
 * - Light sharpening for crisp output
 * - Strips metadata for privacy/size
 * 
 * Returns: { thumbKey, thumbUrl, fullKey, fullUrl, thumbSize, fullSize }
 * 
 * Standards:
 * - Returns 400 for invalid file
 * - Returns 401 for unauthenticated
 * - Returns 413 for file too large
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { 
  processListingImages, 
  ImageValidationError,
  MAX_FILE_SIZE_BYTES,
  formatFileSize 
} from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for large HEIC image processing


/**
 * Generate organized storage keys for listing images (thumb + full pair)
 * Format: listings/{year}/{month}/{day}/{userId}/{vin}/{uniqueId}_{variant}.webp
 * 
 * IMPORTANT: Both thumb and full share the SAME uniqueId so that
 * getThumbUrl() can derive the thumb key by replacing _full → _thumb.
 * 
 * Benefits:
 * - Time-based organization for easy browsing
 * - User grouping for accountability
 * - VIN grouping keeps all vehicle images together
 * - Easy cleanup by prefix
 */
function generateListingImageKeys(userId: string, vin: string): { thumbKey: string; fullKey: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const uniqueId = createId();
  
  // Use first 8 chars of userId for shorter paths
  const userPrefix = userId.slice(0, 8);
  const prefix = `listings/${year}/${month}/${day}/${userPrefix}/${vin}/${uniqueId}`;
  
  return {
    thumbKey: `${prefix}_thumb.webp`,
    fullKey: `${prefix}_full.webp`,
  };
}

export async function POST(req: NextRequest) {

  try {
    // Authentication required
    const user = await getSessionUser();
    console.log("[upload-listing-image] User:", user?.id ?? "null");
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const vin = formData.get("vin") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }

    // VIN is required for organizing images
    if (!vin || vin.length < 11) {
      return NextResponse.json({ error: "Valid VIN is required" }, { status: 400 });
    }

    // Quick size check before reading buffer (slightly larger to account for formdata overhead)
    if (file.size > MAX_FILE_SIZE_BYTES * 1.1) {
      return NextResponse.json({ 
        error: `File too large. Maximum ${formatFileSize(MAX_FILE_SIZE_BYTES)} allowed` 
      }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process image: validate, HEIC conversion, generate thumb + full
    const startTime = Date.now();
    const { thumb, full, originalFormat } = await processListingImages(buffer);
    const processingTime = Date.now() - startTime;
    
    // Generate organized storage keys using VIN and user
    // Both share the same uniqueId so getThumbUrl() can derive thumb from full
    const { thumbKey, fullKey } = generateListingImageKeys(user.id, vin);
    
    console.log("[upload-listing-image] Processing complete:", {
      originalFormat,
      originalSize: formatFileSize(buffer.length),
      thumbSize: formatFileSize(thumb.buffer.length),
      fullSize: formatFileSize(full.buffer.length),
      thumbDimensions: `${thumb.width}x${thumb.height}`,
      fullDimensions: `${full.width}x${full.height}`,
      processingTimeMs: processingTime,
      vin,
    });

    // Upload both versions to R2 in parallel
    const [thumbResult, fullResult] = await Promise.all([
      uploadFile({
        data: thumb.buffer,
        contentType: "image/webp",
        key: thumbKey,
        cacheControl: "public, max-age=31536000, immutable", // 1 year cache
      }),
      uploadFile({
        data: full.buffer,
        contentType: "image/webp",
        key: fullKey,
        cacheControl: "public, max-age=31536000, immutable", // 1 year cache
      }),
    ]);

    return NextResponse.json({
      // Thumb (for grids/cards)
      thumbKey: thumbResult.key,
      thumbUrl: thumbResult.url,
      thumbSize: thumb.buffer.length,
      thumbWidth: thumb.width,
      thumbHeight: thumb.height,
      // Full (for detail page)
      fullKey: fullResult.key,
      fullUrl: fullResult.url,
      fullSize: full.buffer.length,
      fullWidth: full.width,
      fullHeight: full.height,
      // Legacy compatibility (point to full for existing code)
      key: fullResult.key,
      url: fullResult.url,
      size: full.buffer.length,
    });
  } catch (error: any) {
    // Handle validation errors with appropriate status codes
    if (error instanceof ImageValidationError) {
      const status = error.code === 'FILE_TOO_LARGE' ? 413 
        : error.code === 'TOO_MANY_PIXELS' ? 413 
        : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    
    // Log detailed error for debugging
    console.error("[upload-listing-image] POST failed:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more specific error messages
    const errorMessage = error.message || "Upload failed";
    if (errorMessage.includes('HEIC') || errorMessage.includes('heic')) {
      return NextResponse.json({ error: "Failed to process HEIC image. Please try a different format." }, { status: 500 });
    }
    if (errorMessage.includes('R2') || errorMessage.includes('storage') || errorMessage.includes('S3')) {
      return NextResponse.json({ error: "Storage service temporarily unavailable. Please try again." }, { status: 503 });
    }
    if (errorMessage.includes('sharp') || errorMessage.includes('image')) {
      return NextResponse.json({ error: "Failed to process image. Please try a different image." }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

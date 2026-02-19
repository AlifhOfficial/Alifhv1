/**
 * API: Listing Image Upload with WebP Conversion
 * POST /api/storage/upload-listing-image
 * 
 * Purpose: Upload listing images with automatic WebP conversion and optimization
 * Authentication: Required (user must be logged in)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC, HEIF)
 * - vin: Vehicle VIN (required for organizing images)
 * 
 * Processing:
 * - Auto-detects HEIC/HEIF by magic bytes (handles mobile mislabeling)
 * - Converts HEIC/HEIF to JPEG first using heic-convert
 * - Converts final output to WebP format using Sharp
 * - Resizes to max 2048x2048 (preserving aspect ratio)
 * - Compresses with quality 82 (optimal balance of quality/size/speed)
 * 
 * Returns: { key, url, etag, size }
 * 
 * Standards:
 * - Returns 400 for invalid file
 * - Returns 401 for unauthenticated
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { detectImageFormat, isValidImageFormat, processImage } from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for large HEIC image processing

const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image

const listingImageLimiter = createRateLimiter(RATE_LIMITS_STORAGE.UPLOAD_GENERAL);

/**
 * Generate organized storage key for listing images
 * Format: listings/{year}/{month}/{day}/{userId}/{vin}/{uniqueId}.webp
 * 
 * Benefits:
 * - Time-based organization for easy browsing
 * - User grouping for accountability
 * - VIN grouping keeps all vehicle images together
 * - Easy cleanup by prefix
 */
function generateListingImageKey(userId: string, vin: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const uniqueId = createId();
  
  // Use first 8 chars of userId for shorter paths
  const userPrefix = userId.slice(0, 8);
  
  return `listings/${year}/${month}/${day}/${userPrefix}/${vin}/${uniqueId}.webp`;
}

export async function POST(req: NextRequest) {
  // Rate limiting: standard upload limits
  const identifier = getIdentifier(req);
  const rateLimitResult = await listingImageLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

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

    // Validate file size first (before reading buffer)
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum 10MB allowed" 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detect actual format from magic bytes (mobile often mislabels HEIC as JPEG)
    const detectedFormat = detectImageFormat(buffer);
    console.log("[upload-listing-image] Detected format:", detectedFormat, "MIME:", file.type);
    
    if (!isValidImageFormat(detectedFormat)) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" 
      }, { status: 400 });
    }
    
    // Process image: HEIC conversion + resize + WebP output (optimized for speed)
    const startTime = Date.now();
    const { buffer: processedBuffer, originalFormat } = await processImage(buffer, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 82,      // Slightly lower = faster encoding
      effort: 2,        // Low effort = faster encoding
    });
    const processingTime = Date.now() - startTime;
    
    // Generate organized storage key using VIN and user
    const key = generateListingImageKey(user.id, vin);
    
    console.log("[upload-listing-image] Processing complete:", {
      originalFormat,
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: ((1 - processedBuffer.length / buffer.length) * 100).toFixed(1) + '%',
      processingTimeMs: processingTime,
      vin,
      key,
    });

    // Upload to R2 with public cache headers
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key,
      cacheControl: "public, max-age=31536000, immutable", // 1 year cache (immutable)
    });

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      size: processedBuffer.length,
    });
  } catch (error: any) {
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

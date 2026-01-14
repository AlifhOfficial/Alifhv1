/**
 * API: Listing Image Upload with WebP Conversion
 * POST /api/storage/upload-listing-image
 * 
 * Purpose: Upload listing images with automatic WebP conversion and optimization
 * Authentication: Required (user must be logged in)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC)
 * - listingId: Optional listing ID (for updating existing listing)
 * 
 * Processing:
 * - Converts to WebP format using Sharp
 * - Resizes to max 2048x2048 (preserving aspect ratio)
 * - Compresses with quality 85 (optimal balance of quality/size)
 * - Organized storage: listings/{year}/{month}/{day}/{id}.webp
 * 
 * Returns: { key, url, etag, size }
 * 
 * Standards:
 * - Returns 400 for invalid file
 * - Returns 401 for unauthenticated
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadFile } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs"; // Sharp requires Node.js runtime

// Supported input formats (HEIC/HEIF require libvips with heif support)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image

// Output configuration - optimized for listing photos
const OUTPUT_CONFIG = {
  maxWidth: 2048,      // Max dimension (good for full-screen viewing)
  maxHeight: 2048,     // Max dimension
  quality: 85,         // WebP quality (85 is optimal for photos)
  effort: 4,           // Compression effort (0-6, 4 is balanced)
} as const;

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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum 10MB allowed" 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp
    // - Resize to max dimensions (preserving aspect ratio)
    // - Convert to WebP format
    // - Apply quality compression
    const processedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(OUTPUT_CONFIG.maxWidth, OUTPUT_CONFIG.maxHeight, {
        fit: "inside",           // Preserve aspect ratio, fit within bounds
        withoutEnlargement: true, // Don't upscale smaller images
      })
      .webp({ 
        quality: OUTPUT_CONFIG.quality,
        effort: OUTPUT_CONFIG.effort,
      })
      .toBuffer();

    // Generate organized storage key using VIN and user
    const key = generateListingImageKey(user.id, vin);
    
    console.log("[upload-listing-image] Processing complete:", {
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: ((1 - processedBuffer.length / buffer.length) * 100).toFixed(1) + '%',
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
  } catch (error) {
    console.error("[upload-listing-image] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

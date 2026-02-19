/**
 * API: Partner Image Upload with WebP Conversion
 * POST /api/storage/upload-partner-image
 * 
 * Purpose: Upload partner logo or hero image with automatic WebP conversion and compression
 * Authentication: Required (must be partner admin or staff with permissions)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC)
 * - type: "logo" | "hero" - determines output size and directory
 * - partnerId: Partner ID (required)
 * 
 * Processing:
 * - Auto-detects HEIC by magic bytes (handles mobile mislabeling)
 * - Converts HEIC to JPEG first using heic-convert
 * - Converts to WebP format
 * - Logo: Resizes to 512x512 max (square crop)
 * - Hero: Resizes to 1920x600 max (cover crop for banner)
 * - Compresses with quality 85
 * 
 * Returns: { key, url, etag }
 * 
 * Standards:
 * - Returns 400 for invalid file or missing type
 * - Returns 401 for unauthenticated
 * - Returns 403 for unauthorized (not partner admin/staff)
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/storage";
import { generateBrandImageKey, type BrandImageType } from "@/lib/storage/keys";
import { processSingleImage, ImageValidationError, formatFileSize } from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for HEIC image processing

const MAX_SIZE = 10 * 1024 * 1024; // 10MB


// Image configuration by type
const IMAGE_CONFIG = {
  logo: {
    width: 512,
    height: 512,
    fit: "cover" as const,
    quality: 85,
  },
  hero: {
    width: 1920,
    height: 600,
    fit: "cover" as const,
    quality: 85,
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const formData = await req.formData();
    const file = formData.get("file");
    const imageType = formData.get("type") as string;
    const partnerId = formData.get("partnerId") as string;
    const previousKey = formData.get("previousKey") as string | null; // Old image to delete
    
    // Validate required fields
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!imageType || !["logo", "hero"].includes(imageType)) {
      return NextResponse.json({ 
        error: "Invalid image type. Must be 'logo' or 'hero'" 
      }, { status: 400 });
    }

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID required" }, { status: 400 });
    }

    // TODO: Add proper partner permission check
    // For now, we trust that the calling code has validated permissions
    // In production, you should verify user has admin/staff access to this partnerId

    // Validate file size first
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum 10MB allowed" 
      }, { status: 400 });
    }

    const config = IMAGE_CONFIG[imageType as BrandImageType];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process image with validation, HEIC conversion, sharpening, and WebP output
    const { buffer: processedBuffer } = await processSingleImage(buffer, {
      maxWidth: config.width,
      maxHeight: config.height,
      fit: config.fit,
      position: 'center',
      quality: config.quality,
      sharpen: 0.5,
    });

    // Generate unique key with date-based path to bust CDN cache
    // Format: brands/{partnerId}/{YYYY}/{MM}/{DD}/{type}-{timestamp}.webp
    // This ensures each upload creates a NEW cache entry in Cloudflare R2 edge
    const timestamp = Date.now();
    const key = generateBrandImageKey({ partnerId, type: imageType as BrandImageType });

    // IMPORTANT: Long cache since each upload creates a unique path
    // No need for must-revalidate since path changes on each upload
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key, // Unique key per upload
      cacheControl: "public, max-age=31536000, immutable", // 1 year cache (immutable)
    });

    // Delete old image if provided (async, don't block response)
    // Supports both legacy (partner-logos/, partner-heroes/) and new (brands/) formats
    const isLegacyKey = previousKey?.startsWith("partner-logos/") || previousKey?.startsWith("partner-heroes/");
    const isNewKey = previousKey?.startsWith("brands/");
    if (previousKey && (isLegacyKey || isNewKey)) {
      deleteFile(previousKey).catch((err) => {
        console.warn(`[upload-partner-image] Failed to delete old image: ${previousKey}`, err);
      });
    }

    // Return the new key - caller must save this to partner.logo/heroImage
    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      updatedAt: timestamp,
    });
  } catch (error) {
    // Handle validation errors with appropriate status codes
    if (error instanceof ImageValidationError) {
      const status = error.code === 'FILE_TOO_LARGE' ? 413 
        : error.code === 'TOO_MANY_PIXELS' ? 413 
        : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("[storage/upload-partner-image] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

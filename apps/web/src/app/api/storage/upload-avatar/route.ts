/**
 * API: Avatar Upload with WebP Conversion
 * POST /api/storage/upload-avatar
 * 
 * Purpose: Upload user avatar with automatic WebP conversion and compression
 * Authentication: Required (user must be logged in)
 * 
 * Request Body (multipart/form-data):
 * - file: Image file (JPEG, PNG, WebP, HEIC)
 * 
 * Processing:
 * - Auto-detects HEIC by magic bytes (handles mobile mislabeling)
 * - Converts HEIC to JPEG first using heic-convert
 * - Converts to WebP format
 * - Resizes to 512x512 (square crop)
 * - Compresses with quality 80
 * 
 * Returns: { key, url, etag }
 * 
 * Standards:
 * - Returns 400 for invalid file
 * - Returns 401 for unauthenticated
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/storage";
import { generateUserAvatarKey } from "@/lib/storage/keys";
import { detectImageFormat, isValidImageFormat, processImage } from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for HEIC image processing

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const avatarUploadLimiter = createRateLimiter(RATE_LIMITS_STORAGE.UPLOAD_AVATAR);

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 avatar uploads per hour
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await avatarUploadLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const previousKey = formData.get("previousKey") as string | null;
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size first
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum 5MB allowed" 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detect actual format from magic bytes (mobile often mislabels HEIC as JPEG)
    const detectedFormat = detectImageFormat(buffer);
    if (!isValidImageFormat(detectedFormat)) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" 
      }, { status: 400 });
    }

    // Process image with HEIC conversion and WebP output
    const { buffer: processedBuffer } = await processImage(buffer, {
      maxWidth: 512,
      maxHeight: 512,
      fit: 'cover',
      position: 'center',
      quality: 80,
    });

    // Generate unique key with date-based path
    const key = generateUserAvatarKey({ userId: user.id });

    // Upload to public R2 bucket
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key,
      cacheControl: "public, max-age=31536000, immutable",
    });

    // Delete old avatar in background (don't await)
    if (previousKey && (previousKey.startsWith("avatars/") || previousKey.startsWith("users/"))) {
      deleteFile(previousKey).catch(() => {});
    }

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("[upload-avatar] Failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

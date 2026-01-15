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
 * - Converts to WebP format
 * - Resizes to 512x512 max (preserving aspect ratio)
 * - Compresses with quality 80
 * - Uses user ID as filename for easy cleanup
 * 
 * Returns: { key, url, etag }
 * 
 * Standards:
 * - Returns 400 for invalid file
 * - Returns 401 for unauthenticated
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadFile, deleteFile } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";

export const runtime = "nodejs"; // Sharp requires Node.js runtime

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const OUTPUT_SIZE = 512; // Max dimension
const OUTPUT_QUALITY = 80; // WebP quality

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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum 5MB allowed" 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp - optimized pipeline
    const processedBuffer = await sharp(buffer, { failOnError: false })
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "cover",
        position: "center",
        fastShrinkOnLoad: true, // Fast shrink for large images
      })
      .webp({ quality: OUTPUT_QUALITY, effort: 2 }) // effort 2 = faster encoding
      .toBuffer();

    // Generate unique key with timestamp
    const timestamp = Date.now();
    const key = `avatars/${user.id}-${timestamp}.webp`;

    // Upload to public R2 bucket
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key,
      cacheControl: "public, max-age=31536000, immutable",
    });

    // Delete old avatar in background (don't await)
    if (previousKey && previousKey.startsWith("avatars/")) {
      deleteFile(previousKey).catch(() => {});
    }

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      updatedAt: timestamp,
    });
  } catch (error) {
    console.error("[upload-avatar] Failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

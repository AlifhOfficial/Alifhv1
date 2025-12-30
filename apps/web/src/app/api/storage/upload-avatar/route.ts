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
import { uploadFile } from "@/lib/storage";
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
    console.log("[upload-avatar] User:", user?.id);
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
    console.log("[upload-avatar] File received:", file instanceof File ? `${file.name} (${file.size} bytes)` : "none");
    
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

    // Process image with Sharp
    // - Resize to max 512x512 (preserving aspect ratio)
    // - Convert to WebP
    // - Compress with quality 80
    const processedBuffer = await sharp(buffer)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "cover", // Crop to square for avatars
        position: "center",
      })
      .webp({ quality: OUTPUT_QUALITY })
      .toBuffer();

    // Use full key with user ID - ensures only one avatar per user
    // Using 'key' bypasses the unique ID generation in buildKey
    // This enables true overwriting when user uploads a new avatar
    const key = `avatars/${user.id}.webp`;
    console.log("[upload-avatar] Uploading to key:", key, "Size:", processedBuffer.length);

    // IMPORTANT: Short cache with must-revalidate ensures browsers check for updates
    // Combined with ?v=timestamp cache busting on the URL, this guarantees fresh images
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key, // Use key directly to bypass unique ID generation
      cacheControl: "public, max-age=300, must-revalidate", // 5 min cache with revalidation
    });
    
    console.log("[upload-avatar] Upload result:", result);

    // Include timestamp for cache busting - clients should use this in avatarUrl
    const now = Date.now();
    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      updatedAt: now, // For cache busting query param
    });
  } catch (error) {
    console.error("[storage/upload-avatar] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

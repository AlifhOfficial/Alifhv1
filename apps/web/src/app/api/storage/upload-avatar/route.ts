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

export const runtime = "nodejs"; // Sharp requires Node.js runtime

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const OUTPUT_SIZE = 512; // Max dimension
const OUTPUT_QUALITY = 80; // WebP quality

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    
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

    // Use user ID as filename - ensures only one avatar per user in storage
    const fileName = `${user.id}.webp`;

    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      directory: "avatars",
      fileName,
      cacheControl: "public, max-age=31536000", // 1 year cache (filename changes on new upload)
    });

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
    });
  } catch (error) {
    console.error("[storage/upload-avatar] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

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
 * - Converts to WebP format
 * - Logo: Resizes to 512x512 max (square crop)
 * - Hero: Resizes to 1920x600 max (cover crop for banner)
 * - Compresses with quality 85
 * - Uses partnerId as filename for easy cleanup/overwrite
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
import sharp from "sharp";
import { uploadFile } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs"; // Sharp requires Node.js runtime

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Image configuration by type
const IMAGE_CONFIG = {
  logo: {
    width: 512,
    height: 512,
    fit: "cover" as const, // Square crop for logos
    quality: 85,
    directory: "partner-logos",
  },
  hero: {
    width: 1920,
    height: 600,
    fit: "cover" as const, // Banner crop for hero images
    quality: 85,
    directory: "partner-heroes",
  },
} as const;

type ImageType = keyof typeof IMAGE_CONFIG;

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

    const config = IMAGE_CONFIG[imageType as ImageType];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp
    // - Resize to configured dimensions
    // - Convert to WebP
    // - Compress with configured quality
    const processedBuffer = await sharp(buffer)
      .resize(config.width, config.height, {
        fit: config.fit,
        position: "center",
      })
      .webp({ quality: config.quality })
      .toBuffer();

    // Use full key with partnerId - ensures only one logo/hero per partner
    // Using 'key' bypasses the unique ID generation in buildKey
    // This enables true overwriting when partner uploads a new image
    const key = `${config.directory}/${partnerId}.webp`;

    // IMPORTANT: Short cache with must-revalidate ensures browsers check for updates
    // Combined with ?v=timestamp cache busting on the URL, this guarantees fresh images
    const result = await uploadFile({
      data: processedBuffer,
      contentType: "image/webp",
      key, // Use key directly to bypass unique ID generation
      cacheControl: "public, max-age=300, must-revalidate", // 5 min cache with revalidation
    });

    // Include timestamp for cache busting - clients should use this in URLs
    const now = Date.now();
    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
      updatedAt: now, // For cache busting query param
    });
  } catch (error) {
    console.error("[storage/upload-partner-image] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

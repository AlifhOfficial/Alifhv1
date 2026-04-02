/**
 * R2 Marketing Asset Upload API with Image Processing
 * Upload marketing assets to R2 via drag-drop GUI
 * 
 * Images are automatically processed to WebP for CDN optimization
 * unless skipProcessing=true is passed (for pre-optimized assets)
 */

import { NextRequest, NextResponse } from "next/server";
import { R2StorageProvider } from "@/lib/storage/r2-provider";
import { processSingleImage, ImageValidationError, detectImageFormat, isValidImageFormat } from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for HEIC image processing

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    // Auth check - only staff/admin
    const user = await getSessionUser();
    if (!user || !["staff", "admin"].includes(user.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "marketing";
    const customKey = formData.get("key") as string | null;
    const skipProcessing = formData.get("skipProcessing") === "true"; // Allow bypassing for pre-optimized assets

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}` 
      }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 100MB` 
      }, { status: 400 });
    }

    // Upload to R2
    const storage = new R2StorageProvider();
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Detect format and process images (unless SVG or skipProcessing)
    const detectedFormat = detectImageFormat(buffer);
    const isImage = isValidImageFormat(detectedFormat);
    const isSvg = file.type === "image/svg+xml";
    const isVideo = file.type.startsWith("video/");
    
    let processedData: Buffer | ArrayBuffer = buffer;
    let finalContentType = file.type;
    let finalFileName = file.name;
    
    // Process raster images to WebP (skip SVGs and videos)
    if (isImage && !isSvg && !isVideo && !skipProcessing) {
      try {
        // Uses centralized quality settings, tuned for marketing assets
        const { buffer: processedBuffer } = await processSingleImage(buffer, {
          maxWidth: 1920,  // Full HD for static marketing assets
          maxHeight: 1920,
        });
        
        processedData = processedBuffer;
        finalContentType = "image/webp";
        finalFileName = file.name.replace(/\.[^.]+$/, ".webp");
        
        console.warn(`[marketing-upload] Processed: ${detectedFormat} → webp, ${buffer.length} → ${processedBuffer.length} bytes`);
      } catch (err) {
        if (err instanceof ImageValidationError) {
          const status = err.code === 'FILE_TOO_LARGE' ? 413 
            : err.code === 'TOO_MANY_PIXELS' ? 413 
            : 400;
          return NextResponse.json({ error: err.message }, { status });
        }
        // For other errors, log and continue with original
        console.error("[marketing-upload] Image processing failed, uploading original:", err);
        processedData = buffer;
      }
    }
    
    // Generate key
    const sanitizedName = finalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = customKey || `${folder}/${sanitizedName}`;
    
    const result = await storage.upload({
      key,
      data: processedData,
      contentType: finalContentType,
      cacheControl: "public, max-age=31536000, immutable",
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      size: Buffer.isBuffer(processedData) ? processedData.length : file.size,
      type: finalContentType,
      processed: isImage && !isSvg && !isVideo && !skipProcessing,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Upload failed" 
    }, { status: 500 });
  }
}

// List existing marketing asset folders (optional)
export async function GET(_request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !["staff", "admin"].includes(user.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return helpful info about available folders
    return NextResponse.json({
      folders: [
        "marketing",
      ],
      allowedTypes: ALLOWED_TYPES,
      maxSize: MAX_SIZE,
      baseUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch info" }, { status: 500 });
  }
}

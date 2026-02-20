/**
 * API: Storage File Upload with Image Processing
 * POST /api/storage/upload
 * 
 * Purpose: Upload files to storage provider with automatic image optimization
 * Authentication: Required - only authenticated users can upload
 * 
 * Request Body (multipart/form-data):
 * - file: File blob (required)
 * - directory: Target directory (optional)
 * - fileName: Custom filename (optional)
 * - contentType: MIME type (optional)
 * - cacheControl: Cache header value (optional)
 * 
 * Processing:
 * - Images: Auto-detects HEIC, converts to WebP, resizes to 1600x1600 max
 * - Non-images: Uploaded as-is
 * 
 * Returns: { key, url, etag }
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 400 for invalid file payload
 * - Returns 413 for files too large
 * - Returns 500 for server errors
 * 
 * NOTE: For listing images, use /api/storage/upload-listing-image instead
 * for dual-output (thumb + full) and better organization.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { uploadFile } from "@/lib/storage";
import { processSingleImage, ImageValidationError, isValidImageFormat, detectImageFormat } from "@/lib/storage/image-processing";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for HEIC image processing

const FileUploadSchema = z.object({
  directory: z.string().optional(),
  fileName: z.string().optional(),
  contentType: z.string().optional(),
  cacheControl: z.string().optional(),
});


export async function POST(req: NextRequest) {
  // Authentication required - prevent anonymous uploads
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const identifier = user.id;
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }

    // Extract and validate metadata fields
    const directoryValue = formData.get("directory");
    const fileNameValue = formData.get("fileName");
    const contentTypeValue = formData.get("contentType");
    const cacheControlValue = formData.get("cacheControl");

    const metadataValidation = FileUploadSchema.safeParse({
      directory: directoryValue && typeof directoryValue === "string" ? directoryValue : undefined,
      fileName: fileNameValue && typeof fileNameValue === "string" ? fileNameValue : undefined,
      contentType: contentTypeValue && typeof contentTypeValue === "string" ? contentTypeValue : undefined,
      cacheControl: cacheControlValue && typeof cacheControlValue === "string" ? cacheControlValue : undefined,
    });

    if (!metadataValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid upload metadata',
          details: metadataValidation.error.format()
        },
        { status: 400 }
      );
    }

    const { directory, fileName: validatedFileName, contentType: validatedContentType, cacheControl } = metadataValidation.data;
    let fileName = validatedFileName ?? file.name;
    let contentType = validatedContentType || file.type || "application/octet-stream";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Detect if this is an image and process it
    const detectedFormat = detectImageFormat(buffer);
    let processedData: Buffer | ArrayBuffer = buffer;
    
    if (isValidImageFormat(detectedFormat)) {
      try {
        // Process image: validate, HEIC conversion, resize, WebP output
        const { buffer: processedBuffer } = await processSingleImage(buffer, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 82,
          sharpen: 0.5,
        });
        
        processedData = processedBuffer;
        contentType = "image/webp";
        // Update extension to .webp
        fileName = typeof fileName === "string" 
          ? fileName.replace(/\.[^.]+$/, ".webp") 
          : "image.webp";
          
        console.log(`[storage/upload] Processed image: ${detectedFormat} → webp, ${buffer.length} → ${processedBuffer.length} bytes`);
      } catch (err) {
        // If processing fails, let validation error bubble up
        if (err instanceof ImageValidationError) {
          const status = err.code === 'FILE_TOO_LARGE' ? 413 
            : err.code === 'TOO_MANY_PIXELS' ? 413 
            : 400;
          return NextResponse.json({ error: err.message }, { status });
        }
        // For other errors, log and continue with original
        console.error("[storage/upload] Image processing failed, uploading original:", err);
        processedData = arrayBuffer;
      }
    }

    const result = await uploadFile({
      data: processedData,
      contentType: typeof contentType === "string" ? contentType : "application/octet-stream",
      directory: typeof directory === "string" ? directory : undefined,
      fileName: typeof fileName === "string" ? fileName : undefined,
      cacheControl: typeof cacheControl === "string" ? cacheControl : "public, max-age=31536000, immutable",
    });

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
    });
  } catch (error) {
    console.error("[storage/upload] POST failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

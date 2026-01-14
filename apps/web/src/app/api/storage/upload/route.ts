/**
 * API: Storage File Upload
 * POST /api/storage/upload
 * 
 * Purpose: Upload files to storage provider
 * Authentication: Required - only authenticated users can upload
 * 
 * Request Body (multipart/form-data):
 * - file: File blob (required)
 * - directory: Target directory (optional)
 * - fileName: Custom filename (optional)
 * - contentType: MIME type (optional)
 * - cacheControl: Cache header value (optional)
 * 
 * Returns: { key, url, etag }
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 400 for invalid file payload
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { uploadFile } from "@/lib/storage";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";

const FileUploadSchema = z.object({
  directory: z.string().optional(),
  fileName: z.string().optional(),
  contentType: z.string().optional(),
  cacheControl: z.string().optional(),
});

const uploadLimiter = createRateLimiter(RATE_LIMITS_STORAGE.UPLOAD_GENERAL);

export async function POST(req: NextRequest) {
  // Authentication required - prevent anonymous uploads
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Rate limiting: 50 uploads per hour per user
  const identifier = user.id;
  const rateLimitResult = await uploadLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }
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
    const fileName = validatedFileName ?? file.name;
    const contentType = validatedContentType || file.type || "application/octet-stream";

    const arrayBuffer = await file.arrayBuffer();

    const result = await uploadFile({
      data: arrayBuffer,
      contentType: typeof contentType === "string" ? contentType : "application/octet-stream",
      directory: typeof directory === "string" ? directory : undefined,
      fileName: typeof fileName === "string" ? fileName : undefined,
      cacheControl: typeof cacheControl === "string" ? cacheControl : undefined,
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

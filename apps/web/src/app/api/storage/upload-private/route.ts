/**
 * API: Private Storage File Upload with Image Optimization
 * POST /api/storage/upload-private
 * 
 * Purpose: Upload sensitive files to private storage bucket with automatic optimization
 * Authentication: Required (session-based)
 * 
 * Request Body (multipart/form-data):
 * - file: File blob (required)
 * - directory: Target directory (optional)
 * - fileName: Custom filename (optional)
 * - contentType: MIME type (optional)
 * 
 * Processing:
 * - Images: Converts to WebP, compresses with quality 85, max 2048px
 * - PDFs: Kept as-is (no compression)
 * 
 * Returns: { key }
 * 
 * Note: Private files do not return public URLs
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import sharp from "sharp";
import { uploadPrivateFile } from "@/lib/storage";
import { auth } from "@/lib/auth";

export const runtime = "nodejs"; // Sharp requires Node.js runtime

const FileUploadSchema = z.object({
  directory: z.string().optional(),
  fileName: z.string().optional(),
  contentType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }

    // Extract and validate metadata fields
    const directoryValue = formData.get("directory");
    const fileNameValue = formData.get("fileName");
    const contentTypeValue = formData.get("contentType");

    const metadataValidation = FileUploadSchema.safeParse({
      directory: directoryValue && typeof directoryValue === "string" ? directoryValue : undefined,
      fileName: fileNameValue && typeof fileNameValue === "string" ? fileNameValue : undefined,
      contentType: contentTypeValue && typeof contentTypeValue === "string" ? contentTypeValue : undefined,
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

    const { directory, fileName: validatedFileName, contentType: validatedContentType } = metadataValidation.data;
    const fileName = validatedFileName ?? file.name;
    const contentType = validatedContentType || file.type || "application/octet-stream";

    const arrayBuffer = await file.arrayBuffer();
    let processedData: ArrayBuffer | Buffer = arrayBuffer;
    let finalContentType = contentType;
    let finalFileName = fileName;

    // Process images with Sharp for optimization
    const isImage = typeof contentType === "string" && contentType.startsWith("image/");
    
    if (isImage) {
      try {
        const buffer = Buffer.from(arrayBuffer);
        const processedBuffer = await sharp(buffer)
          .resize(2048, 2048, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();
        
        processedData = processedBuffer;
        finalContentType = "image/webp";
        // Change extension to .webp
        finalFileName = typeof fileName === "string" 
          ? fileName.replace(/\.[^.]+$/, ".webp") 
          : "document.webp";
      } catch (error) {
        console.error('[Upload Private] Image processing failed, uploading original:', error);
        // If processing fails, upload original
      }
    }

    const result = await uploadPrivateFile({
      data: processedData,
      contentType: typeof finalContentType === "string" ? finalContentType : "application/octet-stream",
      directory: typeof directory === "string" ? directory : undefined,
      fileName: typeof finalFileName === "string" ? finalFileName : undefined,
      metadata: {
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      key: result.key,
      etag: result.etag,
    });
  } catch (error) {
    console.error('[Upload Private] Error:', error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}

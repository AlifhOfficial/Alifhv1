/**
 * R2 Static Asset Upload API
 * Upload static assets (images, videos) to R2 via drag-drop GUI
 */

import { NextRequest, NextResponse } from "next/server";
import { R2StorageProvider } from "@/lib/storage/r2-provider";
import { getSessionUser } from "@/lib/auth/session-context";

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
    const folder = (formData.get("folder") as string) || "uploads";
    const customKey = formData.get("key") as string | null;

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

    // Generate key
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = customKey || `static/${folder}/${sanitizedName}`;

    // Upload to R2
    const storage = new R2StorageProvider();
    const buffer = await file.arrayBuffer();
    
    const result = await storage.upload({
      key,
      data: buffer,
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Upload failed" 
    }, { status: 500 });
  }
}

// List existing static assets (optional)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !["staff", "admin"].includes(user.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return helpful info about available folders
    return NextResponse.json({
      folders: [
        "Marketing",
        "Marketing_Media", 
        "Labeled_Cars",
        "Black_cars",
        "Abstract",
        "uploads",
      ],
      allowedTypes: ALLOWED_TYPES,
      maxSize: MAX_SIZE,
      baseUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch info" }, { status: 500 });
  }
}

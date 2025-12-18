/**
 * API: Storage Signed URL Generator
 * POST /api/storage/sign
 * 
 * Purpose: Generate signed URLs for private storage access
 * Authentication: Public (no auth required)
 * 
 * Request Body:
 * - key: Storage object key (required)
 * - expiresIn: URL expiry in seconds (optional)
 * - downloadName: Custom filename for downloads (optional)
 * 
 * Returns: { url: string }
 * 
 * Standards:
 * - Returns 400 for invalid input
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { key, expiresIn, downloadName } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const url = await getSignedUrl(key, {
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
      downloadName: typeof downloadName === "string" ? downloadName : undefined,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[storage/sign] POST failed", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}

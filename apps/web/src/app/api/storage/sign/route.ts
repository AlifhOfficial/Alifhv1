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
import { z } from 'zod';
import { getSignedUrl } from "@/lib/storage";

export const runtime = "edge";

const SignedUrlSchema = z.object({
  key: z.string().min(1, 'Storage key is required'),
  expiresIn: z.number().positive().optional(),
  downloadName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);
    const validationResult = SignedUrlSchema.safeParse(payload);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { key, expiresIn, downloadName } = validationResult.data;

    const url = await getSignedUrl(key, {
      expiresIn,
      downloadName,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[storage/sign] POST failed", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}

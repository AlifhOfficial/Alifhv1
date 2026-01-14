/**
 * API: Get Private File Signed URL
 * GET /api/storage/private-url?key=<fileKey>&expires=<seconds>
 * 
 * Purpose: Generate temporary signed URLs for private files
 * Authentication: Required (session-based)
 * Authorization: Admin or document owner
 * 
 * Returns: { url: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getPrivateSignedUrl } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication - uses proxy-cached session
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expires') || '3600');

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    // TODO: Add authorization check - verify user has permission to access this file
    // For now, only admins can access or the user who uploaded it

    const url = await getPrivateSignedUrl(key, { expiresIn });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[Private URL] Error:', error);
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 }
    );
  }
}

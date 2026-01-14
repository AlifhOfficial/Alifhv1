/**
 * API: Storage Signed URL Generator
 * POST /api/storage/sign
 * 
 * Purpose: Generate signed URLs for private storage access
 * Authentication: Required - validates user has access to requested key
 * 
 * Request Body:
 * - key: Storage object key (required)
 * - expiresIn: URL expiry in seconds (optional)
 * - downloadName: Custom filename for downloads (optional)
 * 
 * Returns: { url: string }
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 403 for unauthorized key access
 * - Returns 400 for invalid input
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { getSignedUrl } from "@/lib/storage";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_STORAGE } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";

const SignedUrlSchema = z.object({
  key: z.string().min(1, 'Storage key is required'),
  expiresIn: z.number().positive().optional(),
  downloadName: z.string().optional(),
});

const signedUrlLimiter = createRateLimiter(RATE_LIMITS_STORAGE.SIGNED_URL);

// Key prefixes that require ownership validation
const PRIVATE_KEY_PREFIXES = ['kyc/', 'private/', 'documents/'];

// Check if user can access the requested storage key
function canAccessKey(key: string, userId: string, userRole: string): boolean {
  // Admins can access all keys
  if (userRole === 'admin' || userRole === 'super_admin') {
    return true;
  }
  
  // Check if key is in a private directory
  const isPrivateKey = PRIVATE_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
  
  if (isPrivateKey) {
    // Private keys must contain the user's ID to be accessible
    return key.includes(userId);
  }
  
  // Public keys (avatars, listings, etc.) are accessible to authenticated users
  return true;
}

export async function POST(req: NextRequest) {
  // Authentication required - prevent anonymous access to signed URLs
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Rate limiting: 100 signed URL requests per minute per user
  const identifier = user.id;
  const rateLimitResult = await signedUrlLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }
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

    // Validate key ownership for private files
    if (!canAccessKey(key, user.id, user.role)) {
      return NextResponse.json(
        { error: 'Access denied to requested file' },
        { status: 403 }
      );
    }

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

import { NextRequest, NextResponse } from "next/server";
import { invalidateSessionByToken, invalidateAllSessions } from "@/lib/auth/session-cache";

/**
 * Clear Session Cache on Sign Out
 * 
 * This endpoint is called after Better Auth sign-out to clear our
 * in-memory session cache. Without this, middleware continues to
 * serve cached session data even after the user signs out.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session token that's about to be cleared
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;
    
    if (sessionToken) {
      // Clear the specific session from cache
      invalidateSessionByToken(sessionToken);
    }
    
    // Also clear all sessions for extra safety
    // This ensures no stale data remains in cache
    invalidateAllSessions();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[sign-out-clear-cache] Error:', error);
    // Still return success - cache clearing is best-effort
    return NextResponse.json({ success: true });
  }
}

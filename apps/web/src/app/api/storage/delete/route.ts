/**
 * API: Storage File Delete
 * DELETE /api/storage/delete
 * 
 * Purpose: Delete files from storage provider
 * Authentication: Required (user must be logged in)
 * 
 * Request Body (JSON):
 * - key: Storage key to delete (required)
 * 
 * Returns: { success: true }
 * 
 * Security:
 * - Only allows deletion of files in allowed directories (listings, avatars, etc.)
 * - Prevents deletion of system files
 * 
 * Standards:
 * - Returns 400 for invalid key
 * - Returns 401 for unauthenticated
 * - Returns 403 for forbidden paths
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { deleteFile } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session-context";

export const runtime = "nodejs";

// Allowed directories for deletion (security whitelist)
const ALLOWED_DIRECTORIES = [
  'listings/',
  'avatars/',
  'partners/',
  'gallery/',
];

const DeleteSchema = z.object({
  key: z.string().min(1, "Key is required"),
});


export async function DELETE(req: NextRequest) {

  try {
    // Authentication required
    const user = await getSessionUser();
    console.log("[storage/delete] User:", user?.id ?? "null");
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const validation = DeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { key } = validation.data;

    // Security: Only allow deletion from whitelisted directories
    const isAllowed = ALLOWED_DIRECTORIES.some(dir => key.startsWith(dir));
    if (!isAllowed) {
      console.warn(`[storage/delete] Blocked deletion attempt for key: ${key} by user: ${user.id}`);
      return NextResponse.json(
        { error: "Deletion not allowed for this path" },
        { status: 403 }
      );
    }

    // Extract key from full URL if needed
    let storageKey = key;
    if (key.startsWith('http://') || key.startsWith('https://')) {
      // Extract path from URL
      try {
        const url = new URL(key);
        storageKey = url.pathname.replace(/^\//, '');
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }

    await deleteFile(storageKey);

    console.log(`[storage/delete] Deleted: ${storageKey} by user: ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[storage/delete] DELETE failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

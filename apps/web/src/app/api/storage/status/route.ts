/**
 * API: Storage Status Endpoint
 * GET /api/storage/status 
 *
 * 
 * Purpose: Get storage provider configuration status
 * Authentication: Public (no auth required)
 * 
 * Returns: Storage provider info and configuration status
 * 
 * Standards:
 * - Returns 500 for server errors
 */

import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = getStorageStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[storage/status] GET failed", error);
    return NextResponse.json({ error: "Failed to load storage status" }, { status: 500 });
  }
}

/**
 * API: Listings Base Route
 * GET /api/listings
 * 
 * Purpose: Redirect handler to car-card endpoint
 * Authentication: None required (public endpoint)
 * 
 * Flow:
 * - Forwards all query params to /api/listings/car-card
 * - Maintains backward compatibility with old API structure
 * 
 * Standards:
 * - 302 redirect to car-card endpoint
 * - Preserves all query parameters
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Forward all query params to car-card endpoint
  const carCardUrl = new URL('/api/listings/car-card', req.url);
  searchParams.forEach((value, key) => {
    carCardUrl.searchParams.set(key, value);
  });
  
  // Redirect to car-card endpoint
  return NextResponse.redirect(carCardUrl);
}

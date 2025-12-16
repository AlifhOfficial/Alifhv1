/**
 * Base Listings API Route
 * Redirects to car-card endpoint
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/listings
 * Redirects to /api/listings/car-card with query params
 */
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

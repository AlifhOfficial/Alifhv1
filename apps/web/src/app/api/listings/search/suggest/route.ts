/**
 * API: Quick Search / Auto-suggest Endpoint
 * GET /api/listings/search/suggest
 * 
 * Purpose: Fast auto-complete for header search bar
 * Returns: Make/model suggestions as user types
 * 
 * Query Params:
 * - q: Search query (min 2 chars)
 * - limit: Max suggestions (default: 8, max: 20)
 * 

 * @module api/listings/search/suggest
 */

import { NextRequest, NextResponse } from "next/server";
import { applyCdnHeaders } from '@/lib/cdn-cache';
import { quickSearch, getPopularMakes } from "@alifh/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiting removed — public read endpoint protected by CF DDoS/bot + CDN caching.
// Upstash REST round-trip was adding ~100ms per request to typeahead.

export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const popular = searchParams.get('popular') === 'true';
    const limitParam = Number(searchParams.get('limit') || '4');
    const limit = Math.min(Math.max(limitParam, 1), 10);
    
    // Get context for hierarchical search
    const contextMake = searchParams.get('make') || undefined;
    const contextModel = searchParams.get('model') || undefined;
    const context = contextMake ? { make: contextMake, model: contextModel } : undefined;

    // Return popular makes/models/trims when requested (hierarchical)
    if (popular || query.length < 2) {
      const popularItems = context 
        ? await quickSearch('', limit, context)
        : await getPopularMakes(limit);
      const result = { suggestions: popularItems };
      
      const response = NextResponse.json(result);
      applyCdnHeaders(response, 'suggest');
      return response;
    }

    // Execute quick search with context
    const suggestions = await quickSearch(query, limit, context);

    const result = { suggestions };

    const response = NextResponse.json(result);
    applyCdnHeaders(response, 'suggest');

    return response;
  } catch (error) {
    console.error('[suggest] Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

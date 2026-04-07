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
import { getCachedQuickSearch, getCachedPopularMakes, getCachedSearchFacets } from "@/lib/search-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const facetParams = {
      ...(contextMake ? { make: [contextMake] } : {}),
      ...(contextModel ? { model: [contextModel] } : {}),
    };

    // Return popular makes/models/trims when requested (hierarchical)
    if (popular || query.length < 2) {
      if (!context) {
        const popularItems = await getCachedPopularMakes(limit);
        return NextResponse.json({ suggestions: popularItems });
      }

      const facets = await getCachedSearchFacets(facetParams);

      if (context.make && context.model) {
        const trimSuggestions = facets.trim
          .slice(0, limit)
          .map(trim => ({
            type: 'make_model_trim' as const,
            text: trim.label || trim.value,
            make: context.make,
            model: context.model,
            trim: trim.value,
            count: trim.count,
          }));

        return NextResponse.json({ suggestions: trimSuggestions });
      }

      const modelSuggestions = facets.model
        .slice(0, limit)
        .map(model => ({
          type: 'make_model' as const,
          text: model.label || model.value,
          make: context.make,
          model: model.value,
          count: model.count,
        }));

      return NextResponse.json({ suggestions: modelSuggestions });
    }

    // Execute quick search with context
    const suggestions = await getCachedQuickSearch(query, limit, context);

    // Use the same cached facet source-of-truth (1h) for hierarchical counts.
    // This keeps suggest counts aligned with filter facets.
    const facets = await getCachedSearchFacets(facetParams);
    const makeCountByValue = new Map(facets.make.map(item => [item.value, item.count]));
    const modelCountByValue = new Map(facets.model.map(item => [item.value, item.count]));
    const trimCountByValue = new Map(facets.trim.map(item => [item.value, item.count]));

    const withFacetCounts = suggestions.map((suggestion) => {
      if (suggestion.type === 'make' && suggestion.make) {
        return {
          ...suggestion,
          count: makeCountByValue.get(suggestion.make) ?? suggestion.count,
        };
      }

      if (suggestion.type === 'make_model' && context?.make && suggestion.model) {
        return {
          ...suggestion,
          count: modelCountByValue.get(suggestion.model) ?? suggestion.count,
        };
      }

      if (suggestion.type === 'make_model_trim' && context?.make && context?.model && suggestion.trim) {
        return {
          ...suggestion,
          count: trimCountByValue.get(suggestion.trim) ?? suggestion.count,
        };
      }

      return suggestion;
    });

    return NextResponse.json({ suggestions: withFacetCounts });
  } catch (error) {
    console.error('[suggest] Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

/**
 * API: AI Search Intent Parser
 * POST /api/listings/search/ai
 * 
 * Purpose: Convert natural language to structured search filters
 * Input: { query: string } — any natural language (up to 500 words)
 * Output: { intent, searchUrl, cached, processingTimeMs, estimatedCost }
 * 
 * The AI never touches the DB. It parses intent → SearchParams → your existing search pipeline.
 * 
 * Cost: ~$0.0001/uncached request (GPT-4o-mini)
 * Caching: 24h in-memory cache on normalized input
 * 
 * @module api/listings/search/ai
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseSearchIntent, intentToSearchParams } from '@alifh/ai/search';
import { searchParamsToUrl } from '@/lib/search-utils';

export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "query" field' },
        { status: 400 }
      );
    }

    // Enforce word limit (500 words ≈ ~2500 chars max)
    if (query.length > 3000) {
      return NextResponse.json(
        { error: 'Query too long. Maximum 500 words.' },
        { status: 400 }
      );
    }

    // Parse intent with LLM
    const result = await parseSearchIntent(query);

    // Convert intent to SearchParams and build URL
    const searchParams = intentToSearchParams(result.intent);
    const hasFilters = Object.keys(searchParams).length > 0;
    const urlParams = searchParamsToUrl(searchParams as any);
    const searchUrl = `/listings${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    
    // Safety net: if AI returned confidence > 0 but no actual filters,
    // downgrade confidence to 0 so clients handle it as a low-confidence case
    const effectiveConfidence = (result.intent.confidence > 0 && !hasFilters) 
      ? 0 
      : result.intent.confidence;
    
    console.warn('[AI Search] query:', query);
    console.warn('[AI Search] intent:', JSON.stringify(result.intent));
    console.warn('[AI Search] searchUrl:', searchUrl);
    console.warn('[AI Search] hasFilters:', hasFilters);

    return NextResponse.json({
      intent: { ...result.intent, confidence: effectiveConfidence },
      message: result.intent.message || null,
      searchParams,
      searchUrl,
      hasFilters,
      cached: result.cached,
      processingTimeMs: result.processingTimeMs,
      estimatedCost: result.estimatedCost,
    });
  } catch (error) {
    console.error('[AI Search API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to parse search intent' },
      { status: 500 }
    );
  }
}

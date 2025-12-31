/**
 * API: AI Valuation
 * POST /api/ai/valuation
 * 
 * Purpose: Generate AI-powered pricing insights for a car listing
 * Authentication: Required (internal use - called during listing creation/update)
 * 
 * Returns:
 * - fairValue: Estimated market value
 * - estimateMin/Max: Price range
 * - priceTrend: up/down/stable
 * - qiScore: Quality Index (0-100)
 * - aiConfidenceScore: Confidence (0-1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { generateValuation, type ValuationInput } from '@alifh/ai/valuation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Auth check - only authenticated users can request valuation
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.mileage || !body.specs || !body.askingPrice || !body.emirate) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['make', 'model', 'year', 'mileage', 'specs', 'askingPrice', 'emirate']
        },
        { status: 400 }
      );
    }

    // Build valuation input (lean data only)
    const input: ValuationInput = {
      make: body.make,
      model: body.model,
      year: body.year,
      trim: body.trim || null,
      mileage: body.mileage,
      specs: body.specs,
      askingPrice: body.askingPrice,
      emirate: body.emirate,
      // Important specs only
      bodyType: body.bodyType || null,
      fuelType: body.fuelType || null,
      transmission: body.transmission || null,
      cylinders: body.cylinders || null,
      warrantyType: body.warrantyType || null,
      extras: body.extras || null,
    };

    // Generate valuation
    const result = await generateValuation(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AI Valuation API] Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

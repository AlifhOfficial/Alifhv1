/**
 * Car Valuation API
 * 
 * POST /api/valuation
 * Uses AI to generate market value estimates
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateValuation, type ValuationInput } from '@alifh/ai/valuation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields (askingPrice is now optional)
    const { make, model, year, mileage, specs, emirate } = body;
    
    if (!make || !model || !year || !mileage || !specs || !emirate) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, mileage, specs, emirate' },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (typeof year !== 'number' || year < 1980 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }
    
    if (typeof mileage !== 'number' || mileage < 0 || mileage > 1000000) {
      return NextResponse.json(
        { error: 'Invalid mileage' },
        { status: 400 }
      );
    }
    
    // askingPrice is optional now - validate only if provided
    const askingPrice = body.askingPrice ? Number(body.askingPrice) : 0;
    if (body.askingPrice && (askingPrice < 5000 || askingPrice > 50000000)) {
      return NextResponse.json(
        { error: 'Invalid asking price' },
        { status: 400 }
      );
    }
    
    // Build valuation input
    const input: ValuationInput = {
      make: String(make).trim(),
      model: String(model).trim(),
      year: Number(year),
      trim: body.trim ? String(body.trim).trim() : null,
      mileage: Number(mileage),
      specs: String(specs).toLowerCase(),
      askingPrice: askingPrice, // 0 if not provided
      emirate: String(emirate).trim(),
      bodyType: body.bodyType || null,
      fuelType: body.fuelType || null,
      transmission: body.transmission || null,
      cylinders: body.cylinders ? Number(body.cylinders) : null,
      warrantyType: body.warrantyType || null,
      extras: body.extras || null,
    };
    
    // Generate valuation
    const result = await generateValuation(input);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Valuation API] Error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate valuation. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * API: AI Description Generator
 * POST /api/ai/description
 * 
 * Purpose: Generate AI-powered car listing descriptions
 * Authentication: Required
 * 
 * Returns:
 * - description: Generated text (max 700 chars)
 * - characterCount: Actual length
 * - highlights: Key selling points extracted
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { generateDescription, type DescriptionInput } from '@alifh/ai/description';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.make || !body.model || !body.year) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['make', 'model', 'year']
        },
        { status: 400 }
      );
    }

    // Build description input
    const input: DescriptionInput = {
      make: body.make,
      model: body.model,
      year: body.year,
      trim: body.trim || null,
      mileage: body.mileage ?? null,
      specs: body.specs || null,
      bodyType: body.bodyType || null,
      fuelType: body.fuelType || null,
      transmission: body.transmission || null,
      engineSize: body.engineSize || null,
      cylinders: body.cylinders || null,
      exteriorColor: body.exteriorColor || null,
      interiorColor: body.interiorColor || null,
      warrantyType: body.warrantyType || null,
      condition: body.condition || null,
      price: body.price || null,
      isNegotiable: body.isNegotiable ?? null,
      emirate: body.emirate || null,
      extras: body.extras || null,
      ownerRemarks: body.ownerRemarks || null,
      // Regeneration support
      previousDescription: body.previousDescription || null,
      regenerateReason: body.regenerateReason || null,
    };

    const result = await generateDescription(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AI Description API] Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

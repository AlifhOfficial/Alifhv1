/**
 * VIN Check API Route
 * 
 * Checks if a VIN is already in use by an active listing
 * and decodes VIN to auto-fill vehicle information.
 * 
 * GET /api/listings/check-vin?vin=XXXXX
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, carListing, eq, and, ne } from '@alifh/database';
import { decodeVIN, isValidVINFormat, formatVIN } from '@/lib/vin-decoder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vin = searchParams.get('vin');
    const excludeListingId = searchParams.get('excludeId'); // For edit mode
    
    if (!vin) {
      return NextResponse.json(
        { error: 'VIN is required' },
        { status: 400 }
      );
    }
    
    const formattedVIN = formatVIN(vin);
    
    // Validate VIN format
    if (!isValidVINFormat(formattedVIN)) {
      return NextResponse.json(
        { 
          error: 'Invalid VIN format',
          details: 'VIN must be exactly 17 characters and cannot contain I, O, or Q'
        },
        { status: 400 }
      );
    }
    
    // Check for existing listing with this VIN
    // Exclude soft-deleted listings (lifecycleStatus = 'deleted') - those VINs can be reused
    
    const conditions = [
      eq(carListing.vin, formattedVIN),
      ne(carListing.lifecycleStatus, 'deleted'), // Allow reuse of VINs from deleted listings
    ];
    
    // Exclude the current listing when editing
    if (excludeListingId) {
      conditions.push(ne(carListing.id, excludeListingId));
    }
    
    const existingListing = await db
      .select({
        id: carListing.id,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
        moderationStatus: carListing.moderationStatus,
        lifecycleStatus: carListing.lifecycleStatus,
        deletedAt: carListing.deletedAt,
      })
      .from(carListing)
      .where(and(...conditions))
      .limit(1);
    
    const isInUse = existingListing.length > 0;
    
    // Decode VIN to get vehicle info
    const decodeResult = await decodeVIN(formattedVIN);
    
    if (isInUse) {
      const existing = existingListing[0];
      
      // Provide context about why VIN is unavailable
      let message = `This VIN is already listed: ${existing.year} ${existing.make} ${existing.model}`;
      if (existing.deletedAt) {
        message = `This VIN was previously used in a deleted listing`;
      } else if (existing.lifecycleStatus === 'sold') {
        message = `This VIN belongs to a sold listing: ${existing.year} ${existing.make} ${existing.model}`;
      } else if (existing.lifecycleStatus === 'archived') {
        message = `This VIN belongs to an archived listing: ${existing.year} ${existing.make} ${existing.model}`;
      }
      
      return NextResponse.json({
        available: false,
        message,
        existingListing: {
          id: existing.id,
          make: existing.make,
          model: existing.model,
          year: existing.year,
          status: existing.moderationStatus,
          lifecycleStatus: existing.lifecycleStatus,
        },
        decoded: decodeResult.success ? decodeResult.data : null,
      });
    }
    
    // VIN is available
    return NextResponse.json({
      available: true,
      message: 'VIN is available',
      decoded: decodeResult.success ? decodeResult.data : null,
      decodeError: !decodeResult.success ? decodeResult.error : null,
    });
    
  } catch (error) {
    console.error('VIN check error:', error);
    return NextResponse.json(
      { error: 'Failed to check VIN' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  getAllListings,
} from "@alifh/database";

export const runtime = "nodejs";

/**
 * GET /api/listings/search
 * Advanced search endpoint with full text search capabilities
 * 
 * Query params:
 * - q: string (search query - searches title, make, model, description)
 * - emirate: string
 * - make: string
 * - model: string
 * - yearMin: number
 * - yearMax: number
 * - priceMin: number
 * - priceMax: number
 * - mileageMax: number
 * - condition: 'new' | 'used' | 'certified'
 * - bodyType: string[] (e.g., 'sedan,suv,coupe')
 * - fuelType: string[] (e.g., 'petrol,diesel,electric')
 * - transmission: string[] (e.g., 'automatic,manual')
 * - features: string[] (e.g., 'sunroof,leather,navigation')
 * - sortBy: 'recent' | 'price-asc' | 'price-desc' | 'mileage' | 'year' | 'views'
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * 
 * This endpoint provides the same filtering as GET /api/listings but with
 * additional full-text search capability via the 'q' parameter
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse search query
    const searchQuery = searchParams.get('q') || undefined;
    
    // Parse filters (reuse same logic as base listings route)
    const emirate = searchParams.get('emirate') || undefined;
    const make = searchParams.get('make') || undefined;
    const model = searchParams.get('model') || undefined;
    const yearMin = searchParams.get('yearMin') 
      ? parseInt(searchParams.get('yearMin')!) 
      : undefined;
    const yearMax = searchParams.get('yearMax') 
      ? parseInt(searchParams.get('yearMax')!) 
      : undefined;
    const priceMin = searchParams.get('priceMin') 
      ? parseFloat(searchParams.get('priceMin')!) 
      : undefined;
    const priceMax = searchParams.get('priceMax') 
      ? parseFloat(searchParams.get('priceMax')!) 
      : undefined;
    const mileageMax = searchParams.get('mileageMax') 
      ? parseInt(searchParams.get('mileageMax')!) 
      : undefined;
    const condition = searchParams.get('condition') || undefined;
    
    // Parse arrays
    const bodyType = searchParams.get('bodyType')?.split(',') || undefined;
    const fuelType = searchParams.get('fuelType')?.split(',') || undefined;
    const transmission = searchParams.get('transmission')?.split(',') || undefined;
    const features = searchParams.get('features')?.split(',') || undefined;
    
    // Pagination
    const sortBy = searchParams.get('sortBy') || 'recent';
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build filters object
    const filters: any = {
      status: 'published' as const,
      emirate,
      make,
      model,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      mileageMax,
      condition,
      bodyType,
      fuelType,
      transmission,
      features,
      searchQuery, // Full-text search
      sortBy: sortBy as any,
      limit,
      offset,
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );
    
    const listings = await getAllListings(filters);
    
    return NextResponse.json({ 
      data: listings,
      meta: {
        query: searchQuery,
        filters: filters,
        sortBy,
        limit,
        offset,
        count: listings.length,
      }
    });
  } catch (error) {
    console.error('[listings/search] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to search listings' },
      { status: 500 }
    );
  }
}

/**
 * API: Create Car Listing
 * POST /api/listings
 * 
 * Purpose: Create a new car listing
 * Authentication: Required (users and staff only)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Approval Flow:
 * - Staff-posted listings: Can become public immediately (moderationStatus: 'approved')
 * - User-posted listings: Require admin approval (moderationStatus goes to 'submitted'/'pending_review')
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 400 for invalid input
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createAuditLogEntry,
  createCarListing,
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  memoryCache,
  db,
  carListing,
  updateListingAIValuation,
  updateListingAIModeration,
  type CreateCarListingInput,
  eq, and, ne,
} from '@alifh/database';
import { getClientIp } from '@/lib/utils/get-client-ip';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_LISTINGS } from '@/lib/rate-limit';
import { generateValuation, type ValuationInput } from '@alifh/ai/valuation';
import { moderateListing, type ModerationInput } from '@alifh/ai/moderation';

export const runtime = 'nodejs';

const listingCreateLimiter = createRateLimiter(RATE_LIMITS_LISTINGS.CREATE);

export async function POST(req: NextRequest) {
  try {
    // Auth check - only authenticated users can create listings
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Staff members (have partner membership) bypass rate limiting
    // This allows dealers to onboard full inventory without hitting limits
    const isStaffOrAdmin = 
      user.role === 'admin' || 
      user.role === 'super_admin' || 
      (user.partnerMemberships && user.partnerMemberships.length > 0);

    // Rate limit check - only for regular users (5 listings per day)
    if (!isStaffOrAdmin) {
      const identifier = getIdentifier(req, user.id);
      const rateLimitResult = await listingCreateLimiter.check(identifier);
      if (!rateLimitResult.success) {
        return rateLimitResponse(rateLimitResult);
      }
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.price || !body.mileage || !body.specs || !body.steeringSide || !body.emirate) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['make', 'model', 'year', 'price', 'mileage', 'specs', 'steeringSide', 'emirate']
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.year !== 'number' || body.year < 1900 || body.year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    if (typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    if (typeof body.mileage !== 'number' || body.mileage < 0) {
      return NextResponse.json(
        { error: 'Invalid mileage' },
        { status: 400 }
      );
    }

    // Validate specs enum (includes Chinese & Korean for UAE market)
    const validSpecs = ['gcc', 'american', 'european', 'japanese', 'chinese', 'korean', 'canadian', 'other'];
    if (!validSpecs.includes(body.specs)) {
      return NextResponse.json(
        { 
          error: 'Invalid specs',
          validValues: validSpecs
        },
        { status: 400 }
      );
    }

    // Validate steeringSide enum
    const validSteeringSide = ['left', 'right'];
    if (!validSteeringSide.includes(body.steeringSide)) {
      return NextResponse.json(
        { 
          error: 'Invalid steeringSide',
          validValues: validSteeringSide
        },
        { status: 400 }
      );
    }

    // Validate images array if provided
    if (body.images && !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // Server-side VIN uniqueness check (safety net for unique constraint)
    // Exclude soft-deleted listings - those VINs can be reused
    if (body.vin) {
      const formattedVIN = body.vin.toUpperCase().trim();
      
      // Check if VIN is used by an active (non-deleted) listing
      const existingActive = await db
        .select({ id: carListing.id })
        .from(carListing)
        .where(and(
          eq(carListing.vin, formattedVIN),
          ne(carListing.lifecycleStatus, 'deleted')
        ))
        .limit(1);
      
      if (existingActive.length > 0) {
        return NextResponse.json(
          { error: 'This VIN is already in use by another listing' },
          { status: 409 }
        );
      }
      
      // Clear VIN from any soft-deleted listings to avoid unique constraint violation
      await db
        .update(carListing)
        .set({ vin: null })
        .where(and(
          eq(carListing.vin, formattedVIN),
          eq(carListing.lifecycleStatus, 'deleted')
        ));
    }

    // Set thumbnail to first image if not explicitly provided
    const thumbnail = body.thumbnail || (body.images && body.images.length > 0 ? body.images[0] : undefined);

    // Listing type is determined by the listing itself, not the user's role:
    // - Partner/staff listing: has a `partnerId`
    // - Personal user listing: no `partnerId` (always moderated if publishing)
    const isPartnerListing = typeof body.partnerId === 'string' && body.partnerId.length > 0;

    if (isPartnerListing) {
      // Ensure the user is actually staff/owner for this partner (and can manage listings).
      // Prefer session data, but fall back to DB in case middleware/session shape is incomplete for API routes.
      const sessionMembership = user.partnerMemberships?.find((m) => m.partnerId === body.partnerId);

      const roleFromSession = (sessionMembership as any)?.staffRole as string | undefined;
      const permissionsFromSession = (sessionMembership as any)?.permissions as any;
      const canCreateFromSession =
        permissionsFromSession?.manageListings ??
        permissionsFromSession?.listings?.create ??
        undefined;

      if (!sessionMembership) {
        const dbMembership = await getActivePartnerStaffMembershipByUserIdAndPartnerId(user.id, body.partnerId);
        if (!dbMembership) {
          return NextResponse.json(
            { error: 'Not authorized to create listings for this partner' },
            { status: 403 }
          );
        }
        if (dbMembership.role === 'viewer') {
          return NextResponse.json(
            { error: 'Your staff role does not allow creating listings' },
            { status: 403 }
          );
        }
      } else {
        // Session membership exists; validate role/permissions.
        if (roleFromSession === 'viewer' || canCreateFromSession === false) {
          return NextResponse.json(
            { error: 'Not authorized to create listings for this partner' },
            { status: 403 }
          );
        }
      }
    }
    
    const postedByRole = isPartnerListing ? 'staff' : 'user';

    // Legacy status mapping (kept for current clients):
    // - 'draft' -> moderationStatus 'draft'
    // - 'published' -> staff: 'approved' (public), user: 'submitted' (queued)
    const legacyStatus = body.status || 'draft';
    const moderationStatus =
      legacyStatus === 'published'
        ? postedByRole === 'staff'
          ? 'approved'
          : 'submitted'
        : 'draft';

    // Prepare input data
    const input: CreateCarListingInput = {
      userId: user.id,
      postedByRole,
      make: body.make,
      model: body.model,
      year: body.year,
      price: body.price,
      mileage: body.mileage,
      specs: body.specs,
      steeringSide: body.steeringSide,
      emirate: body.emirate,
      
      // Partner info (for dealer/staff listings)
      partnerId: isPartnerListing ? body.partnerId : undefined,
      
      // Optional fields
      vin: body.vin || undefined,
      trim: body.trim || undefined,
      description: body.description || undefined,
      currency: body.currency || 'AED',
      isNegotiable: body.isNegotiable ?? false,
      
      // Specifications
      bodyType: body.bodyType || undefined,
      fuelType: body.fuelType || undefined,
      transmission: body.transmission || undefined,
      engineSize: body.engineSize || undefined,
      engineType: body.engineType || undefined,
      cylinders: body.cylinders || undefined,
      powerRange: body.powerRange || undefined,
      torque: body.torque || undefined,
      fuelEconomy: body.fuelEconomy || undefined,
      doors: body.doors || undefined,
      seatingCapacity: body.seatingCapacity || undefined,
      exteriorColor: body.exteriorColor || undefined,
      interiorColor: body.interiorColor || undefined,
      
      // Moderation & Lifecycle
      moderationStatus,
      lifecycleStatus: 'active',

      // Export
      exportStatus: body.exportStatus || 'local_only',
      warrantyType: body.warrantyType || undefined,
      sellerType: postedByRole === 'staff' ? 'dealer' : 'private',
      
      // Location
      city: body.city || undefined,
      
      // Media (thumbnail auto-set to first image)
      thumbnail: thumbnail,
      images: body.images || undefined,
      videoUrl: body.videoUrl || undefined,
      
      // Features & Notes
      technicalFeatures: body.technicalFeatures || undefined,
      extras: body.extras || undefined,           // Vehicle features from predefined list
      tags: body.tags || undefined,               // Predefined tags (max 3)
      specialNotes: body.specialNotes || undefined, // Owner remarks + moderation
      badges: body.badges || undefined,           // System-assigned badges
    };

    // Create listing
    const listingId = await createCarListing(input);

    // Generate AI valuation asynchronously (don't block response)
    // Only run for non-draft listings to save API calls
    if (moderationStatus !== 'draft') {
      // Pass only relevant data for valuation - lean input = better results
      const valuationInput: ValuationInput = {
        make: input.make,
        model: input.model,
        year: input.year,
        trim: input.trim || null,
        mileage: input.mileage,
        specs: input.specs,
        askingPrice: input.price,
        emirate: input.emirate,
        // Important specs only
        bodyType: input.bodyType || null,
        fuelType: input.fuelType || null,
        transmission: input.transmission || null,
        cylinders: input.cylinders || null,
        warrantyType: input.warrantyType || null,
        extras: input.extras || null,
      };

      // Fire and forget - don't await, let it run in background
      generateValuation(valuationInput)
        .then(async (result) => {
          await updateListingAIValuation(listingId, {
            fairValue: result.fairValue,
            estimateMin: result.estimateMin,
            estimateMax: result.estimateMax,
            priceTrend: result.priceTrend,
            qiScore: result.qiScore,
            aiConfidenceScore: result.aiConfidenceScore,
            valueFactors: result.valueFactors,
          });
          console.log(`[AI Valuation] Listing ${listingId}: QI=${result.qiScore}, Confidence=${result.aiConfidenceScore}`);
        })
        .catch((error) => {
          console.error(`[AI Valuation] Failed for listing ${listingId}:`, error);
        });
    }

    // AI Auto-Moderation for USER-posted listings only
    // Staff/dealer listings skip moderation as they are already trusted
    if (postedByRole === 'user' && moderationStatus === 'submitted') {
      const moderationInput: ModerationInput = {
        make: input.make,
        model: input.model,
        year: input.year,
        trim: input.trim || null,
        vin: input.vin || null,
        price: input.price,
        isNegotiable: input.isNegotiable,
        mileage: input.mileage,
        specs: input.specs,
        bodyType: input.bodyType || null,
        fuelType: input.fuelType || null,
        transmission: input.transmission || null,
        cylinders: input.cylinders || null,
        warrantyType: input.warrantyType || null,
        // TODO: Add condition, exteriorColor, interiorColor to CreateCarListingInput type
        condition: null,
        exteriorColor: null,
        interiorColor: null,
        description: input.description || null,
        emirate: input.emirate,
        city: input.city || null,
        imageCount: input.images?.length || 0,
        hasVideo: !!input.videoUrl,
        extras: input.extras || null,
        tags: input.tags || null,
        // Extract ownerRemarks from SpecialNotes object
        ownerRemarks: input.specialNotes?.ownerRemarks || null,
      };

      // Fire and forget - don't await, let it run in background
      moderateListing(moderationInput)
        .then(async (result) => {
          await updateListingAIModeration(listingId, result);
          console.log(`[AI Moderation] Listing ${listingId}: ${result.decision} (confidence: ${result.confidence})`);
        })
        .catch((error) => {
          console.error(`[AI Moderation] Failed for listing ${listingId}:`, error);
          // On failure, listing stays as 'submitted' for manual review
        });
    }

    void createAuditLogEntry({
      action: 'listing.create',
      entityType: 'car_listing',
      entityId: listingId,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata: {
        postedByRole,
        partnerId: input.partnerId ?? null,
        moderationStatus: input.moderationStatus ?? 'draft',
        lifecycleStatus: input.lifecycleStatus ?? 'active',
      },
    }).catch((error) => {
      console.error('[Audit] Failed to write listing.create log:', error);
    });

    // Invalidate listing caches so new inventory reflects immediately
    memoryCache.deleteByPrefix('listings:cards:');
    memoryCache.deleteByPrefix('listings:partner:');

    return NextResponse.json(
      {
        success: true,
        data: {
          id: listingId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Extract more detailed error info for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    };
    
    return NextResponse.json(
      { 
        error: errorDetails.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

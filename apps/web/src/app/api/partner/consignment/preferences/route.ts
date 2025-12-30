import { NextRequest, NextResponse } from 'next/server';
import {
  getActivePartnerStaffMembershipByUserId,
  getOrCreatePartnerConsignmentPreference,
  updatePartnerConsignmentPreference,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
  RATE_LIMITS_CONSIGNMENT,
} from '@/lib/rate-limit';

const readLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);
const updateLimiter = createRateLimiter(RATE_LIMITS_CONSIGNMENT.MATCH);

/**
 * GET /api/partner/consignment/preferences
 * Get partner's consignment preferences (staff access)
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(_req, user.id);
    const rateLimitResult = await readLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = await getActivePartnerStaffMembershipByUserId(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    const preferences = await getOrCreatePartnerConsignmentPreference(membership.partnerId);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/partner/consignment/preferences
 * Update partner's consignment preferences (staff access)
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await updateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = await getActivePartnerStaffMembershipByUserId(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updated = await updatePartnerConsignmentPreference(membership.partnerId, {
      isEnabled: body.isEnabled,
      makes: body.makes || [],
      models: body.models || [],
      bodyTypes: body.bodyTypes || [],
      fuelTypes: body.fuelTypes || [],
      minYear: body.minYear,
      maxYear: body.maxYear,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      maxMileage: body.maxMileage,
      emirates: body.emirates || [],
      preferredSpecs: body.preferredSpecs || [],
      mustHaveFeatures: body.mustHaveFeatures || [],
      onlyVerifiedSellers: body.onlyVerifiedSellers ?? false,
      excludeAccidents: body.excludeAccidents ?? true,
      priorityScore: body.priorityScore ?? 50,
      notifyOnNewLead: body.notifyOnNewLead ?? true,
      maxLeadsPerDay: body.maxLeadsPerDay,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      preferences: updated,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

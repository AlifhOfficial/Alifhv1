/**
 * API: Partner Request Validation
 * POST /api/partners/request/validate - Validate partner request data before submission
 * 
 * Purpose: Pre-validate trade license and check for duplicates
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: No cache
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 400 for validation errors
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  hasActivePartnerRequest,
  isTradeLicenseInUse,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// Validation Schema
// ============================================================================

const ValidateSchema = z.object({
  tradeLicense: z.string().min(5, 'Trade license is required'),
  checkType: z.enum(['user', 'license', 'both']).default('both'),
});

// ============================================================================
// POST - Validate Partner Request Data
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        requiresAuth: true 
      }, { status: 401 });
    }


    // Parse and validate input
    const payload = await req.json().catch(() => null);
    const result = ValidateSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { tradeLicense, checkType } = result.data;

    const validationResults = {
      valid: true,
      errors: [] as string[],
      checks: {
        hasActiveRequest: false,
        licenseInUse: false,
      }
    };

    // Check if user has an active request
    if (checkType === 'user' || checkType === 'both') {
      const hasActive = await hasActivePartnerRequest(user.id);
      validationResults.checks.hasActiveRequest = hasActive;
      
      if (hasActive) {
        validationResults.valid = false;
        validationResults.errors.push('You already have an active partner request');
      }
    }

    // Check if trade license is in use
    if (checkType === 'license' || checkType === 'both') {
      const licenseInUse = await isTradeLicenseInUse(tradeLicense);
      validationResults.checks.licenseInUse = licenseInUse;
      
      if (licenseInUse) {
        validationResults.valid = false;
        validationResults.errors.push('This trade license is already registered');
      }
    }

    const response = NextResponse.json(validationResults);

    return response;
  } catch (error) {
    console.error('[partners/request/validate] POST failed', error);
    return NextResponse.json({ 
      error: 'Validation failed' 
    }, { status: 500 });
  }
}

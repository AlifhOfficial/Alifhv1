/**
 * API: Partner Request Public Submission
 * POST /api/partners/request/public - Submit partner request without authentication
 * 
 * Purpose: Allow public users to submit partner applications
 * Authentication: Not required (email used to link to user account later)
 * 
 * Cache Strategy: No cache
 * 
 * Standards:
 * - Returns 400 for validation errors
 * - Returns 409 for duplicate applications
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createPartnerRequest,
  hasActivePartnerRequest,
  isTradeLicenseInUse,
  db,
  user,
} from '@alifh/database';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Validation schema for public partner request
const publicPartnerRequestSchema = z.object({
  userEmail: z.string().email('Valid email required'),
  companyNameLegal: z.string().min(2, 'Company name required'),
  email: z.string().email('Valid company email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  tradeLicense: z.string().min(5, 'Trade license number required'),
  tradeLicenseExpiry: z.string().refine((date) => {
    const expiry = new Date(date);
    return expiry > new Date();
  }, 'Trade license must be valid'),
  partnerType: z.enum(['dealer', 'showroom', 'multi_brand', 'rental', 'broker', 'other']),
  
  // Optional fields
  brandName: z.string().optional(),
  vatNumber: z.string().optional(),
  website: z.string().optional().transform(val => {
    if (!val || val === '') return undefined;
    // Add protocol if missing
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return `https://${val}`;
    }
    return val;
  }),
  address: z.string().optional(),
  emirate: z.string().optional(),
  description: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  specialties: z.array(z.string()).optional(),
  tradeLicenseDocumentUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * POST /api/partners/request/public
 * Create a partner request from public form (no authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[partners/request/public] Received body:', JSON.stringify(body, null, 2));
    
    const validatedData = publicPartnerRequestSchema.parse(body);
    console.log('[partners/request/public] Validated data:', JSON.stringify(validatedData, null, 2));

    // Check if trade license is already in use
    const tradeLicenseExists = await isTradeLicenseInUse(validatedData.tradeLicense);
    if (tradeLicenseExists) {
      return NextResponse.json({ 
        error: 'Trade license already registered',
        field: 'tradeLicense'
      }, { status: 409 });
    }

    // Find or create user account for this email
    let [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, validatedData.userEmail))
      .limit(1);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      
      // Check if user already has an active partner request
      const hasActive = await hasActivePartnerRequest(userId);
      if (hasActive) {
        return NextResponse.json({ 
          error: 'You already have a pending partner application',
          field: 'userEmail'
        }, { status: 409 });
      }
    } else {
      // Create a temporary user account for this email
      // They can claim it later by signing up with the same email
      userId = createId();
      
      await db.insert(user).values({
        id: userId,
        email: validatedData.userEmail,
        name: validatedData.companyNameLegal, // Use company name as temp name
        emailVerified: false,
        phoneVerified: false,
        role: 'user',
      });
    }

    // Create the partner request
    const request = await createPartnerRequest({
      userId,
      companyNameLegal: validatedData.companyNameLegal,
      email: validatedData.email,
      phone: validatedData.phone,
      tradeLicense: validatedData.tradeLicense,
      tradeLicenseExpiry: new Date(validatedData.tradeLicenseExpiry),
      partnerType: validatedData.partnerType,
      brandName: validatedData.brandName,
      vatNumber: validatedData.vatNumber,
      website: validatedData.website || undefined,
      address: validatedData.address,
      emirate: validatedData.emirate,
      description: validatedData.description,
      experienceYears: validatedData.experienceYears,
      specialties: validatedData.specialties,
      tradeLicenseDocumentUrl: validatedData.tradeLicenseDocumentUrl,
    });

    const response = NextResponse.json({ 
      success: true,
      requestId: request.id,
      message: 'Application submitted successfully. You will receive an email notification once reviewed.'
    }, { status: 201 });

    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );

    return response;
  } catch (error) {
    console.error('[partners/request/public] Error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('[partners/request/public] Validation errors:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 });
    }

    console.error('[partners/request/public] POST failed', error);
    return NextResponse.json({ 
      error: 'Failed to submit partner request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

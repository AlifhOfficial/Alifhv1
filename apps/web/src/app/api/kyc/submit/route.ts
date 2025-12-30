import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { createKycRecord } from "@alifh/database";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_KYC } from '@/lib/rate-limit';

export const runtime = "nodejs";

const KYCSubmitSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'driving_license']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentFrontUrl: z.string().url('Document front URL must be a valid URL'),
  documentBackUrl: z.string().url('Document back URL must be a valid URL').optional(),
  selfieUrl: z.string().url('Selfie URL must be a valid URL'),
});

const kycSubmitLimiter = createRateLimiter(RATE_LIMITS_KYC.SUBMIT);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 KYC submissions per day
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await kycSubmitLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const body = await req.json().catch(() => null);
    const validationResult = KYCSubmitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = validationResult.data;

    // Create KYC record using query function
    const record = await createKycRecord({
      userId: user.id,
      type: 'basic',
      documentType,
      documentNumber,
      documentFrontUrl,
      documentBackUrl: documentBackUrl || undefined,
      selfieUrl,
    });

    return NextResponse.json({ 
      success: true,
      record: {
        id: record.id,
        status: record.status,
      }
    });
  } catch (error) {
    console.error("[kyc/submit] Failed", error);
    return NextResponse.json(
      { error: "Failed to submit KYC request" },
      { status: 500 }
    );
  }
}

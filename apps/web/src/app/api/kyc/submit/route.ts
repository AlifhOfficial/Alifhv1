import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, kycRecord } from "@alifh/database";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs";

const KYCSubmitSchema = z.object({
  documentType: z.enum(['passport', 'national_id', 'driving_license']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentFrontUrl: z.string().url('Document front URL must be a valid URL'),
  documentBackUrl: z.string().url('Document back URL must be a valid URL').optional(),
  selfieUrl: z.string().url('Selfie URL must be a valid URL'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create KYC record
    const [record] = await db
      .insert(kycRecord)
      .values({
        id: `kyc_${createId()}`,
        userId: user.id,
        status: 'pending',
        type: 'individual',
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || null,
        selfieUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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

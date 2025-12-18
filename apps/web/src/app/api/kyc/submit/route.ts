import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, kycRecord } from "@alifh/database";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = body;

    // Validation
    if (!documentType || !documentNumber || !documentFrontUrl || !selfieUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

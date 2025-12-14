import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, kycRecord } from "@alifh/database";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "nodejs";

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
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

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, kycRecord, userProfile, user } from "@alifh/database";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

// Get all KYC requests
export async function GET(req: NextRequest) {
  try {
    const currentUser = await requireSessionUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all KYC records with user info
    const records = await db
      .select({
        id: kycRecord.id,
        userId: kycRecord.userId,
        status: kycRecord.status,
        type: kycRecord.type,
        documentType: kycRecord.documentType,
        documentNumber: kycRecord.documentNumber,
        documentFrontUrl: kycRecord.documentFrontUrl,
        documentBackUrl: kycRecord.documentBackUrl,
        selfieUrl: kycRecord.selfieUrl,
        verifiedBy: kycRecord.verifiedBy,
        verifiedAt: kycRecord.verifiedAt,
        rejectionReason: kycRecord.rejectionReason,
        createdAt: kycRecord.createdAt,
        updatedAt: kycRecord.updatedAt,
        userName: user.name,
        userEmail: user.email,
        userProfileFirstName: userProfile.firstName,
        userProfileLastName: userProfile.lastName,
      })
      .from(kycRecord)
      .leftJoin(user, eq(kycRecord.userId, user.id))
      .leftJoin(userProfile, eq(kycRecord.userId, userProfile.userId))
      .orderBy(kycRecord.createdAt);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[kyc/requests] GET failed", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC requests" },
      { status: 500 }
    );
  }
}

// Approve or reject KYC request
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await requireSessionUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { kycId, action, rejectionReason } = body;

    if (!kycId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Get the KYC record
    const [record] = await db
      .select()
      .from(kycRecord)
      .where(eq(kycRecord.id, kycId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "KYC record not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === 'approve') {
      // Update KYC record status
      await db
        .update(kycRecord)
        .set({
          status: 'approved',
          verifiedBy: currentUser.id,
          verifiedAt: now,
          rejectionReason: null,
          updatedAt: now,
        })
        .where(eq(kycRecord.id, kycId));

      // Update user profile to verified
      await db
        .update(userProfile)
        .set({
          kycVerified: true,
          kycVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(userProfile.userId, record.userId));

      return NextResponse.json({
        success: true,
        message: 'KYC request approved',
      });
    } else {
      // Reject
      await db
        .update(kycRecord)
        .set({
          status: 'rejected',
          verifiedBy: currentUser.id,
          verifiedAt: now,
          rejectionReason: rejectionReason || 'No reason provided',
          updatedAt: now,
        })
        .where(eq(kycRecord.id, kycId));

      return NextResponse.json({
        success: true,
        message: 'KYC request rejected',
      });
    }
  } catch (error) {
    console.error("[kyc/requests] PATCH failed", error);
    return NextResponse.json(
      { error: "Failed to update KYC request" },
      { status: 500 }
    );
  }
}

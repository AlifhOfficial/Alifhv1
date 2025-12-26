import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { 
  getKycRequestsByStatus, 
  getPendingKycRequests,
  getKycRecordById,
  approveKycRecord, 
  rejectKycRecord,
  type KycStatus 
} from "@alifh/database";

export const runtime = "nodejs";
export const revalidate = 30; // Cache for 30s - admin data changes infrequently

const KYCActionSchema = z.object({
  kycId: z.string().min(1, 'KYC ID is required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

// Get all KYC requests (optimized with pagination and filtering)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as KycStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const queryStart = performance.now();

    // Use appropriate query function based on status filter
    const records = status 
      ? await getKycRequestsByStatus(status, Math.min(limit, 100), offset)
      : await getPendingKycRequests(Math.min(limit, 100), offset);

    // Transform records to match expected API response format
    const formattedRecords = records.map(r => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      type: r.type,
      documentType: r.documentType,
      documentNumber: r.documentNumber,
      documentFrontUrl: r.documentFrontUrl,
      documentBackUrl: r.documentBackUrl,
      selfieUrl: r.selfieUrl,
      verifiedBy: r.verifiedBy,
      verifiedAt: r.verifiedAt,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userName: r.user.name,
      userEmail: r.user.email,
      userProfileFirstName: r.profile?.firstName ?? null,
      userProfileLastName: r.profile?.lastName ?? null,
    }));

    const queryTime = performance.now() - queryStart;
    console.log(`[kyc/requests] Query completed in ${queryTime.toFixed(2)}ms - ${formattedRecords.length} results`);

    return NextResponse.json({ 
      records: formattedRecords,
      meta: {
        total: formattedRecords.length,
        limit: Math.min(limit, 100),
        offset,
      }
    });
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
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const validationResult = KYCActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { kycId, action, rejectionReason } = validationResult.data;

    // Get the KYC record to verify it exists
    const record = await getKycRecordById(kycId);

    if (!record) {
      return NextResponse.json({ error: "KYC record not found" }, { status: 404 });
    }

    if (action === 'approve') {
      await approveKycRecord(kycId, currentUser.id);

      return NextResponse.json({
        success: true,
        message: 'KYC request approved',
      });
    } else {
      await rejectKycRecord(kycId, currentUser.id, rejectionReason || 'No reason provided');

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

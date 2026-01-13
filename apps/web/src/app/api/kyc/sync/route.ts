/**
 * KYC Sync Endpoint
 * 
 * Manually sync KYC session data from Didit's API.
 * Uses update-builder - shares logic with webhook handler.
 * 
 * POST /api/kyc/sync - Sync session data from Didit (localhost dev fallback)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionDetails } from '@/lib/kyc/didit-client';
import { checkDuplicateDocument } from '@/lib/kyc/duplicate-check';
import { 
  buildKycRecordUpdate, 
  buildProfileUpdate,
  buildDuplicateRejectionUpdate,
  type DiditSessionData,
} from '@/lib/kyc/update-builder';
import { db, kycRecord, userProfile, eq, invalidateUserProfile, invalidateUserSession } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const record = await db.query.kycRecord.findFirst({
      where: eq(kycRecord.userId, user.id),
      orderBy: (kycRecord, { desc }) => [desc(kycRecord.createdAt)],
    });

    if (!record) {
      return NextResponse.json({ error: 'No KYC record found' }, { status: 404 });
    }

    if (!record.diditSessionId) {
      return NextResponse.json({ error: 'No Didit session ID' }, { status: 400 });
    }

    // Fetch session details from Didit
    let sessionDetails: DiditSessionData;
    try {
      sessionDetails = await getSessionDetails(record.diditSessionId);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch session from Didit',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 502 });
    }

    const status = sessionDetails.status?.toLowerCase();
    const isInReview = status === 'in review' || status === 'in_review';
    const isCompleted = status === 'approved' || status === 'declined';
    
    if (!isCompleted && !isInReview) {
      return NextResponse.json({ 
        status: sessionDetails.status,
        message: 'Session not yet completed or in review',
        sessionId: record.diditSessionId,
      });
    }

    const isApproved = status === 'approved';
    const newStatus = isApproved ? 'approved' : isInReview ? 'pending' : 'rejected';

    // DUPLICATE CHECK
    if (isApproved && sessionDetails.id_verification?.document_number) {
      const isDuplicate = await checkDuplicateDocument(
        sessionDetails.id_verification.document_number, 
        user.id
      );
      
      if (isDuplicate) {
        const { kycUpdate, profileUpdate } = buildDuplicateRejectionUpdate(
          sessionDetails.id_verification.document_number
        );
        
        await Promise.all([
          db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.id, record.id)),
          db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, user.id)),
        ]);
        
        invalidateUserProfile(user.id);
        invalidateUserSession(user.id);
        
        return NextResponse.json({
          success: false,
          error: 'DUPLICATE_DOCUMENT',
          message: 'This document has already been used to verify another account',
        });
      }
    }

    // Build updates using shared builder (skip R2 sync - images stay on S3 for dev)
    const kycUpdate = await buildKycRecordUpdate({
      userId: user.id,
      sessionId: record.diditSessionId,
      sessionData: sessionDetails,
      status: newStatus as 'pending' | 'approved' | 'rejected',
      verifiedBy: isApproved ? 'didit-automated' : undefined,
      skipR2Sync: true,
    });

    const profileUpdate = buildProfileUpdate(
      newStatus as 'pending' | 'approved' | 'rejected',
      kycUpdate.documentExpiryDate
    );

    // Execute updates in parallel
    await Promise.all([
      db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.id, record.id)),
      db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, user.id)),
    ]);

    invalidateUserProfile(user.id);
    invalidateUserSession(user.id);

    return NextResponse.json({
      success: true,
      status: newStatus,
      extractedData: {
        firstName: sessionDetails.id_verification?.first_name,
        lastName: sessionDetails.id_verification?.last_name,
        documentType: sessionDetails.id_verification?.document_type,
        faceMatchScore: sessionDetails.face_match?.score,
        livenessScore: sessionDetails.liveness?.score,
      },
    });

  } catch {
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}

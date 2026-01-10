/**
 * KYC Sync Endpoint
 * 
 * Manually sync KYC session data from Didit's API.
 * Use this to fetch verification data when webhooks can't reach localhost.
 * 
 * POST /api/kyc/sync - Sync session data from Didit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionDetails } from '@/lib/kyc/didit-client';
import { db, kycRecord, userProfile, eq, memoryCache, CacheKeys } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's pending KYC record
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

    console.log(`[KYC/Sync] Syncing session ${record.diditSessionId} for user ${user.id}`);

    // Fetch session details from Didit
    let sessionDetails;
    try {
      sessionDetails = await getSessionDetails(record.diditSessionId);
      console.log(`[KYC/Sync] Session status: ${sessionDetails.status}`);
    } catch (error) {
      console.error(`[KYC/Sync] Failed to fetch session:`, error);
      return NextResponse.json({ 
        error: 'Failed to fetch session from Didit',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 502 });
    }

    // Check if session is completed or in review (both have data available)
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
    // In Review keeps status as pending for admin review
    const newStatus = isApproved ? 'approved' : isInReview ? 'pending' : 'rejected';

    // Extract all verification data
    const idVerification = sessionDetails.id_verification;
    const faceMatch = sessionDetails.face_match;
    const liveness = sessionDetails.liveness;
    const ipAnalysis = sessionDetails.ip_analysis;

    // Build update object
    const updateData: Record<string, any> = {
      status: newStatus,
      diditDecision: sessionDetails,
      diditSessionNumber: sessionDetails.session_number,
      verifiedAt: isApproved ? new Date() : null,
      verifiedBy: isApproved ? 'didit-automated' : isInReview ? null : 'didit-automated',
      rawResponse: JSON.stringify(sessionDetails),
      updatedAt: new Date(),
    };
    
    // Add in-review metadata
    if (isInReview) {
      updateData.metadata = {
        diditStatus: 'In Review',
        inReviewAt: new Date().toISOString(),
        requiresManualReview: true,
      };
    }

    // ID Verification data
    if (idVerification) {
      updateData.documentType = idVerification.document_type;
      updateData.documentNumber = idVerification.document_number;
      updateData.documentCountry = idVerification.issuing_state_name;
      updateData.documentCountryCode = idVerification.issuing_state;
      updateData.documentExpiryDate = idVerification.expiration_date;
      updateData.documentIssueDate = idVerification.date_of_issue;
      updateData.documentFrontUrl = idVerification.front_image;
      updateData.documentBackUrl = idVerification.back_image;
      updateData.selfieUrl = idVerification.portrait_image;
      updateData.extractedFirstName = idVerification.first_name;
      updateData.extractedLastName = idVerification.last_name;
      updateData.extractedFullName = idVerification.full_name;
      updateData.extractedDateOfBirth = idVerification.date_of_birth;
      updateData.extractedAge = idVerification.age;
      updateData.extractedGender = idVerification.gender;
      updateData.extractedNationality = idVerification.nationality;
      
      if (idVerification.warnings?.length) {
        updateData.warnings = idVerification.warnings.map((w: any) => ({
          risk: w.risk,
          description: w.short_description,
        }));
      }
    }

    // Face Match data
    if (faceMatch) {
      updateData.faceMatchScore = faceMatch.score;
      updateData.faceMatchStatus = faceMatch.status;
      updateData.faceSourceImage = faceMatch.source_image;
      updateData.faceTargetImage = faceMatch.target_image;
    }

    // Liveness data
    if (liveness) {
      updateData.livenessScore = liveness.score;
      updateData.livenessStatus = liveness.status;
      updateData.livenessMethod = liveness.method;
      updateData.livenessAgeEstimation = liveness.age_estimation;
      updateData.livenessReferenceImage = liveness.reference_image;
    }

    // IP Analysis data
    if (ipAnalysis) {
      updateData.ipAddress = ipAnalysis.ip_address;
      updateData.ipCity = ipAnalysis.ip_city;
      updateData.ipCountry = ipAnalysis.ip_country;
      updateData.ipCountryCode = ipAnalysis.ip_country_code;
      updateData.ipLatitude = ipAnalysis.latitude;
      updateData.ipLongitude = ipAnalysis.longitude;
      updateData.isVpnOrTor = ipAnalysis.is_vpn_or_tor;
      updateData.isDataCenter = ipAnalysis.is_data_center;
      updateData.devicePlatform = ipAnalysis.platform;
      updateData.deviceBrand = ipAnalysis.device_brand;
      updateData.deviceBrowser = ipAnalysis.browser_family;
    }

    // Rejection reason
    if (!isApproved) {
      const warnings = idVerification?.warnings?.map((w: any) => w.short_description).join(', ');
      updateData.rejectionReason = warnings || 'Verification failed';
    }

    // Update KYC record
    await db
      .update(kycRecord)
      .set(updateData)
      .where(eq(kycRecord.id, record.id));

    console.log(`[KYC/Sync] Updated KYC record with ${Object.keys(updateData).length} fields`);

    // Update user profile with KYC status
    const profileUpdate: Record<string, any> = {
      kycStatus: newStatus,
      updatedAt: new Date(),
    };
    
    if (isApproved) {
      profileUpdate.kycVerified = true;
      profileUpdate.kycVerifiedAt = new Date();
      profileUpdate.trustScore = 80;
    }
    
    await db
      .update(userProfile)
      .set(profileUpdate)
      .where(eq(userProfile.userId, user.id));

    // Invalidate user profile cache so next fetch gets fresh data
    memoryCache.delete(CacheKeys.userProfile(user.id));

    console.log(`[KYC/Sync] User ${user.id} profile updated with kycStatus: ${newStatus}`);

    return NextResponse.json({
      success: true,
      status: newStatus,
      extractedData: {
        firstName: idVerification?.first_name,
        lastName: idVerification?.last_name,
        documentType: idVerification?.document_type,
        faceMatchScore: faceMatch?.score,
        livenessScore: liveness?.score,
      },
    });

  } catch (error) {
    console.error('[KYC/Sync] Error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

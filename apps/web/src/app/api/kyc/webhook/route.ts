/**
 * Didit Webhook Handler
 * 
 * Receives webhooks from Didit when verification status changes.
 * Updates the KYC record and user profile accordingly.
 * 
 * GET /api/kyc/webhook - Callback redirect from Didit with query params
 * POST /api/kyc/webhook - Webhook from Didit with signed payload
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyWebhookSignature, 
  parseWebhookPayload,
  getSessionDetails,
  type DiditWebhookPayload,
} from '@/lib/kyc/didit-client';
import { syncKycImagesToR2 } from '@/lib/kyc/image-sync';
import { db, kycRecord, userProfile, eq, and, memoryCache, CacheKeys } from '@alifh/database';

export const runtime = 'nodejs';

// Disable body parsing - we need raw body for signature verification
export const dynamic = 'force-dynamic';

// In-memory deduplication to prevent parallel processing of the same session
const processingSessionsMap = new Map<string, Promise<any>>();

/**
 * GET handler - Didit callback redirect
 * Called when user completes verification in the iframe
 * Returns HTML that posts message to parent window
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('verificationSessionId');
  const status = searchParams.get('status');

  console.log(`[KYC/Webhook] GET callback: sessionId=${sessionId}, status=${status}`);

  // If no session ID, just return health check
  if (!sessionId) {
    return NextResponse.json({ status: 'ok', service: 'didit-kyc-webhook' });
  }

  // Deduplicate: if this session is already being processed, wait for it
  const existingPromise = processingSessionsMap.get(sessionId);
  if (existingPromise) {
    console.log(`[KYC/Webhook] Session ${sessionId} already being processed, waiting...`);
    try {
      await existingPromise;
    } catch {
      // Ignore errors from existing promise
    }
    // Return success HTML without reprocessing
    return createSuccessHtml(status === 'Approved', sessionId, status || 'approved');
  }

  // Create processing promise and store it
  const processingPromise = processWebhookSession(sessionId, status);
  processingSessionsMap.set(sessionId, processingPromise);

  try {
    const result = await processingPromise;
    return result;
  } finally {
    // Clean up after 5 seconds to allow for race conditions
    setTimeout(() => processingSessionsMap.delete(sessionId), 5000);
  }
}

/**
 * Process the webhook session (extracted for deduplication)
 */
async function processWebhookSession(sessionId: string, status: string | null) {
  try {
    // Find the KYC record by session ID
    const record = await db.query.kycRecord.findFirst({
      where: eq(kycRecord.diditSessionId, sessionId),
    });

    if (!record) {
      console.error(`[KYC/Webhook] No record found for session ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Skip if already processed with same status
    const diditStatus = status?.toLowerCase();
    const isApproving = diditStatus === 'approved';
    const isRejecting = diditStatus === 'declined';
    
    if (record.status === 'approved' && isApproving) {
      console.log(`[KYC/Webhook] Session ${sessionId} already approved, skipping`);
      return createSuccessHtml(true, sessionId, status || 'approved');
    }
    if (record.status === 'rejected' && isRejecting) {
      console.log(`[KYC/Webhook] Session ${sessionId} already rejected, skipping`);
      return createSuccessHtml(false, sessionId, status || 'rejected');
    }

    // Determine status from URL param
    const isInReview = diditStatus === 'in review' || diditStatus === 'in_review';
    const newStatus = diditStatus === 'approved' ? 'approved' : 
                      diditStatus === 'declined' ? 'rejected' : 
                      'pending';
    
    const isApproved = newStatus === 'approved';
    const isRejected = newStatus === 'rejected';
    const isCompleted = isApproved || isRejected;

    console.log(`[KYC/Webhook] Updating record ${record.id} to status: ${newStatus}, isInReview: ${isInReview}`);

    // Fetch session details for completed OR in-review sessions (Didit provides all data)
    let sessionDetails: any = null;
    if (isCompleted || isInReview) {
      try {
        // Add a small delay to ensure Didit has processed the session
        await new Promise(resolve => setTimeout(resolve, 500));
        sessionDetails = await getSessionDetails(sessionId);
        console.log(`[KYC/Webhook] Session details fetched:`, JSON.stringify(sessionDetails, null, 2));
      } catch (error) {
        console.error(`[KYC/Webhook] Failed to fetch session details:`, error);
        // Continue anyway - we'll sync later via the modal
      }
    } else {
      console.log(`[KYC/Webhook] Status is ${newStatus}, skipping session details fetch`);
    }

    // Extract all verification data
    const idVerification = sessionDetails?.id_verification;
    const faceMatch = sessionDetails?.face_match;
    const liveness = sessionDetails?.liveness;
    const ipAnalysis = sessionDetails?.ip_analysis;

    // Sync images to R2 if we have session details
    // Skip if images are already synced (R2 keys don't contain 's3.amazonaws.com')
    let r2Images: any = {};
    const imagesAlreadySynced = record.documentFrontUrl && !record.documentFrontUrl.includes('s3.amazonaws.com');
    
    if (sessionDetails && record.userId && !imagesAlreadySynced) {
      console.log(`[KYC/Webhook] Syncing images to R2 for user ${record.userId}...`);
      r2Images = await syncKycImagesToR2(record.userId, sessionId, {
        documentFrontUrl: idVerification?.front_image,
        documentBackUrl: idVerification?.back_image,
        selfieUrl: idVerification?.portrait_image,
        faceSourceImage: faceMatch?.source_image,
        faceTargetImage: faceMatch?.target_image,
        livenessReferenceImage: liveness?.reference_image,
      });
      console.log(`[KYC/Webhook] Synced images to R2:`, Object.keys(r2Images));
    } else if (imagesAlreadySynced) {
      console.log(`[KYC/Webhook] Images already synced to R2, skipping`);
      // Use existing R2 keys
      r2Images = {
        documentFrontUrl: record.documentFrontUrl,
        documentBackUrl: record.documentBackUrl,
        selfieUrl: record.selfieUrl,
        faceSourceImage: record.faceSourceImage,
        faceTargetImage: record.faceTargetImage,
        livenessReferenceImage: record.livenessReferenceImage,
      };
    }

    // Build update object with all fields
    const updateData: any = {
      status: newStatus,
      diditDecision: { status: status },
      verifiedAt: isApproved ? new Date() : null,
      updatedAt: new Date(),
    };

    // Add document data if available - use R2 keys for images
    if (idVerification) {
      updateData.documentType = idVerification.document_type;
      updateData.documentNumber = idVerification.document_number;
      updateData.documentCountry = idVerification.issuing_state_name || idVerification.issuing_state;
      updateData.documentCountryCode = idVerification.issuing_state;
      updateData.documentExpiryDate = idVerification.expiration_date;
      updateData.documentIssueDate = idVerification.date_of_issue;
      
      // Store R2 keys (permanent) instead of S3 URLs (expire in 4 hours)
      updateData.documentFrontUrl = r2Images.documentFrontUrl || idVerification.front_image;
      updateData.documentBackUrl = r2Images.documentBackUrl || idVerification.back_image;
      updateData.selfieUrl = r2Images.selfieUrl || idVerification.portrait_image;
      
      // Extracted personal data
      updateData.extractedFirstName = idVerification.first_name;
      updateData.extractedLastName = idVerification.last_name;
      updateData.extractedFullName = idVerification.full_name;
      updateData.extractedDateOfBirth = idVerification.date_of_birth;
      updateData.extractedAge = idVerification.age;
      updateData.extractedGender = idVerification.gender;
      updateData.extractedNationality = idVerification.nationality;
      updateData.extractedNationalityCode = idVerification.nationality;
      
      console.log(`[KYC/Webhook] Extracted: ${idVerification.first_name} ${idVerification.last_name}, DOB: ${idVerification.date_of_birth}`);
    }

    // Add face match data
    if (faceMatch) {
      updateData.faceMatchScore = faceMatch.score;
      updateData.faceMatchStatus = faceMatch.status;
      updateData.faceSourceImage = r2Images.faceSourceImage || faceMatch.source_image;
      updateData.faceTargetImage = r2Images.faceTargetImage || faceMatch.target_image;
    }

    // Add liveness data
    if (liveness) {
      updateData.livenessScore = liveness.score;
      updateData.livenessStatus = liveness.status;
      updateData.livenessMethod = liveness.method;
      updateData.livenessAgeEstimation = liveness.age_estimation;
      updateData.livenessReferenceImage = r2Images.livenessReferenceImage || liveness.reference_image;
    }

    // Add IP analysis data
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

    // Store raw response for debugging
    if (sessionDetails) {
      updateData.rawResponse = JSON.stringify(sessionDetails);
    }

    // Update KYC record
    await db
      .update(kycRecord)
      .set(updateData)
      .where(eq(kycRecord.id, record.id));

    // Update user profile based on result
    if (record.userId) {
      if (isApproved) {
        // Parse document expiry date from the stored documentExpiryDate
        let kycExpiryDate: Date | null = null;
        if (updateData.documentExpiryDate) {
          try {
            // Parse the stored date string
            kycExpiryDate = new Date(updateData.documentExpiryDate);
            if (isNaN(kycExpiryDate.getTime())) {
              kycExpiryDate = null;
            }
          } catch (e) {
            console.error(`[KYC/Webhook] Failed to parse documentExpiryDate: ${updateData.documentExpiryDate}`);
          }
        }
        
        await db
          .update(userProfile)
          .set({
            kycVerified: true,
            kycVerifiedAt: new Date(),
            kycExpiryDate: kycExpiryDate,
            kycStatus: 'approved',
            trustScore: 80,
            updatedAt: new Date(),
          })
          .where(eq(userProfile.userId, record.userId));
        console.log(`[KYC/Webhook] User ${record.userId} marked as KYC verified, documentExpiryDate: ${updateData.documentExpiryDate}, parsed: ${kycExpiryDate?.toISOString() ?? 'N/A'}`);
      } else if (isRejected) {
        // Rejected - update kycStatus so user can retry
        await db
          .update(userProfile)
          .set({
            kycStatus: 'rejected',
            updatedAt: new Date(),
          })
          .where(eq(userProfile.userId, record.userId));
        console.log(`[KYC/Webhook] User ${record.userId} KYC rejected`);
      }
      // If In Review - keep status as pending, don't update kycStatus
      // Invalidate user profile cache
      memoryCache.delete(CacheKeys.userProfile(record.userId));
    }

    // Return HTML that posts message to parent window and shows nice UI
    return createSuccessHtml(isApproved, sessionId, newStatus);

  } catch (error) {
    console.error('[KYC/Webhook] Error processing callback:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

/**
 * Create success/failure HTML response for the iframe
 */
function createSuccessHtml(isApproved: boolean, sessionId: string, status: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verification ${isApproved ? 'Complete' : 'Failed'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fafafa;
    }
    .container {
      text-align: center;
      padding: 40px;
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 40px;
    }
    .success { background: #dcfce7; }
    .failed { background: #fee2e2; }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111;
    }
    p {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${isApproved ? 'success' : 'failed'}">
      ${isApproved ? '✓' : '✕'}
    </div>
    <h1>${isApproved ? 'Verified!' : 'Verification Failed'}</h1>
    <p>${isApproved ? 'Closing...' : 'Please try again'}</p>
  </div>
  <script>
    // Post message to parent window
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kyc-complete',
        status: '${status}',
        sessionId: '${sessionId}'
      }, '*');
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await req.text();
    
    // 2. Log all headers for debugging
    console.log('[KYC/Webhook] Headers:', Object.fromEntries(req.headers.entries()));
    
    // 3. Verify webhook signature (Didit uses X-Signature and X-Timestamp headers)
    const signature = req.headers.get('X-Signature') || req.headers.get('x-signature') || '';
    const timestamp = req.headers.get('X-Timestamp') || req.headers.get('x-timestamp') || '';
    const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
    
    if (!isValid) {
      console.error('[KYC/Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. Parse webhook payload
    const body = JSON.parse(rawBody);
    console.log('[KYC/Webhook] Full payload:', JSON.stringify(body, null, 2));
    const payload = parseWebhookPayload(body);
    
    if (!payload) {
      console.error('[KYC/Webhook] Invalid payload');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`[KYC/Webhook] Received webhook_type=${payload.webhook_type}, status=${payload.status} for session ${payload.session_id}`);

    // 5. Handle status updates based on Didit's webhook format
    // Didit sends webhook_type: 'status.updated' or 'data.updated'
    const status = payload.status?.toLowerCase();
    
    if (status === 'approved' || status === 'declined') {
      await handleSessionCompleted(payload);
    } else if (status === 'in review') {
      // "In Review" means Didit needs manual review but all data is available
      await handleSessionInReview(payload);
    } else if (status === 'in progress') {
      await handleSessionStarted(payload);
    } else if (status === 'abandoned' || status === 'expired') {
      await handleSessionFailed(payload);
    } else {
      console.log(`[KYC/Webhook] Unhandled status: ${payload.status}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[KYC/Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle session completed (Approved or Declined)
 * Didit sends all verification data in the decision object
 */
async function handleSessionCompleted(payload: DiditWebhookPayload) {
  const userId = payload.vendor_data;
  const sessionId = payload.session_id;
  const decision = payload.decision;
  
  // Extract all verification data from decision
  const idVerification = decision?.id_verification;
  const faceMatch = decision?.face_match;
  const liveness = decision?.liveness;
  const ipAnalysis = decision?.ip_analysis;

  console.log(`[KYC/Webhook] Session completed for user ${userId}: status=${payload.status}`);
  console.log(`[KYC/Webhook] ID Verification:`, idVerification?.first_name, idVerification?.last_name, idVerification?.document_type);
  console.log(`[KYC/Webhook] Face Match Score:`, faceMatch?.score);
  console.log(`[KYC/Webhook] Liveness Score:`, liveness?.score);

  // Determine the new status
  const status = payload.status?.toLowerCase();
  const newStatus = status === 'approved' ? 'approved' : 'rejected';
  const isApproved = newStatus === 'approved';

  // Sync images from Didit S3 to our R2 private bucket
  console.log(`[KYC/Webhook] Syncing images to R2 for user ${userId}...`);
  const r2Images = await syncKycImagesToR2(userId, sessionId, {
    documentFrontUrl: idVerification?.front_image,
    documentBackUrl: idVerification?.back_image,
    selfieUrl: idVerification?.portrait_image,
    faceSourceImage: faceMatch?.source_image,
    faceTargetImage: faceMatch?.target_image,
    livenessReferenceImage: liveness?.reference_image,
  });
  console.log(`[KYC/Webhook] Synced images to R2:`, Object.keys(r2Images));

  // Build comprehensive update object matching schema exactly
  const updateData: Record<string, any> = {
    status: newStatus,
    diditDecision: decision,
    diditSessionNumber: decision?.session_number,
    verifiedAt: isApproved ? new Date() : null,
    verifiedBy: 'didit-automated',
    rawResponse: JSON.stringify(payload),
    updatedAt: new Date(),
  };

  // ID Verification data - use R2 keys for images, fall back to S3 URLs
  if (idVerification) {
    updateData.documentType = idVerification.document_type;
    updateData.documentNumber = idVerification.document_number;
    updateData.documentCountry = idVerification.issuing_state_name;
    updateData.documentCountryCode = idVerification.issuing_state; // ARE, USA, etc.
    updateData.documentExpiryDate = idVerification.expiration_date;
    updateData.documentIssueDate = idVerification.date_of_issue;
    
    // Store R2 keys (permanent) instead of S3 URLs (expire in 4 hours)
    updateData.documentFrontUrl = r2Images.documentFrontUrl || idVerification.front_image;
    updateData.documentBackUrl = r2Images.documentBackUrl || idVerification.back_image;
    updateData.selfieUrl = r2Images.selfieUrl || idVerification.portrait_image;
    
    // Extracted personal data
    updateData.extractedFirstName = idVerification.first_name;
    updateData.extractedLastName = idVerification.last_name;
    updateData.extractedFullName = idVerification.full_name;
    updateData.extractedDateOfBirth = idVerification.date_of_birth;
    updateData.extractedAge = idVerification.age;
    updateData.extractedGender = idVerification.gender;
    updateData.extractedNationality = idVerification.nationality; // Full country name or code
    updateData.extractedNationalityCode = idVerification.nationality; // IND, USA, etc.
    
    if (idVerification.warnings?.length) {
      updateData.warnings = idVerification.warnings.map((w: any) => ({
        risk: w.risk,
        description: w.short_description || w.description,
      }));
    }
  }

  // Face Match data
  if (faceMatch) {
    updateData.faceMatchScore = faceMatch.score;
    updateData.faceMatchStatus = faceMatch.status; // 'Approved' | 'Declined'
    updateData.faceSourceImage = r2Images.faceSourceImage || faceMatch.source_image;
    updateData.faceTargetImage = r2Images.faceTargetImage || faceMatch.target_image;
    
    // Capture face match warnings (like low similarity)
    if (faceMatch.warnings?.length) {
      updateData.warnings = [
        ...(updateData.warnings || []),
        ...faceMatch.warnings.map((w: any) => ({
          risk: w.risk,
          description: w.short_description || w.description,
          feature: w.feature || 'FACEMATCH',
        })),
      ];
    }
  }

  // Liveness data
  if (liveness) {
    updateData.livenessScore = liveness.score;
    updateData.livenessStatus = liveness.status; // 'Approved' | 'Declined'
    updateData.livenessMethod = liveness.method; // 'PASSIVE' | 'ACTIVE'
    updateData.livenessAgeEstimation = liveness.age_estimation;
    updateData.livenessReferenceImage = r2Images.livenessReferenceImage || liveness.reference_image;
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
    updateData.devicePlatform = ipAnalysis.platform; // 'desktop' | 'mobile'
    updateData.deviceBrand = ipAnalysis.device_brand;
    updateData.deviceBrowser = ipAnalysis.browser_family;
  }

  // Rejection reason - combine all warnings and review comments
  if (!isApproved) {
    const idWarnings = idVerification?.warnings?.map((w: any) => w.short_description || w.description) || [];
    const faceWarnings = faceMatch?.warnings?.map((w: any) => w.short_description || w.description) || [];
    const allWarnings = [...idWarnings, ...faceWarnings];
    
    // Check if there's a manual review with comment
    const reviews = decision?.reviews || [];
    const latestReview = reviews[reviews.length - 1];
    const reviewComment = latestReview?.comment;
    const reviewedBy = latestReview?.user;
    
    // Build rejection reason
    let rejectionReason = allWarnings.join(', ') || 'Verification failed';
    if (reviewComment) {
      rejectionReason = reviewComment;
    }
    
    updateData.rejectionReason = rejectionReason;
    
    // Store who reviewed it
    if (reviewedBy) {
      updateData.verifiedBy = `didit-review:${reviewedBy}`;
    }
  }

  console.log(`[KYC/Webhook] Updating KYC record with ${Object.keys(updateData).length} fields`);

  // Update KYC record - find by session ID for reliability
  const result = await db
    .update(kycRecord)
    .set(updateData)
    .where(eq(kycRecord.diditSessionId, sessionId));

  console.log(`[KYC/Webhook] Updated KYC record for session ${sessionId}`);

  // Update user profile based on result
  if (userId) {
    if (isApproved) {
      // Parse document expiry date from the stored documentExpiryDate
      let kycExpiryDate: Date | null = null;
      if (updateData.documentExpiryDate) {
        try {
          // Parse the stored date string
          kycExpiryDate = new Date(updateData.documentExpiryDate);
          if (isNaN(kycExpiryDate.getTime())) {
            kycExpiryDate = null;
          }
        } catch (e) {
          console.error(`[KYC/Webhook] Failed to parse documentExpiryDate: ${updateData.documentExpiryDate}`);
        }
      }
      
      await db
        .update(userProfile)
        .set({
          kycVerified: true,
          kycVerifiedAt: new Date(),
          kycExpiryDate: kycExpiryDate,
          kycStatus: 'approved',
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, userId));
      console.log(`[KYC/Webhook] User ${userId} KYC approved, documentExpiryDate: ${updateData.documentExpiryDate}, parsed: ${kycExpiryDate?.toISOString() ?? 'N/A'}`);
    } else {
      // Rejected - update kycStatus so user can retry
      await db
        .update(userProfile)
        .set({
          kycStatus: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, userId));
      console.log(`[KYC/Webhook] User ${userId} KYC rejected`);
    }
    // Invalidate user profile cache
    memoryCache.delete(CacheKeys.userProfile(userId));
  }
}

/**
 * Handle session.started event
 * User has begun the verification process
 */
async function handleSessionStarted(payload: DiditWebhookPayload) {
  const sessionId = payload.session_id;
  
  console.log(`[KYC/Webhook] Session started: ${sessionId}`);

  // Update status to show user has started
  await db
    .update(kycRecord)
    .set({
      status: 'pending',
      metadata: {
        startedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(kycRecord.diditSessionId, sessionId));
}

/**
 * Handle session "In Review" status
 * Didit needs manual review but all verification data is already available
 * We save all data but keep status as 'pending' for admin to decide
 */
async function handleSessionInReview(payload: DiditWebhookPayload) {
  const userId = payload.vendor_data;
  const sessionId = payload.session_id;
  const decision = payload.decision;
  
  // Extract all verification data from decision - same as handleSessionCompleted
  const idVerification = decision?.id_verification;
  const faceMatch = decision?.face_match;
  const liveness = decision?.liveness;
  const ipAnalysis = decision?.ip_analysis;

  console.log(`[KYC/Webhook] Session in review for user ${userId}`);
  console.log(`[KYC/Webhook] ID Verification:`, idVerification?.first_name, idVerification?.last_name, idVerification?.document_type);
  console.log(`[KYC/Webhook] Face Match Score:`, faceMatch?.score);
  console.log(`[KYC/Webhook] Liveness Score:`, liveness?.score);
  console.log(`[KYC/Webhook] Warnings:`, faceMatch?.warnings);

  // Sync images from Didit S3 to our R2 private bucket
  console.log(`[KYC/Webhook] Syncing images to R2 for user ${userId}...`);
  const r2Images = await syncKycImagesToR2(userId, sessionId, {
    documentFrontUrl: idVerification?.front_image,
    documentBackUrl: idVerification?.back_image,
    selfieUrl: idVerification?.portrait_image,
    faceSourceImage: faceMatch?.source_image,
    faceTargetImage: faceMatch?.target_image,
    livenessReferenceImage: liveness?.reference_image,
  });
  console.log(`[KYC/Webhook] Synced images to R2:`, Object.keys(r2Images));

  // Build comprehensive update object - save all data but keep status as pending
  const updateData: Record<string, any> = {
    status: 'pending', // Keep pending - admin needs to decide
    diditDecision: decision,
    diditSessionNumber: decision?.session_number,
    rawResponse: JSON.stringify(payload),
    updatedAt: new Date(),
    metadata: {
      diditStatus: 'In Review',
      inReviewAt: new Date().toISOString(),
      requiresManualReview: true,
    },
  };

  // ID Verification data - use R2 keys for images
  if (idVerification) {
    updateData.documentType = idVerification.document_type;
    updateData.documentNumber = idVerification.document_number;
    updateData.documentCountry = idVerification.issuing_state_name;
    updateData.documentCountryCode = idVerification.issuing_state;
    updateData.documentExpiryDate = idVerification.expiration_date;
    updateData.documentIssueDate = idVerification.date_of_issue;
    
    // Store R2 keys (permanent) instead of S3 URLs (expire in 4 hours)
    updateData.documentFrontUrl = r2Images.documentFrontUrl || idVerification.front_image;
    updateData.documentBackUrl = r2Images.documentBackUrl || idVerification.back_image;
    updateData.selfieUrl = r2Images.selfieUrl || idVerification.portrait_image;
    
    // Extracted personal data
    updateData.extractedFirstName = idVerification.first_name;
    updateData.extractedLastName = idVerification.last_name;
    updateData.extractedFullName = idVerification.full_name;
    updateData.extractedDateOfBirth = idVerification.date_of_birth;
    updateData.extractedAge = idVerification.age;
    updateData.extractedGender = idVerification.gender;
    updateData.extractedNationality = idVerification.nationality;
    updateData.extractedNationalityCode = idVerification.nationality;
    
    if (idVerification.warnings?.length) {
      updateData.warnings = idVerification.warnings.map((w: any) => ({
        risk: w.risk,
        description: w.short_description || w.description,
      }));
    }
  }

  // Face match data
  if (faceMatch) {
    updateData.faceMatchScore = faceMatch.score;
    updateData.faceMatchStatus = faceMatch.status;
    updateData.faceSourceImage = r2Images.faceSourceImage || faceMatch.source_image;
    updateData.faceTargetImage = r2Images.faceTargetImage || faceMatch.target_image;
    
    // Capture face match warnings (like low similarity)
    if (faceMatch.warnings?.length) {
      updateData.warnings = [
        ...(updateData.warnings || []),
        ...faceMatch.warnings.map((w: any) => ({
          risk: w.risk,
          description: w.short_description || w.description,
          feature: w.feature,
        })),
      ];
    }
  }

  // Liveness data
  if (liveness) {
    updateData.livenessScore = liveness.score;
    updateData.livenessStatus = liveness.status;
    updateData.livenessMethod = liveness.method;
    updateData.livenessAgeEstimation = liveness.age_estimation;
    updateData.livenessReferenceImage = r2Images.livenessReferenceImage || liveness.reference_image;
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

  console.log(`[KYC/Webhook] Updating KYC record (In Review) with ${Object.keys(updateData).length} fields`);

  // Update KYC record - find by session ID for reliability
  await db
    .update(kycRecord)
    .set(updateData)
    .where(eq(kycRecord.diditSessionId, sessionId));

  console.log(`[KYC/Webhook] Updated KYC record for session ${sessionId} - awaiting admin review`);

  // Update user profile to show in-review status
  if (userId) {
    await db
      .update(userProfile)
      .set({
        kycStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, userId));
    
    // Invalidate user profile cache
    memoryCache.delete(CacheKeys.userProfile(userId));
    console.log(`[KYC/Webhook] User ${userId} profile updated - KYC in review`);
  }
}

/**
 * Handle session.expired or session.abandoned
 */
async function handleSessionFailed(payload: DiditWebhookPayload) {
  const userId = payload.vendor_data;
  const sessionId = payload.session_id;
  const reason = payload.status?.toLowerCase() === 'expired' ? 'Session expired' : 'User abandoned';

  console.log(`[KYC/Webhook] Session failed for user ${userId}: ${reason}`);

  await db
    .update(kycRecord)
    .set({
      status: 'expired',
      rejectionReason: reason,
      rawResponse: JSON.stringify(payload),
      updatedAt: new Date(),
    })
    .where(eq(kycRecord.diditSessionId, sessionId));
}

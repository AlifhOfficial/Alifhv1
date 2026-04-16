/**
 * Didit Webhook Handler
 * 
 * Receives webhooks from Didit when verification status changes.
 * Uses update-builder for all KYC record updates - NO DUPLICATED CODE.
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
import { checkDuplicateDocument } from '@/lib/kyc/duplicate-check';
import { 
  buildKycRecordUpdate, 
  buildProfileUpdate, 
  buildRejectionReason,
  buildDuplicateRejectionUpdate,
  type DiditSessionData,
} from '@/lib/kyc/update-builder';
import { db, kycRecord, userProfile, eq } from '@alifh/database';

export const runtime = 'nodejs';

// In-memory deduplication to prevent parallel processing of the same session
const processingSessionsMap = new Map<string, Promise<any>>();

// ============================================================================
// GET HANDLER - Didit iframe callback redirect
// ============================================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('verificationSessionId');
  const status = searchParams.get('status');

  if (!sessionId) {
    return NextResponse.json({ status: 'ok', service: 'didit-kyc-webhook' });
  }

  // Deduplicate: if already processing, wait for it
  const existingPromise = processingSessionsMap.get(sessionId);
  if (existingPromise) {
    try { await existingPromise; } catch {}
    return createResultHtml(status === 'Approved' ? 'approved' : 'pending', sessionId);
  }

  const processingPromise = processCallbackSession(sessionId, status);
  processingSessionsMap.set(sessionId, processingPromise);

  try {
    return await processingPromise;
  } finally {
    setTimeout(() => processingSessionsMap.delete(sessionId), 5000);
  }
}

/**
 * Process the GET callback session
 */
async function processCallbackSession(sessionId: string, status: string | null) {
  try {
    const record = await db.query.kycRecord.findFirst({
      where: eq(kycRecord.diditSessionId, sessionId),
    });

    if (!record) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const diditStatus = status?.toLowerCase();
    
    // Skip if already processed
    if (record.status === 'approved' && diditStatus === 'approved') {
      return createResultHtml('approved', sessionId);
    }
    if (record.status === 'rejected' && diditStatus === 'declined') {
      return createResultHtml('rejected', sessionId);
    }

    // Determine new status
    const newStatus = diditStatus === 'approved' ? 'approved' : 
                      diditStatus === 'declined' ? 'rejected' : 'pending';
    const isApproved = newStatus === 'approved';
    const isRejected = newStatus === 'rejected';

    // Fetch session details
    let sessionDetails: DiditSessionData | null = null;
    if (isApproved || isRejected || diditStatus === 'in review' || diditStatus === 'in_review') {
      try {
        sessionDetails = await getSessionDetails(sessionId);
      } catch {
        // Continue with null sessionDetails
      }
    }

    if (!sessionDetails || !record.userId) {
      return createResultHtml(newStatus, sessionId);
    }

    // Check for existing R2 images
    const imagesAlreadySynced = !!record.documentFrontUrl && !isLegacyS3ImageUrl(record.documentFrontUrl);
    const existingR2Images = imagesAlreadySynced ? {
      documentFrontUrl: record.documentFrontUrl,
      documentBackUrl: record.documentBackUrl,
      selfieUrl: record.selfieUrl,
      faceSourceImage: record.faceSourceImage,
      faceTargetImage: record.faceTargetImage,
      livenessReferenceImage: record.livenessReferenceImage,
    } : {};

    // DUPLICATE CHECK
    if (isApproved && sessionDetails.id_verification?.document_number) {
      const isDuplicate = await checkDuplicateDocument(
        sessionDetails.id_verification.document_number, 
        record.userId
      );
      
      if (isDuplicate) {
        const { kycUpdate, profileUpdate } = buildDuplicateRejectionUpdate(
          sessionDetails.id_verification.document_number
        );
        
        await Promise.all([
          db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.id, record.id)),
          db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, record.userId)),
        ]);
        
        return createResultHtml('duplicate', sessionId);
      }
    }

    // Build updates using shared builder
    const kycUpdate = await buildKycRecordUpdate({
      userId: record.userId,
      sessionId,
      sessionData: sessionDetails,
      status: newStatus as 'pending' | 'approved' | 'rejected',
      skipR2Sync: imagesAlreadySynced,
      existingR2Images,
    });

    // Add rejection reason if declined
    let rejectionReason: string | undefined;
    if (isRejected && sessionDetails) {
      const { reason } = buildRejectionReason(sessionDetails);
      kycUpdate.rejectionReason = reason;
      rejectionReason = reason;
    }

    const profileUpdate = (isApproved || isRejected) 
      ? buildProfileUpdate(newStatus as 'approved' | 'rejected', kycUpdate.documentExpiryDate)
      : null;

    // Execute updates in parallel
    const dbPromises: Promise<any>[] = [
      db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.id, record.id)),
    ];
    if (profileUpdate) {
      dbPromises.push(
        db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, record.userId))
      );
    }
    await Promise.all(dbPromises);

    return createResultHtml(newStatus, sessionId, rejectionReason);

  } catch {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// ============================================================================
// POST HANDLER - Didit webhook
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    const signature = req.headers.get('X-Signature') || req.headers.get('x-signature') || '';
    const timestamp = req.headers.get('X-Timestamp') || req.headers.get('x-timestamp') || '';
    const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const payload = parseWebhookPayload(body);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const status = payload.status?.toLowerCase();
    
    if (status === 'approved' || status === 'declined') {
      await handleSessionCompleted(payload);
    } else if (status === 'in review') {
      await handleSessionInReview(payload);
    } else if (status === 'in progress') {
      await handleSessionStarted(payload);
    } else if (status === 'abandoned' || status === 'expired') {
      await handleSessionFailed(payload);
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle session completed (Approved or Declined)
 */
async function handleSessionCompleted(payload: DiditWebhookPayload) {
  const userId = payload.vendor_data;
  const sessionId = payload.session_id;
  const status = payload.status?.toLowerCase();
  const newStatus = status === 'approved' ? 'approved' : 'rejected';
  const isApproved = newStatus === 'approved';

  // Convert payload.decision to DiditSessionData format
  const sessionData: DiditSessionData = {
    ...payload.decision,
    status: payload.status,
    session_number: payload.decision?.session_number,
  };

  // DUPLICATE CHECK - CRITICAL: Must check before approving
  if (isApproved && userId && sessionData.id_verification?.document_number) {
    const isDuplicate = await checkDuplicateDocument(
      sessionData.id_verification.document_number,
      userId
    );
    
    if (isDuplicate) {
      const { kycUpdate, profileUpdate } = buildDuplicateRejectionUpdate(
        sessionData.id_verification.document_number
      );
      
      await Promise.all([
        db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.diditSessionId, sessionId)),
        db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, userId)),
      ]);
      
      return; // Exit early - don't process as approved
    }
  }

  // Build KYC update using shared builder
  const kycUpdate = await buildKycRecordUpdate({
    userId,
    sessionId,
    sessionData,
    status: newStatus,
    verifiedBy: 'didit-automated',
  });

  // Add rejection reason if declined
  if (!isApproved) {
    const { reason, verifiedBy } = buildRejectionReason(sessionData);
    kycUpdate.rejectionReason = reason;
    if (verifiedBy) kycUpdate.verifiedBy = verifiedBy;
  }

  // Build profile update
  const profileUpdate = buildProfileUpdate(newStatus, kycUpdate.documentExpiryDate);

  // Execute updates in parallel
  await Promise.all([
    db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.diditSessionId, sessionId)),
    userId ? db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, userId)) : Promise.resolve(),
  ]);

}

/**
 * Handle session "In Review" status
 */
async function handleSessionInReview(payload: DiditWebhookPayload) {
  const userId = payload.vendor_data;
  const sessionId = payload.session_id;

  const sessionData: DiditSessionData = {
    ...payload.decision,
    status: payload.status,
    session_number: payload.decision?.session_number,
  };

  const kycUpdate = await buildKycRecordUpdate({
    userId,
    sessionId,
    sessionData,
    status: 'pending',
    skipR2Sync: true,
  });

  const profileUpdate = buildProfileUpdate('pending');

  await Promise.all([
    db.update(kycRecord).set(kycUpdate).where(eq(kycRecord.diditSessionId, sessionId)),
    userId ? db.update(userProfile).set(profileUpdate).where(eq(userProfile.userId, userId)) : Promise.resolve(),
  ]);

}

/**
 * Handle session started
 */
async function handleSessionStarted(payload: DiditWebhookPayload) {
  await db.update(kycRecord).set({
    status: 'pending',
    updatedAt: new Date(),
  }).where(eq(kycRecord.diditSessionId, payload.session_id));
}

/**
 * Handle session expired/abandoned
 */
async function handleSessionFailed(payload: DiditWebhookPayload) {
  const reason = payload.status?.toLowerCase() === 'expired' ? 'Session expired' : 'User abandoned';

  await db.update(kycRecord).set({
    status: 'expired',
    rejectionReason: reason,
    updatedAt: new Date(),
  }).where(eq(kycRecord.diditSessionId, payload.session_id));
}

// ============================================================================
// HTML RESPONSE GENERATORS
// ============================================================================

type ResultStatus = 'approved' | 'rejected' | 'pending' | 'duplicate';

function isLegacyS3ImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === 's3.amazonaws.com' || hostname.endsWith('.s3.amazonaws.com');
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function createResultHtml(status: ResultStatus, sessionId: string, reason?: string) {
  const config = {
    approved: { icon: '✓', title: 'Verified!', message: 'Your identity has been verified', bgClass: 'success', btnClass: 'btn-success' },
    rejected: { icon: '✕', title: 'Verification Failed', message: reason || 'Please try again with a valid ID', bgClass: 'failed', btnClass: 'btn-failed' },
    pending: { icon: '⏳', title: 'Under Review', message: 'We\'ll notify you when complete', bgClass: 'pending', btnClass: 'btn-pending' },
    duplicate: { icon: '⚠️', title: 'Document Already Used', message: 'This ID is registered to another account', bgClass: 'failed', btnClass: 'btn-failed' },
  }[status];

  const postMessageStatus = status === 'duplicate' ? 'duplicate' : status;
  
  // Build error payload for postMessage
  let errorPayload: Record<string, string> = {};
  if (status === 'duplicate') {
    errorPayload = {
      error: 'DUPLICATE_DOCUMENT',
      reason: 'This document has already been used to verify another account',
    };
  } else if (status === 'rejected' && reason) {
    errorPayload = {
      error: 'VERIFICATION_FAILED',
      reason,
    };
  }

  const postMessagePayload = serializeForInlineScript({
    type: 'kyc-complete',
    status: postMessageStatus,
    sessionId,
    ...errorPayload,
  });

  const safeTitle = escapeHtml(config.title);
  const safeMessage = escapeHtml(config.message);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verification ${safeTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fafafa;
    }
    .container { text-align: center; padding: 40px; max-width: 320px; }
    .icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 36px;
    }
    .success { background: #dcfce7; }
    .failed { background: #fee2e2; }
    .pending { background: #fef3c7; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 6px; color: #111; }
    p { color: #666; font-size: 14px; line-height: 1.4; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-success { background: #22c55e; color: white; }
    .btn-failed { background: #ef4444; color: white; }
    .btn-pending { background: #f59e0b; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${config.bgClass}">${config.icon}</div>
    <h1>${safeTitle}</h1>
    <p>${safeMessage}</p>
    <button class="btn ${config.btnClass}" onclick="closeModal()">Close</button>
  </div>
  <script>
    const postMessagePayload = ${postMessagePayload};

    // Notify parent modal of result
    function notifyParent() {
      if (window.parent !== window) {
        window.parent.postMessage(postMessagePayload, '*');
      }
    }
    
    // Close button handler - notify parent again to ensure modal closes
    function closeModal() {
      notifyParent();
    }
    
    // Auto-notify on load
    notifyParent();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      // Allow this response to be framed by Didit verification and our own modal iframe
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors *;",
    },
  });
}

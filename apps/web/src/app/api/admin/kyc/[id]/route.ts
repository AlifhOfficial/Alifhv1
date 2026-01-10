/**
 * Admin KYC Detail API
 * 
 * GET /api/admin/kyc/[id] - Get single KYC record details with signed image URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getKycRecordFull } from '@alifh/database';
import { getKycImageSignedUrl } from '@/lib/kyc/image-sync';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Check if a URL is an R2 key (not a full URL)
 */
function isR2Key(url: string | null): boolean {
  if (!url) return false;
  // R2 keys start with 'kyc/' and don't contain 'http'
  return url.startsWith('kyc/') && !url.includes('http');
}

/**
 * Get signed URL for an R2 key, or return the original URL if it's already a full URL
 */
async function getSignedUrlIfNeeded(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (isR2Key(url)) {
    return await getKycImageSignedUrl(url, 3600); // 1 hour expiry
  }
  return url; // Already a full URL (legacy S3 URL)
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const record = await getKycRecordFull(id);

    if (!record) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    // Generate signed URLs for all images in parallel
    const [
      signedDocumentFrontUrl,
      signedDocumentBackUrl,
      signedSelfieUrl,
      signedFaceSourceImage,
      signedFaceTargetImage,
      signedLivenessReferenceImage,
    ] = await Promise.all([
      getSignedUrlIfNeeded(record.documentFrontUrl),
      getSignedUrlIfNeeded(record.documentBackUrl),
      getSignedUrlIfNeeded(record.selfieUrl),
      getSignedUrlIfNeeded(record.faceSourceImage),
      getSignedUrlIfNeeded(record.faceTargetImage),
      getSignedUrlIfNeeded(record.livenessReferenceImage),
    ]);

    return NextResponse.json({ 
      record: {
        ...record,
        signedDocumentFrontUrl,
        signedDocumentBackUrl,
        signedSelfieUrl,
        signedFaceSourceImage,
        signedFaceTargetImage,
        signedLivenessReferenceImage,
      }
    });
  } catch (error) {
    console.error('[Admin/KYC] Get detail failed:', error);
    return NextResponse.json({ error: 'Failed to load KYC record' }, { status: 500 });
  }
}

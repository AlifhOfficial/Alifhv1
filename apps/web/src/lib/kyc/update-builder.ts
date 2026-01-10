/**
 * KYC Update Data Builder
 * 
 * SINGLE SOURCE OF TRUTH for building KYC record updates.
 * All webhook handlers use this - no duplicated field mapping.
 * 
 * @module lib/kyc/update-builder
 */

import { encryptSensitiveData } from './encryption';
import { hashDocumentNumber } from './duplicate-check';
import { syncKycImagesToR2 } from './image-sync';

export interface DiditSessionData {
  status?: string;
  session_number?: number;
  id_verification?: {
    document_type?: string;
    document_number?: string;
    issuing_state_name?: string;
    issuing_state?: string;
    expiration_date?: string;
    date_of_issue?: string;
    front_image?: string;
    back_image?: string;
    portrait_image?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    date_of_birth?: string;
    age?: number;
    gender?: string;
    nationality?: string;
    warnings?: Array<{ risk: string; short_description?: string; description?: string }>;
  };
  face_match?: {
    score?: number;
    status?: string;
    source_image?: string;
    target_image?: string;
    warnings?: Array<{ risk: string; short_description?: string; description?: string; feature?: string }>;
  };
  liveness?: {
    score?: number;
    status?: string;
    method?: string;
    age_estimation?: number;
    reference_image?: string;
  };
  ip_analysis?: {
    ip_address?: string;
    ip_city?: string;
    ip_country?: string;
    ip_country_code?: string;
    latitude?: number;
    longitude?: number;
    is_vpn_or_tor?: boolean;
    is_data_center?: boolean;
    platform?: string;
    device_brand?: string;
    browser_family?: string;
  };
  reviews?: Array<{ comment?: string; user?: string }>;
}

interface ImageUrls {
  documentFrontUrl?: string | null;
  documentBackUrl?: string | null;
  selfieUrl?: string | null;
  faceSourceImage?: string | null;
  faceTargetImage?: string | null;
  livenessReferenceImage?: string | null;
}

interface BuildOptions {
  userId: string;
  sessionId: string;
  sessionData: DiditSessionData;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  verifiedBy?: string;
  skipR2Sync?: boolean;
  existingR2Images?: ImageUrls;
}

/**
 * Build complete KYC record update from Didit session data.
 * Handles encryption, hashing, R2 sync, and all field mapping in one place.
 */
export async function buildKycRecordUpdate({
  userId,
  sessionId,
  sessionData,
  status,
  verifiedBy,
  skipR2Sync = false,
  existingR2Images = {},
}: BuildOptions): Promise<Record<string, any>> {
  const { id_verification, face_match, liveness, ip_analysis } = sessionData;
  const isApproved = status === 'approved';

  // Sync images to R2 if not skipped
  let r2Images = existingR2Images;
  if (!skipR2Sync && userId) {
    r2Images = await syncKycImagesToR2(userId, sessionId, {
      documentFrontUrl: id_verification?.front_image,
      documentBackUrl: id_verification?.back_image,
      selfieUrl: id_verification?.portrait_image,
      faceSourceImage: face_match?.source_image,
      faceTargetImage: face_match?.target_image,
      livenessReferenceImage: liveness?.reference_image,
    });
  }

  // Base update data
  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date(),
  };

  // Session metadata (diditDecision is the structured JSON; rawResponse removed as redundant)
  if (sessionData) updateData.diditDecision = sessionData;
  if (sessionData.session_number) updateData.diditSessionNumber = sessionData.session_number;
  if (verifiedBy) updateData.verifiedBy = verifiedBy;
  if (isApproved) updateData.verifiedAt = new Date();

  // Collect all warnings
  const allWarnings: Array<{ risk: string; description: string; feature?: string }> = [];

  // ID Verification data
  if (id_verification) {
    updateData.documentType = id_verification.document_type;
    
    if (id_verification.document_number) {
      updateData.documentNumber = encryptSensitiveData(id_verification.document_number);
      updateData.documentHash = hashDocumentNumber(id_verification.document_number);
    }
    
    updateData.documentCountry = id_verification.issuing_state_name || id_verification.issuing_state;
    updateData.documentCountryCode = id_verification.issuing_state;
    updateData.documentExpiryDate = id_verification.expiration_date;
    updateData.documentIssueDate = id_verification.date_of_issue;
    
    // Prefer R2 URLs over temporary S3 URLs
    updateData.documentFrontUrl = r2Images.documentFrontUrl || id_verification.front_image;
    updateData.documentBackUrl = r2Images.documentBackUrl || id_verification.back_image;
    updateData.selfieUrl = r2Images.selfieUrl || id_verification.portrait_image;
    
    // Extracted personal data
    updateData.extractedFirstName = id_verification.first_name;
    updateData.extractedLastName = id_verification.last_name;
    updateData.extractedFullName = id_verification.full_name;
    updateData.extractedDateOfBirth = id_verification.date_of_birth;
    updateData.extractedAge = id_verification.age;
    updateData.extractedGender = id_verification.gender;
    updateData.extractedNationality = id_verification.nationality;

    // Collect ID warnings
    if (id_verification.warnings?.length) {
      allWarnings.push(...id_verification.warnings.map(w => ({
        risk: w.risk,
        description: w.short_description || w.description || '',
      })));
    }
  }

  // Face match data
  if (face_match) {
    updateData.faceMatchScore = face_match.score;
    updateData.faceMatchStatus = face_match.status;
    updateData.faceSourceImage = r2Images.faceSourceImage || face_match.source_image;
    updateData.faceTargetImage = r2Images.faceTargetImage || face_match.target_image;

    if (face_match.warnings?.length) {
      allWarnings.push(...face_match.warnings.map(w => ({
        risk: w.risk,
        description: w.short_description || w.description || '',
        feature: w.feature || 'FACEMATCH',
      })));
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

  // IP analysis data
  if (ip_analysis) {
    updateData.ipAddress = ip_analysis.ip_address;
    updateData.ipCity = ip_analysis.ip_city;
    updateData.ipCountry = ip_analysis.ip_country;
    updateData.ipCountryCode = ip_analysis.ip_country_code;
    updateData.ipLatitude = ip_analysis.latitude;
    updateData.ipLongitude = ip_analysis.longitude;
    updateData.isVpnOrTor = ip_analysis.is_vpn_or_tor;
    updateData.isDataCenter = ip_analysis.is_data_center;
    updateData.devicePlatform = ip_analysis.platform;
    updateData.deviceBrand = ip_analysis.device_brand;
    updateData.deviceBrowser = ip_analysis.browser_family;
  }

  // Store collected warnings
  if (allWarnings.length > 0) {
    updateData.warnings = allWarnings;
  }

  return updateData;
}

/**
 * Build profile update for KYC status changes
 */
export function buildProfileUpdate(
  status: 'approved' | 'rejected' | 'pending',
  documentExpiryDate?: string | null
): Record<string, any> {
  const update: Record<string, any> = { updatedAt: new Date() };

  if (status === 'approved') {
    update.kycVerified = true;
    update.kycVerifiedAt = new Date();
    update.kycStatus = 'approved';
    update.trustScore = 80;
    
    if (documentExpiryDate) {
      try {
        const expiry = new Date(documentExpiryDate);
        if (!isNaN(expiry.getTime())) update.kycExpiryDate = expiry;
      } catch {}
    }
  } else if (status === 'rejected') {
    update.kycStatus = 'rejected';
    update.kycVerified = false;
  } else {
    update.kycStatus = 'pending';
  }

  return update;
}

/**
 * Build rejection reason from warnings and reviews
 */
export function buildRejectionReason(
  sessionData: DiditSessionData
): { reason: string; verifiedBy?: string } {
  const idWarnings = sessionData.id_verification?.warnings?.map(w => w.short_description || w.description || '') || [];
  const faceWarnings = sessionData.face_match?.warnings?.map(w => w.short_description || w.description || '') || [];
  const allWarnings = [...idWarnings, ...faceWarnings].filter(Boolean);

  const latestReview = sessionData.reviews?.[sessionData.reviews.length - 1];
  const reason = latestReview?.comment || allWarnings.join(', ') || 'Verification failed';
  const verifiedBy = latestReview?.user ? `didit-review:${latestReview.user}` : undefined;

  return { reason, verifiedBy };
}

/**
 * Build updates for duplicate document rejection.
 * SINGLE SOURCE OF TRUTH - used by webhook and sync routes.
 * 
 * Returns both kycRecord and userProfile updates ready for Promise.all()
 */
export function buildDuplicateRejectionUpdate(
  documentNumber: string
): { kycUpdate: Record<string, any>; profileUpdate: Record<string, any> } {
  const kycUpdate = {
    status: 'rejected',
    rejectionReason: 'DUPLICATE_DOCUMENT',
    documentNumber: encryptSensitiveData(documentNumber),
    documentHash: hashDocumentNumber(documentNumber),
    updatedAt: new Date(),
  };

  const profileUpdate = {
    kycStatus: 'rejected',
    kycVerified: false,
    trustScore: 0,
    updatedAt: new Date(),
  };

  return { kycUpdate, profileUpdate };
}

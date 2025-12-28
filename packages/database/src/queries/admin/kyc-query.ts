/**
 * KYC Queries - Production
 * 
 * KYC record management for user verification.
 * Handles KYC submission, approval, and rejection workflows.
 * 
 * @module queries/admin/kyc-query
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, desc, and, sql, isNull } from 'drizzle-orm';
import { db } from '../../dbclient';
import { kycRecord, userProfile } from '../../schema/profile';
import { user } from '../../schema/auth';

const KYC_ID_PREFIX = 'kyc_';
const makeKycId = () => `${KYC_ID_PREFIX}${createId()}`;

// Types
export type KycRecord = typeof kycRecord.$inferSelect;
export type KycRecordInsert = typeof kycRecord.$inferInsert;
export type KycStatus = 'pending' | 'approved' | 'rejected';
export type KycType = 'basic' | 'full';

export interface CreateKycRecordData {
  userId: string;
  type: KycType;
  documentType?: string;
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  metadata?: Record<string, any>;
}

export interface KycRecordWithUser extends KycRecord {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  profile?: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
}

/**
 * Get KYC record by ID
 */
export const getKycRecordById = async (id: string): Promise<KycRecord | null> => {
  const [result] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.id, id))
    .limit(1);
    
  return result || null;
};

/**
 * Get latest KYC record for a user
 */
export const getLatestKycRecordForUser = async (userId: string): Promise<KycRecord | null> => {
  const [result] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.userId, userId))
    .orderBy(desc(kycRecord.createdAt))
    .limit(1);
    
  return result || null;
};

/**
 * Get all KYC records for a user
 */
export const getKycRecordsForUser = async (userId: string): Promise<KycRecord[]> => {
  return await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.userId, userId))
    .orderBy(desc(kycRecord.createdAt));
};

/**
 * Create a new KYC record (user submits KYC)
 */
export const createKycRecord = async (data: CreateKycRecordData): Promise<KycRecord> => {
  const [result] = await db
    .insert(kycRecord)
    .values({
      id: makeKycId(),
      userId: data.userId,
      status: 'pending',
      type: data.type,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentFrontUrl: data.documentFrontUrl,
      documentBackUrl: data.documentBackUrl,
      selfieUrl: data.selfieUrl,
      metadata: data.metadata,
    })
    .returning();
    
  return result;
};

/**
 * Get pending KYC requests with user info (for admin)
 */
export const getPendingKycRequests = async (
  limit: number = 50, 
  offset: number = 0
): Promise<KycRecordWithUser[]> => {
  const results = await db
    .select({
      kyc: kycRecord,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
      },
    })
    .from(kycRecord)
    .innerJoin(user, eq(kycRecord.userId, user.id))
    .leftJoin(userProfile, eq(kycRecord.userId, userProfile.userId))
    .where(eq(kycRecord.status, 'pending'))
    .orderBy(desc(kycRecord.createdAt))
    .limit(limit)
    .offset(offset);
    
  return results.map(r => ({
    ...r.kyc,
    user: r.user,
    profile: r.profile,
  }));
};

/**
 * Get KYC requests by status with user info (for admin)
 */
export const getKycRequestsByStatus = async (
  status: KycStatus,
  limit: number = 50,
  offset: number = 0
): Promise<KycRecordWithUser[]> => {
  const results = await db
    .select({
      kyc: kycRecord,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
      },
    })
    .from(kycRecord)
    .innerJoin(user, eq(kycRecord.userId, user.id))
    .leftJoin(userProfile, eq(kycRecord.userId, userProfile.userId))
    .where(eq(kycRecord.status, status))
    .orderBy(desc(kycRecord.createdAt))
    .limit(limit)
    .offset(offset);
    
  return results.map(r => ({
    ...r.kyc,
    user: r.user,
    profile: r.profile,
  }));
};

/**
 * Get count of KYC requests by status
 */
export const getKycRequestsCount = async (status?: KycStatus): Promise<number> => {
  const whereClause = status ? eq(kycRecord.status, status) : undefined;
  
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kycRecord)
    .where(whereClause);
    
  return result?.count ?? 0;
};

/**
 * Approve a KYC request (admin action)
 * Uses transaction for atomic update of both KYC record and user profile
 */
export const approveKycRecord = async (
  id: string, 
  verifiedBy: string,
  expiresAt?: Date
): Promise<KycRecord | null> => {
  return await db.transaction(async (tx) => {
    const now = new Date();
    
    // Get KYC record within transaction
    const [existingKyc] = await tx
      .select()
      .from(kycRecord)
      .where(eq(kycRecord.id, id))
      .limit(1);
      
    if (!existingKyc) return null;
    
    // Update KYC record and user profile atomically
    const [[result]] = await Promise.all([
      tx.update(kycRecord)
        .set({
          status: 'approved',
          verifiedBy,
          verifiedAt: now,
          expiresAt: expiresAt ?? null,
          updatedAt: now,
        })
        .where(eq(kycRecord.id, id))
        .returning(),
        
      tx.update(userProfile)
        .set({
          kycVerified: true,
          kycVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(userProfile.userId, existingKyc.userId)),
    ]);
    
    return result ?? null;
  });
};

/**
 * Reject a KYC request (admin action)
 * Uses transaction for atomic update
 */
export const rejectKycRecord = async (
  id: string,
  verifiedBy: string,
  rejectionReason: string
): Promise<KycRecord | null> => {
  return await db.transaction(async (tx) => {
    const now = new Date();
    
    // Get KYC record within transaction
    const [existingKyc] = await tx
      .select()
      .from(kycRecord)
      .where(eq(kycRecord.id, id))
      .limit(1);
      
    if (!existingKyc) return null;
    
    // Update KYC record and user profile atomically
    const [[result]] = await Promise.all([
      tx.update(kycRecord)
        .set({
          status: 'rejected',
          verifiedBy,
          verifiedAt: now,
          rejectionReason,
          updatedAt: now,
        })
        .where(eq(kycRecord.id, id))
        .returning(),
        
      tx.update(userProfile)
        .set({
          kycVerified: false,
          updatedAt: now,
        })
        .where(eq(userProfile.userId, existingKyc.userId)),
    ]);
    
    return result ?? null;
  });
};

/**
 * Check if user has pending KYC request
 */
export const hasPendingKycRequest = async (userId: string): Promise<boolean> => {
  const [result] = await db
    .select({ id: kycRecord.id })
    .from(kycRecord)
    .where(
      and(
        eq(kycRecord.userId, userId),
        eq(kycRecord.status, 'pending')
      )
    )
    .limit(1);
    
  return !!result;
};

/**
 * Check if user is KYC verified
 */
export const isUserKycVerified = async (userId: string): Promise<boolean> => {
  const [result] = await db
    .select({ kycVerified: userProfile.kycVerified })
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);
    
  return result?.kycVerified ?? false;
};

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
import { memoryCache, CacheKeys } from '../../caches/memory-cache';

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
  // Didit integration fields
  diditSessionId?: string;
  diditSessionUrl?: string;
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
      // Didit integration fields
      diditSessionId: data.diditSessionId,
      diditSessionUrl: data.diditSessionUrl,
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
 * Note: Neon HTTP driver doesn't support transactions, so we use sequential queries
 */
export const approveKycRecord = async (
  id: string, 
  verifiedBy: string,
  expiresAt?: Date
): Promise<KycRecord | null> => {
  const now = new Date();
  
  // Get KYC record first
  const [existingKyc] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.id, id))
    .limit(1);
    
  if (!existingKyc) return null;
  
  // Update KYC record and user profile in parallel
  const [[result]] = await Promise.all([
    db.update(kycRecord)
      .set({
        status: 'approved',
        verifiedBy,
        verifiedAt: now,
        expiresAt: expiresAt ?? null,
        updatedAt: now,
      })
      .where(eq(kycRecord.id, id))
      .returning(),
      
    db.update(userProfile)
      .set({
        kycVerified: true,
        kycVerifiedAt: now,
        kycStatus: 'approved',
        trustScore: 80,
        updatedAt: now,
      })
      .where(eq(userProfile.userId, existingKyc.userId)),
  ]);
  
  // Invalidate user profile cache
  memoryCache.delete(CacheKeys.userProfile(existingKyc.userId));
  
  return result ?? null;
};

/**
 * Reject a KYC request (admin action)
 * Note: Neon HTTP driver doesn't support transactions, so we use sequential queries
 */
export const rejectKycRecord = async (
  id: string,
  verifiedBy: string,
  rejectionReason: string
): Promise<KycRecord | null> => {
  const now = new Date();
  
  // Get KYC record first
  const [existingKyc] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.id, id))
    .limit(1);
    
  if (!existingKyc) return null;
  
  // Update KYC record and user profile in parallel
  const [[result]] = await Promise.all([
    db.update(kycRecord)
      .set({
        status: 'rejected',
        verifiedBy,
        verifiedAt: now,
        rejectionReason,
        updatedAt: now,
      })
      .where(eq(kycRecord.id, id))
      .returning(),
      
    db.update(userProfile)
      .set({
        kycVerified: false,
        kycStatus: 'rejected',
        updatedAt: now,
      })
      .where(eq(userProfile.userId, existingKyc.userId)),
  ]);
  
  // Invalidate user profile cache
  memoryCache.delete(CacheKeys.userProfile(existingKyc.userId));
  
  return result ?? null;
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

/**
 * Get comprehensive KYC record with all Didit fields for admin review
 */
export interface KycRecordFull extends KycRecord {
  userName: string | null;
  userEmail: string;
  userAvatar: string | null;
}

export const getKycRecordFull = async (id: string): Promise<KycRecordFull | null> => {
  const [result] = await db
    .select({
      kyc: kycRecord,
      userName: user.name,
      userEmail: user.email,
      userAvatar: userProfile.avatar,
    })
    .from(kycRecord)
    .innerJoin(user, eq(user.id, kycRecord.userId))
    .leftJoin(userProfile, eq(userProfile.userId, kycRecord.userId))
    .where(eq(kycRecord.id, id))
    .limit(1);

  if (!result) return null;

  return {
    ...result.kyc,
    userName: result.userName,
    userEmail: result.userEmail,
    userAvatar: result.userAvatar,
  };
};

/**
 * Get all KYC records with full Didit data for admin list view
 */
export const getAllKycRecordsFull = async (options: {
  status?: KycStatus | 'all';
  limit?: number;
  offset?: number;
}): Promise<{ records: KycRecordFull[]; total: number }> => {
  const { status = 'all', limit = 20, offset = 0 } = options;
  
  const whereCondition = status !== 'all' 
    ? eq(kycRecord.status, status) 
    : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(kycRecord)
    .where(whereCondition);

  const total = Number(countResult?.count ?? 0);

  // Get records
  const results = await db
    .select({
      kyc: kycRecord,
      userName: user.name,
      userEmail: user.email,
      userAvatar: userProfile.avatar,
    })
    .from(kycRecord)
    .innerJoin(user, eq(user.id, kycRecord.userId))
    .leftJoin(userProfile, eq(userProfile.userId, kycRecord.userId))
    .where(whereCondition)
    .orderBy(desc(kycRecord.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    records: results.map(r => ({
      ...r.kyc,
      userName: r.userName,
      userEmail: r.userEmail,
      userAvatar: r.userAvatar,
    })),
    total,
  };
};

/**
 * Get KYC stats for admin dashboard
 */
export const getKycStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where ${kycRecord.status} = 'pending')`,
      approved: sql<number>`count(*) filter (where ${kycRecord.status} = 'approved')`,
      rejected: sql<number>`count(*) filter (where ${kycRecord.status} = 'rejected')`,
    })
    .from(kycRecord);

  return {
    total: Number(stats?.total ?? 0),
    pending: Number(stats?.pending ?? 0),
    approved: Number(stats?.approved ?? 0),
    rejected: Number(stats?.rejected ?? 0),
  };
};

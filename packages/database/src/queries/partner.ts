/**
 * Partner Queries - Simplified
 *
 * Basic CRUD operations for Partner table only.
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../dbclient';
import { partner } from '../schema/partner';

// ID Prefix
const PARTNER_ID_PREFIX = 'partner_';
const makePartnerId = () => `${PARTNER_ID_PREFIX}${createId()}`;

// Type Exports
export type PartnerRecord = typeof partner.$inferSelect;
export type PartnerInsert = typeof partner.$inferInsert;
export type PartnerUpdate = Partial<Omit<PartnerInsert, 'id' | 'createdAt'>>;

// Utility to prune undefined values
const pruneUndefined = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

// ==================== PARTNER QUERIES ====================

export const getPartnerById = async (
  id: string
): Promise<PartnerRecord | null> => {
  const result = await db
    .select()
    .from(partner)
    .where(eq(partner.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const getPartnerByEmail = async (
  email: string
): Promise<PartnerRecord | null> => {
  const result = await db
    .select()
    .from(partner)
    .where(eq(partner.email, email))
    .limit(1);

  return result[0] ?? null;
};

export const getPartnerByTradeLicense = async (
  tradeLicense: string
): Promise<PartnerRecord | null> => {
  const result = await db
    .select()
    .from(partner)
    .where(eq(partner.tradeLicense, tradeLicense))
    .limit(1);

  return result[0] ?? null;
};

export const getAllPartners = async (filters?: {
  status?: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier?: 'standard' | 'gold' | 'platinum' | 'black';
  emirate?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<PartnerRecord[]> => {
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(partner.status, filters.status));
  }
  if (filters?.tier) {
    conditions.push(eq(partner.tier, filters.tier));
  }
  if (filters?.emirate) {
    conditions.push(eq(partner.emirate, filters.emirate));
  }
  if (filters?.isVerified !== undefined) {
    conditions.push(eq(partner.isVerified, filters.isVerified));
  }

  let query = db.select().from(partner);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(partner.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

export const createPartner = async (
  input: Omit<PartnerInsert, 'id'> & { id?: string }
): Promise<PartnerRecord> => {
  const result = await db
    .insert(partner)
    .values({
      ...input,
      id: input.id ?? makePartnerId(),
    })
    .returning();

  return result[0];
};

export const updatePartner = async (
  id: string,
  changes: PartnerUpdate
): Promise<PartnerRecord | null> => {
  const updates = pruneUndefined({
    ...changes,
    updatedAt: new Date(),
  });

  if (Object.keys(updates).length === 0) {
    return getPartnerById(id);
  }

  const result = await db
    .update(partner)
    .set(updates)
    .where(eq(partner.id, id))
    .returning();

  return result[0] ?? null;
};

export const deletePartner = async (id: string): Promise<boolean> => {
  const result = await db.delete(partner).where(eq(partner.id, id));
  return (result.rowCount ?? 0) > 0;
};

// ==================== PARTNER STAFF QUERIES ====================

export const getStaffById = async (
  id: string
): Promise<PartnerStaffRecord | null> => {
  const result = await db
    .select()
    .from(partnerStaff)
    .where(eq(partnerStaff.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const getStaffByPartnerId = async (
  partnerId: string,
  filters?: {
    status?: 'active' | 'invited' | 'suspended' | 'left';
    role?: 'owner' | 'admin' | 'sales' | 'viewer';
  }
): Promise<PartnerStaffRecord[]> => {
  const conditions = [eq(partnerStaff.partnerId, partnerId)];
  
  if (filters?.status) {
    conditions.push(eq(partnerStaff.status, filters.status));
  }
  if (filters?.role) {
    conditions.push(eq(partnerStaff.role, filters.role));
  }

  return await db
    .select()
    .from(partnerStaff)
    .where(and(...conditions))
    .orderBy(desc(partnerStaff.joinedAt));
};

export const getStaffByUserId = async (
  userId: string
): Promise<PartnerStaffRecord[]> => {
  return await db
    .select()
    .from(partnerStaff)
    .where(eq(partnerStaff.userId, userId))
    .orderBy(desc(partnerStaff.joinedAt));
};

export const getStaffByPartnerAndUser = async (
  partnerId: string,
  userId: string
): Promise<PartnerStaffRecord | null> => {
  const result = await db
    .select()
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.partnerId, partnerId),
        eq(partnerStaff.userId, userId)
      )
    )
    .limit(1);

  return result[0] ?? null;
};

export const createStaff = async (
  input: Omit<PartnerStaffInsert, 'id'> & { id?: string }
): Promise<PartnerStaffRecord> => {
  const result = await db
    .insert(partnerStaff)
    .values({
      ...input,
      id: input.id ?? makeStaffId(),
    })
    .returning();

  return result[0];
};

export const updateStaff = async (
  id: string,
  changes: PartnerStaffUpdate
): Promise<PartnerStaffRecord | null> => {
  const updates = pruneUndefined({
    ...changes,
    updatedAt: new Date(),
  });

  if (Object.keys(updates).length === 0) {
    return getStaffById(id);
  }

  const result = await db
    .update(partnerStaff)
    .set(updates)
    .where(eq(partnerStaff.id, id))
    .returning();

  return result[0] ?? null;
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  const result = await db.delete(partnerStaff).where(eq(partnerStaff.id, id));
  return (result.rowCount ?? 0) > 0;
};

// ==================== PARTNER REVIEW QUERIES ====================

export const getReviewById = async (
  id: string
): Promise<PartnerReviewRecord | null> => {
  const result = await db
    .select()
    .from(partnerReview)
    .where(eq(partnerReview.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const getReviewsByPartnerId = async (
  partnerId: string,
  filters?: {
    status?: 'pending' | 'published' | 'hidden' | 'flagged';
    minRating?: number;
    limit?: number;
    offset?: number;
  }
): Promise<PartnerReviewRecord[]> => {
  const conditions = [eq(partnerReview.partnerId, partnerId)];

  if (filters?.status) {
    conditions.push(eq(partnerReview.status, filters.status));
  }

  let query = db
    .select()
    .from(partnerReview)
    .where(and(...conditions));

  query = query.orderBy(desc(partnerReview.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

export const getReviewsByUserId = async (
  userId: string
): Promise<PartnerReviewRecord[]> => {
  return await db
    .select()
    .from(partnerReview)
    .where(eq(partnerReview.userId, userId))
    .orderBy(desc(partnerReview.createdAt));
};

export const createReview = async (
  input: Omit<PartnerReviewInsert, 'id'> & { id?: string }
): Promise<PartnerReviewRecord> => {
  const result = await db
    .insert(partnerReview)
    .values({
      ...input,
      id: input.id ?? makeReviewId(),
    })
    .returning();

  return result[0];
};

export const updateReview = async (
  id: string,
  changes: PartnerReviewUpdate
): Promise<PartnerReviewRecord | null> => {
  const updates = pruneUndefined({
    ...changes,
    updatedAt: new Date(),
  });

  if (Object.keys(updates).length === 0) {
    return getReviewById(id);
  }

  const result = await db
    .update(partnerReview)
    .set(updates)
    .where(eq(partnerReview.id, id))
    .returning();

  return result[0] ?? null;
};

export const deleteReview = async (id: string): Promise<boolean> => {
  const result = await db.delete(partnerReview).where(eq(partnerReview.id, id));
  return (result.rowCount ?? 0) > 0;
};

// ==================== PARTNER REQUEST QUERIES ====================

export const getRequestById = async (
  id: string
): Promise<PartnerRequestRecord | null> => {
  const result = await db
    .select()
    .from(partnerRequest)
    .where(eq(partnerRequest.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const getRequestsByUserId = async (
  userId: string
): Promise<PartnerRequestRecord[]> => {
  return await db
    .select()
    .from(partnerRequest)
    .where(eq(partnerRequest.userId, userId))
    .orderBy(desc(partnerRequest.createdAt));
};

export const getAllRequests = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}): Promise<PartnerRequestRecord[]> => {
  let query = db.select().from(partnerRequest);

  if (filters?.status) {
    query = query.where(eq(partnerRequest.status, filters.status)) as any;
  }

  query = query.orderBy(desc(partnerRequest.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

export const createRequest = async (
  input: Omit<PartnerRequestInsert, 'id'> & { id?: string }
): Promise<PartnerRequestRecord> => {
  const result = await db
    .insert(partnerRequest)
    .values({
      ...input,
      id: input.id ?? makeRequestId(),
    })
    .returning();

  return result[0];
};

export const updateRequest = async (
  id: string,
  changes: PartnerRequestUpdate
): Promise<PartnerRequestRecord | null> => {
  const updates = pruneUndefined({
    ...changes,
    updatedAt: new Date(),
  });

  if (Object.keys(updates).length === 0) {
    return getRequestById(id);
  }

  const result = await db
    .update(partnerRequest)
    .set(updates)
    .where(eq(partnerRequest.id, id))
    .returning();

  return result[0] ?? null;
};

export const deleteRequest = async (id: string): Promise<boolean> => {
  const result = await db.delete(partnerRequest).where(eq(partnerRequest.id, id));
  return (result.rowCount ?? 0) > 0;
};

// ==================== AUDIT LOG QUERIES ====================

export const createAuditLog = async (
  input: Omit<AuditLogInsert, 'id' | 'createdAt'> & { id?: string }
): Promise<AuditLogRecord> => {
  const result = await db
    .insert(auditLog)
    .values({
      ...input,
      id: input.id ?? makeAuditId(),
    })
    .returning();

  return result[0];
};

export const getAuditLogsByEntity = async (
  entityType: string,
  entityId: string,
  limit = 100
): Promise<AuditLogRecord[]> => {
  return await db
    .select()
    .from(auditLog)
    .where(
      and(
        eq(auditLog.entityType, entityType),
        eq(auditLog.entityId, entityId)
      )
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
};

export const getAuditLogsByUserId = async (
  userId: string,
  limit = 100
): Promise<AuditLogRecord[]> => {
  return await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.userId, userId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
};

export const getAuditLogsByAction = async (
  action: string,
  limit = 100
): Promise<AuditLogRecord[]> => {
  return await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.action, action))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
};

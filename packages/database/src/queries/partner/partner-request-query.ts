/**
 * Partner Request Queries
 * 
 * Simplified partner application workflow:
 * - User must be logged in (userId from session)
 * - Collect only essential info: company name, trade license, company size, 
 *   trade license document, VAT number, partner type (car_dealer/showroom), expiry date
 * - Admins review and approve/reject
 * 
 * @module queries/partner/partner-request
 */

import { db } from '../../dbclient';
import { partnerRequest, user, partner, partnerStaff } from '../../schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// Types
// ============================================================================

export interface CreatePartnerRequestInput {
  userId: string;
  companyNameLegal: string;
  tradeLicense: string;
  tradeLicenseExpiry: Date;
  tradeLicenseDocumentUrl: string;
  vatNumber: string;
  partnerType: 'car_dealer' | 'showroom';
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface ReviewPartnerRequestInput {
  requestId: string;
  reviewedBy: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  internalNotes?: string;
}

// ============================================================================
// Create Partner Request
// ============================================================================

/**
 * Submit a new partner application
 * User must be logged in - userId comes from session
 * Collects only essential business registration info
 */
export async function createPartnerRequest(input: CreatePartnerRequestInput) {
  const requestId = createId();
  
  const [request] = await db
    .insert(partnerRequest)
    .values({
      id: requestId,
      userId: input.userId,
      companyNameLegal: input.companyNameLegal,
      tradeLicense: input.tradeLicense,
      tradeLicenseExpiry: input.tradeLicenseExpiry,
      tradeLicenseDocumentUrl: input.tradeLicenseDocumentUrl,
      vatNumber: input.vatNumber,
      partnerType: input.partnerType,
      companySize: input.companySize,
      status: 'pending',
    })
    .returning();
  
  return request;
}

// ============================================================================
// Get Partner Request
// ============================================================================

/**
 * Get a partner request by ID with user details
 */
export async function getPartnerRequestById(requestId: string) {
  const [request] = await db
    .select({
      request: partnerRequest,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(partnerRequest)
    .leftJoin(user, eq(partnerRequest.userId, user.id))
    .where(eq(partnerRequest.id, requestId))
    .limit(1);
  
  return request || null;
}

/**
 * Get partner request by user ID
 * Check if user has already submitted an application
 */
export async function getPartnerRequestByUserId(userId: string) {
  const [request] = await db
    .select()
    .from(partnerRequest)
    .where(eq(partnerRequest.userId, userId))
    .orderBy(desc(partnerRequest.createdAt))
    .limit(1);
  
  return request || null;
}

/**
 * Get partner request by trade license
 * Check for duplicate applications
 */
export async function getPartnerRequestByTradeLicense(tradeLicense: string) {
  const [request] = await db
    .select()
    .from(partnerRequest)
    .where(eq(partnerRequest.tradeLicense, tradeLicense))
    .limit(1);
  
  return request || null;
}

// ============================================================================
// List Partner Requests (Admin)
// ============================================================================

export interface ListPartnerRequestsOptions {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

/**
 * List all partner requests with filters (Admin view)
 */
export async function listPartnerRequests(options: ListPartnerRequestsOptions = {}) {
  const { status, limit = 50, offset = 0 } = options;
  
  const baseQuery = db
    .select({
      request: partnerRequest,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(partnerRequest)
    .leftJoin(user, eq(partnerRequest.userId, user.id))
    .$dynamic();
  
  const filteredQuery = status 
    ? baseQuery.where(eq(partnerRequest.status, status))
    : baseQuery;
  
  const requests = await filteredQuery
    .orderBy(desc(partnerRequest.createdAt))
    .limit(limit)
    .offset(offset);
  
  return requests;
}

/**
 * Get partner request counts by status (Admin dashboard)
 */
export async function getPartnerRequestCounts() {
  const [counts] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${partnerRequest.status} = 'pending')`,
      approved: sql<number>`count(*) filter (where ${partnerRequest.status} = 'approved')`,
      rejected: sql<number>`count(*) filter (where ${partnerRequest.status} = 'rejected')`,
      total: sql<number>`count(*)`,
    })
    .from(partnerRequest);
  
  return counts;
}

// ============================================================================
// Review Partner Request (Admin)
// ============================================================================

/**
 * Approve or reject a partner request (Admin action)
 * Note: Actual partner creation happens in a separate service/transaction
 */
export async function reviewPartnerRequest(input: ReviewPartnerRequestInput) {
  const { requestId, reviewedBy, status, rejectionReason, internalNotes } = input;
  
  const [updated] = await db
    .update(partnerRequest)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      internalNotes,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerRequest.id, requestId),
        eq(partnerRequest.status, 'pending') // Only pending requests can be reviewed
      )
    )
    .returning();
  
  return updated || null;
}

/**
 * Create partner and partner staff after approval
 * Called after partner request is approved
 * 
 * Note: A user CAN be staff at another company AND become an owner of a new company.
 * The unique constraint is (partnerId, userId) - one person, one seat per company.
 * This allows the same user to be owner of Company A AND staff at Company B.
 */
export async function createPartnerFromRequest(requestId: string, requestData: any) {
  const partnerId = createId();
  const staffId = createId();

  // Create partner record
  const newPartnerResult = await db
    .insert(partner)
    .values({
      id: partnerId,
      companyNameLegal: requestData.companyNameLegal,
      brandName: requestData.companyNameLegal, // Use company name as brand name
      tradeLicense: requestData.tradeLicense,
      tradeLicenseExpiry: requestData.tradeLicenseExpiry,
      tradeLicenseDocumentUrl: requestData.tradeLicenseDocumentUrl,
      vatNumber: requestData.vatNumber,
      partnerType: requestData.partnerType,
      status: 'active',
      tier: 'standard',
      email: requestData.userEmail || requestData.email,
      phone: requestData.userPhone || '+971000000000', // Default phone
      showroomCount: 1,
    })
    .returning();
  
  const newPartner = Array.isArray(newPartnerResult) ? newPartnerResult[0] : newPartnerResult;

  // Create partner staff record (owner)
  // Note: User can be owner of NEW company even if they're staff elsewhere
  const newStaffResult = await db
    .insert(partnerStaff)
    .values({
      id: staffId,
      partnerId: partnerId,
      userId: requestData.userId,
      role: 'owner',
      isOwner: true,
      status: 'active',
      displayName: requestData.userName || requestData.companyNameLegal,
      workEmail: requestData.userEmail || requestData.email,
      isPrimaryContact: true,
      joinedAt: new Date(),
      acceptedAt: new Date(),
    })
    .returning();
  
  const newStaff = Array.isArray(newStaffResult) ? newStaffResult[0] : newStaffResult;

  // Link partner request to partner
  await db
    .update(partnerRequest)
    .set({
      partnerId,
      updatedAt: new Date(),
    })
    .where(eq(partnerRequest.id, requestId));

  return { partner: newPartner, staff: newStaff };
}

/**
 * Link approved request to created partner
 * Called after partner record is created
 */
export async function linkPartnerRequestToPartner(
  requestId: string,
  partnerId: string
) {
  const [updated] = await db
    .update(partnerRequest)
    .set({
      partnerId,
      updatedAt: new Date(),
    })
    .where(eq(partnerRequest.id, requestId))
    .returning();
  
  return updated || null;
}

// ============================================================================
// Delete Partner Request
// ============================================================================

/**
 * Delete a partner request (User can delete their pending or rejected request)
 * - Pending: Cancellation
 * - Rejected: Dismissal to clear from their dashboard
 */
export async function deletePartnerRequest(requestId: string, userId: string) {
  const [deleted] = await db
    .delete(partnerRequest)
    .where(
      and(
        eq(partnerRequest.id, requestId),
        eq(partnerRequest.userId, userId),
        inArray(partnerRequest.status, ['pending', 'rejected'])
      )
    )
    .returning();
  
  return deleted || null;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if user has a pending or approved request
 */
export async function hasActivePartnerRequest(userId: string): Promise<boolean> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(partnerRequest)
    .where(
      and(
        eq(partnerRequest.userId, userId),
        sql`${partnerRequest.status} IN ('pending', 'approved')`
      )
    );
  
  return (result?.count || 0) > 0;
}

/**
 * Check if trade license is already in use
 */
export async function isTradeLicenseInUse(tradeLicense: string): Promise<boolean> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(partnerRequest)
    .where(
      and(
        eq(partnerRequest.tradeLicense, tradeLicense),
        sql`${partnerRequest.status} IN ('pending', 'approved')`
      )
    );
  
  return (result?.count || 0) > 0;
}

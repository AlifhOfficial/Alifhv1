/**
 * Database Queries: Communications
 * Public submission and admin operations for contact/support messages
 */

import { db } from '../../dbclient';
import { 
  communications, 
  user, 
  type Communication, 
  type NewCommunication 
} from '../../schema';
import { eq, desc, inArray, and, count, sql, isNull, or, ilike } from 'drizzle-orm';

// ============================================================================
// PUBLIC OPERATIONS (Anyone can submit)
// ============================================================================

export interface CreateCommunicationInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type?: 'inquiry' | 'support' | 'partnership' | 'feedback' | 'other';
}

/**
 * Create a new communication (public-facing)
 * Anyone can submit - no auth required
 */
export async function createCommunication(
  input: CreateCommunicationInput
): Promise<{ success: boolean; id: string }> {
  const [created] = await db.insert(communications).values({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    phone: input.phone?.trim() || null,
    subject: input.subject.trim(),
    message: input.message.trim(),
    type: input.type || 'inquiry',
    status: 'new',
  }).returning({ id: communications.id });

  return { success: true, id: created.id };
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export interface CommunicationsFilter {
  status?: 'new' | 'in_progress' | 'resolved' | 'archived';
  type?: 'inquiry' | 'support' | 'partnership' | 'feedback' | 'other';
  isRead?: boolean;
  search?: string; // Search in name, email, subject
}

/**
 * Get all communications for admin (with filters)
 */
export async function getAdminCommunications(filter?: CommunicationsFilter) {
  const conditions = [];

  if (filter?.status) {
    conditions.push(eq(communications.status, filter.status));
  }
  if (filter?.type) {
    conditions.push(eq(communications.type, filter.type));
  }
  if (filter?.isRead !== undefined) {
    conditions.push(eq(communications.isRead, filter.isRead));
  }
  if (filter?.search) {
    const searchTerm = `%${filter.search}%`;
    conditions.push(
      or(
        ilike(communications.name, searchTerm),
        ilike(communications.email, searchTerm),
        ilike(communications.subject, searchTerm)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get communications
  const items = await db.query.communications.findMany({
    where: whereClause,
    orderBy: [desc(communications.createdAt)],
  });

  if (items.length === 0) return [];

  // Get assigned/resolved user info in batch
  const userIds = [...new Set([
    ...items.filter(c => c.assignedTo).map(c => c.assignedTo!),
    ...items.filter(c => c.resolvedBy).map(c => c.resolvedBy!),
  ])];

  const users = userIds.length > 0
    ? await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
      }).from(user).where(inArray(user.id, userIds))
    : [];

  const userMap = new Map(users.map(u => [u.id, u]));

  // Assemble results
  return items.map(item => ({
    ...item,
    assignedUser: item.assignedTo ? userMap.get(item.assignedTo) || null : null,
    resolvedByUser: item.resolvedBy ? userMap.get(item.resolvedBy) || null : null,
  }));
}

/**
 * Get a single communication by ID
 */
export async function getCommunicationById(id: string) {
  const [item] = await db.select()
    .from(communications)
    .where(eq(communications.id, id))
    .limit(1);

  if (!item) return null;

  // Get user info if assigned/resolved
  const userIds = [item.assignedTo, item.resolvedBy].filter(Boolean) as string[];
  const users = userIds.length > 0
    ? await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
      }).from(user).where(inArray(user.id, userIds))
    : [];

  const userMap = new Map(users.map(u => [u.id, u]));

  return {
    ...item,
    assignedUser: item.assignedTo ? userMap.get(item.assignedTo) || null : null,
    resolvedByUser: item.resolvedBy ? userMap.get(item.resolvedBy) || null : null,
  };
}

/**
 * Mark communication as read
 */
export async function markCommunicationRead(id: string): Promise<boolean> {
  const result = await db.update(communications)
    .set({ isRead: true })
    .where(eq(communications.id, id));

  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Mark multiple as read
 */
export async function markCommunicationsRead(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  
  const result = await db.update(communications)
    .set({ isRead: true })
    .where(inArray(communications.id, ids));

  return result.rowCount || 0;
}

/**
 * Update communication status
 */
export async function updateCommunicationStatus(
  id: string,
  status: 'new' | 'in_progress' | 'resolved' | 'archived',
  adminId?: string,
  adminNote?: string
): Promise<boolean> {
  const updateData: Partial<Communication> = { 
    status,
    isRead: true, // Auto-mark as read when status changes
  };

  if (adminNote !== undefined) {
    updateData.adminNote = adminNote;
  }

  if (status === 'resolved' && adminId) {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = adminId;
  }

  if (status === 'in_progress' && adminId) {
    updateData.assignedTo = adminId;
  }

  const result = await db.update(communications)
    .set(updateData)
    .where(eq(communications.id, id));

  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Add admin note to communication
 */
export async function addCommunicationNote(
  id: string,
  note: string
): Promise<boolean> {
  const result = await db.update(communications)
    .set({ adminNote: note.trim() })
    .where(eq(communications.id, id));

  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Delete a communication (admin only)
 */
export async function deleteCommunication(id: string): Promise<boolean> {
  const result = await db.delete(communications)
    .where(eq(communications.id, id));

  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Get communication stats for admin dashboard
 */
export async function getCommunicationStats() {
  const [stats] = await db.select({
    total: count(),
    unread: count(sql`CASE WHEN ${communications.isRead} = false THEN 1 END`),
    new: count(sql`CASE WHEN ${communications.status} = 'new' THEN 1 END`),
    inProgress: count(sql`CASE WHEN ${communications.status} = 'in_progress' THEN 1 END`),
    resolved: count(sql`CASE WHEN ${communications.status} = 'resolved' THEN 1 END`),
  }).from(communications);

  return stats;
}

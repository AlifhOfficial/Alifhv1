/**
 * Partner Staff Invite Queries
 * Handle staff invitations and onboarding
 */

import { db } from '../../dbclient';
import { partnerStaff, partner, user, userProfile } from '../../schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

/**
 * Send staff invite
 */
export async function sendStaffInvite(input: {
  partnerId: string;
  email: string;
  role: 'owner' | 'admin' | 'sales' | 'viewer';
  invitedBy: string;
  title?: string;
  department?: string;
}) {
  // Check if user exists with this email
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (!existingUser) {
    throw new Error('User with this email does not exist. They need to sign up first.');
  }

  // Check if already staff member of ANY partner (staff can only work for one company)
  const [existingMembership] = await db
    .select({
      id: partnerStaff.id,
      partnerId: partnerStaff.partnerId,
      partnerName: partner.brandName,
      status: partnerStaff.status,
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(eq(partnerStaff.userId, existingUser.id))
    .limit(1);

  if (existingMembership) {
    // If they LEFT this same company, allow re-invite by updating the existing record
    if (existingMembership.partnerId === input.partnerId && existingMembership.status === 'left') {
      const [updatedInvite] = await db
        .update(partnerStaff)
        .set({
          role: input.role,
          title: input.title ?? null,
          department: input.department ?? null,
          status: 'invited',
          invitedBy: input.invitedBy,
          invitedAt: new Date(),
          acceptedAt: null,
          leftAt: null,
          leftReason: null,
        })
        .where(eq(partnerStaff.id, existingMembership.id))
        .returning();
      
      return updatedInvite;
    }
    
    // If active/invited with this company
    if (existingMembership.partnerId === input.partnerId) {
      throw new Error('This user is already a staff member or has a pending invite for your company');
    }
    
    // If active with another company
    if (existingMembership.status === 'active') {
      throw new Error(`This user already works for "${existingMembership.partnerName}". Staff can only work for one company.`);
    }
    
    // If they left another company, they can be invited to yours - delete the old record
    if (existingMembership.status === 'left') {
      await db.delete(partnerStaff).where(eq(partnerStaff.id, existingMembership.id));
    }
  }

  // Create invite
  const invites = await db
    .insert(partnerStaff)
    .values({
      id: createId(),
      partnerId: input.partnerId,
      userId: existingUser.id,
      role: input.role,
      title: input.title,
      department: input.department,
      status: 'invited',
      invitedBy: input.invitedBy,
      invitedAt: new Date(),
      isOwner: false,
      isPrimaryContact: false,
    })
    .returning();

  return invites[0];
}

/**
 * Get staff invites for a user (pending invites they can accept)
 */
export async function getUserStaffInvites(userId: string) {
  const invites = await db
    .select({
      id: partnerStaff.id,
      partnerId: partnerStaff.partnerId,
      partnerName: partner.brandName,
      partnerLogo: partner.logo,
      partnerEmail: partner.email,
      role: partnerStaff.role,
      title: partnerStaff.title,
      department: partnerStaff.department,
      invitedAt: partnerStaff.invitedAt,
      invitedByUserId: partnerStaff.invitedBy,
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(
      and(
        eq(partnerStaff.userId, userId),
        eq(partnerStaff.status, 'invited')
      )
    );

  return invites;
}

/**
 * Accept staff invite
 */
export async function acceptStaffInvite(input: {
  inviteId: string;
  userId: string;
}) {
  const [invite] = await db
    .select()
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.id, input.inviteId),
        eq(partnerStaff.userId, input.userId),
        eq(partnerStaff.status, 'invited')
      )
    )
    .limit(1);

  if (!invite) {
    throw new Error('Invite not found or already processed');
  }

  const updated = await db
    .update(partnerStaff)
    .set({
      status: 'active',
      acceptedAt: new Date(),
      joinedAt: new Date(),
    })
    .where(eq(partnerStaff.id, input.inviteId))
    .returning();

  // V1: Team chat disabled - will be added in V2

  return updated[0];
}

/**
 * Reject staff invite
 */
export async function rejectStaffInvite(input: {
  inviteId: string;
  userId: string;
}) {
  const [invite] = await db
    .select()
    .from(partnerStaff)
    .where(
      and(
        eq(partnerStaff.id, input.inviteId),
        eq(partnerStaff.userId, input.userId),
        eq(partnerStaff.status, 'invited')
      )
    )
    .limit(1);

  if (!invite) {
    throw new Error('Invite not found or already processed');
  }

  // Delete the invite
  await db.delete(partnerStaff).where(eq(partnerStaff.id, input.inviteId));

  return { success: true };
}

/**
 * Get all staff for a partner (for management)
 */
export async function getPartnerStaff(partnerId: string) {
  const staff = await db
    .select({
      id: partnerStaff.id,
      userId: partnerStaff.userId,
      userName: user.name,
      userEmail: user.email,
      userAvatar: userProfile.avatar,
      displayName: partnerStaff.displayName,
      workEmail: partnerStaff.workEmail,
      workPhone: partnerStaff.workPhone,
      role: partnerStaff.role,
      title: partnerStaff.title,
      department: partnerStaff.department,
      status: partnerStaff.status,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      joinedAt: partnerStaff.joinedAt,
      invitedAt: partnerStaff.invitedAt,
      leftAt: partnerStaff.leftAt,
      leftReason: partnerStaff.leftReason,
    })
    .from(partnerStaff)
    .innerJoin(user, eq(partnerStaff.userId, user.id))
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(eq(partnerStaff.partnerId, partnerId));

  return staff;
}

/**
 * Update staff member
 */
export async function updateStaffMember(input: {
  staffId: string;
  partnerId: string;
  role?: 'owner' | 'admin' | 'sales' | 'viewer';
  title?: string;
  department?: string;
  isPrimaryContact?: boolean;
}) {
  const updated = await db
    .update(partnerStaff)
    .set({
      role: input.role,
      title: input.title,
      department: input.department,
      isPrimaryContact: input.isPrimaryContact,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaff.id, input.staffId),
        eq(partnerStaff.partnerId, input.partnerId)
      )
    )
    .returning();

  return updated[0];
}

/**
 * Suspend staff member
 */
export async function suspendStaffMember(staffId: string, partnerId: string) {
  const updated = await db
    .update(partnerStaff)
    .set({
      status: 'suspended',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaff.id, staffId),
        eq(partnerStaff.partnerId, partnerId)
      )
    )
    .returning();

  return updated[0];
}

/**
 * Activate staff member
 */
export async function activateStaffMember(staffId: string, partnerId: string) {
  const updated = await db
    .update(partnerStaff)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaff.id, staffId),
        eq(partnerStaff.partnerId, partnerId)
      )
    )
    .returning();

  return updated[0];
}

/**
 * Remove staff member
 */
export async function removeStaffMember(input: {
  staffId: string;
  partnerId: string;
  reason?: string;
}) {
  // Get the staff member's userId before updating
  const [staffMember] = await db
    .select({ userId: partnerStaff.userId })
    .from(partnerStaff)
    .where(eq(partnerStaff.id, input.staffId))
    .limit(1);

  const updated = await db
    .update(partnerStaff)
    .set({
      status: 'left',
      leftAt: new Date(),
      leftReason: input.reason,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaff.id, input.staffId),
        eq(partnerStaff.partnerId, input.partnerId)
      )
    )
    .returning();

  // V1: Team chat disabled - will be added in V2

  return updated[0];
}

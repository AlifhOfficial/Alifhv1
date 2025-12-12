/**
 * Essential Auth Queries - V1 Only
 * 
 * Only the most essential queries for V1.
 * Add more as features are built.
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../dbclient';
import { users, partnerRequests, partnerMembers } from './schema';

// Essential user queries
export const getUserById = async (id: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return user || null;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
};

export interface CreateUserData {
  name: string;
  email: string;
  platformRole?: 'user' | 'staff' | 'admin' | 'super-admin';
  status?: 'active' | 'pending' | 'suspended' | 'inactive';
  emailVerified?: boolean;
  image?: string;
  activePartnerId?: string;
}

export const createUser = async (data: CreateUserData) => {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      platformRole: data.platformRole || 'user',
      status: data.status || 'active',
      emailVerified: data.emailVerified || false,
      image: data.image,
      activePartnerId: data.activePartnerId,
    })
    .returning();
  
  return user;
};

// Essential partner request queries
export interface CreatePartnerRequestData {
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessWebsite?: string;
  description?: string;
}

export const createPartnerRequest = async (data: CreatePartnerRequestData) => {
  const [request] = await db
    .insert(partnerRequests)
    .values({
      userId: data.userId,
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessWebsite: data.businessWebsite,
      description: data.description,
      status: 'pending',
    })
    .returning();
  
  return request;
};

// Essential partner membership queries
export const getPartnerMembershipsForUser = async (userId: string) => {
  const memberships = await db
    .select({
      id: partnerMembers.id,
      partnerId: partnerMembers.partnerId,
      role: partnerMembers.role,
      isActive: partnerMembers.isActive,
      createdAt: partnerMembers.createdAt,
    })
    .from(partnerMembers)
    .where(eq(partnerMembers.userId, userId));
  
  return memberships;
};

export const getUserPartnerRole = async (userId: string, partnerId: string) => {
  const [membership] = await db
    .select({
      role: partnerMembers.role,
      isActive: partnerMembers.isActive,
    })
    .from(partnerMembers)
    .where(
      and(
        eq(partnerMembers.userId, userId),
        eq(partnerMembers.partnerId, partnerId),
        eq(partnerMembers.isActive, true)
      )
    )
    .limit(1);
  
  return membership?.role || null;
};

export const getActivePartnerMembership = async (userId: string) => {
  const [membership] = await db
    .select({
      id: partnerMembers.id,
      partnerId: partnerMembers.partnerId,
      role: partnerMembers.role,
      isActive: partnerMembers.isActive,
      createdAt: partnerMembers.createdAt,
    })
    .from(partnerMembers)
    .where(
      and(
        eq(partnerMembers.userId, userId),
        eq(partnerMembers.isActive, true)
      )
    )
    .limit(1);
  
  return membership || null;
};
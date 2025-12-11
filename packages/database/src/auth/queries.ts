/**
 * Essential Auth Queries - V1 Only
 * 
 * Only the most essential queries for V1.
 * Add more as features are built.
 */

import { eq } from 'drizzle-orm';
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
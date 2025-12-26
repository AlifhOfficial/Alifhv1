/**
 * Admin User Management Queries - Production
 * 
 * Comprehensive user management system for admin portal with search capabilities.
 * Provides complete user data including profile, KYC status, and partner membership.
 * 
 * @module queries/admin/user-management-query
 */

import { eq, and, like, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../../dbclient';
import { user } from '../../schema/auth';
import { userProfile, kycRecord } from '../../schema/profile';
import { partnerStaff, partner } from '../../schema/partner';

/**
 * Complete user data type for admin portal
 */
export type AdminUserData = {
  // Core User Info
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneVerifiedAt: Date | null;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: Date;
  updatedAt: Date;
  
  // Account Status
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  
  // Profile Info
  profile: {
    id: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    description: string | null;
    
    // KYC Status
    kycVerified: boolean;
    kycVerifiedAt: Date | null;
    
    // Location
    locationCity: string | null;
    locationEmirate: string | null;
    locationLat: number | null;
    locationLng: number | null;
    
    // Activity
    inventoryCount: number;
    rating: number | null;
    lastActiveAt: Date | null;
    memberSince: Date | null;
    
    // Settings
    consignmentMode: boolean;
    tags: string[];
    badges: string[];
  } | null;
  
  // KYC Details (if exists)
  kyc: {
    id: string;
    status: string;
    type: string;
    verifiedAt: Date | null;
    verifiedBy: string | null;
    rejectionReason: string | null;
    createdAt: Date;
  } | null;
  
  // Partner Membership (if user is staff of any partner)
  partnerMemberships: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerBrandName: string;
    staffRole: string;
    isOwner: boolean;
    isPrimaryContact: boolean;
    status: string;
    joinedAt: Date;
  }>;
};

/**
 * Partner data type for admin portal
 */
export type AdminPartnerData = {
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier: 'standard' | 'gold' | 'platinum' | 'black';
  partnerType: string;
  isVerified: boolean;
  verifiedAt: Date | null;
  
  // Location
  emirate: string | null;
  city: string | null;
  address: string | null;
  
  // Stats
  activeListingsCount: number;
  platformRating: number | null;
  platformReviewCount: number;
  
  // Dates
  createdAt: Date;
  approvedAt: Date | null;
  activatedAt: Date | null;
  suspendedAt: Date | null;
  
  // Staff
  staffCount: number;
  staffMembers: Array<{
    staffId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string | null;
    staffRole: string;
    isOwner: boolean;
    isPrimaryContact: boolean;
    status: string;
    joinedAt: Date;
  }>;
};

/**
 * Get all users with complete information
 * Returns users with profile, KYC status, and partner memberships
 */
export const getAdminAllUsers = async (options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminUserData[]> => {
  const {
    limit = 50,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options || {};

  // Get sort column
  const sortColumn = {
    createdAt: user.createdAt,
    name: user.name,
    email: user.email,
  }[sortBy];

  const sortFn = sortOrder === 'asc' ? asc : desc;

  // Fetch users with their profiles
  const users = await db
    .select({
      // User fields
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      
      // Profile fields
      profileId: userProfile.id,
      phone: userProfile.phone,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatar: userProfile.avatar,
      description: userProfile.description,
      kycVerified: userProfile.kycVerified,
      kycVerifiedAt: userProfile.kycVerifiedAt,
      locationCity: userProfile.locationCity,
      locationEmirate: userProfile.locationEmirate,
      locationLat: userProfile.locationLat,
      locationLng: userProfile.locationLng,
      inventoryCount: userProfile.inventoryCount,
      rating: userProfile.rating,
      lastActiveAt: userProfile.lastActiveAt,
      memberSince: userProfile.memberSince,
      consignmentMode: userProfile.consignmentMode,
      tags: userProfile.tags,
      badges: userProfile.badges,
    })
    .from(user)
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .orderBy(sortFn(sortColumn))
    .limit(limit)
    .offset(offset);

  // Fetch KYC records for these users (latest per user)
  const userIds = users.map(u => u.id);
  const kycRecords = userIds.length > 0 ? await db
    .select()
    .from(kycRecord)
    .where(inArray(kycRecord.userId, userIds))
    .orderBy(desc(kycRecord.createdAt)) : [];

  // Group KYC by userId (take latest)
  const kycByUserId = new Map<string, typeof kycRecords[0]>();
  for (const kyc of kycRecords) {
    if (!kycByUserId.has(kyc.userId)) {
      kycByUserId.set(kyc.userId, kyc);
    }
  }

  // Fetch partner memberships for these users
  const staffMemberships = userIds.length > 0 ? await db
    .select({
      staffId: partnerStaff.id,
      userId: partnerStaff.userId,
      partnerId: partnerStaff.partnerId,
      partnerName: partner.companyNameLegal,
      partnerBrandName: partner.brandName,
      staffRole: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      status: partnerStaff.status,
      joinedAt: partnerStaff.joinedAt,
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(inArray(partnerStaff.userId, userIds)) : [];

  // Group memberships by userId
  const membershipsByUserId = new Map<string, typeof staffMemberships>();
  for (const membership of staffMemberships) {
    const existing = membershipsByUserId.get(membership.userId) || [];
    existing.push(membership);
    membershipsByUserId.set(membership.userId, existing);
  }

  // Combine all data
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    phoneVerifiedAt: u.phoneVerifiedAt,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    banned: u.banned,
    banReason: u.banReason,
    banExpires: u.banExpires,
    
    profile: u.profileId ? {
      id: u.profileId,
      phone: u.phone,
      firstName: u.firstName,
      lastName: u.lastName,
      avatar: u.avatar,
      description: u.description,
      kycVerified: u.kycVerified ?? false,
      kycVerifiedAt: u.kycVerifiedAt,
      locationCity: u.locationCity,
      locationEmirate: u.locationEmirate,
      locationLat: u.locationLat,
      locationLng: u.locationLng,
      inventoryCount: u.inventoryCount ?? 0,
      rating: u.rating,
      lastActiveAt: u.lastActiveAt,
      memberSince: u.memberSince,
      consignmentMode: u.consignmentMode ?? false,
      tags: (u.tags as string[]) ?? [],
      badges: (u.badges as string[]) ?? [],
    } : null,
    
    kyc: kycByUserId.has(u.id) ? {
      id: kycByUserId.get(u.id)!.id,
      status: kycByUserId.get(u.id)!.status,
      type: kycByUserId.get(u.id)!.type,
      verifiedAt: kycByUserId.get(u.id)!.verifiedAt,
      verifiedBy: kycByUserId.get(u.id)!.verifiedBy,
      rejectionReason: kycByUserId.get(u.id)!.rejectionReason,
      createdAt: kycByUserId.get(u.id)!.createdAt,
    } : null,
    
    partnerMemberships: membershipsByUserId.get(u.id) || [],
  }));
};

/**
 * Get user by email with complete information
 */
export const getAdminUserByEmail = async (email: string): Promise<AdminUserData | null> => {
  const results = await db
    .select({
      // User fields
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      
      // Profile fields
      profileId: userProfile.id,
      phone: userProfile.phone,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatar: userProfile.avatar,
      description: userProfile.description,
      kycVerified: userProfile.kycVerified,
      kycVerifiedAt: userProfile.kycVerifiedAt,
      locationCity: userProfile.locationCity,
      locationEmirate: userProfile.locationEmirate,
      locationLat: userProfile.locationLat,
      locationLng: userProfile.locationLng,
      inventoryCount: userProfile.inventoryCount,
      rating: userProfile.rating,
      lastActiveAt: userProfile.lastActiveAt,
      memberSince: userProfile.memberSince,
      consignmentMode: userProfile.consignmentMode,
      tags: userProfile.tags,
      badges: userProfile.badges,
    })
    .from(user)
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(eq(user.email, email))
    .limit(1);

  if (results.length === 0) return null;

  const userData = results[0];

  // Fetch latest KYC record
  const [kycData] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.userId, userData.id))
    .orderBy(desc(kycRecord.createdAt))
    .limit(1);

  // Fetch partner memberships
  const staffMemberships = await db
    .select({
      staffId: partnerStaff.id,
      userId: partnerStaff.userId,
      partnerId: partnerStaff.partnerId,
      partnerName: partner.companyNameLegal,
      partnerBrandName: partner.brandName,
      staffRole: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      status: partnerStaff.status,
      joinedAt: partnerStaff.joinedAt,
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(eq(partnerStaff.userId, userData.id));

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    emailVerified: userData.emailVerified,
    phoneVerified: userData.phoneVerified,
    phoneVerifiedAt: userData.phoneVerifiedAt,
    role: userData.role,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    banned: userData.banned,
    banReason: userData.banReason,
    banExpires: userData.banExpires,
    
    profile: userData.profileId ? {
      id: userData.profileId,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      description: userData.description,
      kycVerified: userData.kycVerified ?? false,
      kycVerifiedAt: userData.kycVerifiedAt,
      locationCity: userData.locationCity,
      locationEmirate: userData.locationEmirate,
      locationLat: userData.locationLat,
      locationLng: userData.locationLng,
      inventoryCount: userData.inventoryCount ?? 0,
      rating: userData.rating,
      lastActiveAt: userData.lastActiveAt,
      memberSince: userData.memberSince,
      consignmentMode: userData.consignmentMode ?? false,
      tags: (userData.tags as string[]) ?? [],
      badges: (userData.badges as string[]) ?? [],
    } : null,
    
    kyc: kycData ? {
      id: kycData.id,
      status: kycData.status,
      type: kycData.type,
      verifiedAt: kycData.verifiedAt,
      verifiedBy: kycData.verifiedBy,
      rejectionReason: kycData.rejectionReason,
      createdAt: kycData.createdAt,
    } : null,
    
    partnerMemberships: staffMemberships,
  };
};

/**
 * Get user by phone with complete information
 */
export const getAdminUserByPhone = async (phone: string): Promise<AdminUserData | null> => {
  // Phone is stored in userProfile, not user table
  const results = await db
    .select({
      // User fields
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      phoneVerifiedAt: user.phoneVerifiedAt,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      
      // Profile fields
      profileId: userProfile.id,
      phone: userProfile.phone,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatar: userProfile.avatar,
      description: userProfile.description,
      kycVerified: userProfile.kycVerified,
      kycVerifiedAt: userProfile.kycVerifiedAt,
      locationCity: userProfile.locationCity,
      locationEmirate: userProfile.locationEmirate,
      locationLat: userProfile.locationLat,
      locationLng: userProfile.locationLng,
      inventoryCount: userProfile.inventoryCount,
      rating: userProfile.rating,
      lastActiveAt: userProfile.lastActiveAt,
      memberSince: userProfile.memberSince,
      consignmentMode: userProfile.consignmentMode,
      tags: userProfile.tags,
      badges: userProfile.badges,
    })
    .from(userProfile)
    .innerJoin(user, eq(userProfile.userId, user.id))
    .where(eq(userProfile.phone, phone))
    .limit(1);

  if (results.length === 0) return null;

  const userData = results[0];

  // Fetch latest KYC record
  const [kycData] = await db
    .select()
    .from(kycRecord)
    .where(eq(kycRecord.userId, userData.id))
    .orderBy(desc(kycRecord.createdAt))
    .limit(1);

  // Fetch partner memberships
  const staffMemberships = await db
    .select({
      staffId: partnerStaff.id,
      userId: partnerStaff.userId,
      partnerId: partnerStaff.partnerId,
      partnerName: partner.companyNameLegal,
      partnerBrandName: partner.brandName,
      staffRole: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      status: partnerStaff.status,
      joinedAt: partnerStaff.joinedAt,
    })
    .from(partnerStaff)
    .innerJoin(partner, eq(partnerStaff.partnerId, partner.id))
    .where(eq(partnerStaff.userId, userData.id));

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    emailVerified: userData.emailVerified,
    phoneVerified: userData.phoneVerified,
    phoneVerifiedAt: userData.phoneVerifiedAt,
    role: userData.role,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    banned: userData.banned,
    banReason: userData.banReason,
    banExpires: userData.banExpires,
    
    profile: userData.profileId ? {
      id: userData.profileId,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      description: userData.description,
      kycVerified: userData.kycVerified ?? false,
      kycVerifiedAt: userData.kycVerifiedAt,
      locationCity: userData.locationCity,
      locationEmirate: userData.locationEmirate,
      locationLat: userData.locationLat,
      locationLng: userData.locationLng,
      inventoryCount: userData.inventoryCount ?? 0,
      rating: userData.rating,
      lastActiveAt: userData.lastActiveAt,
      memberSince: userData.memberSince,
      consignmentMode: userData.consignmentMode ?? false,
      tags: (userData.tags as string[]) ?? [],
      badges: (userData.badges as string[]) ?? [],
    } : null,
    
    kyc: kycData ? {
      id: kycData.id,
      status: kycData.status,
      type: kycData.type,
      verifiedAt: kycData.verifiedAt,
      verifiedBy: kycData.verifiedBy,
      rejectionReason: kycData.rejectionReason,
      createdAt: kycData.createdAt,
    } : null,
    
    partnerMemberships: staffMemberships,
  };
};

/**
 * Get all partners with complete information
 */
export const getAdminAllPartners = async (options?: {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'active' | 'suspended' | 'cancelled';
  sortBy?: 'createdAt' | 'brandName' | 'status';
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminPartnerData[]> => {
  const {
    limit = 50,
    offset = 0,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options || {};

  // Build where clause
  const whereClause = status ? eq(partner.status, status) : undefined;

  // Get sort column with fallback
  const sortColumn = {
    createdAt: partner.createdAt,
    brandName: partner.brandName,
    status: partner.status,
  }[sortBy] || partner.createdAt;

  const sortFn = sortOrder === 'asc' ? asc : desc;

  // Fetch partners
  const partners = await db
    .select({
      id: partner.id,
      companyNameLegal: partner.companyNameLegal,
      brandName: partner.brandName,
      logo: partner.logo,
      tradeLicense: partner.tradeLicense,
      email: partner.email,
      phone: partner.phone,
      status: partner.status,
      tier: partner.tier,
      partnerType: partner.partnerType,
      isVerified: partner.isVerified,
      verifiedAt: partner.verifiedAt,
      emirate: partner.emirate,
      city: partner.city,
      address: partner.address,
      activeListingsCount: partner.activeListingsCount,
      platformRating: partner.platformRating,
      platformReviewCount: partner.platformReviewCount,
      createdAt: partner.createdAt,
      approvedAt: partner.approvedAt,
      activatedAt: partner.activatedAt,
      suspendedAt: partner.suspendedAt,
    })
    .from(partner)
    .where(whereClause)
    .orderBy(sortFn(sortColumn))
    .limit(limit)
    .offset(offset);

  // Get staff members for each partner with user details
  const partnerIds = partners.map(p => p.id);
  const staffMembers = partnerIds.length > 0 ? await db
    .select({
      staffId: partnerStaff.id,
      partnerId: partnerStaff.partnerId,
      userId: partnerStaff.userId,
      userName: user.name,
      userEmail: user.email,
      userAvatar: userProfile.avatar,
      staffRole: partnerStaff.role,
      isOwner: partnerStaff.isOwner,
      isPrimaryContact: partnerStaff.isPrimaryContact,
      status: partnerStaff.status,
      joinedAt: partnerStaff.joinedAt,
    })
    .from(partnerStaff)
    .innerJoin(user, eq(partnerStaff.userId, user.id))
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(inArray(partnerStaff.partnerId, partnerIds)) : [];

  // Group staff by partnerId
  const staffByPartnerId = new Map<string, typeof staffMembers>();
  for (const staff of staffMembers) {
    const existing = staffByPartnerId.get(staff.partnerId) || [];
    existing.push(staff);
    staffByPartnerId.set(staff.partnerId, existing);
  }

  return partners.map(p => {
    const members = staffByPartnerId.get(p.id) || [];
    return {
      id: p.id,
      companyNameLegal: p.companyNameLegal,
      brandName: p.brandName,
      logo: p.logo,
      tradeLicense: p.tradeLicense,
      email: p.email,
      phone: p.phone,
      status: p.status,
      tier: p.tier,
      partnerType: p.partnerType,
      isVerified: p.isVerified,
      verifiedAt: p.verifiedAt,
      emirate: p.emirate,
      city: p.city,
      address: p.address,
      activeListingsCount: p.activeListingsCount,
      platformRating: p.platformRating,
      platformReviewCount: p.platformReviewCount,
      createdAt: p.createdAt,
      approvedAt: p.approvedAt,
      activatedAt: p.activatedAt,
      suspendedAt: p.suspendedAt,
      staffCount: members.length,
      staffMembers: members,
    };
  });
};

/**
 * Search users by email or name (for autocomplete/search)
 * Max limit: 50 results to prevent abuse
 */
const MAX_SEARCH_LIMIT = 50;

export const searchAdminUsers = async (query: string, limit: number = 10): Promise<Array<{
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}>> => {
  // Guard against excessive limits and empty queries
  const safeLimit = Math.min(Math.max(1, limit), MAX_SEARCH_LIMIT);
  
  // Sanitize query - minimum 2 chars to prevent wildcard abuse
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }
  
  const searchPattern = `%${trimmedQuery}%`;
  
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: userProfile.avatar,
      role: user.role,
    })
    .from(user)
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(
      sql`${user.email} ILIKE ${searchPattern} OR ${user.name} ILIKE ${searchPattern}`
    )
    .limit(safeLimit);

  return results;
};

/**
 * Get user count by role
 */
export const getAdminUserCountByRole = async (): Promise<{
  user: number;
  admin: number;
  super_admin: number;
  total: number;
}> => {
  const counts = await db
    .select({
      role: user.role,
      count: sql<number>`count(*)::int`,
    })
    .from(user)
    .groupBy(user.role);

  const countMap = new Map(counts.map(c => [c.role, c.count]));

  return {
    user: countMap.get('user') || 0,
    admin: countMap.get('admin') || 0,
    super_admin: countMap.get('super_admin') || 0,
    total: counts.reduce((sum, c) => sum + c.count, 0),
  };
};

/**
 * Get partner count by status
 */
export const getAdminPartnerCountByStatus = async (): Promise<{
  pending: number;
  active: number;
  suspended: number;
  cancelled: number;
  total: number;
}> => {
  const counts = await db
    .select({
      status: partner.status,
      count: sql<number>`count(*)::int`,
    })
    .from(partner)
    .groupBy(partner.status);

  const countMap = new Map(counts.map(c => [c.status, c.count]));

  return {
    pending: countMap.get('pending') || 0,
    active: countMap.get('active') || 0,
    suspended: countMap.get('suspended') || 0,
    cancelled: countMap.get('cancelled') || 0,
    total: counts.reduce((sum, c) => sum + c.count, 0),
  };
};

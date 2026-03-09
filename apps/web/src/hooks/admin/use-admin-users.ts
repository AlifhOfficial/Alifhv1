/**
 * Admin User Management Hooks
 * 
 * Admin operations for user management
 * - List all users with pagination
 * - Search users by email/phone/query
 * - Get dashboard statistics
 * 
 * Usage:
 * ```tsx
 * const { users, isLoading } = useAdminUsers({ limit: 20, sortBy: 'createdAt' });
 * const { user, isLoading } = useAdminUserByEmail('john@example.com');
 * const { users } = useAdminUserSearch({ query: 'john' });
 * const { stats } = useAdminStats();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface AdminUserData {
  // Core User Info
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Account Status
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | string | null;
  
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
    kycVerifiedAt: Date | string | null;
    
    // Location
    locationCity: string | null;
    locationEmirate: string | null;
    locationLat: number | null;
    locationLng: number | null;
    
    // Activity
    inventoryCount: number;
    rating: number | null;
    lastActiveAt: Date | string | null;
    memberSince: Date | string | null;
    
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
    verifiedAt: Date | string | null;
    verifiedBy: string | null;
    rejectionReason: string | null;
    createdAt: Date | string;
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
    joinedAt: Date | string;
  }>;
}

export interface AdminPartnerData {
  id: string;
  companyNameLegal: string;
  brandName: string;
  logo: string | null;
  tradeLicense: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier: 'flow' | 'black';
  partnerType: string;
  isVerified: boolean;
  verifiedAt: Date | string | null;
  
  // Location
  emirate: string | null;
  city: string | null;
  address: string | null;
  
  // Stats
  activeListingsCount: number;
  platformRating: number | null;
  platformReviewCount: number;
  
  // Dates
  createdAt: Date | string;
  approvedAt: Date | string | null;
  activatedAt: Date | string | null;
  suspendedAt: Date | string | null;
  
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
    joinedAt: Date | string;
  }>;
}

export interface AdminStats {
  users: {
    user: number;
    admin: number;
    super_admin: number;
    total: number;
  };
  partners: {
    pending: number;
    active: number;
    suspended: number;
    cancelled: number;
    total: number;
  };
}

export interface ListUsersOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface ListPartnersOptions {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'active' | 'suspended' | 'cancelled';
  sortBy?: 'createdAt' | 'brandName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchUsersOptions {
  email?: string;
  phone?: string;
  query?: string;
  limit?: number;
}

// ============================================================================
// Query Keys
// ============================================================================

const ADMIN_KEYS = {
  all: ['admin'] as const,
  users: () => [...ADMIN_KEYS.all, 'users'] as const,
  usersList: (options: ListUsersOptions) => [...ADMIN_KEYS.users(), 'list', options] as const,
  userSearch: (options: SearchUsersOptions) => [...ADMIN_KEYS.users(), 'search', options] as const,
  partners: () => [...ADMIN_KEYS.all, 'partners'] as const,
  partnersList: (options: ListPartnersOptions) => [...ADMIN_KEYS.partners(), 'list', options] as const,
  stats: () => [...ADMIN_KEYS.all, 'stats'] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchAdminUsers(options: ListUsersOptions = {}): Promise<{
  users: AdminUserData[];
  pagination: { limit: number; offset: number; count: number };
}> {
  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);

  const response = await fetch(`/api/admin/users?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch users');
  }
  
  const data = await response.json();
  return {
    users: data.data,
    pagination: data.pagination,
  };
}

async function searchAdminUsers(options: SearchUsersOptions): Promise<{
  user?: AdminUserData;
  users?: AdminUserData[];
  searchType: 'email' | 'phone' | 'autocomplete';
}> {
  const params = new URLSearchParams();
  
  if (options.email) params.append('email', options.email);
  if (options.phone) params.append('phone', options.phone);
  if (options.query) {
    params.append('q', options.query);
    if (options.limit) params.append('limit', options.limit.toString());
  }

  const response = await fetch(`/api/admin/users/search?${params.toString()}`);
  
  if (response.status === 404) {
    return { searchType: options.email ? 'email' : 'phone', user: undefined };
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to search users');
  }
  
  const data = await response.json();
  
  // Autocomplete returns array
  if (data.searchType === 'autocomplete') {
    return {
      users: data.data,
      searchType: data.searchType,
    };
  }
  
  // Email/phone returns single user
  return {
    user: data.data,
    searchType: data.searchType,
  };
}

async function fetchAdminPartners(options: ListPartnersOptions = {}): Promise<{
  partners: AdminPartnerData[];
  pagination: { limit: number; offset: number; count: number };
}> {
  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.status) params.append('status', options.status);
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);

  const response = await fetch(`/api/admin/partners?${params.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch partners');
  }
  
  const data = await response.json();
  return {
    partners: data.data,
    pagination: data.pagination,
  };
}

async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch('/api/admin/stats');
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch statistics');
  }
  
  const data = await response.json();
  return data.data;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * List all users with pagination and sorting
 * 
 * @param options - Pagination and sorting options
 * @returns User list with loading/error states
 */
export function useAdminUsers(options: ListUsersOptions = {}) {
  const query = useQuery({
    queryKey: ADMIN_KEYS.usersList(options),
    queryFn: () => fetchAdminUsers(options),
  });

  return {
    users: query.data?.users || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Search for a user by email
 * Returns null if user not found
 * 
 * @param email - Email address to search
 * @param enabled - Enable/disable the query
 * @returns Single user with loading/error states
 */
export function useAdminUserByEmail(email: string | null, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ADMIN_KEYS.userSearch({ email: email || undefined }),
    queryFn: () => searchAdminUsers({ email: email! }),
    enabled: enabled && !!email,
  });

  return {
    user: query.data?.user,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Search for a user by phone
 * Returns null if user not found
 * 
 * @param phone - Phone number to search
 * @param enabled - Enable/disable the query
 * @returns Single user with loading/error states
 */
export function useAdminUserByPhone(phone: string | null, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ADMIN_KEYS.userSearch({ phone: phone || undefined }),
    queryFn: () => searchAdminUsers({ phone: phone! }),
    enabled: enabled && !!phone,
  });

  return {
    user: query.data?.user,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Autocomplete search for users (by name or email)
 * Returns array of matching users
 * 
 * @param query - Search query string
 * @param options - Search options
 * @returns User list with loading/error states
 */
export function useAdminUserSearch(
  query: string | null,
  options: { limit?: number; enabled?: boolean } = {}
) {
  const { limit = 10, enabled = true } = options;

  const queryResult = useQuery({
    queryKey: ADMIN_KEYS.userSearch({ query: query || undefined, limit }),
    queryFn: () => searchAdminUsers({ query: query!, limit }),
    enabled: enabled && !!query && query.length >= 2,
  });

  return {
    users: queryResult.data?.users || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}

/**
 * List all partners with filtering and pagination
 * 
 * @param options - Filter and pagination options
 * @returns Partner list with loading/error states
 */
export function useAdminPartners(options: ListPartnersOptions = {}) {
  const query = useQuery({
    queryKey: ADMIN_KEYS.partnersList(options),
    queryFn: () => fetchAdminPartners(options),
  });

  return {
    partners: query.data?.partners || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Get dashboard statistics
 * Returns user and partner counts
 * 
 * @returns Statistics with loading/error states
 */
export function useAdminStats() {
  const query = useQuery({
    queryKey: ADMIN_KEYS.stats(),
    queryFn: fetchAdminStats,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * User Profile Hook - Unified with React Query
 * 
 * Clean implementation following the same pattern as favorites.
 * UI/UX → Hook → API → Query → DB
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query-keys';
import { invalidateUserData } from '@/lib/query-helpers';

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseTime: number | null; // Minutes (business hours only)
  responseRate: number | null; // Percentage (0-100)
}

export interface UserPasskey {
  id: string;
  name: string | null;
  createdAt: Date | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  kycVerified?: boolean;
  kycVerifiedAt?: Date | string | null;
  kycExpiryDate?: Date | string | null;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  kycRejectionReason?: string | null;
  badges?: string[];
  platformRating?: number | null;
  memberSince?: Date | string;
  avatar?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
}

export interface UserProfileResponse {
  profile: UserProfile | null;
  stats: UserStats;
  passkeys: UserPasskey[];
}

export interface UserProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  avatar?: string | null;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchUserProfile(): Promise<UserProfileResponse | null> {
  const res = await fetch('/api/profile/user/user-profile', {
    credentials: 'include',
    cache: 'no-store', // Bypass browser cache
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (res.status === 401) {
    return null; // Not authenticated
  }

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await res.json();
  return data;
}

async function updateUserProfileAPI(updates: UserProfileUpdate): Promise<UserProfile> {
  const res = await fetch('/api/profile/user/user-profile', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update profile');
  }

  const data = await res.json();
  return data.profile;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useUserProfile() {
  const queryClient = useQueryClient();
  const { refetch: refetchSession, isAuthenticated } = useAuth();

  // No client-side caching - server cache is source of truth
  // staleTime: Infinity prevents auto-refetches (we trust setQueryData for mutations)
  // gcTime: 0 means fresh fetch from server on each page visit
  const query = useQuery<UserProfileResponse | null>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: Infinity, // Never auto-refetch (mutations update via setQueryData)
    gcTime: 0, // No caching when unmounted - fresh from server each time
    refetchOnWindowFocus: false, // No auto refetch
    refetchOnMount: true, // Fetch on mount if no data
    refetchOnReconnect: false, // No auto refetch on reconnect
    retry: false, // Don't retry on 401
    enabled: isAuthenticated, // Only fetch when user is logged in
  });

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: updateUserProfileAPI,
    onSuccess: async (updatedProfile, variables) => {
      // Update the profile within the cached response
      queryClient.setQueryData<UserProfileResponse | null>(['user-profile'], (old) => {
        if (!old) return { profile: updatedProfile, stats: { listingsCount: 0, soldCount: 0, responseTime: null, responseRate: null }, passkeys: [] };
        return { ...old, profile: updatedProfile };
      });
      
      // Ensure session-backed UI (sidebar/navbar) reflects changes immediately.
      const touchesSession =
        'avatar' in variables ||
        'firstName' in variables ||
        'lastName' in variables ||
        'preferences' in variables;

      if (touchesSession && refetchSession) {
        await refetchSession();
      }
    },
  });

  return {
    profile: query.data?.profile ?? null,
    stats: query.data?.stats ?? null,
    passkeys: query.data?.passkeys ?? [],
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    error: query.error?.message || mutation.error?.message || null,
    refresh: () => queryClient.refetchQueries({ queryKey: ['user-profile'] }),
    updateProfile: (updates: UserProfileUpdate) => mutation.mutateAsync(updates),
    invalidateCache: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Invalidate user profile cache globally
 * Use this when profile is updated outside of the hook
 */
export function invalidateUserProfileCache() {
  // This can be imported and used anywhere to invalidate the cache
  // Useful for forms or components that update profile data
  if (typeof window !== 'undefined') {
    const queryClient = require('@tanstack/react-query').useQueryClient();
    queryClient?.invalidateQueries({ queryKey: ['user-profile'] });
  }
}

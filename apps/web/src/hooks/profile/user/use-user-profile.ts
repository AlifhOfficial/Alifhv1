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
import { CACHE_BEHAVIORS } from '@/lib/cache-config';
import { invalidateUserData } from '@/lib/cache-patterns';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  locationCity?: string | null;
  locationEmirate?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  kycVerified?: boolean;
  badges?: string[];
  inventoryCount?: number;
  rating?: number;
  platformRating?: number | null;
  platformReviewCount?: number | null;
  
  // ❌ avgResponseTime removed from user profile (only for partners)
  
  memberSince?: Date | string;
  status?: string;
  createdAt?: Date | string;
  avatar?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  locationCity?: string;
  locationEmirate?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: { theme?: string; language?: string; distanceUnit?: string; useGeneratedAvatar?: boolean };
  avatar?: string | null;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchUserProfile(): Promise<UserProfile | null> {
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
  return data.profile ?? null;
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

  // Fetch profile data with proper caching - ONLY when authenticated
  const query = useQuery<UserProfile | null>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    staleTime: 60 * 60 * 1000, // 1 hour cache - profiles rarely change
    gcTime: 90 * 60 * 1000, // Keep in cache for 90 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - expensive query
    refetchOnMount: false, // Don't refetch on remount - use cache
    retry: false, // Don't retry on 401
    enabled: isAuthenticated, // Only fetch when user is logged in
  });

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: updateUserProfileAPI,
    onSuccess: async (updatedProfile, variables) => {
      // Immediately update the cache with the new data from API response
      // The API already includes the signed avatarUrl, so no need to refetch
      queryClient.setQueryData(['user-profile'], updatedProfile);
      
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
    profile: query.data ?? null,
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

/**
 * User Profile Hook - Simplified
 * Only handles fields used in ProfileView
 */

'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

// Minimal profile type matching UI needs
// Note: firstName/lastName sync to user.name automatically
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
  kycVerified?: boolean;
  badges?: string[];
  inventoryCount?: number;
  carsSold?: number;
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
  avatar?: string | null;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refresh: () => Promise<UserProfile | null>;
  updateProfile: (input: UserProfileUpdate) => Promise<UserProfile | null>;
}

// Shared store for deduplication
let store: {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
} = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

let pendingRequest: Promise<UserProfile | null> | null = null;
const listeners = new Set<(state: typeof store) => void>();

const notify = () => {
  listeners.forEach(listener => listener(store));
};

const updateStore = (partial: Partial<typeof store>) => {
  store = { ...store, ...partial };
  notify();
};

const resetStore = () => {
  store = { profile: null, isLoading: false, isUpdating: false, error: null };
  pendingRequest = null;
  notify();
};

async function refreshProfileFromServer(): Promise<UserProfile | null> {
  // Deduplicate requests
  if (pendingRequest) {
    return pendingRequest;
  }

  updateStore({ isLoading: true });

  pendingRequest = (async () => {
    try {
      const res = await fetch('/api/profile/user-profile', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!res.ok) {
        if (res.status === 401) {
          resetStore();
          return null;
        }
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const profile = data.profile ?? null;
      
      updateStore({ profile, error: null });
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      updateStore({ error: message });
      return null;
    } finally {
      updateStore({ isLoading: false });
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

async function patchProfileOnServer(input: UserProfileUpdate): Promise<UserProfile | null> {
  updateStore({ isUpdating: true });

  try {
    const res = await fetch('/api/profile/user-profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      if (res.status === 401) {
        resetStore();
        return null;
      }
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    const profile = data.profile ?? null;
    
    updateStore({ profile, error: null });
    return profile;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    updateStore({ error: message });
    return null;
  } finally {
    updateStore({ isUpdating: false });
  }
}

export function useUserProfile(options: { fetchOnMount?: boolean; userId?: string | null } = {}): UseUserProfileResult {
  const { fetchOnMount = true, userId = undefined } = options;
  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (nextState: typeof store) => setState(nextState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      resetStore();
      return;
    }
    if (store.profile && store.profile.userId !== userId) {
      resetStore();
    }
  }, [userId]);

  const refresh = useCallback(() => refreshProfileFromServer(), []);
  const updateProfile = useCallback((input: UserProfileUpdate) => patchProfileOnServer(input), []);

  useEffect(() => {
    if (!fetchOnMount) return;
    if (store.profile || store.isLoading) return;
    void refreshProfileFromServer();
  }, [fetchOnMount]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    refresh,
    updateProfile,
  };
}

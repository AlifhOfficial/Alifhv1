'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProfileUpdateInput, ProfileWithAvatarUrl } from '@/lib/profile';

interface UseProfileOptions {
  /** Skip the initial fetch and control it manually via `refresh`. */
  fetchOnMount?: boolean;
  /** Current authenticated user id. Used to clear cached profile when identity changes. */
  userId?: string | null;
}

interface UseProfileResult {
  profile: ProfileWithAvatarUrl | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refresh: () => Promise<ProfileWithAvatarUrl | null>;
  updateProfile: (
    input: ProfileUpdateInput
  ) => Promise<ProfileWithAvatarUrl | null>;
  setTags: (tags: string[]) => Promise<ProfileWithAvatarUrl | null>;
  setLocation: (
    location: UseProfileLocationInput
  ) => Promise<ProfileWithAvatarUrl | null>;
}

export interface UseProfileLocationInput {
  city?: string | null;
  emirate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const PROFILE_ENDPOINT = '/api/profile';

type ProfileResponse = { profile?: ProfileWithAvatarUrl | null; error?: string };

class ProfileRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ProfileRequestError';
  }
}

type ProfileStore = {
  profile: ProfileWithAvatarUrl | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
};

let store: ProfileStore = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const listeners = new Set<(state: ProfileStore) => void>();

const notify = () => {
  for (const listener of listeners) {
    listener(store);
  }
};

const updateStore = (partial: Partial<ProfileStore>) => {
  store = { ...store, ...partial };
  notify();
};

const resetStore = () => {
  store = {
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
  };
  notify();
};

async function parseJsonResponse(response: Response): Promise<ProfileResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return {};
  }

  try {
    return (await response.json()) as ProfileResponse;
  } catch (error) {
    console.warn('[useProfile] Failed to parse JSON response', error);
    return {};
  }
}

async function requestProfile(init: RequestInit): Promise<ProfileWithAvatarUrl | null> {
  const response = await fetch(PROFILE_ENDPOINT, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message = data.error || `Request failed with status ${response.status}`;
    throw new ProfileRequestError(message, response.status);
  }

  return data.profile ?? null;
}

async function refreshProfileFromServer(): Promise<ProfileWithAvatarUrl | null> {
  updateStore({ isLoading: true });

  try {
    const result = await requestProfile({ method: 'GET', cache: 'no-store' });
    updateStore({ profile: result, error: null });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    if (err instanceof ProfileRequestError && err.status === 401) {
      resetStore();
      return null;
    }
    updateStore({ error: message });
    return null;
  } finally {
    updateStore({ isLoading: false });
  }
}

async function patchProfileOnServer(
  input: ProfileUpdateInput
): Promise<ProfileWithAvatarUrl | null> {
  updateStore({ isUpdating: true });

  try {
    const result = await requestProfile({
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    updateStore({ profile: result, error: null });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    if (err instanceof ProfileRequestError && err.status === 401) {
      resetStore();
      return null;
    }
    updateStore({ error: message });
    return null;
  } finally {
    updateStore({ isUpdating: false });
  }
}

export function useProfile(options: UseProfileOptions = {}): UseProfileResult {
  const { fetchOnMount = true, userId = undefined } = options;
  const [state, setState] = useState<ProfileStore>(store);

  useEffect(() => {
    const listener = (nextState: ProfileStore) => {
      setState(nextState);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    if (userId === null) {
      resetStore();
      return;
    }

    if (store.profile && store.profile.userId !== userId) {
      resetStore();
    }
  }, [userId]);

  const refresh = useCallback(() => refreshProfileFromServer(), []);
  const updateProfile = useCallback(
    (input: ProfileUpdateInput) => patchProfileOnServer(input),
    []
  );

  const setTags = useCallback(
    async (tags: string[]) => {
      updateStore({ isUpdating: true });
      try {
        const result = await patchProfileOnServer({ tags });
        if (result) {
          updateStore({ profile: result, error: null });
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update tags';
        updateStore({ error: message });
        return null;
      } finally {
        updateStore({ isUpdating: false });
      }
    },
    []
  );

  const setLocation = useCallback(
    async (location: UseProfileLocationInput) => {
      updateStore({ isUpdating: true });
      try {
        const result = await patchProfileOnServer({
          locationCity: location.city ?? undefined,
          locationEmirate: location.emirate ?? undefined,
          locationLat: location.latitude ?? null,
          locationLng: location.longitude ?? null,
        });
        if (result) {
          updateStore({ profile: result, error: null });
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update location';
        updateStore({ error: message });
        return null;
      } finally {
        updateStore({ isUpdating: false });
      }
    },
    []
  );

  useEffect(() => {
    if (!fetchOnMount) return;

    const current = store;
    if (current.profile || current.isLoading) {
      return;
    }

    void refreshProfileFromServer();
  }, [fetchOnMount]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    refresh,
    updateProfile,
    setTags,
    setLocation,
  };
}

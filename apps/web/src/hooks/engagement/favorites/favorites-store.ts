'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getFavoritesStatusAction } from '@/actions/favorites';

export interface FavoritesStatusData {
  favorites: string[];
  superlikes: string[];
  quota: {
    currentMonthSuperlikesUsed: number;
    maxSuperlikesPerMonth: number;
    premiumSuperlikesBonus: number;
    remaining: number;
    periodEndDate?: string | Date | null;
    periodStartDate?: string | Date | null;
  };
}

interface FavoritesStoreState {
  data: FavoritesStatusData | null;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_STATE: FavoritesStoreState = {
  data: null,
  isLoading: false,
  error: null,
};

let state: FavoritesStoreState = DEFAULT_STATE;
const listeners = new Set<() => void>();
let inFlightRequest: Promise<FavoritesStatusData | null> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: Partial<FavoritesStoreState>) {
  state = { ...state, ...nextState };
  emitChange();
}

async function fetchFavoritesStatus(): Promise<FavoritesStatusData> {
  return getFavoritesStatusAction();
}

export async function ensureFavoritesLoaded(force = false, silent = false) {
  if (!force && (state.isLoading || state.data)) {
    return state.data;
  }

  if (!force && inFlightRequest) {
    return inFlightRequest;
  }

  const shouldShowLoading = !(silent && state.data);
  if (shouldShowLoading) {
    setState({ isLoading: true, error: null });
  } else {
    setState({ error: null });
  }

  inFlightRequest = fetchFavoritesStatus()
    .then((data) => {
      setState({ data, isLoading: false, error: null });
      return data;
    })
    .catch((error) => {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load favorites',
      });
      return null;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

export async function refreshFavorites() {
  return ensureFavoritesLoaded(true, true);
}

export function seedFavorites(data: FavoritesStatusData) {
  setState({ data, isLoading: false, error: null });
}

export function clearFavoritesStore() {
  state = DEFAULT_STATE;
  inFlightRequest = null;
  emitChange();
}

export function updateFavoritesState(
  updater: (current: FavoritesStatusData | null) => FavoritesStatusData | null
) {
  setState({ data: updater(state.data) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useFavoritesStore(options?: { enabled?: boolean; initialData?: FavoritesStatusData }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (options?.initialData) {
      seedFavorites(options.initialData);
      return;
    }

    if (options?.enabled ?? true) {
      void ensureFavoritesLoaded();
    }
  }, [options?.enabled, options?.initialData]);

  return snapshot;
}

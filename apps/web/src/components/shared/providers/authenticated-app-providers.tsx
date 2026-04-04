'use client';

import { getQueryClient } from '@/lib/query-client';
import type { FavoritesStatusData } from '@/hooks/engagement/favorites/use-favorites-unified';
import { useRef } from 'react';

interface AuthenticatedAppProvidersProps {
  children: React.ReactNode;
  initialFavoritesStatus?: FavoritesStatusData;
  initialNavbarFavoriteListings?: Array<{
    id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    price: number | null;
    thumbnail: string | null;
  }>;
  initialNavbarFavoriteIds?: string[];
  initialPersonalConversations?: {
    conversations: Array<Record<string, unknown>>;
    totalUnread: number;
    hasMore: boolean;
  };
  initialUserId?: string;
}

export function AuthenticatedAppProviders({
  children,
  initialFavoritesStatus,
  initialNavbarFavoriteListings,
  initialNavbarFavoriteIds,
  initialPersonalConversations,
  initialUserId,
}: AuthenticatedAppProvidersProps) {
  const queryClient = getQueryClient();
  const seededRef = useRef<symbol | null>(null);

  if (seededRef.current == null) {
    seededRef.current = Symbol('seeded');

    queryClient.setQueryDefaults(['favorites-status'], {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

    if (initialFavoritesStatus && queryClient.getQueryData(['favorites-status']) === undefined) {
      queryClient.setQueryData(['favorites-status'], initialFavoritesStatus);
    }

    if (initialNavbarFavoriteListings && initialNavbarFavoriteIds) {
      const navbarListingsKey = ['navbar-favorites-listings', ...initialNavbarFavoriteIds];
      if (queryClient.getQueryData(navbarListingsKey) === undefined) {
        queryClient.setQueryData(navbarListingsKey, initialNavbarFavoriteListings);
      }
    }

    if (initialUserId && initialPersonalConversations) {
      const conversationsKey = ['conversations', initialUserId, 'personal', 50] as const;

      queryClient.setQueryDefaults(conversationsKey, {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      });

      if (queryClient.getQueryData(conversationsKey) === undefined) {
        queryClient.setQueryData(conversationsKey, {
          pages: [initialPersonalConversations],
          pageParams: [0],
        });
      }
    }
  }

  return <>{children}</>;  
}

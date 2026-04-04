"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { FavoritesStatusData } from "@/hooks/engagement/favorites/use-favorites-unified";
import type { ConversationsResponse } from "@/hooks/messaging/use-conversations";
import { useRef } from "react";

interface QueryProviderProps {
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
  initialPersonalConversations?: ConversationsResponse;
  initialUserId?: string;
}

export function QueryProvider({
  children,
  initialFavoritesStatus,
  initialNavbarFavoriteListings,
  initialNavbarFavoriteIds,
  initialPersonalConversations,
  initialUserId,
}: QueryProviderProps) {
  const queryClient = getQueryClient();
  const seededRef = useRef<symbol | null>(null);

  if (seededRef.current == null) {
    seededRef.current = Symbol('seeded');

    // Preserve server-seeded singleton queries before any observers mount.
    // gcTime: Infinity prevents GC before useQuery observers attach.
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

    // Set defaults and seed conversations data for NavbarMessaging and messaging pages.
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

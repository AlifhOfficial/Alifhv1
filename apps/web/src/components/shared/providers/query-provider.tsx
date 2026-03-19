"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { FavoritesStatusData } from "@/hooks/engagement/favorites/use-favorites-unified";
import { queryKeys } from "@/lib/query-keys";
import type { ConversationsResponse } from "@/hooks/messaging/use-conversations";

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

  // Preserve server-seeded singleton queries before any observers mount.
  // gcTime: Infinity prevents GC before useQuery observers attach.
  queryClient.setQueryDefaults(['favorites-status'], {
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (initialFavoritesStatus) {
    queryClient.setQueryData(['favorites-status'], initialFavoritesStatus);
  }

  if (initialNavbarFavoriteListings && initialNavbarFavoriteIds) {
    queryClient.setQueryData(
      ['navbar-favorites-listings', ...initialNavbarFavoriteIds],
      initialNavbarFavoriteListings
    );
  }

  if (initialUserId) {
    queryClient.setQueryDefaults(['conversations', initialUserId, 'personal'], {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });
  }

  if (initialPersonalConversations && initialUserId) {
    queryClient.setQueryData(['conversations', initialUserId, 'personal'], initialPersonalConversations);
    queryClient.setQueryData(
      queryKeys.messaging.unreadCount(),
      { unreadCount: initialPersonalConversations.totalUnread ?? 0 }
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

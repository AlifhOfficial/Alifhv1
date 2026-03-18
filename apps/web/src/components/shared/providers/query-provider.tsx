"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { FavoritesStatusData } from "@/hooks/engagement/favorites/use-favorites-unified";
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
  initialPersonalConversations?: ConversationsResponse;
  initialUserId?: string;
}

export function QueryProvider({
  children,
  initialFavoritesStatus,
  initialNavbarFavoriteListings,
  initialPersonalConversations,
  initialUserId,
}: QueryProviderProps) {
  const queryClient = getQueryClient();

  // Preserve server-seeded singleton queries before any observers mount.
  queryClient.setQueryDefaults(['favorites-status'], {
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (initialUserId) {
    queryClient.setQueryDefaults(['conversations', initialUserId, 'personal'], {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });
  }

  if (initialFavoritesStatus) {
    queryClient.setQueryData(['favorites-status'], initialFavoritesStatus);
  }

  if (initialNavbarFavoriteListings) {
    queryClient.setQueryData(['navbar-favorites-listings'], initialNavbarFavoriteListings);
  }

  if (initialPersonalConversations && initialUserId) {
    queryClient.setQueryData(['conversations', initialUserId, 'personal'], initialPersonalConversations);
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

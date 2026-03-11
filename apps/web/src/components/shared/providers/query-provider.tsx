"use client";

import { useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import type { FavoritesStatusData } from "@/hooks/engagement/favorites/use-favorites-unified";
import type { ConversationsResponse } from "@/hooks/messaging/use-conversations";

interface QueryProviderProps {
  children: React.ReactNode;
  initialFavoritesStatus?: FavoritesStatusData;
  initialPersonalConversations?: ConversationsResponse;
  initialUserId?: string;
}

export function QueryProvider({
  children,
  initialFavoritesStatus,
  initialPersonalConversations,
  initialUserId,
}: QueryProviderProps) {
  const queryClient = getQueryClient();
  const hydratedFavoritesRef = useRef(false);
  const hydratedPersonalConversationsRef = useRef(false);

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

  if (initialFavoritesStatus && !hydratedFavoritesRef.current) {
    queryClient.setQueryData(['favorites-status'], initialFavoritesStatus);
    hydratedFavoritesRef.current = true;
  }

  if (initialPersonalConversations && initialUserId && !hydratedPersonalConversationsRef.current) {
    queryClient.setQueryData(['conversations', initialUserId, 'personal'], initialPersonalConversations);
    hydratedPersonalConversationsRef.current = true;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

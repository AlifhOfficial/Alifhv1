'use client';

import { useQueryClient } from '@tanstack/react-query';
import { GlobalChatProvider } from '@/components/shared/providers/global-chat-provider';
import type { FavoritesStatusData } from '@/hooks/engagement/favorites/use-favorites-unified';

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
  const queryClient = useQueryClient();

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

  if (initialUserId && initialPersonalConversations) {
    const conversationsKey = ['conversations', initialUserId, 'personal', 50] as const;

    queryClient.setQueryDefaults(conversationsKey, {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

    queryClient.setQueryData(conversationsKey, {
      pages: [initialPersonalConversations],
      pageParams: [0],
    });
  }

  return <GlobalChatProvider>{children}</GlobalChatProvider>;
}

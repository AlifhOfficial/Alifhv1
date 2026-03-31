import { QueryClient, isServer } from '@tanstack/react-query';

const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000;
const DEFAULT_GC_TIME_MS = 30 * 60 * 1000;

/**
 * Query Client Factory - Standardized Configuration
 *
 * Web is SSR-first, but we still keep a modest client cache so navigation and
 * background revalidation feel fast without pretending old data is live.
 *
 * Per-query hooks can tighten or loosen these defaults when a surface needs a
 * different freshness model.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: DEFAULT_GC_TIME_MS,

        // Keep focus refetch opt-in to avoid noisy reloads on navigation-heavy pages.
        refetchOnWindowFocus: false,

        // Retry remains opt-in so failures stay explicit.
        retry: false,

        // Reconnect refetch is opt-in because some pages are intentionally
        // server-hydrated snapshots, while others are real-time or manually refreshed.
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is important to avoid re-making a new client on every render
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

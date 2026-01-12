import { QueryClient, isServer } from '@tanstack/react-query';

/**
 * Query Client Factory - Standardized Configuration
 * 
 * Creates React Query clients with server-side only caching.
 * No client-side caching - server handles all caching with proper invalidation.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // No client-side caching - server handles caching with proper invalidation
        staleTime: 0,
        gcTime: 0,
        
        // Don't refetch on window focus by default (opt-in per query)
        refetchOnWindowFocus: false,
        
        // Don't retry failed queries by default (opt-in per query)
        retry: false,
        
        // Don't refetch on reconnect by default (opt-in per query)
        refetchOnReconnect: false,
      },
      mutations: {
        // Don't retry failed mutations by default
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

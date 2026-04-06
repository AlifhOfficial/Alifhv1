export const MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS = 5 * 60_000;
export const MESSAGING_MESSAGES_CACHE_STALE_TIME_MS = 30 * 60_000;

// Backward compatibility alias. Prefer the scoped constants above.
export const MESSAGING_CACHE_STALE_TIME_MS = MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS;
export const MESSAGING_CACHE_GC_TIME_MS = 5 * 60_000;

// Keep page sizes aligned across clients for consistent pagination behavior.
export const MESSAGING_CONVERSATIONS_PAGE_SIZE = 30;
export const MESSAGING_MESSAGES_PAGE_SIZE = 30;
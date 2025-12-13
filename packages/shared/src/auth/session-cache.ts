import type { ExtendedUser } from "./types";

export interface CachedSession {
  user: ExtendedUser;
  expiresAt: number;
}

export const DEFAULT_SESSION_CACHE_TTL_MS = 30_000;
export const SESSION_CACHE_TTL_MS = DEFAULT_SESSION_CACHE_TTL_MS;

const globalForCache = globalThis as typeof globalThis & {
  __alifhSessionCache?: Map<string, CachedSession>;
};

const sessionCache =
  globalForCache.__alifhSessionCache ??
  (globalForCache.__alifhSessionCache = new Map<string, CachedSession>());

export function getCachedSession(token: string | undefined): ExtendedUser | null {
  if (!token) return null;

  const cached = sessionCache.get(token);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    sessionCache.delete(token);
    return null;
  }

  return cached.user;
}

export function setCachedSession(
  token: string,
  user: ExtendedUser,
  ttlMs: number = DEFAULT_SESSION_CACHE_TTL_MS
) {
  sessionCache.set(token, {
    user,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateSessionByToken(token: string) {
  sessionCache.delete(token);
}

export function invalidateUserSessions(userId: string) {
  for (const [token, cached] of sessionCache.entries()) {
    if (cached.user.id === userId) {
      sessionCache.delete(token);
    }
  }
}

export function invalidateAllSessions() {
  sessionCache.clear();
}

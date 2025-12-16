import type { ExtendedUser } from "./types";
import { AUTH_CONFIG } from "./config";

export interface CachedSession {
  user: ExtendedUser;
  expiresAt: number;
}

// Use centralized config value (5 minutes for better performance)
export const DEFAULT_SESSION_CACHE_TTL_MS = AUTH_CONFIG.SESSION_CACHE_TTL_MS;
export const SESSION_CACHE_TTL_MS = DEFAULT_SESSION_CACHE_TTL_MS;

// TODO: Replace in-memory cache with production-ready solution
// 
// ISSUES WITH CURRENT IN-MEMORY CACHE:
// - Does not work across multiple server instances (horizontal scaling)
// - Memory leaks possible with no automatic cleanup
// - Lost on server restart
// - Hot module replacement issues in development
//
// RECOMMENDED SOLUTIONS:
// 1. Vercel KV (Redis) - Serverless-friendly
//    - import { kv } from '@vercel/kv'
//    - await kv.set(`session:${token}`, user, { ex: TTL_SECONDS })
//    - await kv.get(`session:${token}`)
//
// 2. Upstash Redis - Alternative serverless Redis
//    - Similar API to Vercel KV
//    - Works on any platform
//
// 3. Better Auth's built-in session management
//    - Consider removing custom cache entirely
//    - Let Better Auth handle session persistence

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

# Cache Removal & Replacement — Operation Scope

> **Goal:** Strip all broken in-process `memoryCache` caching. Replace with Cloudflare edge cache (public endpoints) + Upstash Redis (sessions, rate limiting).

---

## Why

- `memoryCache` is a per-process `Map`. Multi-instance Railway = each instance has different cache = stale data, 404s.
- 17 invalidation functions across 30+ call sites. Easy to miss (AI moderation bug proved this).
- Rate limiting is per-instance — trivially bypassed.
- Upstash Redis credentials already in env but never connected.
- All traffic already routes through Cloudflare — free edge caching wasted with `Cache-Control: no-store`.

---

## Phase 1: Remove All memoryCache (this operation)

### 1A — Delete cache infrastructure
```
DELETE packages/database/src/caches/          (entire directory)
DELETE packages/database/src/queries/listings/car-listings/cache-invalidation.ts
DELETE apps/web/src/app/api/admin/cache/stats/route.ts     (cache dashboard)
DELETE apps/web/src/app/api/internal/warm-cache/route.ts   (cache warmer)
```

### 1B — DB query files: remove cache wrapping, keep raw queries (15 files)

| File | Remove |
|------|--------|
| `queries/listings/car-listings/car-detailed-query.ts` | `memoryCache.get/set` around `getListingDetailed()` |
| `queries/auth/user-auth-queries.ts` | `memoryCache.get/set` in `getUserById()`, `.delete()` in update/delete |
| `queries/profile/user/user-profile-query.ts` | `memoryCache.get/set/delete` + `invalidateUserSessions()` call |
| `queries/partner/staff-profile-query.ts` | `memoryCache.get/set` in `getStaffEffectivePhone()` |
| `queries/partner/car-dealer/partner-stats.ts` | `memoryCache.get/set` (already disabled/no-op) |
| `queries/partner/car-dealer/get-partners-list.ts` | `memoryCache.get/set` with key `'partners:list:top50'` |
| `queries/partner/car-dealer/get-dealer-base-profile.ts` | `memoryCache.get/set` in `getDealerBaseProfile()` |
| `queries/partner/car-dealer/partner-profile-comprehensive.ts` | `memoryCache.get/set` + `invalidatePartnerProfileComprehensive/ListingsInSearch` |
| `queries/partner/car-dealer/update-dealer-base-profile.ts` | `invalidateDealerBaseProfile/PartnerListingsInSearch/UserSessions` calls |
| `queries/partner/showroom/showroom-queries.ts` | 6 get/set pairs + `ShowroomCacheKeys/TTL` + `invalidateShowroomCache()` |
| `queries/admin/kyc-query.ts` | `memoryCache.delete()` + `invalidateUserListingsInSearch()` in approve/reject |
| `queries/admin/user-operations-query.ts` | `invalidateUserSession()` in `banUser()` |
| `services/google-reviews.ts` | `memoryCache.delete()` in `syncPartnerReviews()` |
| `queries/listings/car-listings/mutations/ai-moderation.ts` | `invalidateListingDetail/SearchCaches` (the fix we just added — removing) |
| `queries/engagement/favorites.ts` | Already clean — no changes needed |

### 1C — API routes: remove response-level `memoryCache` caching (14 files)

| Route | Cached what |
|-------|------------|
| `listings/[id]/detailed/route.ts` | Full response object (CacheTTL.listingDetail) |
| `listings/car-card/route.ts` | Card responses with dynamic keys |
| `listings/search/route.ts` | Search results + facets |
| `listings/search/suggest/route.ts` | Suggestions + popular searches |
| `listings/my-listings/route.ts` | My listings + stats + maintenance flag |
| `listings/[id]/similar/route.ts` | Similar listings |
| `listings/black/route.ts` | Black listings |
| `bookings/route.ts` | User bookings + maintenance flag |
| `bookings/partner-bookings/route.ts` | Partner booking stats |
| `bookings/manage/route.ts` | Managed bookings + stats |
| `sellers/stats/route.ts` | Seller stats |
| `engagement/favorites-status/route.ts` | Favorites status map |
| `ai/summary/route.ts` | AI listing summary |
| `admin/listings/route.ts` | Admin listing stats |

### 1D — API routes: remove invalidation calls only (27 files)

Remove `invalidateXxx()` calls + their imports. The underlying mutation logic stays.

Routes: `listings/[id]/route.ts`, `listings/route.ts`, `listings/[id]/black-status/route.ts`, `listings/[id]/extend/route.ts`, `listings/[id]/hard-delete/route.ts`, `listings/[id]/mark-sold/route.ts`, `listings/[id]/reassign/route.ts`, `listings/bulk-delete/route.ts`, `listings/cleanup-deleted/route.ts`, `admin/listings/[id]/operations/route.ts`, `admin/listings/[id]/route.ts`, `admin/partners/operations/route.ts`, `admin/users/operations/route.ts`, `bookings/[id]/route.ts`, `cron/expire-listings/route.ts`, `engagement/favorites/route.ts`, `engagement/superlikes/route.ts`, `kyc/cancel/route.ts`, `kyc/didit/session/route.ts`, `kyc/sync/route.ts`, `kyc/webhook/route.ts`, `partner/staff/operations/route.ts`, `partner/staff/resign/route.ts`, `partners/request/admin/route.ts`, `profile/user/delete-account/route.ts`, `profile/user/user-profile/route.ts`, `user/staff-invites/route.ts`

### 1E — Auth/Session/Rate-limit (3 files — KEEP with TODO)

These need Upstash Redis before full removal. For Phase 1, remove `memoryCache` dependency but leave session logic functional:

| File | What to do |
|------|-----------|
| `proxy.ts` | `sessionCache` → remove caching, always fetch from DB (temp perf hit until Phase 2) |
| `lib/auth/index.ts` | `sessionCache` → remove caching layer, remove `setSessionCacheInvalidator`, remove `invalidateUserSessions` calls. Add `// TODO: Add Upstash Redis session cache` |
| `lib/rate-limit/index.ts` | Remove `memoryCache` usage → simple in-memory `Map` with TTL (temporary, replaced by `@upstash/ratelimit` in Phase 2) |

### 1F — Package exports cleanup (2 files)

| File | Remove |
|------|--------|
| `packages/database/src/server.ts` | All `memoryCache`, `CacheKeys`, `CacheTTL`, `CachePrefixes`, and all `invalidateXxx` exports |
| `packages/database/src/index.ts` | Any cache-related re-exports |

---

## Phase 2: Add proper caching (separate PR)

### 2A — Upstash Redis
- Install `@upstash/redis` + `@upstash/ratelimit`
- Session cache: `proxy.ts` + `lib/auth/index.ts` → Redis-backed with 5min TTL
- Rate limiting: `lib/rate-limit/index.ts` → `@upstash/ratelimit` sliding window
- Env vars already configured: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### 2B — Cloudflare Edge Cache
- Public read endpoints → `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`
- Mutation endpoints → Cloudflare Cache Purge API (`/api/listings/[id]` → purge `/api/listings/[id]/detailed`)
- Authenticated endpoints → `Cache-Control: private, no-store` (unchanged)

### 2C — Candidates for Cloudflare edge caching

| Endpoint | s-maxage | stale-while-revalidate |
|----------|----------|----------------------|
| `listings/[id]/detailed` | 300s | 60s |
| `listings/search` | 120s | 30s |
| `listings/car-card` | 300s | 60s |
| `listings/[id]/similar` | 600s | 120s |
| `listings/black` | 300s | 60s |
| `sellers/stats` | 600s | 120s |

---

## File counts

| Category | Files | Action |
|----------|-------|--------|
| Cache infra (`caches/`) | ~8 | Delete directory |
| DB queries | 15 | Edit (remove cache wrapping) |
| API routes (direct cache) | 14 + 2 delete | Edit / Delete |
| API routes (invalidation only) | 27 | Edit (remove calls + imports) |
| Auth/session/rate-limit | 3 | Edit (remove memoryCache, add TODO) |
| Package exports | 2 | Edit |
| **Total** | **~70** | |

---

## DO NOT TOUCH

- React Query (`queryClient.invalidateQueries`) in components/hooks — this is client-side, stays
- `revalidatePath()` in showroom routes — this is Next.js ISR, stays
- Image CDN (`getPublicUrl`, `getThumbUrl`, `getStaticUrl`) — separate system, already done
- `lib/cache-patterns.ts` + `lib/query-keys.ts` — React Query helpers, stay

# Server-Side Caching System

**Location:** `/packages/database/src/caches/`

Single source of truth for all caching in the application.

## 📁 Files

- **`memory-cache.ts`** - Core in-memory cache implementation
- **`auth-cache.ts`** - Session/authentication caching
- **`invalidation.ts`** - All cache invalidation functions
- **`index.ts`** - Public exports

## 🎯 Usage Pattern

### Set Cache
```typescript
import { memoryCache, CacheTTL } from '@alifh/database';

const data = await fetchExpensiveData();
memoryCache.set('my-key', data, CacheTTL.listingDetail); // 10 min
```

### Get Cache
```typescript
const cached = memoryCache.get('my-key');
if (cached) return cached;
```

### Invalidate Cache
```typescript
import { 
  invalidateSearchCaches,
  invalidateListingCaches,
  invalidateFavoritesCache 
} from '@alifh/database';

// After mutation
await updateListing(id);
invalidateListingCaches(id, partnerId); // Auto-clears search too
```

## 🔑 Available Functions

### Listings
- `invalidateSearchCaches()` - All search results
- `invalidateListingDetail(id)` - Single listing
- `invalidateListingCaches(id, partnerId?, userId?)` - Full listing + search + stats
- `invalidatePartnerInventory(partnerId)` - Partner's listings

### Engagement
- `invalidateFavoritesCache(userId)` - User's favorites/superlikes

### User Dashboard Data
- `invalidateUserMyListings(userId)` - User's personal listings cache (called on create/update/delete)
- `invalidateUserBookings(userId)` - User's bookings cache (called on create/cancel/reschedule)

### Profiles & Stats
- `invalidatePartnerProfile(partnerId)` - Partner profile
- `invalidatePartnerStats(partnerId)` - Partner stats (inventory, sales, response rate/time)
- `invalidateUserProfile(userId)` - User profile
- `invalidateUserStats(userId)` - User stats (via profile)

### Nuclear
- `invalidateAllCaches()` - Clear everything (use sparingly)

## ⚙️ Cache TTLs

```typescript
CacheTTL.userSession      // 5 min - auth sessions
CacheTTL.userMyListings   // 2 min - user's personal listings
CacheTTL.userBookings     // 2 min - user's bookings
CacheTTL.listingDetail    // 10 min - listing data
CacheTTL.searchResults    // 10 min - search queries
```

## 🚫 What NOT to Do

❌ Client-side caching for **shared data** (listings, search results)
❌ Browser caching (Cache-Control headers)
❌ Manual cache key construction

## ✅ What TO Do

✅ Always use server-side cache for shared data
✅ Always invalidate after mutations
✅ Use provided invalidation functions
✅ Import from `@alifh/database`

## 🔐 Exception: User-Owned Data

For user-specific data (favorites, superlikes), client-side caching with `staleTime: Infinity` is **allowed**:

```typescript
// ✅ OK for user-owned data
useQuery({
  queryKey: ['favorites-status'],
  queryFn: fetchFavoritesStatus,
  staleTime: Infinity,           // Never refetch automatically
  refetchOnWindowFocus: false,   // Only refetch after mutations
});
```

**Why this is safe:**
- User-owned data changes ONLY via user actions (mutations)
- Both server cache (`invalidateFavoritesCache`) AND client cache (`invalidateQueries`) are invalidated together
- No risk of stale data from other users' actions

**Where this applies:**
- `favorites-status` (favorites, superlikes, quota)
- User profile data
- User bookings

## 📝 Adding New Cache

1. Add cache key to `memory-cache.ts` `CacheKeys`
2. Add invalidation function to `invalidation.ts`
3. Export from `index.ts`
4. Use in your API route
5. Document here

## 🎯 Philosophy

**Single Source of Truth = Server Memory Cache**

- Server handles caching with proper invalidation
- Client always fetches fresh from server
- Browser doesn't cache API responses
- Simple, predictable, bulletproof

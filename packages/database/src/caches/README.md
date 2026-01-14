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

### Profiles & Stats
- `invalidatePartnerProfile(partnerId)` - Partner profile
- `invalidatePartnerStats(partnerId)` - Partner stats (inventory, sales, response rate/time)
- `invalidateUserProfile(userId)` - User profile
- `invalidateUserStats(userId)` - User stats (via profile)

### Nuclear
- `invalidateAllCaches()` - Clear everything (use sparingly)

## ⚙️ Cache TTLs

```typescript
CacheTTL.userSession    // 5 min - auth sessions
CacheTTL.listingDetail  // 10 min - listing data
CacheTTL.searchResults  // 10 min - search queries
```

## 🚫 What NOT to Do

❌ Client-side caching (React Query staleTime/gcTime)
❌ Browser caching (Cache-Control headers)
❌ Manual cache key construction

## ✅ What TO Do

✅ Always use server-side cache
✅ Always invalidate after mutations
✅ Use provided invalidation functions
✅ Import from `@alifh/database`

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

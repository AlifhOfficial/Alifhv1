# Listings Cache - Quick Reference

⚡ **3-Layer Caching for Maximum Performance**

---

## 📦 Cache Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: React Query (Client)         │
│  TTL: 5 minutes                         │
│  Benefit: Instant navigation            │
└─────────────────────────────────────────┘
           ↓ (cache miss)
┌─────────────────────────────────────────┐
│  Layer 2: Memory Cache (Server)        │
│  TTL: 1-5 minutes                       │
│  Benefit: <1ms API response             │
└─────────────────────────────────────────┘
           ↓ (cache miss)
┌─────────────────────────────────────────┐
│  Layer 3: CDN Cache (Edge)              │
│  TTL: 60s + 120s stale-while-revalidate │
│  Benefit: Global edge caching           │
└─────────────────────────────────────────┘
           ↓ (cache miss)
┌─────────────────────────────────────────┐
│  Database Query (PostgreSQL)            │
│  Time: 30-200ms                         │
└─────────────────────────────────────────┘
```

---

## 🔑 Cache Keys

| Key Pattern | TTL | Use Case |
|-------------|-----|----------|
| `listing:{id}:detail` | 5min | Listing detail pages |
| `listings:cards:{filters}` | 2min | Main browse page |
| `listings:partner:{id}:{status}` | 3min | Partner inventory |
| `listings:cards:batch:{ids}` | 1min | Favorites/superlikes |

---

## 🔧 When to Invalidate

```typescript
import { 
  invalidateListingDetail,
  invalidateListingCaches,
  invalidatePartnerInventory,
  smartInvalidateListing 
} from '@alifh/database';

// ✅ After price update
smartInvalidateListing(listingId, partnerId, ['price']);

// ✅ After publish
invalidateListingCaches(listingId, partnerId);

// ✅ After archive/delete
invalidateListingCaches(listingId, partnerId);

// ✅ After partner tier change
invalidatePartnerInventory(partnerId);

// ✅ After minor description edit
invalidateListingDetail(listingId);
```

---

## 📊 Expected Performance

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Browse page (cache hit) | 150ms | 20ms | **87% faster** |
| Listing detail (cache hit) | 150ms | 20ms | **87% faster** |
| Database queries | 100% | 1-5% | **95% reduction** |
| Cache hit rate | 0% | 95-99% | **N/A** |

---

## 🚨 Common Issues

### Issue: Cache not hitting
```typescript
// ❌ Wrong - params order matters
const key = CacheKeys.listingCardsBatch(['id2', 'id1']);

// ✅ Correct - IDs are auto-sorted
const key = CacheKeys.listingCardsBatch(['id1', 'id2']);
```

### Issue: Stale data showing
```typescript
// After updating listing
await updateListing(id, data);
// Cache auto-invalidated ✅

// After external update (admin panel, scripts)
invalidateListingCaches(id, partnerId); // Manual invalidation needed
```

### Issue: High cache miss rate
```typescript
// Problem: Too many unique filter combinations
// Solution: Normalize filters or reduce cache key variations

// ❌ High cardinality
listings:cards:published:20:0:sort=price:asc:emirate=dubai

// ✅ Better - cache by common combinations
listings:cards:published:20:0
```

---

## 🎯 Best Practices

1. **Always invalidate after mutations**
   ```typescript
   const listing = await updateListing(id, data);
   // ✅ Auto-invalidates via query function
   ```

2. **Use smart invalidation**
   ```typescript
   // Only invalidates necessary caches
   smartInvalidateListing(id, partnerId, changedFields);
   ```

3. **Monitor cache in dev**
   ```typescript
   // Check console for:
   [car-card] Cache HIT for listings:cards:... (saved DB query)
   [car-card] Cache MISS for listings:cards:... - querying DB
   ```

4. **Don't over-cache**
   ```typescript
   // ❌ Don't cache user-specific data globally
   // ✅ Include userId in cache key
   const key = `listings:favorites:${userId}`;
   ```

---

## 🔮 Future: Redis Migration

```typescript
// When scaling, replace memory cache with Redis
// Interface stays the same!

import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Same API, distributed caching
memoryCache.get(key) → redis.get(key)
memoryCache.set(key, value, ttl) → redis.setex(key, ttl, value)
memoryCache.delete(...keys) → redis.del(...keys)
```

---

## ✅ Quick Checklist

- [x] Cache keys defined
- [x] TTL configured
- [x] Cache in car-card endpoint
- [x] Cache in listing detail endpoint
- [x] Auto-invalidation on updates
- [x] Manual invalidation helpers
- [x] Performance logging
- [x] Documentation

🎉 **Listings caching is production-ready!**

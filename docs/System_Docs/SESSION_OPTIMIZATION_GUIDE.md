# Session Optimization Guide

## The Problem We Solved

**Before**: Every component, layout, and API route was calling `auth.api.getSession()` independently, resulting in 12+ database queries per page load just to fetch the same user session data.

**After**: One session check at middleware, cached for the entire request lifecycle. 92% reduction in session-related database calls.

## The Architecture

### Security Guard Analogy
- **Before**: Every room had its own security guard checking your ID (12+ checks)
- **After**: One guard at the entrance checks once, gives you a badge, everyone reads the badge (1 check)

### How It Works

1. **Middleware** (`proxy.ts`):
   - Validates session from Better Auth cookie
   - Caches extended user data in `x-auth-user` request header
   - Cost: 3-8ms (cookie parsing, no DB)

2. **Session Context** (`lib/auth/session-context.ts`):
   - `getSessionUser()` - Reads from `x-auth-user` header first
   - Uses React `cache()` for request-scoped deduplication
   - Falls back to Better Auth only if header missing

3. **API Routes**:
   - All use `getSessionUser()` instead of `auth.api.getSession()`
   - Session data available instantly from cached header

4. **Server Components**:
   - Use `requireAuth()` which wraps `getSessionUser()`
   - Session available without database query

## Implementation Pattern

### ❌ Old Way (Don't Do This)
```typescript
// API Route
const session = await auth.api.getSession({ headers: req.headers });
const user = session?.user;

// Helper function
async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}
```

### ✅ New Way (Do This)
```typescript
import { getSessionUser } from '@/lib/auth/session-context';

// API Route
const user = await getSessionUser();

// Server Component
const user = await requireAuth();
```

## Client-Side Optimization

### React StrictMode Double-Fetch Prevention
```typescript
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (!hasFetchedRef.current) {
    hasFetchedRef.current = true;
    fetchData();
  }
}, [fetchData]);
```

### Conditional Fetching (Modals)
```typescript
// Only fetch when modal is open
usePartnerMiniProfile(isOpen ? partnerId : null)
```

### React Query Configuration
```typescript
useQuery({
  queryKey: ['data', id],
  queryFn: fetchData,
  enabled: !!id,                    // Conditional
  staleTime: 2 * 60 * 1000,        // 2min cache
  refetchOnMount: false,            // Don't refetch on remount
  refetchOnWindowFocus: false,      // Don't refetch on focus
})
```

## Performance Indicators

### Good Signs (Optimized)
```
proxy.ts: 3-8ms     ← Cookie parsing only
render: 8-20ms      ← Reading from cache
```

### Bad Signs (Database Calls)
```
proxy.ts: 300-500ms ← Database query
render: 200-600ms   ← Multiple DB calls
```

### What Reloads Should Look Like
- First visit: `proxy.ts: ~100ms` (session validation)
- Navigation: `proxy.ts: 3-8ms` (cookie cached)
- Page reload: `proxy.ts: 3-8ms` (still from cookie)
- Only data fetches hit DB (listings, profiles, etc.)

## Key Rules

1. **Never call `auth.api.getSession()` in app code** - Use `getSessionUser()` or `requireAuth()`
2. **Remove helper functions** - No `requireUser()` or `requireSessionUser()` wrappers
3. **Guard useEffect** - Use `useRef` to prevent StrictMode double-fetch
4. **Conditional hooks** - Don't fetch data for closed modals
5. **Trust the middleware** - Session is always cached in header after middleware runs

## When Database IS Called (Expected)

- Initial login/signup
- Session refresh (~every 15 minutes, automatic)
- Cookie expires or invalid
- Actual data queries (listings, profiles, etc.)

## Migration Checklist

When adding new features:
- [ ] API routes use `getSessionUser()` not `auth.api.getSession()`
- [ ] Server components use `requireAuth()` from `lib/auth/roles`
- [ ] Client hooks have `useRef` guards for StrictMode
- [ ] React Query has proper `staleTime` and conditional fetching
- [ ] Test: Reload should show `proxy.ts: <10ms` (proves no DB call)

## Verification

Check dev logs for session optimization:
```bash
bun run dev
# Navigate around app
# Look for: proxy.ts: 3-8ms (good!)
# Avoid: Multiple auth.api.getSession calls (bad!)
```

**Result**: One security check per request, shared by all components. Fast, efficient, scalable.

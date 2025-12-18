# API Building Guidelines

Quick reference for building API routes. Read before creating new APIs.

---

## 1. Before You Start

- **Check API_REGISTRAR.md first** - route might already exist
- Business logic is OK in APIs (they're protected anyway)

---

## 2. Standard Header (copy-paste this)

```typescript
/**
 * API: [Name]
 * GET/POST /api/[path] - What it does
 * 
 * Purpose: One sentence
 * Authentication: Required/Optional/Public
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy: Public 60s / No cache / etc
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 500 for errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
```

---

## 3. Auth Check

```typescript
// Required auth
const user = await getSessionUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Optional auth (guests allowed)
const user = await getSessionUser();
// user will be null for guests, that's fine
```

**Rule:** Always use `getSessionUser()` - never call `auth.api.getSession()` directly

---

## 4. Cache Headers

Pick one, define at top:

```typescript
// User data (no cache)
const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

// Public data (CDN cache)
const CACHE_HEADERS_PUBLIC = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;
```

Apply:
```typescript
const response = NextResponse.json({ data });
Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
  response.headers.set(key, value)
);
return response;
```

**When to use:**
- User-specific data → NO_CACHE
- Public listings/content → PUBLIC
- POST/PATCH/DELETE → NO_CACHE

---

## 5. Error Handling

```typescript
try {
  // your logic
} catch (error) {
  console.error('[route-name] METHOD failed', error);
  return NextResponse.json({ error: 'Message' }, { status: 500 });
}
```

**Status codes:**
- 400 = bad input
- 401 = no login
- 429 = rate limited
- 500 = server error

---

## 6. Clean Code Rules

**Remove:**
- `performance.now()` timing variables
- Inline comments everywhere
- Dead code after returns

**Keep:**
- Clear variable names
- Complex logic comments only

---

## 7. After Building

Update `API_REGISTRAR.md` with your new route

---

**Last Updated**: December 19, 2025

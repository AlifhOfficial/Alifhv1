# Portal Routing Overview

```
[Session Cookie]
    |
    v
[apps/web/src/middleware.ts]
    |-- load extended session (cache + /api/auth/get-session)
    |-- compute access via getUserPortalAccess
    |-- guard admin/partner/staff dashboards, redirect to /access-denied
    v
[Route Segment]
    |-- next/router push() respects middleware redirect
    |-- Pages read `activeTab` and `user` props

Navbar (ProfileMenu)
    |-- imports getUserPortalAccess
    |-- renders dashboard links per access matrix

Dashboards
    |-- `StandardDashboardLayout`, `PartnerDashboardLayout`, `StaffDashboardLayout`
    |-- sign-out via authClient
    |-- theme toggle (client only)

Helpers
    |-- `apps/web/src/lib/auth/routing.ts`
          ├─ ExtendedUser type
          ├─ getDefaultRedirect()
          ├─ isDealerOwner()/isDealerStaff()
          ├─ getUserPortalAccess()
          └─ getUserPartnerContext()
```

## Route Access Matrix

| Target | Middleware Check | Helper | Redirect on Fail |
| - | - | - | - |
| `/admin-dashboard` | `access.admin` | `getUserPortalAccess` | `/access-denied?reason=insufficient-permissions` |
| `/partner-dashboard` | `isDealerOwner` | `isDealerOwner` | `/access-denied?reason=not-dealer-owner` |
| `/staff-dashboard` | `isDealerStaff` | `isDealerStaff` | `/access-denied?reason=not-dealer-staff` |
| `/user-dashboard` | none (requires session) | `getDefaultRedirect` | `/sign-in` |

All other routes replay the cached session but skip role gating. Public routes and API paths short-circuit before session fetch.

## Data Flow Recap

1. **Session load**: Middleware calls `/api/auth/get-session` when cache misses; handler enriches Better Auth session with partner memberships and sanitized permissions.
2. **Access Matrix**: `getUserPortalAccess` returns `{ admin, partnerOwner, partnerStaff, user }` booleans. Middleware and UI both consume this to stay in sync.
3. **Default Redirect**: After sign-in, `getDefaultRedirect` picks the highest privilege portal (admin → partner owner → staff → user).
4. **Partner Context**: `getUserPartnerContext` provides defaults for dashboards (primary partner id, counts, etc.).

## Extending Routing

If you add a new portal:
1. Extend `ExtendedUser` and helpers in `routing.ts` with the new role flag.
2. Update middleware guard logic (and redirect reason).
3. Surface link(s) in `ProfileMenu` and relevant dashboard layout.
4. Add coverage in `apps/web/src/lib/auth/__tests__/routing.test.ts`.

## Observability

- Middleware debug logs are dev-only (uses `console.debug`).
- `/api/auth/get-session` logs structured JSON in prod; include routing info (path + access matrix) for audit by piping server logs to your collector.

## Residual Risk

- Cache TTL is 30s; partner role changes within that window require a new session cookie to reflect immediately.
- Rate limiting is per IP; highly shared addresses (office VPN) may hit limits—monitor `auth.session.rate_limited` events.
# Auth & Identity Runtime Flow

The current implementation is driven by Better Auth + Drizzle with a single extension point that enriches partner context. Use the diagram below to trace a request from browser to database.

**📌 New Feature:** All Better Auth errors now show in your custom modal UI/UX instead of Better Auth's default error page. See [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md) for details.

```
[User Action]
    |
    v
[next/link or fetch]
    |
    v
[Middleware] (/apps/web/src/middleware.ts)
    |-- check public route? yes -> allow
    |-- read better-auth.session_token cookie
    |-- cache lookup (30s TTL)
    |-- missing? fetch /api/auth/get-session
                |
                v
       [API Route] (/apps/web/src/app/api/auth/get-session/route.ts)
                |-- auth.api.getSession(headers)
                |-- SELECT partner_staff JOIN partner (Drizzle)
                |-- sanitize permissions + compute flags
                |-- structured log + rate limit (60 req/min)
                |-- return { user, session }
    |-- build portal access via getUserPortalAccess
    |-- gate /admin-dashboard, /partner-dashboard, /staff-dashboard
    v
[Page/Route]
    |-- dashboards call auth helpers/hooks
    v
[Client Hooks]
    |-- useSession() in useUser (apps/web/src/hooks/auth/use-auth.ts)
    |-- useBetterAuth() for actions (apps/web/src/hooks/auth/use-better-auth.ts)
    |-- navbar/dashboard use getUserPortalAccess & context helpers

[Auth Errors]
    |-- OAuth/Redirect errors -> /auth/error?error=code
    |-- Form errors -> AuthErrorModal in auth-flow-controller
    |-- All errors -> Your branded modal UI
    v
[AuthErrorModal]
    |-- Maps error code to user-friendly content
    |-- Shows actionable next steps
    |-- Maintains Revvup design system
```

## Key Pieces

- **Better Auth config** lives in `apps/web/src/lib/auth/index.ts`. It wires:
  - Email/password and magic link flows
  - Google OAuth via `authClient.signIn.social`
  - Default `user` role with platform overrides (`admin`, `super_admin`)
  - **Custom error URL** (`/auth/error`) for branded error handling
- **Session enrichment** happens only inside `get-session`:
  - Drizzle query grabs `partner_staff` rows with status `active`
  - Permissions JSON is normalised before returning
  - Rate limiter (per IP) and structured logs guard the endpoint
- **Middleware** (`apps/web/src/middleware.ts`):
  - 30s in-memory cache for extended sessions keyed by cookie token
  - Uses `getUserPortalAccess`, `isDealerOwner`, `isDealerStaff` to route users
  - Redirects to `/access-denied` with reasons when checks fail
- **Error Handling** (`/lib/auth/errors.ts`, `/components/auth/feedback/auth-error-modal.tsx`):
  - Centralized error code mapping (40+ error scenarios)
  - Branded modal UI for all auth errors
  - Actionable next steps for users
  - See [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md) for complete guide
- **Routing helpers** (`packages/shared/src/auth/routing.ts`):
  - `getDefaultRedirect`, `getUserPortalAccess`, `getUserPartnerContext`
  - Central source of truth for navbar, dashboards, and guards
- **Client surface**:
  - `useUser` wraps Better Auth `useSession`
  - `useBetterAuth` centralises sign-in/up, magic link, and reset flows
  - `ProfileMenu` dropdown offers dashboards based on `getUserPortalAccess`
- **Dashboard layouts** respect the same helpers and rely on `authClient` for sign-out (`apps/web/src/components/layouts/dashboard-layout.tsx`).

## Operational Notes

- Every new role/permission must flow through `get-session` to reach middleware/UI.
- If partner assignments change, purge the 30s cache by rotating the session cookie.
- For new portals:
   1. Extend `ExtendedUser` + helpers in `packages/shared/src/auth/routing.ts`
  2. Update middleware guards
  3. Adjust navbar/dashboard nav items
  4. Add tests under `apps/web/src/lib/auth/__tests__`
- Logging is structured JSON in production; plug it into central observability to track rate-limit hits and session enrichment latency.

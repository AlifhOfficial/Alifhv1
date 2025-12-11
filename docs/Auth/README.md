# Authentication System

A complete role-based authentication system built with Better Auth, Drizzle ORM, and Next.js.

## Architecture

### Three-Tier Access Control
1. **Regular Users** → User Portal only
2. **Alifh Partners** → User + Partner Portals  
3. **Alifh Internal** → User + Admin Portals

### Tech Stack
- **Auth Provider**: Better Auth 1.4.6 (scrypt hashing)
- **Database**: PostgreSQL with Drizzle ORM
- **Framework**: Next.js 16 App Router
- **Protection**: Route-based proxy system

## Package Structure

### `packages/shared/src/auth/`
**Purpose**: Shared authentication utilities across all apps
- `types.ts` - TypeScript interfaces for auth objects
- `constants.ts` - Role mappings and auth constants  
- `validators.ts` - Zod validation schemas
- `validation.ts` - Helper validation functions
- `access-control.ts` - Portal access logic
- `index.ts` - Consolidated exports

### `packages/database/src/auth/`
**Purpose**: Database schema and queries for auth
- `schema.ts` - Auth tables with performance indexes
- `relations.ts` - Drizzle table relationships
- `queries.ts` - Essential auth queries
- `index.ts` - Database auth exports

### `apps/web/src/`
**Purpose**: Frontend authentication implementation
- `lib/auth.ts` - Better Auth server configuration
- `lib/auth-client.ts` - Better Auth React hooks
- `lib/auth-utils.ts` - Frontend auth helpers
- `app/api/auth/[...auth]/route.ts` - Better Auth API handler
- `proxy.ts` - Route protection proxy

## Core Features

### Database Schema
```sql
users           # User accounts with platform roles
partners        # Organization management
partner_members # User-organization relationships  
sessions        # Better Auth sessions
accounts        # OAuth & credential accounts
```

### Access Control System
```typescript
// Check portal access
const access = getUserPortalAccess(user);
// { public: true, user: true, partner: false, admin: false }

// Get user type
const userType = getUserType(user);
// "regular" | "partner" | "alifh"
```

### Route Protection
```typescript
// proxy.ts automatically protects routes based on:
// - Authentication status
// - Platform roles (user, staff, admin, super-admin)  
// - Partner membership
// - Email verification
```

## Usage in Apps

### Web App (`apps/web`)
```typescript
import { useAuthSession } from '@/lib/auth-client';
import { getUserPortalAccess } from '@alifh/shared';

const { user } = useAuthSession();
const access = getUserPortalAccess(user);
```

### Mobile App (`apps/mobile`)
```typescript
import { authQueries } from '@alifh/database/auth';
import { canAccessPartnerPortal } from '@alifh/shared';

const hasAccess = canAccessPartnerPortal(user);
```

### WebSocket Server (`apps/ws`)
```typescript
import { authQueries } from '@alifh/database/auth';

// Validate user session for WebSocket connections
const user = await authQueries.getUserById(userId);
```

## Test Credentials

| Type | Email | Password | Access |
|------|--------|----------|---------|
| Regular | john@example.com | password123 | User Portal |
| Partner | partner@techcorp.com | partner123 | User + Partner |
| Admin | admin@alifh.ae | admin123 | User + Admin |

## Quick Start

1. **Seed Database**: `bun db:seed`
2. **Setup Partners**: `bun scripts/setup-partner-roles.ts`  
3. **Start Web**: `cd apps/web && bun dev`
4. **Start WS**: `cd apps/ws && bun dev`
5. **Test**: Sign in with test credentials at `localhost:3000`

## Security Features

- ✅ Scrypt password hashing (Better Auth)
- ✅ Email verification required
- ✅ Session-based authentication  
- ✅ Route-level protection (proxy.ts)
- ✅ Role-based access control
- ✅ Partner organization isolation
- ✅ Audit logging for sensitive actions

---

*Last Updated: December 2025*
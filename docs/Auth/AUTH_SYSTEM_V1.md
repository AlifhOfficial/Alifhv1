# Auth System - Single Source of Truth

## ✅ Clean Architecture (Better Auth v1 with Admin Plugin)

### Core Configuration
- **Server Auth**: `/apps/web/src/lib/auth/index.ts` - Better Auth instance with admin plugin
- **Client Auth**: `/apps/web/src/lib/auth/client.ts` - Client hooks (useSession, etc)
- **Permissions**: `/apps/web/src/lib/auth/permissions.ts` - Access control definitions (ac, roles)
- **Role Utilities**: `/apps/web/src/lib/auth/roles.ts` - Server-side auth helpers (requireRole, hasRole, etc)
- **Client Utils**: `/apps/web/src/lib/auth/client-utils.ts` - Shared types and helpers

### Database Schema
- **Auth Schema**: `/packages/database/src/schema/auth.ts` - Better Auth tables (user, account, session, verification)
- **Relations**: `/packages/database/src/schema/relations.ts` - Drizzle relations for Better Auth

### Route Protection
- **Page Level**: Use `requireRole('role')` or `requireAuth()` in page components
- **Access Denied**: `/apps/web/src/app/access-denied/page.tsx` - Unauthorized access handler

### Roles
- `admin` - Full platform access
- `partner` - Dealership business operations
- `staff` - Customer service operations
- `user` - Default role for all users

### Dashboard Routes
- `/admin-dashboard` - Admin only
- `/partner-dashboard` - Partner only
- `/staff-dashboard` - Staff only
- `/user-dashboard` - All authenticated users

### Role Behavior
- **Admin**: Can access all dashboards (universal access)
- **Partner/Staff**: Can access their role dashboard + user dashboard
- **User**: Can only access user dashboard
- **Unauthorized**: Redirected to `/access-denied` with role info

## 🗑️ Removed Legacy Files
- `/apps/web/src/lib/auth/utils.ts` - DELETED (unused, redundant with roles.ts)

## 📋 Scripts
- `/apps/web/scripts/create-test-users.ts` - Seed test users with roles
- `/apps/web/scripts/clear-users.ts` - Delete all users from database

## 🔒 Security
- Password hashing: `scrypt` (Better Auth default)
- Session management: Better Auth session system
- Email verification: Required before login
- CSRF protection: Enabled by default
- Rate limiting: Built into Better Auth

## 🎯 Best Practices
1. Always use `requireRole()` or `requireAuth()` in protected pages
2. Never manually set roles - use Better Auth admin API
3. All role checks go through Better Auth's permission system
4. Console logs removed from production code (v1 lean approach)
5. Single source of truth: Better Auth admin plugin

## 🚫 Never Use
- ❌ Custom session handling
- ❌ Manual password hashing (use Better Auth API)
- ❌ Direct database role updates
- ❌ Custom middleware for auth (use Better Auth)
- ❌ Legacy auth utils or helpers

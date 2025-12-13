# Authentication & Authorization Architecture

> **Status:** ✅ **LOCKED** - Single Source of Truth  
> **Last Updated:** December 13, 2025  
> **Version:** 2.0 (Hybrid Approach)

---

## 📋 Overview

This document defines the **single source of truth** for authentication and authorization in the Alifh platform. All authentication logic MUST follow this architecture.

---

## 🏗️ Three-Layer Architecture

### Layer 1: USER (Person - Platform Level)

**Table:** `user`  
**Purpose:** Platform-wide access control

```typescript
user {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'super_admin'  // Platform role
  // ... other fields
}
```

**Roles:**
- `super_admin` - Platform Owner (Alifh owner)
- `admin` - Alifh Internal Staff
- `user` - Everyone else (dealers, staff, customers)

**Rule:** The `user.role` field determines platform-level permissions ONLY.

---

### Layer 2: PARTNER (Company - Business Entity)

**Table:** `partner`  
**Purpose:** Dealership/Company information

```typescript
partner {
  id: string
  companyNameLegal: string
  brandName: string
  tradeLicense: string
  status: 'pending' | 'active' | 'suspended' | 'cancelled'
  tier: 'standard' | 'gold' | 'platinum' | 'black'
  // ... business metrics
}
```

**Rule:** This represents the business entity, NOT individual access.

---

### Layer 3: PARTNER_STAFF (Membership - Organization Level)

**Table:** `partner_staff`  
**Purpose:** Links users to companies with specific roles

```typescript
partner_staff {
  id: string
  partnerId: string       // FK -> partner.id
  userId: string          // FK -> user.id
  role: 'owner' | 'admin' | 'sales' | 'viewer'  // Organization role
  status: 'active' | 'invited' | 'suspended' | 'left'
  permissions: {
    manageListings: boolean
    manageTeam: boolean
    viewAnalytics: boolean
    // ... granular permissions
  }
}
```

**Roles:**
- `owner` - Dealer Owner (owns the company)
- `admin` - Dealer Manager (manages operations)
- `sales` - Sales Staff (handles listings/leads)
- `viewer` - Read-only Staff

**Rule:** Organization-level roles are INDEPENDENT of platform roles.

---

## 🎯 Portal Access Logic

### Portal Hierarchy

1. **Public Portal** (`/`) - No authentication required
2. **User Portal** (`/user-dashboard`) - Any authenticated user
3. **Staff Portal** (`/staff-dashboard`) - Dealer staff only
4. **Partner Portal** (`/partner-dashboard`) - Dealer owners only
5. **Admin Portal** (`/admin-dashboard`) - Platform admins only

### Access Matrix

| User Type | USER.role | PARTNER_STAFF.role | Accessible Portals |
|-----------|-----------|-------------------|-------------------|
| Platform Owner | `super_admin` | - | Admin + User |
| Alifh Staff | `admin` | - | Admin + User |
| Dealer Owner | `user` | `owner` | Partner + User |
| Dealer Manager | `user` | `admin` | Staff + User |
| Sales Staff | `user` | `sales` | Staff + User |
| Viewer Staff | `user` | `viewer` | Staff + User |
| Customer | `user` | - | User |

---

## 🔐 Session Extension (Hybrid Approach)

### How It Works

1. **User Signs In** → Better Auth creates base session
2. **API Endpoint Extends Session** → `/api/auth/get-session` queries `partner_staff` table
3. **Middleware Reads Extended Session** → Fast routing decisions with NO additional DB queries

### Extended Session Structure

```typescript
{
  user: {
    // Base Better Auth fields
    id: string
    email: string
    name: string
    role: 'user' | 'admin' | 'super_admin'
    
    // Extended fields (computed on-demand)
    hasPartnerAccess: boolean              // Has any active partnership
    isAlifhAdmin: boolean                  // role is 'admin' or 'super_admin'
    partnerMemberships: Array<{
      staffId: string                      // partner_staff.id
      partnerId: string                    // partner.id
      partnerName: string                  // partner.brandName
      partnerTier: string                  // partner.tier
      staffRole: 'owner' | 'admin' | 'sales' | 'viewer'
      permissions: {...}                   // Granular permissions
    }>
  }
}
```

### Performance

- ✅ **1 DB query** when session is extended (`/api/auth/get-session`)
- ✅ **0 DB queries** in middleware (reads from API response)
- ✅ **Fast routing** decisions with session cache

---

## 🛣️ Routing Helpers

**Location:** `/apps/web/src/lib/auth/routing.ts`

### Core Functions

```typescript
// Check if user is dealer owner
isDealerOwner(user): boolean
  → Returns true if user has staffRole === 'owner'

// Check if user is dealer staff (not owner)
isDealerStaff(user): boolean
  → Returns true if hasPartnerAccess && staffRole !== 'owner'

// Get portal access permissions
getUserPortalAccess(user): PortalAccess
  → Returns which portals user can access

// Get default redirect after login
getDefaultRedirect(user): string
  → Priority: Admin > Partner > Staff > User
```

---

## 🚦 Middleware Implementation

**Location:** `/apps/web/src/middleware.ts`

### Flow

1. Check if route needs authentication
2. Validate session token exists
3. For protected dashboards:
   - Call `/api/auth/get-session`
   - Read extended session data
   - Use routing helpers to check access
   - Allow/deny based on portal rules

### Example

```typescript
// Staff dashboard - ONLY dealer staff (not owners)
if (pathname.startsWith('/staff-dashboard')) {
  if (!isDealerStaff(user)) {
    return redirect('/access-denied?reason=not-dealer-staff');
  }
}
```

---

## 📊 Database Scripts

### Setup Scripts

```bash
# Clear all users
bun users:clear

# Create test users (8 users with proper roles)
bun users:seed

# Setup partner companies and staff memberships
bun partners:setup

# Clear all sessions (force re-login with new session structure)
bun sessions:clear
```

### Test Users

| Email | USER.role | PARTNER_STAFF.role | Dashboard |
|-------|-----------|-------------------|-----------|
| alifh.owner@alifh.ae | super_admin | - | Admin |
| mohammed.dealer@alifh.ae | user | owner | Partner |
| sarah.dealer@alifh.ae | user | owner | Partner |
| fatima.staff@alifh.ae | user | admin | Staff |
| ahmed.staff@alifh.ae | user | sales | Staff |
| omar.staff@alifh.ae | user | sales | Staff |
| layla.customer@alifh.ae | user | - | User |
| aisha.customer@alifh.ae | user | - | User |

**Password:** `password123` (all users)

---

## 🔒 Security Rules

### Rule 1: Single Source of Truth

✅ **DO:** Always check `partner_staff` table for organization roles  
❌ **DON'T:** Store organization roles in `user` table

### Rule 2: Role Separation

✅ **DO:** Use `user.role` for platform permissions  
✅ **DO:** Use `partner_staff.role` for organization permissions  
❌ **DON'T:** Mix platform and organization roles

### Rule 3: Session Extension

✅ **DO:** Extend session via `/api/auth/get-session` endpoint  
✅ **DO:** Query `partner_staff` on-demand  
❌ **DON'T:** Store extended data in session cookies

### Rule 4: Middleware Performance

✅ **DO:** Use routing helpers for access checks  
✅ **DO:** Read extended session from API endpoint  
❌ **DON'T:** Query database directly in middleware

---

## 🧪 Testing Checklist

### User Sign In Tests

- [ ] Platform admin sees: Admin + User dashboards
- [ ] Dealer owner sees: Partner + User dashboards
- [ ] Dealer staff sees: Staff + User dashboards
- [ ] Customer sees: User dashboard only

### Access Control Tests

- [ ] Dealer owner can access `/partner-dashboard`
- [ ] Dealer staff CANNOT access `/partner-dashboard`
- [ ] Dealer staff can access `/staff-dashboard`
- [ ] Customer CANNOT access `/staff-dashboard`
- [ ] Only platform admins can access `/admin-dashboard`

### Session Tests

- [ ] Extended session includes `hasPartnerAccess`
- [ ] Extended session includes `isAlifhAdmin`
- [ ] Extended session includes `partnerMemberships` array
- [ ] Session persists across page refreshes
- [ ] Sign out clears session completely

---

## 🚨 Breaking Changes

### Migration from Old System

If you're migrating from the old authentication system:

1. ✅ Clear all sessions: `bun sessions:clear`
2. ✅ Verify `user.role` is correct (most should be `user`)
3. ✅ Verify `partner_staff` entries exist for dealers/staff
4. ✅ Update all authentication checks to use routing helpers
5. ✅ Remove any direct session manipulation code
6. ✅ Test all dashboard access scenarios

---

## 📝 Code Examples

### Check if User is Dealer Owner

```typescript
import { isDealerOwner } from '@/lib/auth/routing';

if (isDealerOwner(user)) {
  // Show partner management features
}
```

### Get User's Partner Context

```typescript
import { getUserPartnerContext } from '@/lib/auth/routing';

const { partners, defaultPartnerId } = getUserPartnerContext(user);
```

### Protect a Page

```typescript
// In middleware.ts
if (pathname.startsWith('/partner-dashboard')) {
  if (!isDealerOwner(user)) {
    return NextResponse.redirect('/access-denied');
  }
}
```

---

## 📚 Related Documentation

- [Better Auth Guide](./Better_Auth_Guide/)
- [System Architecture](../System_Docs/ARCHITECTURE.md)
- [Database Schema](../System_Docs/WORKSPACE_STRUCTURE.MD)

---

## 🔧 Maintenance

### Adding New Organization Role

1. Add role to `staffRoleEnum` in schema
2. Update `StaffRole` type in shared package
3. Update routing helpers if needed
4. Update middleware access checks
5. Update test users script
6. Document the new role in this file

### Adding New Platform Role

1. Add role to `platformRoleEnum` in schema
2. Update `UserRole` type in shared package
3. Update `isAlifhAdmin` logic
4. Update middleware access checks
5. Document the new role in this file

---

**⚠️ CRITICAL:** This document is the SINGLE SOURCE OF TRUTH. Any authentication logic that deviates from this architecture MUST be refactored.

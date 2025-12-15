# 🎯 V1 API Architecture - Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│              (Next.js Client / Mobile App)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTES LAYER                             │
│                  apps/web/src/app/api/                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Simple     │  │   Complex    │  │  External    │         │
│  │    CRUD      │  │  Workflows   │  │    APIs      │         │
│  │  (40 routes) │  │ (24 routes)  │  │ (webhooks)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         │ Direct           │ Uses             │ Calls            │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────┐    ┌─────────────┐   ┌─────────────┐         │
│  │  DB Query   │    │  Service    │   │   Email/    │         │
│  │  Function   │    │   Layer     │   │   Storage   │         │
│  └─────────────┘    └─────────────┘   └─────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER (Optional)                       │
│                   apps/web/src/lib/                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Complex Business Logic (9 workflows)                │      │
│  │  ✅ partner/service.ts          - CRUD + workflows   │      │
│  │  ✅ partner/request-service.ts  - Approvals          │      │
│  │  ✅ partner/review-service.ts   - Moderation         │      │
│  │  ✅ partner/staff-service.ts    - Team mgmt          │      │
│  │  🔨 listings/service.ts         - Publish workflow   │      │
│  │  🔨 bookings/workflow.ts        - 3 complex flows    │      │
│  │  🔨 consignment/matching.ts     - Auto-matching      │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE QUERY LAYER                           │
│               packages/database/src/queries/                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Pure SQL Operations (7 query files)                 │      │
│  │  ✅ profile.ts     - 550 lines                       │      │
│  │  ✅ partner.ts     - 526 lines                       │      │
│  │  🔨 listings.ts    - ~400 lines (TO CREATE)          │      │
│  │  🔨 bookings.ts    - ~600 lines (TO CREATE)          │      │
│  │  🔨 messaging.ts   - ~300 lines (TO CREATE)          │      │
│  │  🔨 consignment.ts - ~200 lines (TO CREATE)          │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Drizzle ORM
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│               packages/database/src/schema/                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  32 Tables Across 7 Domains                         │       │
│  │                                                      │       │
│  │  ✅ auth.ts        - 4 tables                       │       │
│  │  ✅ profile.ts     - 4 tables                       │       │
│  │  ✅ partner.ts     - 5 tables                       │       │
│  │  ✅ listing.ts     - 3 tables                       │       │
│  │  ✅ booking.ts     - 5 tables                       │       │
│  │  ✅ messaging.ts   - 4 tables                       │       │
│  │  ✅ consignment.ts - 3 tables                       │       │
│  │                                                      │       │
│  │  + relations.ts    - 90 relations                   │       │
│  └─────────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                   PostgreSQL
                (Neon Database)
```

---

## 📊 Data Flow Examples

### Simple CRUD (No Service Layer)

```
User Request
    │
    ▼
GET /api/listings?emirate=dubai
    │
    ▼
[API Route Handler]
    │ 1. Validate auth (optional for public)
    │ 2. Parse query params
    ▼
getAllListings({ emirate: 'dubai' })  ← Direct DB query
    │
    ▼
[Drizzle ORM Query]
SELECT * FROM car_listing 
WHERE emirate = 'dubai' 
  AND status = 'published'
ORDER BY created_at DESC
    │
    ▼
PostgreSQL
    │
    ▼
[Response]
{ data: [...listings], meta: { total, page } }
```

**Layers involved:** 3 (API → Query → DB)  
**Time:** ~150ms

---

### Complex Workflow (Uses Service Layer)

```
User Request
    │
    ▼
POST /api/bookings/123/confirm
    │
    ▼
[API Route Handler]
    │ 1. Validate auth
    │ 2. Parse body
    ▼
confirmBooking(bookingId, partnerId)  ← Service function
    │
    ├─→ getBookingById()           [Query 1]
    │
    ├─→ getListingById()           [Query 2]
    │
    ├─→ getSlotById()              [Query 3]
    │
    ├─→ updateBooking()            [Query 4]
    │
    ├─→ incrementSlotBookings()    [Query 5 - Atomic]
    │
    └─→ sendConfirmationEmail()    [External API]
    │
    ▼
PostgreSQL (Transaction)
    │
    ▼
[Response]
{ data: { booking: {...}, status: 'confirmed' } }
```

**Layers involved:** 4 (API → Service → Queries → DB)  
**Queries:** 5 (in transaction)  
**External:** 1 email API call  
**Time:** ~400ms

---

## 🔀 Decision Tree: When to Use Service Layer?

```
New Feature Request
        │
        ▼
    Is it CRUD on
    single table?
        │
    ┌───┴───┐
   YES      NO
    │        │
    ▼        ▼
Direct    Does it need
Route    3+ DB ops?
            │
        ┌───┴───┐
       YES      NO
        │        │
        ▼        ▼
    Service   External
     Layer    API call?
                │
            ┌───┴───┐
           YES      NO
            │        │
            ▼        ▼
        Service   Direct
         Layer    Route
```

### Examples:

**Direct Route (Inline):**
- ✅ Get user profile
- ✅ List conversations
- ✅ Update listing title
- ✅ Delete message
- ✅ Get booking details

**Service Layer (Workflow):**
- ✅ Publish listing (validate + update + notify)
- ✅ Confirm booking (check slot + update + increment + email)
- ✅ Process no-show (update + add restriction + notify)
- ✅ Approve partner request (validate + create partner + update request + email)
- ✅ Accept consignment lead (check limits + update + log + notify)

---

## 📁 File Organization

```
apps/web/src/
├── app/api/                    # 64 API routes (thin handlers)
│   ├── auth/
│   │   └── [...auth]/route.ts
│   ├── profile/
│   │   └── route.ts           # GET, PATCH
│   ├── partner/
│   │   ├── list/route.ts      # GET
│   │   ├── [id]/route.ts      # GET
│   │   └── request/
│   │       └── [id]/
│   │           └── approve/route.ts  # POST (uses service)
│   ├── listings/               # 🔨 TO CREATE (8 routes)
│   │   ├── route.ts           # GET (list), POST (create)
│   │   ├── [id]/route.ts      # GET, PATCH, DELETE
│   │   └── [id]/
│   │       └── publish/route.ts     # POST (uses service)
│   ├── bookings/               # 🔨 TO CREATE (13 routes)
│   │   ├── route.ts           # GET (list), POST (create)
│   │   ├── [id]/
│   │   │   ├── route.ts       # GET, PATCH, DELETE
│   │   │   ├── confirm/route.ts     # POST (uses service)
│   │   │   └── no-show/route.ts     # POST (uses service)
│   │   └── slots/
│   │       └── [listingId]/route.ts # GET
│   ├── messaging/              # 🔨 TO CREATE (9 routes)
│   │   └── conversations/
│   │       ├── route.ts       # GET, POST
│   │       └── [id]/
│   │           └── messages/route.ts # GET, POST
│   └── consignment/            # 🔨 TO CREATE (7 routes)
│       └── leads/
│           ├── route.ts       # GET, POST (uses service)
│           └── [id]/
│               └── accept/route.ts  # POST (uses service)
│
├── lib/                        # Service layer (business logic)
│   ├── auth/                   # ✅ Better Auth integration
│   ├── profile/                # ✅ Profile helpers
│   ├── partner/                # ✅ 4 service files
│   │   ├── service.ts          # Partner CRUD + validation
│   │   ├── request-service.ts  # Application workflows
│   │   ├── review-service.ts   # Review moderation
│   │   └── staff-service.ts    # Team management
│   ├── listings/               # 🔨 TO CREATE
│   │   └── service.ts          # Publish workflow
│   ├── bookings/               # 🔨 TO CREATE
│   │   └── workflow.ts         # Confirm, no-show, restrictions
│   └── consignment/            # 🔨 TO CREATE
│       └── matching-service.ts # Auto-matching algorithm
│
packages/database/src/
├── schema/                     # Table definitions (32 tables)
│   ├── auth.ts
│   ├── profile.ts
│   ├── partner.ts
│   ├── listing.ts
│   ├── booking.ts
│   ├── messaging.ts
│   ├── consignment.ts
│   └── relations.ts
│
└── queries/                    # Database operations
    ├── profile.ts              # ✅ 550 lines
    ├── partner.ts              # ✅ 526 lines
    ├── listings.ts             # 🔨 ~400 lines (TO CREATE)
    ├── bookings.ts             # 🔨 ~600 lines (TO CREATE)
    ├── messaging.ts            # 🔨 ~300 lines (TO CREATE)
    └── consignment.ts          # 🔨 ~200 lines (TO CREATE)
```

---

## 🎯 Implementation Checklist

### ✅ Completed
- [x] Database schema (32 tables)
- [x] Auth queries & routes
- [x] Profile queries & routes
- [x] Partner queries & routes (526 lines)
- [x] Partner service layer (4 files, ~800 lines)
- [x] KYC routes
- [x] Storage routes

### 🔨 To Implement

#### Phase 1: Database Queries (~2000 lines)
- [ ] `packages/database/src/queries/listings.ts` (~400 lines)
- [ ] `packages/database/src/queries/bookings.ts` (~600 lines)
- [ ] `packages/database/src/queries/messaging.ts` (~300 lines)
- [ ] `packages/database/src/queries/consignment.ts` (~200 lines)

#### Phase 2: API Routes (~2000 lines)
- [ ] `apps/web/src/app/api/listings/*` (8 routes)
- [ ] `apps/web/src/app/api/bookings/*` (13 routes)
- [ ] `apps/web/src/app/api/messaging/*` (9 routes)
- [ ] `apps/web/src/app/api/consignment/*` (7 routes)

#### Phase 3: Service Layer (~700 lines)
- [ ] `apps/web/src/lib/listings/service.ts` (~150 lines)
- [ ] `apps/web/src/lib/bookings/workflow.ts` (~300 lines)
- [ ] `apps/web/src/lib/consignment/matching-service.ts` (~250 lines)

**Total:** ~4700 lines of code  
**Time Estimate:** 20-30 hours  
**Priority:** Listings → Bookings → Messaging → Consignment

---

## 🚀 Ready to Start?

Choose a domain to implement first:

1. **Listings** - Easiest (3 tables, 1 workflow, ~8 hours)
2. **Bookings** - Hardest (5 tables, 3 workflows, ~12 hours)
3. **Messaging** - Simplest (4 tables, 0 workflows, ~5 hours)
4. **Consignment** - Medium (3 tables, 2 workflows, ~7 hours)

I'll generate all the code for whichever you pick! 🎯

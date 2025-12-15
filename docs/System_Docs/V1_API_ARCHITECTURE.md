# 🏗️ V1 API Architecture - Lean & Scalable

**Date:** December 15, 2025  
**Status:** 📋 Architecture Proposal  
**Approach:** Pragmatic - Service layer for workflows, direct routes for simple CRUD

---

## 🎯 Architecture Philosophy

**Key Principle:** *Don't over-engineer V1. Use services for complex workflows, inline DB queries for simple CRUD.*

### When to Use Service Layer

✅ **Use `/lib/{domain}/{feature}-service.ts` when:**
- Multi-step transactions (3+ DB operations)
- External API calls (storage, email, webhooks)
- Complex validation or business rules
- Read-then-write logic (check before update)
- Reused in 2+ places

### When to Use Direct API Routes

✅ **Use inline DB queries in `/api/{domain}/route.ts` when:**
- Simple CRUD (single table, basic filters)
- Single DB operation
- No external dependencies
- Used in only one place
- Straightforward validation

---

## 📦 Current State Analysis

### ✅ Already Implemented (4/7 domains)

| Domain | Service Files | API Routes | Status |
|--------|--------------|------------|--------|
| **Auth** | `lib/auth/` | `/api/auth/*` | ✅ Complete |
| **Profile** | `lib/profile/` | `/api/profile` | ✅ Complete |
| **Partner** | `lib/partner/*.ts` (4 files) | `/api/partner/*` (10 routes) | ✅ Complete |
| **KYC** | `lib/kyc/` | `/api/kyc/*` | ✅ Complete |
| **Storage** | `lib/storage/` | `/api/storage/*` | ✅ Complete |

### 🔨 Need Implementation (3/7 domains)

| Domain | Tables | Complexity | Priority |
|--------|--------|------------|----------|
| **Listings** | 3 tables | Medium | 🔥 HIGH |
| **Bookings** | 5 tables | High | 🔥 HIGH |
| **Messaging** | 4 tables | Medium | 🔴 MEDIUM |
| **Consignment** | 3 tables | Medium | 🟡 LOW (background) |

---

## 🗂️ Complete API Structure

### Folder Organization

```
apps/web/src/
├── app/api/                          # API routes (thin handlers)
│   ├── auth/                         # ✅ Already implemented
│   ├── profile/                      # ✅ Already implemented
│   ├── partner/                      # ✅ Already implemented
│   ├── kyc/                          # ✅ Already implemented
│   ├── storage/                      # ✅ Already implemented
│   ├── listings/                     # 🔨 TO IMPLEMENT
│   ├── bookings/                     # 🔨 TO IMPLEMENT
│   ├── messaging/                    # 🔨 TO IMPLEMENT
│   └── consignment/                  # 🔨 TO IMPLEMENT
│
├── lib/                              # Service layer (business logic)
│   ├── auth/                         # ✅ Already implemented
│   ├── profile/                      # ✅ Already implemented
│   ├── partner/                      # ✅ Already implemented (4 files)
│   │   ├── service.ts                # Partner CRUD + workflows
│   │   ├── request-service.ts        # Application approvals
│   │   ├── review-service.ts         # Review moderation
│   │   └── staff-service.ts          # Team management
│   ├── kyc/                          # ✅ Already implemented
│   ├── storage/                      # ✅ Already implemented
│   ├── listings/                     # 🔨 TO IMPLEMENT
│   │   └── service.ts                # Publication workflows
│   ├── bookings/                     # 🔨 TO IMPLEMENT
│   │   └── workflow.ts               # Confirmation, no-show, restrictions
│   ├── messaging/                    # 🔨 TO IMPLEMENT (optional)
│   └── consignment/                  # 🔨 TO IMPLEMENT
│       └── matching-service.ts       # Lead distribution
│
packages/database/src/
└── queries/                          # Database layer (SQL operations)
    ├── profile.ts                    # ✅ Already implemented (550 lines)
    ├── partner.ts                    # ✅ Already implemented (526 lines)
    ├── listings.ts                   # 🔨 TO CREATE (~400 lines)
    ├── bookings.ts                   # 🔨 TO CREATE (~600 lines)
    ├── messaging.ts                  # 🔨 TO CREATE (~300 lines)
    └── consignment.ts                # 🔨 TO CREATE (~200 lines)
```

---

## 🎬 Implementation Plan by Domain

### 1️⃣ LISTINGS DOMAIN (3 tables)

**Tables:** carListing, listingPriceHistory, listingView

#### Database Queries (`packages/database/src/queries/listings.ts`)

```typescript
// CRUD operations (all direct)
- getListingById(id)
- getListingsByPartnerId(partnerId, filters?)
- getAllListings(filters?) // Public + search
- createListing(data) // Auto-generate ID
- updateListing(id, data)
- deleteListing(id) // Soft delete recommended

// Price History (inline)
- getPriceHistory(listingId)
- addPriceChange(listingId, oldPrice, newPrice)

// Listing Views (inline)
- recordListingView(listingId, userId?, metadata)
- getViewCount(listingId)
- getViewsByListing(listingId, filters?)
```

#### API Routes (`apps/web/src/app/api/listings/`)

**Simple CRUD (no service layer needed):**

```
GET    /api/listings                  # List all (public search)
GET    /api/listings/[id]            # Get single listing
POST   /api/listings                  # Create new listing
PATCH  /api/listings/[id]            # Update listing
DELETE /api/listings/[id]            # Delete listing

GET    /api/listings/[id]/price-history    # View price changes (inline)
POST   /api/listings/[id]/view              # Record view (inline)
GET    /api/listings/partner/[partnerId]   # Get partner's listings (inline)
```

**Workflow Function (service layer needed):**

```typescript
// lib/listings/service.ts
export const publishListing = async (listingId: string, partnerId: string) => {
  // 1. Validate partner is active & verified
  const partner = await getPartnerById(partnerId);
  if (!partner || partner.status !== 'active') {
    throw new Error('Partner must be active to publish listings');
  }

  // 2. Validate listing completeness (all required fields)
  const listing = await getListingById(listingId);
  if (!listing.images?.length || !listing.price) {
    throw new Error('Listing incomplete');
  }

  // 3. Update status to 'published'
  const updated = await updateListing(listingId, {
    status: 'published',
    publishedAt: new Date(),
  });

  // 4. Send notification (external API)
  // await sendNotification(...);

  return updated;
};
```

**Route using workflow:**
```
POST   /api/listings/[id]/publish    # Uses publishListing() workflow
```

---

### 2️⃣ BOOKINGS DOMAIN (5 tables)

**Tables:** booking, bookingSlot, partnerAvailability, userBookingRestriction, partnerBookingSettings

#### Database Queries (`packages/database/src/queries/bookings.ts`)

```typescript
// Booking CRUD (direct)
- getBookingById(id)
- getBookingsByUserId(userId, filters?)
- getBookingsByPartnerId(partnerId, filters?)
- createBooking(data)
- updateBooking(id, data)
- cancelBooking(id) // Update status

// Booking Slots (inline)
- getSlotById(id)
- getSlotsByListingId(listingId, filters?)
- createSlot(data)
- updateSlot(id, data)
- incrementSlotBookings(slotId) // Atomic counter

// Partner Availability (inline)
- getAvailabilityByPartnerId(partnerId)
- upsertAvailability(partnerId, data)

// Booking Restrictions (inline)
- getUserRestrictions(userId)
- addRestriction(data)
- removeRestriction(id)

// Booking Settings (inline)
- getSettingsByPartnerId(partnerId)
- upsertSettings(partnerId, data)
```

#### API Routes (`apps/web/src/app/api/bookings/`)

**Simple CRUD (no service):**

```
GET    /api/bookings                     # List user's bookings
GET    /api/bookings/[id]              # Get single booking
POST   /api/bookings                    # Create booking (DIRECT - no workflow yet)
PATCH  /api/bookings/[id]              # Update booking
DELETE /api/bookings/[id]              # Cancel booking

GET    /api/bookings/slots/[listingId]       # Get available slots (inline)
POST   /api/bookings/slots                     # Create slot (partner only, inline)
PATCH  /api/bookings/slots/[id]                # Update slot (inline)

GET    /api/bookings/partner/[partnerId]      # Get partner's bookings (inline)
GET    /api/bookings/availability/[partnerId] # Get availability (inline)
PATCH  /api/bookings/availability/[partnerId] # Update availability (inline)

GET    /api/bookings/settings/[partnerId]     # Get settings (inline)
PATCH  /api/bookings/settings/[partnerId]     # Update settings (inline)
```

**Workflow Functions (service layer):**

```typescript
// lib/bookings/workflow.ts

// 1. CONFIRM BOOKING (multi-step transaction)
export const confirmBooking = async (bookingId: string, partnerId: string) => {
  // 1. Validate booking exists & in pending state
  const booking = await getBookingById(bookingId);
  if (!booking || booking.status !== 'pending') {
    throw new Error('Invalid booking');
  }

  // 2. Check partner owns the listing
  const listing = await getListingById(booking.listingId);
  if (listing.partnerId !== partnerId) {
    throw new Error('Unauthorized');
  }

  // 3. Check slot capacity
  const slot = await getSlotById(booking.slotId);
  if (slot.currentBookings >= slot.maxBookings) {
    throw new Error('Slot full');
  }

  // 4. Update booking status
  await updateBooking(bookingId, {
    status: 'confirmed',
    confirmedAt: new Date(),
  });

  // 5. Increment slot counter (atomic)
  await incrementSlotBookings(booking.slotId);

  // 6. Send confirmation email/notification
  // await sendBookingConfirmation(...);

  return booking;
};

// 2. PROCESS NO-SHOW (penalty logic)
export const processNoShow = async (bookingId: string, partnerId: string) => {
  // 1. Validate booking
  const booking = await getBookingById(bookingId);
  if (!booking || booking.status !== 'confirmed') {
    throw new Error('Invalid booking');
  }

  // 2. Check partner authorization
  const listing = await getListingById(booking.listingId);
  if (listing.partnerId !== partnerId) {
    throw new Error('Unauthorized');
  }

  // 3. Update booking status
  await updateBooking(bookingId, {
    status: 'no_show',
    noShowAt: new Date(),
  });

  // 4. Add restriction to user (3 strikes = 30-day ban)
  const restrictions = await getUserRestrictions(booking.userId);
  const recentNoShows = restrictions.filter(r => 
    r.type === 'no_show' && 
    r.createdAt > new Date(Date.now() - 30*24*60*60*1000)
  );

  if (recentNoShows.length >= 2) { // This is 3rd strike
    await addRestriction({
      userId: booking.userId,
      type: 'booking_banned',
      reason: '3 no-shows in 30 days',
      expiresAt: new Date(Date.now() + 30*24*60*60*1000),
    });
  } else {
    await addRestriction({
      userId: booking.userId,
      type: 'no_show',
      reason: 'Missed booking',
      expiresAt: null, // Permanent record
    });
  }

  // 5. Send penalty notification
  // await sendNoShowPenalty(...);

  return booking;
};

// 3. CHECK BOOKING RESTRICTIONS (validation)
export const checkBookingRestrictions = async (userId: string) => {
  const restrictions = await getUserRestrictions(userId);
  
  const activeBan = restrictions.find(r =>
    r.type === 'booking_banned' &&
    (!r.expiresAt || r.expiresAt > new Date())
  );

  if (activeBan) {
    throw new Error(`User banned until ${activeBan.expiresAt}`);
  }

  return { allowed: true };
};
```

**Routes using workflows:**

```
POST   /api/bookings/[id]/confirm      # Uses confirmBooking()
POST   /api/bookings/[id]/no-show      # Uses processNoShow()
GET    /api/bookings/restrictions/check # Uses checkBookingRestrictions()
```

---

### 3️⃣ MESSAGING DOMAIN (4 tables)

**Tables:** conversation, conversationParticipant, message, messageReaction

#### Database Queries (`packages/database/src/queries/messaging.ts`)

```typescript
// Conversations (direct)
- getConversationById(id)
- getConversationsByUserId(userId) // List user's chats
- createConversation(data)
- updateConversation(id, data)

// Participants (inline)
- getParticipants(conversationId)
- addParticipant(conversationId, userId)
- removeParticipant(conversationId, userId)
- updateParticipant(conversationId, userId, data) // last_read, notifications

// Messages (direct)
- getMessageById(id)
- getMessagesByConversationId(conversationId, filters?)
- createMessage(data)
- updateMessage(id, data) // Edit/delete
- markMessagesAsRead(conversationId, userId)

// Reactions (inline)
- getReactionsByMessageId(messageId)
- addReaction(messageId, userId, emoji)
- removeReaction(reactionId)
```

#### API Routes (`apps/web/src/app/api/messaging/`)

**All Simple CRUD (no complex workflows for V1):**

```
GET    /api/messaging/conversations              # List user's conversations
GET    /api/messaging/conversations/[id]         # Get single conversation
POST   /api/messaging/conversations               # Start new conversation (inline)

GET    /api/messaging/conversations/[id]/messages    # Get messages (inline)
POST   /api/messaging/conversations/[id]/messages    # Send message (inline)
PATCH  /api/messaging/messages/[id]                   # Edit message (inline)
DELETE /api/messaging/messages/[id]                   # Delete message (inline)

POST   /api/messaging/messages/[id]/react         # Add reaction (inline)
DELETE /api/messaging/reactions/[id]              # Remove reaction (inline)

PATCH  /api/messaging/conversations/[id]/read    # Mark as read (inline)
```

**Note:** Messaging is intentionally **simple for V1**. No service layer needed. Real-time delivery handled by WebSocket server (`apps/ws/`), not HTTP API.

---

### 4️⃣ CONSIGNMENT DOMAIN (3 tables)

**Tables:** consignmentLead, consignmentLeadActivity, partnerConsignmentPreference

#### Database Queries (`packages/database/src/queries/consignment.ts`)

```typescript
// Consignment Leads (direct)
- getLeadById(id)
- getLeadsByUserId(userId)
- getLeadsByPartnerId(partnerId)
- getAllLeads(filters?) // Admin view
- createLead(data)
- updateLead(id, data)

// Lead Activities (inline)
- getActivitiesByLeadId(leadId)
- addActivity(leadId, data) // Log every action

// Partner Preferences (inline)
- getPreferencesByPartnerId(partnerId)
- upsertPreferences(partnerId, data)
```

#### API Routes (`apps/web/src/app/api/consignment/`)

**Simple CRUD:**

```
GET    /api/consignment/leads                  # List user's leads
GET    /api/consignment/leads/[id]            # Get single lead
POST   /api/consignment/leads                  # Submit lead (USER - uses workflow)
PATCH  /api/consignment/leads/[id]            # Update lead
DELETE /api/consignment/leads/[id]            # Cancel lead

GET    /api/consignment/leads/[id]/activities # View activity log (inline)
GET    /api/consignment/partner/[partnerId]   # Get partner's leads (inline)

GET    /api/consignment/preferences/[partnerId]  # Get preferences (inline)
PATCH  /api/consignment/preferences/[partnerId]  # Update preferences (inline)
```

**Workflow Functions (service layer):**

```typescript
// lib/consignment/matching-service.ts

// 1. CREATE CONSIGNMENT LEAD (with auto-matching)
export const createConsignmentLead = async (data: LeadInput) => {
  // 1. Validate user data
  const validated = ConsignmentLeadSchema.parse(data);

  // 2. Create lead in database
  const lead = await createLead({
    ...validated,
    status: 'pending',
  });

  // 3. Log initial activity
  await addActivity(lead.id, {
    type: 'created',
    description: 'Lead submitted by user',
  });

  // 4. Find matching partners (background - don't block)
  matchLeadToPartners(lead.id).catch(err => 
    console.error('[consignment] Matching failed', err)
  );

  return lead;
};

// 2. ACCEPT CONSIGNMENT LEAD (partner accepts)
export const acceptConsignmentLead = async (leadId: string, partnerId: string) => {
  // 1. Validate lead exists & status
  const lead = await getLeadById(leadId);
  if (!lead || lead.status !== 'pending') {
    throw new Error('Invalid lead');
  }

  // 2. Check if partner already has 3 active leads (limit)
  const activeLeads = await getLeadsByPartnerId(partnerId);
  if (activeLeads.filter(l => l.status === 'active').length >= 3) {
    throw new Error('Maximum active leads reached');
  }

  // 3. Update lead status
  await updateLead(leadId, {
    status: 'active',
    assignedPartnerId: partnerId,
    acceptedAt: new Date(),
  });

  // 4. Log activity
  await addActivity(leadId, {
    type: 'accepted',
    description: `Accepted by partner ${partnerId}`,
  });

  // 5. Send confirmation to user
  // await sendConsignmentAcceptance(...);

  return lead;
};

// 3. MATCH LEAD TO PARTNERS (background job)
const matchLeadToPartners = async (leadId: string) => {
  // 1. Get lead details
  const lead = await getLeadById(leadId);
  
  // 2. Find partners with matching preferences
  const partners = await db
    .select()
    .from(partner)
    .innerJoin(partnerConsignmentPreference, eq(partner.id, partnerConsignmentPreference.partnerId))
    .where(
      and(
        eq(partner.status, 'active'),
        eq(partnerConsignmentPreference.acceptingLeads, true),
        // Match emirates
        sql`${partnerConsignmentPreference.targetEmirates} @> ARRAY[${lead.emirate}]::text[]`,
        // Match budget range
        lead.expectedPrice >= partnerConsignmentPreference.minBudget,
        lead.expectedPrice <= partnerConsignmentPreference.maxBudget,
      )
    );

  // 3. Notify matched partners (via email/push)
  for (const partner of partners) {
    // await sendLeadNotification(partner.id, leadId);
  }

  // 4. Log matching results
  await addActivity(leadId, {
    type: 'matched',
    description: `Matched to ${partners.length} partners`,
  });
};
```

**Routes using workflows:**

```
POST   /api/consignment/leads                      # Uses createConsignmentLead()
POST   /api/consignment/leads/[id]/accept          # Uses acceptConsignmentLead()
```

---

## 📊 Implementation Summary

### Tables → API Routes Mapping

| Domain | Tables | Direct CRUD Routes | Workflow Routes | Service Files Needed |
|--------|--------|-------------------|----------------|---------------------|
| **Listings** | 3 | 8 routes | 1 (publish) | 1 service file |
| **Bookings** | 5 | 13 routes | 3 (confirm, no-show, check) | 1 workflow file |
| **Messaging** | 4 | 9 routes | 0 (all simple) | 0 (optional) |
| **Consignment** | 3 | 7 routes | 2 (create, accept) | 1 matching service |
| **TOTAL** | **15** | **37 routes** | **6 workflows** | **3 files** |

### Code Estimates

| File | Lines | Complexity | Time Estimate |
|------|-------|------------|---------------|
| `queries/listings.ts` | ~400 | Medium | 2-3 hours |
| `queries/bookings.ts` | ~600 | High | 4-5 hours |
| `queries/messaging.ts` | ~300 | Low | 2 hours |
| `queries/consignment.ts` | ~200 | Low | 1-2 hours |
| `lib/listings/service.ts` | ~150 | Low | 1 hour |
| `lib/bookings/workflow.ts` | ~300 | High | 2-3 hours |
| `lib/consignment/matching-service.ts` | ~250 | Medium | 2-3 hours |
| API routes (37 files) | ~2000 | Low | 6-8 hours |
| **TOTAL** | **~4200 lines** | - | **20-30 hours** |

---

## 🎯 Recommended Implementation Order

### Phase 1: Foundation (Week 1)
1. ✅ Create database query files for all 4 domains (~2000 lines)
2. ✅ Test queries in isolation (Jest tests)

### Phase 2: Simple CRUD (Week 2)
3. ✅ Implement all 37 direct API routes
4. ✅ Test with Postman/Insomnia

### Phase 3: Workflows (Week 3)
5. ✅ Implement 3 service files (listings, bookings, consignment)
6. ✅ Connect workflow routes to services
7. ✅ Add external integrations (email, notifications)

### Phase 4: Polish (Week 4)
8. ✅ Add API documentation (OpenAPI/Swagger)
9. ✅ Performance testing & optimization
10. ✅ Security audit (rate limiting, auth checks)

---

## 💡 Best Practices

### ✅ DO:
- Keep API routes **thin** (validation → service/query → response)
- Use **TypeScript types** from `@alifh/shared`
- Add **comprehensive error handling** (try/catch in every route)
- Log **all errors** with context (user ID, request ID)
- Return **consistent JSON** format: `{ data?, error?, status }`
- Use **auth middleware** for protected routes
- Add **rate limiting** per user (Redis)

### ❌ DON'T:
- Put business logic in API routes (use services)
- Expose raw Drizzle errors to users (sanitize)
- Skip validation (always validate input)
- Use `any` types (type everything)
- Forget pagination (limit + offset for lists)
- Miss authorization checks (user owns resource?)
- Hardcode values (use environment variables)

---

## 🔐 Security Checklist

- [ ] All routes check authentication (`requireSessionUser()`)
- [ ] Protected routes verify resource ownership (user owns booking?)
- [ ] Input validation with Zod schemas
- [ ] Rate limiting per endpoint (100 req/min baseline)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CORS configured correctly
- [ ] Environment variables for secrets
- [ ] Audit logging for sensitive operations

---

## 📈 Performance Targets (V1)

| Route Type | Target Latency | Cache Strategy |
|------------|---------------|----------------|
| **GET listings** | <200ms | Redis 5min |
| **GET bookings** | <100ms | No cache (real-time) |
| **POST booking** | <100ms | No cache |
| **GET messages** | <150ms | Redis 1min |
| **POST message** | <50ms | No cache |
| **Workflows** | <500ms | No cache |

---

## 🚀 Next Action

**Ready to start implementation?** Let me know which domain to begin with:

1. **Listings** (easiest - 3 tables, 1 workflow)
2. **Bookings** (hardest - 5 tables, 3 complex workflows)
3. **Messaging** (simplest - 4 tables, no workflows)
4. **Consignment** (medium - 3 tables, background matching)

I'll generate the complete code (queries + routes + services) for whichever domain you choose! 🎯

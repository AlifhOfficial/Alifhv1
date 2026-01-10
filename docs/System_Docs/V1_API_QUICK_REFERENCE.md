# 🗺️ V1 API Quick Reference

**Complete API surface for 32 tables across 7 domains**

---

## 📍 Endpoint Summary

### 1. AUTH DOMAIN ✅ (Already Implemented)
```
POST   /api/auth/sign-in
POST   /api/auth/sign-up
POST   /api/auth/sign-out
GET    /api/auth/get-session
POST   /api/auth/magic-link-validated
POST   /api/auth/password-reset-validated
```

### 2. PROFILE DOMAIN ✅ (Already Implemented)
```
GET    /api/profile                    # Get current user profile
PATCH  /api/profile                    # Update profile
```

### 3. KYC DOMAIN ✅ (Didit Integration)
```
POST   /api/kyc/didit/session         # Create Didit verification session
GET    /api/kyc/didit/session         # Get current session status
POST   /api/kyc/cancel                # Cancel pending KYC session
POST   /api/kyc/sync                  # Manual sync (localhost dev only)
GET    /api/admin/kyc                 # List KYC submissions (admin)
GET    /api/admin/kyc/[id]            # Get KYC details with signed URLs (admin)
```

### 4. PARTNER DOMAIN ✅ (Already Implemented)
```
# Partner CRUD
GET    /api/partner/list               # List all partners (admin)
GET    /api/partner/[id]              # Get partner details
POST   /api/partner/[id]/update       # Update partner

# Partner Applications
GET    /api/partner/request/list       # List applications (admin)
GET    /api/partner/request/[id]      # Get application
POST   /api/partner/request/approve    # Approve (uses workflow)
POST   /api/partner/request/reject     # Reject (uses workflow)

# Partner Reviews
GET    /api/partner/reviews/[partnerId]  # List reviews
POST   /api/partner/reviews                # Create review
PATCH  /api/partner/reviews/[id]/helpful  # Mark helpful (uses workflow)

# Partner Staff
GET    /api/partner/staff/[partnerId]   # List team members
POST   /api/partner/staff/create         # Add staff member
PATCH  /api/partner/staff/update/[id]    # Update staff role
```

### 5. STORAGE DOMAIN ✅ (Already Implemented)
```
POST   /api/storage/sign               # Get signed URL (S3)
POST   /api/storage/upload             # Upload file
GET    /api/storage/status             # Check upload status
```

---

## 🔨 TO IMPLEMENT

### 6. LISTINGS DOMAIN 🔨 (3 tables)

#### Car Listings
```
# CRUD
GET    /api/listings                   # Search listings (public) [INLINE]
GET    /api/listings/[id]             # Get details [INLINE]
POST   /api/listings                   # Create draft [INLINE]
PATCH  /api/listings/[id]             # Update listing [INLINE]
DELETE /api/listings/[id]             # Delete/soft-delete [INLINE]

# Workflows
POST   /api/listings/[id]/publish     # Publish listing [SERVICE]

# Related Data
GET    /api/listings/[id]/price-history    # View history [INLINE]
POST   /api/listings/[id]/view              # Track view [INLINE]
GET    /api/listings/partner/[partnerId]   # Partner's inventory [INLINE]
```

**Query Functions Required:**
- `packages/database/src/queries/listings.ts` (~400 lines)
  - getListingById, getListingsByPartnerId, getAllListings
  - createListing, updateListing, deleteListing
  - getPriceHistory, addPriceChange
  - recordListingView, getViewCount

**Service Required:**
- `apps/web/src/lib/listings/service.ts` (~150 lines)
  - publishListing() - Multi-step validation + notification

---

### 7. BOOKINGS DOMAIN 🔨 (5 tables)

#### Bookings
```
# CRUD
GET    /api/bookings                   # User's bookings [INLINE]
GET    /api/bookings/[id]             # Booking details [INLINE]
POST   /api/bookings                   # Create booking [INLINE]
PATCH  /api/bookings/[id]             # Update booking [INLINE]
DELETE /api/bookings/[id]             # Cancel booking [INLINE]

# Workflows
POST   /api/bookings/[id]/confirm     # Confirm booking [SERVICE]
POST   /api/bookings/[id]/no-show     # Mark no-show [SERVICE]
GET    /api/bookings/restrictions/check  # Check restrictions [SERVICE]

# Booking Slots
GET    /api/bookings/slots/[listingId]   # Available slots [INLINE]
POST   /api/bookings/slots                # Create slot [INLINE]
PATCH  /api/bookings/slots/[id]           # Update slot [INLINE]

# Partner Management
GET    /api/bookings/partner/[partnerId]      # Partner bookings [INLINE]
GET    /api/bookings/availability/[partnerId] # Get schedule [INLINE]
PATCH  /api/bookings/availability/[partnerId] # Update schedule [INLINE]
GET    /api/bookings/settings/[partnerId]     # Get settings [INLINE]
PATCH  /api/bookings/settings/[partnerId]     # Update settings [INLINE]
```

**Query Functions Required:**
- `packages/database/src/queries/bookings.ts` (~600 lines)
  - getBookingById, getBookingsByUserId, getBookingsByPartnerId
  - createBooking, updateBooking, cancelBooking
  - getSlotById, getSlotsByListingId, createSlot, incrementSlotBookings
  - getAvailabilityByPartnerId, upsertAvailability
  - getUserRestrictions, addRestriction, removeRestriction
  - getSettingsByPartnerId, upsertSettings

**Service Required:**
- `apps/web/src/lib/bookings/workflow.ts` (~300 lines)
  - confirmBooking() - Multi-step transaction
  - processNoShow() - Penalty logic (3 strikes = ban)
  - checkBookingRestrictions() - Validation helper

---

### 8. MESSAGING DOMAIN 🔨 (4 tables)

#### Conversations & Messages
```
# Conversations
GET    /api/messaging/conversations              # List chats [INLINE]
GET    /api/messaging/conversations/[id]         # Get chat [INLINE]
POST   /api/messaging/conversations               # Start chat [INLINE]

# Messages
GET    /api/messaging/conversations/[id]/messages  # Get messages [INLINE]
POST   /api/messaging/conversations/[id]/messages  # Send message [INLINE]
PATCH  /api/messaging/messages/[id]                 # Edit message [INLINE]
DELETE /api/messaging/messages/[id]                 # Delete message [INLINE]

# Interactions
POST   /api/messaging/messages/[id]/react       # React to message [INLINE]
DELETE /api/messaging/reactions/[id]            # Remove reaction [INLINE]
PATCH  /api/messaging/conversations/[id]/read  # Mark as read [INLINE]
```

**Query Functions Required:**
- `packages/database/src/queries/messaging.ts` (~300 lines)
  - getConversationById, getConversationsByUserId, createConversation
  - getParticipants, addParticipant, updateParticipant
  - getMessageById, getMessagesByConversationId, createMessage
  - markMessagesAsRead
  - getReactionsByMessageId, addReaction, removeReaction

**Service Required:**
- None! (Real-time via WebSocket in `apps/ws/`, HTTP API is simple CRUD)

---

### 9. CONSIGNMENT DOMAIN 🔨 (3 tables)

#### Consignment Leads
```
# CRUD
GET    /api/consignment/leads                  # User's leads [INLINE]
GET    /api/consignment/leads/[id]            # Lead details [INLINE]
POST   /api/consignment/leads                  # Submit lead [SERVICE]
PATCH  /api/consignment/leads/[id]            # Update lead [INLINE]
DELETE /api/consignment/leads/[id]            # Cancel lead [INLINE]

# Workflows
POST   /api/consignment/leads/[id]/accept    # Accept lead [SERVICE]

# Related Data
GET    /api/consignment/leads/[id]/activities     # Activity log [INLINE]
GET    /api/consignment/partner/[partnerId]       # Partner leads [INLINE]
GET    /api/consignment/preferences/[partnerId]   # Get prefs [INLINE]
PATCH  /api/consignment/preferences/[partnerId]   # Update prefs [INLINE]
```

**Query Functions Required:**
- `packages/database/src/queries/consignment.ts` (~200 lines)
  - getLeadById, getLeadsByUserId, getLeadsByPartnerId
  - createLead, updateLead
  - getActivitiesByLeadId, addActivity
  - getPreferencesByPartnerId, upsertPreferences

**Service Required:**
- `apps/web/src/lib/consignment/matching-service.ts` (~250 lines)
  - createConsignmentLead() - Auto-matching to partners
  - acceptConsignmentLead() - Partner acceptance + limits
  - matchLeadToPartners() - Background matching algorithm

---

## 📊 Implementation Matrix

| Domain | Tables | Total Routes | Inline Routes | Service Routes | Query Lines | Service Lines |
|--------|--------|--------------|---------------|----------------|-------------|---------------|
| Auth | 4 | 6 | 0 | 6 | ✅ Done | ✅ Done |
| Profile | 4 | 2 | 2 | 0 | ✅ 550 lines | ✅ Done |
| KYC | 1 | 2 | 0 | 2 | ✅ Done | ✅ Done |
| Partner | 5 | 14 | 7 | 7 | ✅ 526 lines | ✅ 4 files |
| Storage | 0 | 3 | 0 | 3 | ✅ Done | ✅ Done |
| **Listings** | 3 | 8 | 7 | 1 | 🔨 400 lines | 🔨 150 lines |
| **Bookings** | 5 | 13 | 10 | 3 | 🔨 600 lines | 🔨 300 lines |
| **Messaging** | 4 | 9 | 9 | 0 | 🔨 300 lines | ✅ None |
| **Consignment** | 3 | 7 | 5 | 2 | 🔨 200 lines | 🔨 250 lines |
| **TOTAL** | **32** | **64** | **40** | **24** | **~4200 lines** | **~1400 lines** |

---

## 🎯 Work Breakdown

### ✅ Completed (5 domains)
- Auth, Profile, KYC, Partner, Storage
- 27 routes implemented
- ~1076 lines of query code
- ~1000 lines of service code

### 🔨 Remaining (4 domains)
- Listings, Bookings, Messaging, Consignment
- 37 routes to implement
- ~1500 lines of query code
- ~700 lines of service code
- **Estimated time: 20-30 hours**

---

## 🚦 Priority Order

1. **HIGH** 🔥 - Listings (core marketplace feature)
2. **HIGH** 🔥 - Bookings (revenue-generating)
3. **MEDIUM** 🔴 - Messaging (user engagement)
4. **LOW** 🟡 - Consignment (competitive advantage but can be MVP)

---

## 💡 Tips

### Route Naming Convention
```
GET    /api/{domain}                    # List resources
GET    /api/{domain}/[id]              # Get single resource
POST   /api/{domain}                    # Create resource
PATCH  /api/{domain}/[id]              # Update resource
DELETE /api/{domain}/[id]              # Delete resource

POST   /api/{domain}/[id]/{action}     # Workflow actions (publish, confirm, etc)
GET    /api/{domain}/{relation}/[id]   # Related resources
```

### Response Format
```typescript
// Success
{
  data: { ... },
  meta?: { page, total, ... }
}

// Error
{
  error: "User-friendly message",
  code: "ERROR_CODE",
  status: 400 | 401 | 404 | 500
}
```

### Authentication
```typescript
// All protected routes use this pattern
async function requireSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
```

---

Ready to implement? Pick a domain and I'll generate all the code! 🚀

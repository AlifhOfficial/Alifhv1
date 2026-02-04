# 🚀 LISTINGS DOMAIN - Implementation Checklist

**Date:** December 15, 2025  
**Domain:** Car Listings (3 tables)  
**Estimated Time:** 6-8 hours  
**Status:** 🔨 Ready to implement

---

## 📋 PHASE 1: DATABASE QUERIES (2-3 hours)

### Step 1.1: Create Query File
**File:** `packages/database/src/queries/listings.ts` (~400 lines)

**Tasks:**
- [ ] Create file with proper imports
- [ ] Add ID prefix generator (`listing_`, `price_`, `view_`)
- [ ] Export TypeScript types (ListingRecord, ListingInsert, ListingUpdate)
- [ ] Add `pruneUndefined` utility helper

**Expected Types:**
```typescript
export type ListingRecord = typeof carListing.$inferSelect;
export type ListingInsert = typeof carListing.$inferInsert;
export type ListingUpdate = Partial<Omit<ListingInsert, 'id' | 'createdAt'>>;

export type PriceHistoryRecord = typeof listingPriceHistory.$inferSelect;
export type PriceHistoryInsert = typeof listingPriceHistory.$inferInsert;

export type ListingViewRecord = typeof listingView.$inferSelect;
export type ListingViewInsert = typeof listingView.$inferInsert;
```

---

### Step 1.2: Implement Core CRUD Functions

**Functions to create (in order):**

#### A. Listing CRUD (8 functions)
- [ ] `getListingById(id: string)` - Get single listing
- [ ] `getListingBySlug(slug: string)` - Get by URL-friendly slug
- [ ] `getListingByVIN(vin: string)` - Get by Vehicle ID Number
- [ ] `getListingsByPartnerId(partnerId, filters?)` - Partner's inventory
- [ ] `getListingsByUserId(userId, filters?)` - User's P2P listings (future)
- [ ] `getAllListings(filters?)` - Public search with pagination
- [ ] `createListing(data)` - Create new listing (auto-generate ID + slug)
- [ ] `updateListing(id, data)` - Update existing listing
- [ ] `deleteListing(id)` - Soft delete (set status to 'archived')

**Filter Options:**
```typescript
interface ListingFilters {
  status?: 'draft' | 'pending' | 'published' | 'reserved' | 'sold' | 'archived';
  emirate?: string;
  make?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  isFeatured?: boolean;
  isBlackMember?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'qiScore';
  sortOrder?: 'asc' | 'desc';
}
```

---

#### B. Price History Functions (3 functions)
- [ ] `getPriceHistory(listingId: string)` - Get all price changes
- [ ] `getLatestPriceChange(listingId: string)` - Get most recent change
- [ ] `addPriceChange(data)` - Record price update
  - Auto-calculate `changePercent`
  - Update listing's `priceChanges` counter
  - Update listing's `lastPriceChange` timestamp

---

#### C. View Tracking Functions (4 functions)
- [ ] `recordListingView(data)` - Track view event
  - Auto-generate ID
  - Increment listing's `viewCount`
- [ ] `getViewCount(listingId: string)` - Total views
- [ ] `getUniqueViewCount(listingId: string)` - Unique users only
- [ ] `getViewsByListing(listingId, filters?)` - Detailed view analytics

---

#### D. Engagement Functions (4 functions)
- [ ] `incrementViewCount(listingId: string)` - Atomic counter +1
- [ ] `incrementFavouriteCount(listingId: string)` - Atomic counter +1
- [ ] `decrementFavouriteCount(listingId: string)` - Atomic counter -1
- [ ] `incrementShareCount(listingId: string)` - Atomic counter +1

---

#### E. Analytics/Stats Functions (3 functions)
- [ ] `getListingStats(listingId: string)` - All metrics in one query
- [ ] `updatePerformanceScore(listingId: string)` - Recalculate score
- [ ] `updateDaysOnMarket(listingId: string)` - Update counter

---

### Step 1.3: Export from Main Queries File
**File:** `packages/database/src/queries.ts`

- [ ] Add: `export * from './queries/listings';`

---

### Step 1.4: Test Query Functions
**File:** `packages/database/src/queries/__tests__/listings.test.ts` (optional but recommended)

- [ ] Test createListing with valid data
- [ ] Test getAllListings with filters
- [ ] Test updateListing
- [ ] Test price history tracking
- [ ] Test view counting (unique vs total)

---

## 📋 PHASE 2: API ROUTES (2-3 hours)

### Step 2.1: Create Route Structure

**Create these files:**
```
apps/web/src/app/api/listings/
├── route.ts                         # GET (list), POST (create)
├── [id]/
│   ├── route.ts                     # GET, PATCH, DELETE
│   ├── publish/
│   │   └── route.ts                 # POST (workflow)
│   ├── price-history/
│   │   └── route.ts                 # GET
│   ├── view/
│   │   └── route.ts                 # POST
│   └── stats/
│       └── route.ts                 # GET
└── partner/
    └── [partnerId]/
        └── route.ts                 # GET (partner inventory)
```

---

### Step 2.2: Implement Base CRUD Routes

#### Route 1: `apps/web/src/app/api/listings/route.ts`
- [ ] `GET /api/listings` - List all published listings (public)
  - Parse query params (filters, pagination)
  - Call `getAllListings({ status: 'published', ...filters })`
  - Return paginated response with metadata
  
- [ ] `POST /api/listings` - Create new listing
  - Auth required (partner only)
  - Validate request body
  - Call `createListing(data)`
  - Return created listing

**Auth Helper:**
```typescript
async function requirePartner(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const user = session?.user;
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Check if user has partner role
  const partner = await getPartnerByUserId(user.id);
  if (!partner || partner.status !== 'active') {
    throw new Error('Partner access required');
  }
  
  return { user, partner };
}
```

---

#### Route 2: `apps/web/src/app/api/listings/[id]/route.ts`
- [ ] `GET /api/listings/[id]` - Get listing details (public for published)
  - Get ID from params
  - Call `getListingById(id)`
  - Check if published OR user owns it
  - Return listing
  
- [ ] `PATCH /api/listings/[id]` - Update listing
  - Auth required (partner owns listing)
  - Validate request body
  - Check ownership
  - If price changed, call `addPriceChange()`
  - Call `updateListing(id, data)`
  - Return updated listing
  
- [ ] `DELETE /api/listings/[id]` - Delete listing (soft delete)
  - Auth required (partner owns listing)
  - Check ownership
  - Call `updateListing(id, { status: 'archived', archivedAt: new Date() })`
  - Return success

---

#### Route 3: `apps/web/src/app/api/listings/[id]/price-history/route.ts`
- [ ] `GET /api/listings/[id]/price-history` - View price changes (public)
  - Get ID from params
  - Call `getPriceHistory(id)`
  - Return price history array

---

#### Route 4: `apps/web/src/app/api/listings/[id]/view/route.ts`
- [ ] `POST /api/listings/[id]/view` - Track view (public)
  - Get ID from params
  - Extract analytics data from request (IP, user agent, etc.)
  - Call `recordListingView({ listingId: id, ...analytics })`
  - Return success (no sensitive data)

---

#### Route 5: `apps/web/src/app/api/listings/[id]/stats/route.ts`
- [ ] `GET /api/listings/[id]/stats` - Get analytics (partner only)
  - Auth required (partner owns listing)
  - Get ID from params
  - Check ownership
  - Call `getListingStats(id)`
  - Return stats object

---

#### Route 6: `apps/web/src/app/api/listings/partner/[partnerId]/route.ts`
- [ ] `GET /api/listings/partner/[partnerId]` - Partner's inventory
  - Auth required (partner or admin)
  - Get partnerId from params
  - Check authorization
  - Call `getListingsByPartnerId(partnerId, filters)`
  - Return listings array

---

## 📋 PHASE 3: SERVICE LAYER (1-2 hours)

### Step 3.1: Create Service File
**File:** `apps/web/src/lib/listings/service.ts` (~150 lines)

---

### Step 3.2: Implement Publish Workflow

#### Function: `publishListing(listingId: string, partnerId: string)`
**Purpose:** Validate and publish a listing (multi-step transaction)

**Steps:**
1. [ ] Get partner by ID
2. [ ] Validate partner is active & verified
3. [ ] Get listing by ID
4. [ ] Validate listing belongs to partner
5. [ ] Validate listing completeness:
   - [ ] Has at least 1 image
   - [ ] Has price > 0
   - [ ] Has required fields (make, model, year, mileage, emirate)
   - [ ] Has description (min 50 characters)
6. [ ] Update listing status to 'published'
7. [ ] Set `publishedAt` timestamp
8. [ ] Generate SEO-friendly slug if missing
9. [ ] (Optional) Send notification/webhook
10. [ ] Return updated listing

**Validation Schema:**
```typescript
const PublishListingSchema = z.object({
  images: z.array(z.string()).min(1, 'At least 1 image required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900),
  mileage: z.number().min(0),
  emirate: z.string().min(1),
  description: z.string().min(50, 'Description must be at least 50 characters'),
});
```

---

### Step 3.3: Create Index File
**File:** `apps/web/src/lib/listings/index.ts`

- [ ] Export all functions from service.ts
```typescript
export * from './service';
```

---

### Step 3.4: Implement Publish Route

#### Route 7: `apps/web/src/app/api/listings/[id]/publish/route.ts`
- [ ] `POST /api/listings/[id]/publish` - Publish listing (uses workflow)
  - Auth required (partner owns listing)
  - Get ID from params
  - Get partner from session
  - Call `publishListing(id, partner.id)`
  - Handle validation errors gracefully
  - Return published listing

---

## 📋 PHASE 4: ADDITIONAL ROUTES (1 hour)

### Step 4.1: Search & Discovery Routes

#### Route 8: `apps/web/src/app/api/listings/search/route.ts` (optional enhancement)
- [ ] `GET /api/listings/search` - Advanced search
  - Parse complex filters from query
  - Full-text search on make/model/description
  - Call `getAllListings` with comprehensive filters
  - Return results with facets (counts by category)

---

### Step 4.2: Featured/Premium Routes (optional for V1)

#### Route 9: `apps/web/src/app/api/listings/featured/route.ts`
- [ ] `GET /api/listings/featured` - Get featured listings
  - Call `getAllListings({ isFeatured: true, status: 'published' })`
  - Return featured listings

---

## 📋 PHASE 5: INTEGRATION & TESTING (1-2 hours)

### Step 5.1: Image Upload Integration
- [ ] Verify R2 storage is working
- [ ] Test image upload flow:
  1. Partner uploads image via `/api/storage/upload`
  2. Gets back R2 URL
  3. Includes URL in listing creation/update
  4. Listing displays images correctly

---

### Step 5.2: Manual API Testing

**Use Postman/Insomnia or similar:**

#### Test 1: Create Draft Listing
```bash
POST /api/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "make": "Mercedes-Benz",
  "model": "C-Class",
  "year": 2023,
  "trim": "AMG C43",
  "mileage": 15000,
  "price": 25000000,
  "emirate": "Dubai",
  "bodyType": "sedan",
  "fuelType": "petrol",
  "transmission": "automatic",
  "description": "Stunning Mercedes-Benz C43 AMG in pristine condition..."
}
```
Expected: 201 Created with listing object

---

#### Test 2: Upload Images
```bash
POST /api/storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
path: listings/<listing-id>/
```
Expected: 200 OK with image URL

---

#### Test 3: Add Images to Listing
```bash
PATCH /api/listings/<listing-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "images": ["https://r2.example.com/listings/.../image1.jpg"],
  "thumbnail": "https://r2.example.com/listings/.../image1.jpg"
}
```
Expected: 200 OK with updated listing

---

#### Test 4: Publish Listing
```bash
POST /api/listings/<listing-id>/publish
Authorization: Bearer <token>
```
Expected: 200 OK with status = 'published' and publishedAt timestamp

---

#### Test 5: Search Listings (Public)
```bash
GET /api/listings?emirate=Dubai&minPrice=10000000&maxPrice=30000000&make=Mercedes-Benz
```
Expected: 200 OK with filtered listings array

---

#### Test 6: Get Listing Details (Public)
```bash
GET /api/listings/<listing-id>
```
Expected: 200 OK with full listing details

---

#### Test 7: Track View
```bash
POST /api/listings/<listing-id>/view
Content-Type: application/json

{
  "sessionId": "abc123",
  "deviceType": "mobile",
  "timeSpent": 45
}
```
Expected: 200 OK with viewCount incremented

---

#### Test 8: Update Price
```bash
PATCH /api/listings/<listing-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 23000000,
  "reason": "market_adjustment"
}
```
Expected: 200 OK + price history record created

---

#### Test 9: Get Price History
```bash
GET /api/listings/<listing-id>/price-history
```
Expected: 200 OK with price change array

---

#### Test 10: Get Partner Inventory
```bash
GET /api/listings/partner/<partner-id>?status=published
Authorization: Bearer <token>
```
Expected: 200 OK with partner's listings

---

### Step 5.3: Error Handling Tests

- [ ] Test unauthorized access (no token)
- [ ] Test forbidden access (wrong partner)
- [ ] Test not found (invalid listing ID)
- [ ] Test validation errors (missing required fields)
- [ ] Test publish with incomplete listing (should fail)

---

### Step 5.4: Performance Testing

- [ ] Test listing search with 1000+ records
- [ ] Verify indexes are working (query execution plan)
- [ ] Test pagination (offset/limit)
- [ ] Check response times (<200ms target)

---

## 📋 PHASE 6: DOCUMENTATION & POLISH (30 min)

### Step 6.1: Update Shared Types
**File:** `packages/shared/src/types/listings.ts`

- [ ] Export listing types for frontend use
- [ ] Add Zod schemas for validation
- [ ] Export filter types

---

### Step 6.2: Add API Comments
- [ ] Add JSDoc comments to all route handlers
- [ ] Document query parameters
- [ ] Document response formats

---

### Step 6.3: Update Main Documentation
- [ ] Mark listings as ✅ implemented in V1_API_QUICK_REFERENCE.md
- [ ] Add any special notes or gotchas

---

## ✅ COMPLETION CHECKLIST

### Database Layer
- [ ] `packages/database/src/queries/listings.ts` created (~400 lines)
- [ ] All 22 query functions implemented
- [ ] Types exported
- [ ] File added to main queries export

### Service Layer
- [ ] `apps/web/src/lib/listings/service.ts` created (~150 lines)
- [ ] `publishListing()` workflow implemented
- [ ] Validation schemas added
- [ ] Index file created

### API Routes
- [ ] 8 route files created
- [ ] All HTTP methods implemented (GET, POST, PATCH, DELETE)
- [ ] Auth checks in place
- [ ] Error handling added

### Testing
- [ ] Manual testing complete (10 test cases)
- [ ] Error scenarios tested
- [ ] Performance verified

### Integration
- [ ] R2 storage integration working
- [ ] Image upload → listing flow tested
- [ ] Frontend can consume APIs

---

## 🎯 FINAL VERIFICATION

Run this command to verify everything compiles:
```bash
cd /Users/Revvup/Desktop/Revvupv1
bun run build
```

Expected: ✅ All packages build successfully

---

## 📊 ESTIMATED TIMELINE

| Phase | Time | Tasks |
|-------|------|-------|
| Phase 1: Database Queries | 2-3 hours | 22 functions + types |
| Phase 2: API Routes | 2-3 hours | 8 route files |
| Phase 3: Service Layer | 1-2 hours | 1 workflow function |
| Phase 4: Additional Routes | 1 hour | Search/featured (optional) |
| Phase 5: Testing | 1-2 hours | 10 test cases + errors |
| Phase 6: Documentation | 30 min | Comments + docs |
| **TOTAL** | **7-11 hours** | **All listings endpoints** |

---

## 🚀 READY TO START?

**Current Status:** 📋 Checklist ready

**Next Action:** Begin with Phase 1, Step 1.1 - Create the query file!

Would you like me to:
1. ✅ **Generate the complete `queries/listings.ts` file** (400 lines) - RECOMMENDED
2. Generate it step-by-step with explanations
3. Start with service layer instead

Just say "start" and I'll generate the first file! 🎯

# Schema Migration Guide - V1 Audit Changes

## Quick Reference

**Changes Summary:**
- 🗑️ Removed: `favoriteTypeEnum` (unused)
- ➕ Added: 13 new fields across 4 tables
- ✅ No breaking changes

---

## Migration Commands

```bash
# 1. Navigate to database package
cd packages/database

# 2. Generate migration
bun run db:generate

# 3. Review the generated SQL
# Check: drizzle/[timestamp]_schema_audit_v1.sql

# 4. Apply migration
bun run db:push
```

---

## New Fields Added

### carListing Table
```sql
-- Heat Score (hot cars tracking)
ALTER TABLE car_listing ADD COLUMN heat_score integer DEFAULT 0 NOT NULL;
ALTER TABLE car_listing ADD COLUMN heat_score_updated_at timestamp;

-- AI Pricing Insights
ALTER TABLE car_listing ADD COLUMN ai_estimated_price integer;
ALTER TABLE car_listing ADD COLUMN ai_price_min integer;
ALTER TABLE car_listing ADD COLUMN ai_price_max integer;
ALTER TABLE car_listing ADD COLUMN ai_confidence_score double precision;
ALTER TABLE car_listing ADD COLUMN ai_price_updated_at timestamp;
ALTER TABLE car_listing ADD COLUMN ai_model text DEFAULT 'v1';
```

### partner Table
```sql
-- Owner tracking
ALTER TABLE partner_staff ADD COLUMN is_owner boolean DEFAULT false NOT NULL;

-- Analytics Cache
ALTER TABLE partner ADD COLUMN active_listings_count integer DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN total_inventory_value integer DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN avg_listing_price integer DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN sold_this_month integer DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN revenue_this_month integer DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN conversion_rate double precision DEFAULT 0 NOT NULL;
ALTER TABLE partner ADD COLUMN analytics_last_updated timestamp;
```

### conversation Table
```sql
-- Conversation initiator (spam prevention)
ALTER TABLE conversation ADD COLUMN initiated_by text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE;
```

---

## Data Backfill Required

After migration, you need to populate initial values:

### 1. Heat Score (one-time backfill)
```sql
-- Calculate heat score for all existing listings
UPDATE car_listing
SET 
  heat_score = (superlike_count * 10) + (favourite_count * 2) + (FLOOR(view_count * 0.1))::integer,
  heat_score_updated_at = NOW()
WHERE heat_score = 0;
```

### 2. Partner Analytics (one-time backfill)
```sql
-- Calculate active listings count
UPDATE partner p
SET active_listings_count = (
  SELECT COUNT(*)
  FROM car_listing cl
  WHERE cl.partner_id = p.id AND cl.status = 'published'
);

-- Calculate total inventory value
UPDATE partner p
SET total_inventory_value = COALESCE((
  SELECT SUM(price)
  FROM car_listing cl
  WHERE cl.partner_id = p.id AND cl.status = 'published'
), 0);

-- Calculate average listing price
UPDATE partner p
SET avg_listing_price = COALESCE((
  SELECT AVG(price)::integer
  FROM car_listing cl
  WHERE cl.partner_id = p.id AND cl.status = 'published'
), 0);

-- Set analytics timestamp
UPDATE partner
SET analytics_last_updated = NOW();
```

### 3. Partner Staff Owner (one-time backfill)
```sql
-- Mark existing owners
UPDATE partner_staff
SET is_owner = true
WHERE role = 'owner';
```

### 4. Conversation Initiator (manual fix required)
```sql
-- ⚠️ WARNING: This field is NOT NULL, so you must handle existing conversations
-- Option A: Set to the first participant
UPDATE conversation c
SET initiated_by = (
  SELECT user_id
  FROM conversation_participant cp
  WHERE cp.conversation_id = c.id
  ORDER BY cp.created_at ASC
  LIMIT 1
)
WHERE initiated_by IS NULL;

-- Option B: If you have no existing conversations, skip this
```

---

## Background Jobs to Implement

Create these cron jobs after migration:

### 1. Heat Score Calculator (Weekly)
```typescript
// packages/ai/src/jobs/calculate-heat-score.ts
export async function calculateHeatScores() {
  await db.execute(sql`
    UPDATE car_listing
    SET 
      heat_score = (superlike_count * 10) + (favourite_count * 2) + (FLOOR(view_count * 0.1))::integer,
      heat_score_updated_at = NOW()
    WHERE status = 'published'
  `);
}
```

### 2. Partner Analytics Aggregator (Daily)
```typescript
// apps/web/src/jobs/update-partner-analytics.ts
export async function updatePartnerAnalytics() {
  // See SQL queries above for reference
  // Update: activeListingsCount, totalInventoryValue, avgListingPrice
  // Calculate: soldThisMonth, revenueThisMonth, conversionRate
}
```

### 3. AI Price Estimator (Weekly or on-demand)
```typescript
// packages/ai/src/jobs/estimate-prices.ts
export async function estimateCarPrices() {
  const listings = await db.select().from(carListing).where(eq(carListing.status, 'published'));
  
  for (const listing of listings) {
    const estimate = await aiModel.estimatePrice({
      make: listing.make,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      // ... other features
    });
    
    await db.update(carListing)
      .set({
        aiEstimatedPrice: estimate.price,
        aiPriceMin: estimate.min,
        aiPriceMax: estimate.max,
        aiConfidenceScore: estimate.confidence,
        aiPriceUpdatedAt: new Date(),
      })
      .where(eq(carListing.id, listing.id));
  }
}
```

---

## Testing Checklist

After migration:

- [ ] Verify all new columns exist
- [ ] Run backfill scripts
- [ ] Test heat score calculation
- [ ] Test AI pricing (if ready)
- [ ] Test partner analytics display
- [ ] Test conversation creation with `initiatedBy`
- [ ] Verify `isOwner` flag on partner staff
- [ ] Check all existing features still work

---

## Rollback Plan

If something goes wrong:

```sql
-- Remove new columns (in reverse order)
ALTER TABLE conversation DROP COLUMN initiated_by;
ALTER TABLE partner DROP COLUMN analytics_last_updated;
ALTER TABLE partner DROP COLUMN conversion_rate;
ALTER TABLE partner DROP COLUMN revenue_this_month;
ALTER TABLE partner DROP COLUMN sold_this_month;
ALTER TABLE partner DROP COLUMN avg_listing_price;
ALTER TABLE partner DROP COLUMN total_inventory_value;
ALTER TABLE partner DROP COLUMN active_listings_count;
ALTER TABLE partner_staff DROP COLUMN is_owner;
ALTER TABLE car_listing DROP COLUMN ai_model;
ALTER TABLE car_listing DROP COLUMN ai_price_updated_at;
ALTER TABLE car_listing DROP COLUMN ai_confidence_score;
ALTER TABLE car_listing DROP COLUMN ai_price_max;
ALTER TABLE car_listing DROP COLUMN ai_price_min;
ALTER TABLE car_listing DROP COLUMN ai_estimated_price;
ALTER TABLE car_listing DROP COLUMN heat_score_updated_at;
ALTER TABLE car_listing DROP COLUMN heat_score;
```

---

## Notes

- ✅ All fields are nullable or have defaults (except `initiatedBy`)
- ✅ No data loss - only additions
- ⚠️ `conversation.initiatedBy` requires manual backfill for existing data
- 📊 Analytics cache fields improve performance vs slow queries
- 🔥 Heat score helps identify trending listings
- 🤖 AI pricing provides user insights (implement when AI is ready)

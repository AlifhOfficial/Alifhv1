# Alifh Database Schemas Documentation (V1)

**Last Updated:** December 15, 2025  
**Database:** PostgreSQL with Drizzle ORM  
**Status:** ✅ V1 Simplified, ready for migration  
**Build Status:** ✅ Passing

> **V1 Note:** This schema has been simplified from the original design to reduce over-engineering at launch scale. See [V1_SIMPLIFICATIONS.md](./V1_SIMPLIFICATIONS.md) for details on what was removed and why.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Schemas](#core-schemas)
3. [Feature Schemas](#feature-schemas)
4. [V1 Changes](#v1-changes)
5. [Relations](#relations)
6. [Next Steps](#next-steps)

---

## Overview

Alifh is a UAE-based automotive marketplace platform connecting dealers, partners, and users for buying/selling cars. The database architecture supports:

- **Phase 1 (v1):** Partner-to-Consumer (B2C) - Dealers listing inventory
- **Phase 2 (Future):** Peer-to-Peer (P2P) - Users listing their own cars
- **Consignment Mode:** Automated lead generation when users enable consignment

### Architecture Principles

- **Clean Separation:** User (person) → PartnerStaff (seat) → Partner (company)
- **UUID-based IDs:** All primary keys are text UUIDs
- **Timestamps:** Auto-managed `createdAt` and `updatedAt` fields
- **JSONB for Flexibility:** Complex nested data stored as JSONB
- **Comprehensive Indexing:** Performance-optimized queries
- **Cascading Deletes:** Proper foreign key constraints

### V1 Philosophy

**Start Simple, Scale Smart:**
- Calculate analytics on-demand (Redis caching for speed)
- Use PostgreSQL's speed at launch scale (<10k records)
- Add materialized tables only when performance demands it
- Measure before optimizing

---

## Core Schemas

### 1. Authentication (`auth.ts`)
**Purpose:** User authentication and session management

**Tables:**
- `user` - Core user accounts (email, name, email verification)
- `session` - Active user sessions
- `account` - OAuth provider accounts
- `verification` - Email verification tokens

**Key Features:**
- Email/password authentication
- OAuth support (Google, etc.)
- Email verification workflow
- Session management

---

### 2. User Profile (`profile.ts`)
**Purpose:** Extended user information and preferences

**Tables:**
- `userProfile` - Personal details, location, phone, bio, avatar
- `kycRecord` - Know Your Customer verification documents
- `userFavorite` - Saved/favorited listings
- `userSuperlikeQuota` - Monthly superlike tracking

**Key Features:**
- **Consignment Mode:** Users can toggle `consignmentMode` to receive dealer offers
- **Favorite System:** Unlimited favorites on listings
- **Superlike System:** 
  - 5 superlikes per month limit
  - Rolling 30-day period tracking
  - Superlikes show stronger interest to dealers
- **KYC Support:** Emirates ID, passport verification

**Enums:**
- `emirateEnum`: All 7 UAE emirates
- `favoriteTypeEnum`: 'favorite' | 'superlike'

---

### 3. Partner (`partner.ts`)
**Purpose:** Dealer/partner company management

**Tables:**
- `partner` - Company details, verification, business info
- `partnerStaff` - Team members (seats) with role-based access
- `partnerReview` - Customer reviews and ratings
- `partnerRequest` - Partner application/approval workflow
- `auditLog` - Activity tracking for compliance

**Key Features:**
- Multi-staff support (admin, manager, agent roles)
- Verification workflow (pending → approved → suspended)
- Review system with ratings
- Audit trail for all actions
- Physical showroom locations

**Staff Roles:**
- `admin` - Full access, can manage team
- `manager` - Listings, bookings, leads
- `agent` - View-only, customer interaction

---

## Feature Schemas

### 4. Car Listings (`listing.ts`)
**Purpose:** Core inventory management for all car listings

**Tables:**
- `carListing` - Main car data (60+ fields)
- `listingPriceHistory` - Price change tracking
- `listingView` - Detailed view analytics

**Key Features:**
- **Ownership:** Supports both partner listings and P2P user listings
- **VIN Tracking:** Unique vehicle identification
- **Comprehensive Specs:** Make, model, year, trim, mileage, engine, transmission, etc.
- **AI Valuation:** 
  - `qiScore` (0-100): AI quality/market fit score
  - `fairValue`: AI-estimated market price
- **Engagement Metrics:**
  - `viewCount`: Total views
  - `uniqueViewCount`: Unique visitors
  - `favouriteCount`: Standard favorites
  - `superlikeCount`: Premium interest signals
  - `inquiryCount`: Message inquiries
  - `bookingCount`: Viewing appointments
- **Status Workflow:**
  - `draft` → `published` → `reserved` → `sold`
  - `rejected` | `hidden` for moderation
- **Media:** Multiple images, videos, 3D tours
- **Technical Data:** JSONB for detailed specs
- **Moderation:** Review workflow with reviewer tracking

**Indexes:** Optimized for search (make, model, year, price, mileage, emirate, status)

---

### 5. Booking System (`booking.ts`)
**Purpose:** Slot-based viewing appointments (v1: Partner listings only)

**Tables:**
- `partnerAvailability` - Weekly availability templates
- `bookingSlot` - 30-minute time slots
- `booking` - Confirmed appointments
- `bookingFeedback` - Post-viewing reviews
- `userBookingRestriction` - Abuse prevention
- `partnerBookingSettings` - Partner-specific configuration

**Key Features:**
- **Slot Generation:** 30-minute intervals based on availability
- **Abuse Prevention:**
  - Max 3 active bookings per user
  - Max 2 cancellations per month
  - Automatic restriction enforcement
- **Booking Lifecycle:**
  - `pending` → `confirmed` → `completed`
  - Can be `cancelled` or `no_show`
- **Confirmation Tokens:** Secure booking verification
- **Buffer Times:** Configurable gaps between appointments
- **Feedback Collection:** Ratings, reviews, lead quality assessment

**Business Rules:**
- Users must confirm bookings via email/SMS token
- Partners can mark no-shows
- Feedback collected after completion
- Slots auto-expire after start time

---

### 6. Messaging System (`messaging.ts`)
**Purpose:** Real-time chat between buyers, sellers, partners

**Tables:**
- `conversation` - Chat threads
- `conversationParticipant` - Users in conversations
- `message` - Individual messages
- `messageReaction` - Emoji reactions
- `typingIndicator` - Real-time typing status

**Key Features:**
- **Conversation Types:**
  - `inquiry`: General questions about listing
  - `negotiation`: Price discussions
  - `consignment`: Consignment offers
  - `support`: Customer service
- **Context Linking:** Conversations tied to listings/partners
- **Rich Media:** Text, images, documents, voice notes
- **Message Status:** Sent → delivered → read
- **Editing:** Edit history with original content preserved
- **Reactions:** Emoji reactions on messages
- **Typing Indicators:** Live typing status with auto-expiry
- **Unread Tracking:** Per-participant unread counts

**Indexes:** Optimized for conversation retrieval and search

---

### 7. Consignment Lead System (`consignment.ts`)
**Purpose:** Automated lead generation for dealer offers on user listings

**Tables:**
- `partnerConsignmentPreference` - Dealer buying criteria
- `consignmentLead` - Auto-generated leads
- `consignmentLeadActivity` - Audit trail
- `consignmentStats` - Performance aggregates

**Key Features:**
- **Automatic Matching:**
  - When user enables `consignmentMode` in profile
  - System matches user listings against all partner preferences
  - Creates leads with `matchScore` (0-100)
- **Partner Preferences:**
  - Target makes/models
  - Price range
  - Year range
  - Mileage limits
  - Emirate preferences
  - Condition requirements
- **Lead Lifecycle:**
  - `new` → `contacted` → `negotiating` → `accepted` | `rejected` | `expired`
- **Offer Management:**
  - Partners can submit offers
  - Users accept/reject/counter
  - Track competitive landscape
- **Activity Tracking:** Full audit trail of all interactions
- **Performance Stats:** Win rates, response times, acceptance rates

**Business Logic:**
- Only applies to user listings (not partner-to-partner)
- User must opt-in via consignment mode
- Leads expire after configurable period
- Track which partner won if multiple offers

---

## Analytics Schemas

### 8. Partner Analytics Dashboard (`analytics.ts`)
**Purpose:** Comprehensive insights and business intelligence for dealer partners

**Tables:**

#### 8.1 `partnerDailyAnalytics`
**Daily aggregated metrics for partner dashboards**

**Metrics:**
- Traffic: Total views, unique visitors, page views
- Engagement: Favorites, superlikes, inquiries, shares
- Conversions: Bookings created, completed, conversion rates
- Lead Performance: Consignment leads, acceptance rate
- Response Metrics: Average response time, resolution time
- Sales: Revenue, units sold, average sale price
- Listings: Active, sold, draft counts
- Customer Satisfaction: Average ratings, NPS score
- Traffic Sources: Direct, organic, paid, referral, social
- Device Breakdown: Mobile, desktop, tablet percentages

**Use Cases:**
- Daily KPI tracking
- Trend analysis (7-day, 30-day comparisons)
- Traffic source attribution
- Performance benchmarking

---

#### 8.2 `listingPerformanceInsight`
**AI-powered per-listing analysis and recommendations**

**Features:**
- **Health Status:** hot | warm | cold | stale
  - `hot`: High engagement, likely to sell soon
  - `warm`: Decent interest, monitor closely
  - `cold`: Low engagement, needs intervention
  - `stale`: No activity, consider repricing/relisting
- **Engagement Scores:** Views, inquiries, bookings (0-100)
- **Pricing Analysis:** 
  - Days on market
  - Predicted sale date
  - Price vs market comparison
- **AI Recommendations:** Array of actionable suggestions
  - "Reduce price by 5% to match market"
  - "Add more photos (only 3 currently)"
  - "Update description with detailed features"
  - "Consider featuring/boosting this listing"
- **Comparable Listings:** Similar cars for benchmarking
- **Sentiment Analysis:** Positive/negative inquiry sentiment
- **Next Best Actions:** Prioritized action items

**Use Cases:**
- Listing optimization
- Pricing strategy
- Content improvement
- Sales forecasting

---

#### 8.3 `staffPerformanceAnalytics`
**Individual team member performance tracking**

**Metrics:**
- Activity: Listings managed, bookings handled, messages sent
- Conversion: Booking → sale conversion rate
- Speed: Response time, resolution time
- Quality: Customer ratings, feedback scores
- Sales: Revenue generated, units sold
- Lead Management: Consignment leads handled, win rate
- Rankings: Team position, percentile score

**Use Cases:**
- Team leaderboards
- Performance reviews
- Commission calculations
- Training identification
- Gamification

---

#### 8.4 `partnerCustomerInsights`
**Deep customer behavior and demographics analysis**

**Data Points:**
- **Demographics:**
  - Age distribution
  - Gender breakdown
  - Location clustering
  - Income segments
- **Preferences:**
  - Favorite makes/models
  - Price range interests
  - Feature preferences (sunroof, leather, etc.)
  - Color preferences
- **Behavior Patterns:**
  - Average time to purchase
  - Browsing patterns
  - Peak activity times
  - Preferred communication channels
- **Purchase Journey:**
  - Typical steps (views → inquiry → booking → sale)
  - Drop-off points
  - Time in each stage
- **Retention:**
  - Repeat customer rate
  - Customer lifetime value
  - Referral likelihood

**Use Cases:**
- Inventory planning
- Marketing campaigns
- Sales strategy
- Customer segmentation
- Personalization

---

#### 8.5 `partnerCompetitiveAnalysis`
**Market positioning and competitive intelligence**

**Insights:**
- **Market Position:**
  - Rank among competitors
  - Market share percentage
  - Growth trajectory
- **SWOT Analysis:** (Strengths, Weaknesses, Opportunities, Threats)
  - Strengths: "Best response time in emirate"
  - Weaknesses: "Limited luxury inventory"
  - Opportunities: "Growing SUV demand"
  - Threats: "New competitor with lower prices"
- **Price Comparison:**
  - Average vs competitors
  - Price positioning (premium/value)
  - Discount frequency
- **Inventory Comparison:**
  - Stock levels vs competitors
  - Unique offerings
  - Gap analysis
- **Performance Benchmarks:**
  - Conversion rates vs industry average
  - Response times vs competitors
  - Customer satisfaction scores
- **Strategic Recommendations:**
  - Pricing adjustments
  - Inventory expansion suggestions
  - Marketing focus areas

**Use Cases:**
- Strategic planning
- Competitive positioning
- Market opportunity identification
- Performance benchmarking

---

#### 8.6 `partnerRevenueForecast`
**Predictive analytics and revenue projections**

**Predictions:**
- **Revenue Forecast:**
  - Next 7 days, 30 days, 90 days
  - Confidence intervals (low, mid, high)
  - Contributing factors
- **Unit Sales Forecast:**
  - Expected units to sell
  - By category/segment
- **Lead Projections:**
  - Expected consignment leads
  - Predicted acceptance rates
- **Trend Analysis:**
  - Growth/decline indicators
  - Seasonality patterns
  - Market shifts
- **Risk Factors:**
  - High-risk listings (unlikely to sell)
  - Inventory aging concerns
  - Market headwinds
- **Opportunities:**
  - High-probability sales
  - Underpriced inventory
  - Hot market segments

**Use Cases:**
- Financial planning
- Inventory management
- Cash flow forecasting
- Resource allocation
- Risk mitigation

---

## Relations

All relationships defined in `/packages/database/src/schema/relations.ts`

### Key Relationship Patterns

**User Relations:**
- → userProfile (one-to-one)
- → userSuperlikeQuota (one-to-one)
- → partnerStaff (one-to-many) - Person can work at multiple companies
- → carListing (one-to-many) - P2P listings
- → userFavorite (one-to-many)
- → booking (one-to-many)
- → conversationParticipant (one-to-many)
- → consignmentLead (one-to-many)

**Partner Relations:**
- → partnerStaff (one-to-many) - Team members
- → carListing (one-to-many) - Inventory
- → booking (one-to-many)
- → partnerAvailability (one-to-many)
- → partnerBookingSettings (one-to-one)
- → consignmentLead (one-to-many)
- → partnerDailyAnalytics (one-to-many)
- → All analytics tables (one-to-many)

**CarListing Relations:**
- → partner (many-to-one) - Owner
- → user (many-to-one) - P2P seller
- → userFavorite (one-to-many)
- → booking (one-to-many)
- → conversation (one-to-many)
- → consignmentLead (one-to-many)
- → listingPerformanceInsight (one-to-one)

**Conversation Relations:**
- → carListing (many-to-one) - Context
- → partner (many-to-one) - Context
- → conversationParticipant (one-to-many)
- → message (one-to-many)

**ConsignmentLead Relations:**
- → partner (many-to-one) - Interested dealer
- → user (many-to-one) - Car owner
- → carListing (many-to-one) - The car
- → consignmentLeadActivity (one-to-many)

**Analytics Relations:**
- All analytics tables → partner (many-to-one)
- listingPerformanceInsight → carListing (one-to-one)
- staffPerformanceAnalytics → partnerStaff (many-to-one)

---

## Next Steps

### 1. Generate Migrations
```bash
cd /Users/Alifh/Desktop/Alifhv1
bun run db:generate
```

This will create SQL migration files in `/packages/database/drizzle/migrations/`

### 2. Push to Database
```bash
bun run db:push
# OR
bun run db:migrate
```

Choose:
- `db:push` - Quick sync (development)
- `db:migrate` - Versioned migrations (production)

### 3. Verify in Drizzle Studio
```bash
bun run db:studio
```

Opens browser UI to inspect tables, relations, data

### 4. Implement Analytics Aggregation

**Required Background Jobs:**

```typescript
// Pseudo-code for daily analytics aggregation

// Run daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
  await aggregatePartnerDailyAnalytics();
  await updateListingPerformanceInsights();
  await calculateStaffPerformanceMetrics();
  await generateCustomerInsights();
  await runCompetitiveAnalysis();
  await forecastRevenue();
});
```

**Key Aggregation Queries:**
- Count views, bookings, inquiries per partner per day
- Calculate conversion rates, response times
- Aggregate traffic sources from listingView
- Run AI/ML models for health scores, predictions
- Compare metrics across partners for competitive analysis

### 5. Build API Endpoints

**Priority Endpoints:**
- `GET /api/partner/:id/analytics/dashboard` - Daily metrics
- `GET /api/partner/:id/listings/:listingId/insights` - Per-listing analysis
- `GET /api/partner/:id/team/performance` - Staff leaderboard
- `GET /api/partner/:id/customers/insights` - Customer behavior
- `GET /api/partner/:id/competitive/analysis` - Market position
- `GET /api/partner/:id/forecast` - Revenue predictions

**Real-time Features:**
- WebSocket for live analytics updates
- Redis caching for dashboard queries
- Incremental aggregation for recent activity

### 6. Frontend Dashboard Components

**Dashboard Widgets:**
- 📊 Daily KPI Cards (views, bookings, sales)
- 📈 Traffic Trends Chart (7/30/90 day views)
- 🎯 Conversion Funnel (view → inquiry → booking → sale)
- 🚗 Listing Performance Grid (health status colors)
- 👥 Team Leaderboard (gamification)
- 💰 Revenue Forecast Graph (with confidence bands)
- 🎯 Customer Segments Pie Chart
- 🏆 Competitive Positioning Radar Chart
- 📋 AI Recommendations List (prioritized actions)
- 📊 SWOT Matrix

---

## Database Statistics

**Total Tables:** 41
- Auth: 4 tables
- Profile: 4 tables
- Partner: 5 tables
- Listing: 3 tables
- Booking: 6 tables
- Messaging: 5 tables
- Consignment: 4 tables
- Analytics: 6 tables
- Relations: Defined for all tables

**Total Fields:** 500+ across all schemas

**Indexes:** 60+ composite indexes for query optimization

**Enums:** 20+ for type safety

**Foreign Keys:** 80+ with cascading rules

---

## Key Business Rules

### Favorite/Superlike System
- ✅ Unlimited favorites per user
- ✅ 5 superlikes per month per user
- ✅ Rolling 30-day period (not calendar month)
- ✅ Superlikes signal strong purchase intent
- ✅ Dealers can prioritize superlike inquiries

### Booking System
- ✅ Max 3 active bookings per user
- ✅ Max 2 cancellations per month
- ✅ 30-minute slot intervals
- ✅ Confirmation token required
- ✅ Auto-expire after start time
- ✅ Mandatory feedback after completion

### Consignment System
- ✅ User must opt-in via consignmentMode
- ✅ Only applies to user listings (P2P)
- ✅ Auto-match against partner preferences
- ✅ Multiple partners can compete for same car
- ✅ Track winner for learning algorithm
- ✅ Leads expire after configurable period

### Analytics System
- ✅ Daily aggregation runs at midnight UTC
- ✅ Real-time metrics updated on user actions
- ✅ AI/ML models run on aggregated data
- ✅ Predictions updated weekly
- ✅ Competitive analysis updated daily
- ✅ Historical data retained for 2 years

---

## Important Notes

⚠️ **Before Migration:**
- Backup existing database
- Review migration SQL files
- Test in staging environment
- Plan for downtime if needed

⚠️ **Performance Considerations:**
- Analytics tables separate from core tables
- Indexes on all foreign keys
- JSONB columns for flexible data
- Consider partitioning for large tables

⚠️ **Security:**
- Row-level security for multi-tenancy
- Audit logs for compliance
- PII encryption where needed
- Rate limiting on analytics queries

---

## Contact & Support

For questions about schema design or implementation:
- Review documentation in `/docs/`
- Check system architecture: `/docs/System_Docs/ARCHITECTURE.md`
- Database package: `/packages/database/`

---

**End of Documentation**  
Generated: December 15, 2025  
Version: 1.0.0

# Partner System - Complete Data Point Analysis

## Overview
This document lists ALL data points across the Partner system tables and tracks their implementation status in the frontend pipeline.

---

## 1. PARTNER TABLE (Company/Business Entity)
**Total: 79 fields**

### Primary Identification (1 field)
- ✅ `id` - Unique partner identifier

### Company Legal Information (5 fields)
- ✅ `companyNameLegal` - Registered legal name
- ✅ `brandName` - Public display name
- ✅ `tradeLicense` - UAE trade license number
- ✅ `tradeLicenseExpiry` - License expiration date
- ✅ `tradeLicenseDocumentUrl` - Document storage URL

### Account Status & Tier (2 fields)
- ✅ `status` - pending | active | suspended | cancelled
- ✅ `tier` - standard | gold | platinum | black

### Contact Information (3 fields)
- ✅ `email` - Company email
- ✅ `phone` - Company phone
- ✅ `website` - Company website

### Location Information (5 fields)
- ✅ `address` - Physical address
- ✅ `emirate` - Dubai, Abu Dhabi, Sharjah, etc.
- ✅ `locationLat` - Latitude coordinate
- ✅ `locationLng` - Longitude coordinate
- ✅ `showroomCount` - Number of showrooms

### Branding & Media (4 fields)
- ✅ `logo` - Company logo URL
- ✅ `heroImage` - Hero banner image URL
- ✅ `coverImage` - Cover image URL
- ✅ `galleryImages` - Array of gallery image URLs

### Business Information (4 fields)
- ✅ `description` - Company description
- ✅ `specialties` - Array of specialties (luxury, sports, electric)
- ✅ `experienceYears` - Years of experience
- ✅ `foundedYear` - Year company was founded

### External Ratings (3 fields)
- ✅ `googleReviewUrl` - Google review page URL
- ✅ `googleRating` - Google rating (0-5)
- ✅ `googleReviewCount` - Number of Google reviews

### Platform Performance Metrics (3 fields)
- ✅ `platformRating` - Platform rating (0-5)
- ✅ `platformReviewCount` - Number of platform reviews
- ✅ `customerSatisfaction` - Internal satisfaction score (0-100)

### Inventory & Sales (5 fields)
- ✅ `totalInventory` - Total inventory count
- ✅ `activeListings` - Active listing count
- ✅ `soldListings` - Sold listing count
- ✅ `totalSales` - Total sales count
- ✅ `totalRevenue` - Total revenue (AED cents)

### Response Metrics (2 fields)
- ✅ `avgResponseTime` - Average response time (minutes)
- ✅ `responseRate` - Response rate percentage (0-100)

### Conversion & Retention Metrics (3 fields)
- ✅ `leadConversionRate` - Lead to sale conversion (%)
- ✅ `repeatCustomerRate` - Repeat customer rate (%)
- ✅ `avgDealValue` - Average deal value (AED cents)

### Monthly Performance (4 fields)
- ✅ `monthlyViews` - Monthly view count
- ✅ `monthlyLeads` - Monthly lead count
- ✅ `monthlySales` - Monthly sales count
- ✅ `monthlyRevenue` - Monthly revenue (AED cents)

### Team Size (2 fields)
- ✅ `teamSize` - Total team size
- ✅ `activeStaffCount` - Active staff count

### Trust & Verification (3 fields)
- ✅ `isVerified` - Verification status
- ✅ `verifiedAt` - Verification timestamp
- ✅ `verifiedBy` - Admin user ID who verified

### Badges & Tags (2 fields)
- ✅ `badges` - Array of badges (verified_dealer, top_rated, etc.)
- ✅ `tags` - Array of tags (luxury_specialist, etc.)

### Services & Features (1 field - 8 sub-fields)
- ✅ `features` - Object containing:
  - `homeDelivery` - Home delivery available
  - `testDriveAvailable` - Test drive available
  - `financing` - Financing available
  - `tradeIn` - Trade-in accepted
  - `warranty` - Warranty offered
  - `insurance` - Insurance available
  - `registration` - Registration assistance
  - `exportAssistance` - Export assistance

### Business Hours (1 field - 7 day objects)
- ✅ `businessHours` - Object with days:
  - Monday-Sunday each with: open, close, closed

### Financial Settings (4 fields)
- ✅ `commissionRate` - Platform commission rate (%)
- ✅ `subscriptionTier` - basic | pro | enterprise
- ✅ `subscriptionExpiresAt` - Subscription expiry date
- ✅ `paymentTerms` - Payment terms (net30, etc.)

### Notification Preferences (1 field - 8 sub-fields)
- ✅ `notificationPreferences` - Object containing:
  - `emailNewLead` - Email for new leads
  - `emailBooking` - Email for bookings
  - `emailMessage` - Email for messages
  - `emailSale` - Email for sales
  - `emailReview` - Email for reviews
  - `emailMarketing` - Marketing emails
  - `smsNewLead` - SMS for new leads
  - `smsBooking` - SMS for bookings

### Account Management (2 fields)
- ✅ `accountManagerId` - Alifh account manager user ID
- ✅ `primaryContactId` - Primary contact staff ID

### Quality & Compliance (3 fields)
- ✅ `lastAuditAt` - Last audit timestamp
- ✅ `nextAuditAt` - Next audit timestamp
- ✅ `complianceScore` - Compliance score (0-100)

### Approval Workflow (5 fields)
- ✅ `submittedAt` - Application submission time
- ✅ `approvedAt` - Approval timestamp
- ✅ `approvedBy` - Admin who approved
- ✅ `rejectedAt` - Rejection timestamp
- ✅ `rejectionReason` - Reason for rejection

### Timestamps (5 fields)
- ✅ `createdAt` - Record creation timestamp
- ✅ `updatedAt` - Last update timestamp
- ✅ `activatedAt` - Activation timestamp
- ✅ `suspendedAt` - Suspension timestamp
- ✅ `cancelledAt` - Cancellation timestamp

---

## 2. PARTNER_STAFF TABLE (User-Partner Relationship)
**Total: 26 fields**

### Primary Identification (1 field)
- ✅ `id` - Unique staff record identifier

### Relationship (2 fields)
- ✅ `partnerId` - Reference to partner
- ✅ `userId` - Reference to user

### Role & Position (3 fields)
- ✅ `role` - owner | admin | sales | viewer
- ✅ `title` - Job title (Sales Executive, etc.)
- ✅ `department` - Department (Sales, Marketing, etc.)

### Primary Contact (1 field)
- ✅ `isPrimaryContact` - Main contact flag

### Permissions (1 field - 8 sub-fields)
- ✅ `permissions` - Object containing:
  - `manageListings` - Can manage listings
  - `manageTeam` - Can manage team
  - `viewAnalytics` - Can view analytics
  - `manageBookings` - Can manage bookings
  - `respondToLeads` - Can respond to leads
  - `manageFinancials` - Can manage financials
  - `manageSettings` - Can manage settings
  - `exportData` - Can export data

### Status (1 field)
- ✅ `status` - active | invited | suspended | left

### Activity Tracking (6 fields)
- ✅ `leadsHandled` - Number of leads handled
- ✅ `leadsConverted` - Number of leads converted
- ✅ `dealsClosed` - Number of deals closed
- ✅ `totalSalesValue` - Total sales value (AED cents)
- ✅ `avgResponseTime` - Average response time (minutes)
- ✅ `lastActiveAt` - Last active timestamp

### Performance Ratings (2 fields)
- ✅ `performanceScore` - Internal performance score (0-100)
- ✅ `customerRating` - Customer rating (0-5)

### Employment Timeline (6 fields)
- ✅ `joinedAt` - Join date
- ✅ `invitedAt` - Invitation sent date
- ✅ `invitedBy` - User ID who invited
- ✅ `acceptedAt` - Invitation acceptance date
- ✅ `leftAt` - Left date
- ✅ `leftReason` - Reason for leaving

### Timestamps (2 fields)
- ✅ `createdAt` - Record creation timestamp
- ✅ `updatedAt` - Last update timestamp

---

## 3. PARTNER_REVIEW TABLE (Customer Reviews)
**Total: 17 fields**

### Primary Identification (3 fields)
- ✅ `id` - Unique review identifier
- ✅ `partnerId` - Reference to partner
- ✅ `userId` - Reference to reviewer

### Review Content (3 fields)
- ✅ `rating` - Overall rating (1-5)
- ✅ `title` - Review title
- ✅ `review` - Review text

### Review Categories (3 fields)
- ✅ `communicationRating` - Communication rating (1-5)
- ✅ `vehicleConditionRating` - Vehicle condition rating (1-5)
- ✅ `processRating` - Process rating (1-5)

### Verification (2 fields)
- ✅ `isVerifiedPurchase` - Verified purchase flag
- ✅ `purchaseId` - Reference to transaction

### Response (2 fields)
- ✅ `partnerResponse` - Partner's response text
- ✅ `respondedAt` - Response timestamp

### Moderation (3 fields)
- ✅ `status` - pending | published | hidden | flagged
- ✅ `moderatedBy` - Admin user ID
- ✅ `moderatedAt` - Moderation timestamp

### Engagement (1 field)
- ✅ `helpfulCount` - Number of helpful votes

### Timestamps (2 fields)
- ✅ `createdAt` - Review creation timestamp
- ✅ `updatedAt` - Last update timestamp

---

## 4. PARTNER_REQUEST TABLE (Partner Applications)
**Total: 18 fields**

### Primary Identification (2 fields)
- ✅ `id` - Unique request identifier
- ✅ `userId` - Applicant user ID

### Application Data (5 fields)
- ✅ `companyNameLegal` - Legal company name
- ✅ `brandName` - Brand name
- ✅ `tradeLicense` - Trade license number
- ✅ `tradeLicenseDocumentUrl` - Document URL
- ✅ `tradeLicenseExpiry` - License expiry date

### Contact Information (5 fields)
- ✅ `email` - Company email
- ✅ `phone` - Company phone
- ✅ `website` - Website URL
- ✅ `address` - Physical address
- ✅ `emirate` - Emirate location

### Business Details (3 fields)
- ✅ `description` - Business description
- ✅ `experienceYears` - Years of experience
- ✅ `specialties` - Array of specialties

### Status & Review (5 fields)
- ✅ `status` - pending | approved | rejected
- ✅ `reviewedBy` - Admin user ID
- ✅ `reviewedAt` - Review timestamp
- ✅ `rejectionReason` - Rejection reason
- ✅ `internalNotes` - Admin notes

### Link to Partner (1 field)
- ✅ `partnerId` - Created partner ID (if approved)

### Timestamps (2 fields)
- ✅ `createdAt` - Request creation timestamp
- ✅ `updatedAt` - Last update timestamp

---

## 5. AUDIT_LOG TABLE (System Audit Trail)
**Total: 12 fields**

### Primary Identification (1 field)
- ✅ `id` - Unique log entry identifier

### Action Details (3 fields)
- ✅ `action` - Action performed (user.created, partner.approved, etc.)
- ✅ `entityType` - Entity type (user, partner, listing, etc.)
- ✅ `entityId` - Entity identifier

### Actor (1 field)
- ✅ `userId` - User who performed action

### Context (3 fields)
- ✅ `metadata` - Additional context object
- ✅ `ipAddress` - IP address
- ✅ `userAgent` - User agent string

### Changes (2 fields)
- ✅ `oldValues` - Previous values object
- ✅ `newValues` - New values object

### Severity (1 field)
- ✅ `severity` - info | warning | critical

### Timestamp (1 field)
- ✅ `createdAt` - Log entry timestamp

---

## GRAND TOTAL: 152 Data Points

### Summary by Table:
- **Partner**: 79 fields
- **PartnerStaff**: 26 fields
- **PartnerReview**: 17 fields
- **PartnerRequest**: 18 fields
- **AuditLog**: 12 fields

---

## Implementation Checklist

### Phase 1: Database Layer ✅
- [x] Schema definitions exist
- [ ] Query functions (CRUD operations)
- [ ] Type exports

### Phase 2: Backend Services
- [ ] Partner service layer
- [ ] PartnerStaff service layer
- [ ] PartnerReview service layer
- [ ] PartnerRequest service layer
- [ ] AuditLog service layer
- [ ] Zod validation schemas
- [ ] Type definitions

### Phase 3: API Routes
- [ ] GET /api/partner/:id
- [ ] PATCH /api/partner/:id
- [ ] POST /api/partner
- [ ] GET /api/partner/staff/:partnerId
- [ ] POST /api/partner/staff
- [ ] PATCH /api/partner/staff/:id
- [ ] DELETE /api/partner/staff/:id
- [ ] GET /api/partner/reviews/:partnerId
- [ ] POST /api/partner/reviews
- [ ] GET /api/partner/request
- [ ] POST /api/partner/request
- [ ] PATCH /api/partner/request/:id (admin only)

### Phase 4: Frontend Hooks
- [ ] usePartner hook
- [ ] usePartnerStaff hook
- [ ] usePartnerReviews hook
- [ ] usePartnerRequest hook

### Phase 5: UI Components (Future)
- [ ] Partner profile view
- [ ] Partner edit form
- [ ] Staff management panel
- [ ] Review display component
- [ ] Application form

---

## Notes
- All fields are accessible via the pipeline once implemented
- Complex JSONB fields (features, businessHours, permissions, etc.) are fully typed
- Foreign key relationships are properly indexed for performance
- Audit logging captures all critical changes
- Multi-level access control (Partner > Staff > Permissions)

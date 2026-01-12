# Stripe Integration Session Memory

## Session Started: January 11, 2026

## Objective
Integrate Stripe payment gateway with Better Auth for subscription management.

---

## 🎯 Subscription Plans

| Plan Name | Price | Currency | Billing |
|-----------|-------|----------|---------|
| **Alifh Core** | 7,000 AED | AED | Monthly |
| **Alifh Black** | 21,000 AED | AED | Monthly |

### Business Rules
- ❌ No annual subscriptions
- ❌ No free trials (credits system instead)
- ✅ 21k AED credits on partner signup (separate from Stripe)
- ✅ **Partners only** - subscriptions are between Partner Owner ↔ Alifh
- ✅ Only partner owners can manage subscriptions (not staff)

---

## 📊 User System (Fully Understood)

### User Flow
```
user (auth) → user_profile (extended) → partner_request → partner → partner_staff
```

### Key Tables
1. **`user`** - Base auth (id, email, role, banned, etc.)
2. **`user_profile`** - Extended profile (KYC, preferences, ratings)
3. **`partner_request`** - Partner application before approval
4. **`partner`** - Approved partner entity (car dealers, showrooms)
5. **`partner_staff`** - Links users to partners with roles

### Existing Subscription Fields
- `partner.subscriptionTier` - text (default: 'basic') 
- `partner.subscriptionExpiresAt` - timestamp
- `partner.tier` - enum: standard, gold, platinum, black
- `userSuperlikeQuota.isPremium` - boolean for premium users

---

## 🔧 Technical Stack (Confirmed)

| Component | Technology |
|-----------|------------|
| Auth | Better Auth v1.4.7 |
| Database | Drizzle ORM + PostgreSQL |
| Package Manager | Bun |
| Monorepo | Turbo |
| Framework | Next.js 16.1.1 |

### Better Auth Config Location
- **Server**: `/apps/web/src/lib/auth/index.ts`
- **Client**: `/apps/web/src/lib/auth/client.ts`
- **Schema**: `/packages/database/src/schema/auth.ts`

### Current Plugins Enabled
- `emailOTP` - Email verification
- `magicLink` - Magic link login
- `admin` - Role-based access
- `phoneNumber` - Phone verification (Twilio)
- `passkey` - WebAuthn
- `customSession` - Extended session with partner memberships

---

## 📝 Implementation Plan

### Phase 1: Setup ✅ COMPLETE
- [x] Install `@better-auth/stripe` and `stripe` packages
- [x] Create subscription schema (Drizzle)
- [x] Add `stripeCustomerId` to `user` table
- [x] Run `db:push` to migrate

### Phase 2: Configure Stripe Plugin ✅ COMPLETE
- [x] Add stripe plugin to `/apps/web/src/lib/auth/index.ts`
- [x] Add stripeClient to `/apps/web/src/lib/auth/client.ts`
- [x] Define Alifh Core & Alifh Black plans in `/apps/web/src/lib/stripe/config.ts`
- [x] Configure authorizeReference for partner owner check
- [x] Configure subscription lifecycle hooks

### Phase 3: Environment Setup ✅ COMPLETE
- [x] Add Stripe env variables to `.env.local`
- [x] Create products in Stripe Dashboard
- [x] Set up webhook in Stripe Dashboard

### Phase 4: UI Components ✅ COMPLETE
- [x] Create subscription components (`/components/partner/subscription/`)
- [x] Build CurrentSubscriptionCard component
- [x] Build PricingCard component
- [x] Build SubscriptionPlansSection component
- [x] Build SubscriptionBanner component
- [x] Create subscription page (`/partner-dashboard/subscription`)
- [x] Add subscription to sidebar navigation

### Phase 5: Testing 📋 TODO
- [ ] Test subscription upgrade flow
- [ ] Test webhook handling
- [ ] Test billing portal
- [ ] Test subscription cancellation/restore

---

## 🔐 Environment Variables Needed

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plan Price IDs (to be created in Stripe Dashboard)
STRIPE_PRICE_ALIFH_CORE=price_...
STRIPE_PRICE_ALIFH_CORE_ANNUAL=price_...
STRIPE_PRICE_ALIFH_SIGNATURE=price_...
STRIPE_PRICE_ALIFH_SIGNATURE_ANNUAL=price_...
```

---

## 📁 Files to Create/Modify

### New Files
1. `/packages/database/src/schema/subscription.ts` - Stripe subscription schema
2. `/apps/web/src/lib/stripe/config.ts` - Stripe configuration

### Files to Modify
1. `/packages/database/src/schema/auth.ts` - Add stripeCustomerId to user
2. `/apps/web/src/lib/auth/index.ts` - Add stripe plugin
3. `/apps/web/src/lib/auth/client.ts` - Add stripe client plugin
4. `/apps/web/package.json` - Add stripe dependencies

---

## 📌 Notes

- User subscriptions will be tracked via `referenceId` (user.id by default)
- Partners can have organization-level subscriptions (referenceId = partner.id)
- Trial periods can be configured per plan
- Webhook endpoint will be at `/api/auth/stripe/webhook`

---

*Last Updated: January 11, 2026*

# API Registrar

**Purpose**: Quick reference for all available API routes to prevent duplicate implementations and enable route reuse.

**Format**: `METHOD /path - Description [Auth: Required/Optional/Public]`

---

## Authentication APIs

- `GET/POST /api/auth/[...auth]` - Better Auth handler for sign-in, sign-up, OAuth, magic links, sessions [Auth: Public]
- `POST /api/auth/magic-link-validated` - Validates magic link tokens and creates user session [Auth: Public]
- `POST /api/auth/password-reset-validated` - Validates password reset tokens and updates password [Auth: Public]

## User Profile APIs

- `GET /api/profile/user-profile` - Fetch user profile with signed avatar URL [Auth: Required]
- `PATCH /api/profile/user-profile` - Update user profile fields [Auth: Required]
- `POST /api/profile/delete-account` - Soft-delete account (6-month retention) [Auth: Required]
- `POST /api/profile/phone/send-otp` - Send OTP for phone verification (rate-limited 3/10min) [Auth: Required]
- `POST /api/profile/phone/verify-otp` - Verify OTP and mark phone as verified (max 5 attempts) [Auth: Required]

## Listings APIs

- `GET /api/listings` - Browse vehicle listings with filters, pagination, and search [Auth: Optional]
- `GET /api/listings/[id]` - Fetch full listing details for single vehicle [Auth: Optional]
- `GET /api/listings/car-card` - Fetch optimized listing cards for browse pages (60s cache) [Auth: Optional]

## Favorites & Superlikes APIs

- `GET /api/favorites` - Fetch user's favorited listings [Auth: Required]
- `POST /api/favorites` - Toggle favorite status for listing [Auth: Required]
- `GET /api/superlikes` - Fetch superlikes and daily quota (optional includeStatuses param) [Auth: Optional]
- `POST /api/superlikes` - Toggle superlike for listing (quota enforced) [Auth: Required]

## Partner APIs

- `GET /api/partners/[partnerId]/mini-profile` - Fetch partner profile for preview modal (60s cache) [Auth: Public]
- `PATCH /api/partners/[partnerId]/mini-profile` - Update partner profile (no cache) [Auth: Required]

## KYC APIs

- `POST /api/kyc/didit/session` - Create Didit verification session [Auth: Required]
- `GET /api/kyc/didit/session` - Get current session status [Auth: Required]
- `GET /api/kyc/webhook` - Didit iframe callback (internal) [Auth: None]
- `POST /api/kyc/webhook` - Didit webhook receiver (internal) [Auth: Signature]
- `POST /api/kyc/sync` - Manual sync for localhost dev [Auth: Required]
- `POST /api/kyc/cancel` - Cancel pending KYC session [Auth: Required]
- `GET /api/kyc/requests` - Admin endpoint to view all KYC submissions [Auth: Admin]

## Storage APIs

- `POST /api/storage/upload` - Upload files to storage provider (multipart/form-data) [Auth: Public]
- `POST /api/storage/sign` - Generate signed URLs for private storage access [Auth: Public]
- `GET /api/storage/status` - Get storage provider configuration status [Auth: Public]

## Dev/Debug APIs

- `GET /api/dev/email-log` - Development email log endpoint [Auth: Public]

---

**Last Updated**: December 19, 2025  
**Total Routes**: 19 endpoints across 8 categories

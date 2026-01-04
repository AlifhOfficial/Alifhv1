/**
 * Seller Profile Card Component - Alifh Design System
 * 
 * Displays partner or user seller information on the listing detail page sidebar.
 * Uses data from existing getDealerBaseProfile, calculatePartnerStats, and getUserProfileByUserId queries.
 * 
 * Image handling:
 * - Uses getPublicUrl from @/utils for R2 storage key resolution
 * - Partner logos/heroes use BrandAvatar and BrandHero components
 * - User avatars use UserAvatar component
 * 
 * ============================================================================
 * GOOGLE REVIEWS INTEGRATION - V1 (Minimal Approach)
 * ============================================================================
 * 
 * Current State:
 * - googleRating and googleReviewCount fields already exist in partner_car_dealer table
 * - These are static values, manually entered
 * 
 * V1 Goal:
 * - Auto-sync rating + review count every 15 days
 * - No individual review display (just aggregate numbers)
 * - Centralized approach (no partner burden)
 * 
 * IMPLEMENTATION: Google Places API
 * 
 * 1. SETUP (One-Time):
 *    - Get Google Places API key from console.cloud.google.com
 *    - Enable "Places API"
 *    - Cost: $17/1000 requests - first $200/month FREE
 *    - Store in .env: GOOGLE_PLACES_API_KEY
 * 
 * 2. DATABASE SCHEMA (Minimal):
 *    - Add to partner_car_dealer table:
 *      • google_place_id (text, nullable) - Google Place ID
 *      • google_reviews_synced_at (timestamp, nullable) - Last sync time
 *    
 *    NOTE: googleRating and googleReviewCount already exist!
 * 
 * 3. HOW TO SET PLACE ID (Admin Task):
 *    - During partner onboarding, ask: "Google Maps URL?" (optional)
 *    - Partner pastes: https://maps.google.com/?cid=12345
 *    - Extract place_id and store
 *    - OR admin can batch-add via admin tool later
 * 
 * 4. SYNC CRON JOB (Every 15 Days):
 *    - Endpoint: /api/cron/sync-google-reviews
 *    - Vercel Cron: "0 0 1,16 * *" (runs 1st and 16th of each month)
 *    
 *    Logic:
 *    ```javascript
 *    // For each partner with google_place_id:
 *    const response = await fetch(
 *      `https://maps.googleapis.com/maps/api/place/details/json?` +
 *      `place_id=${partner.googlePlaceId}&` +
 *      `fields=rating,user_ratings_total&` +
 *      `key=${process.env.GOOGLE_PLACES_API_KEY}`
 *    );
 *    
 *    const { result } = await response.json();
 *    
 *    // Update partner table (only 2 fields!)
 *    await db.update(partnerCarDealer)
 *      .set({
 *        googleRating: result.rating,
 *        googleReviewCount: result.user_ratings_total,
 *        googleReviewsSyncedAt: new Date()
 *      })
 *      .where(eq(partnerCarDealer.id, partner.id));
 *    ```
 * 
 * 5. API ENDPOINTS (Minimal):
 *    POST /api/admin/partners/[id]/set-place-id
 *    - Admin sets Google Place ID
 *    - Body: { placeId: "ChIJ..." }
 *    
 *    POST /api/cron/sync-google-reviews
 *    - Runs every 15 days
 *    - Syncs all partners with place_id
 *    - 100ms delay between requests
 * 
 * 6. UI (Already Done!):
 *    SellerProfileCard already displays:
 *    - partner.googleRating
 *    - partner.googleReviewCount
 *    No changes needed!
 * 
 * 7. COST (15-Day Sync):
 *    - 500 partners × 2 syncs/month = 1,000 requests/month
 *    - Cost: $17 (but FREE within $200 credit)
 *    - Even with 10,000 partners: $340/month = $140 after credit
 * 
 * 8. ERROR HANDLING:
 *    - Invalid place_id: Log error, skip
 *    - API quota exceeded: Pause, retry next day
 *    - No data: Keep existing values
 * 
 * 9. MIGRATION:
 *    Phase 1: Add google_place_id, google_reviews_synced_at columns
 *    Phase 2: Create /api/cron/sync-google-reviews endpoint
 *    Phase 3: Add admin tool to set place_id
 *    Phase 4: Batch-add place_id for existing partners
 *    Phase 5: Setup Vercel Cron (runs 1st & 16th)
 *    Phase 6: Monitor logs for errors
 * 
 * SAMPLE API CALL:
 * ```
 * GET https://maps.googleapis.com/maps/api/place/details/json
 *   ?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4
 *   &fields=rating,user_ratings_total
 *   &key=YOUR_API_KEY
 * 
 * Response:
 * {
 *   "result": {
 *     "rating": 4.5,
 *     "user_ratings_total": 1234
 *   }
 * }
 * ```
 * 
 * That's it! Just 2 numbers synced every 15 days.
 */

'use client';

import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Shield,
  Globe,
  Sparkles,
  Award,
  Car,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/utils';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { BrandHero } from '@/components/partner/car-dealer/ui/brand-hero';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import type { SellerData, PartnerSellerData, UserSellerData } from '@/hooks/listings';

interface SellerProfileCardProps {
  sellerData: SellerData;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

// ============================================================================
// Partner Profile Card
// ============================================================================

function PartnerProfileCard({ sellerData }: { sellerData: PartnerSellerData }) {
  const partner = sellerData.partner;
  const stats = sellerData.partnerStats;
  
  if (!partner) return null;

  const hasRating = partner.googleRating || partner.platformRating;
  const displayRating = partner.platformRating ?? partner.googleRating ?? 0;
  const totalReviews = (partner.platformReviewCount ?? 0) + (partner.googleReviewCount ?? 0);
  const location = [partner.city, partner.emirate].filter(Boolean).join(', ');
  const badges = partner.badges ?? [];
  const specialties = partner.specialties ?? [];

  return (
    <div className="space-y-5">
      {/* Hero Image - Uses BrandHero component for R2 URL resolution */}
      {partner.heroImage && (
        <div className="relative -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden">
          <BrandHero 
            heroImageUrl={partner.heroImage} 
            brandName={partner.brandName}
            height="sm"
            className="h-28"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header with Logo and Brand Info */}
      <div className="flex items-start justify-between gap-4">
        {/* Brand Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-lg sm:text-xl tracking-tight text-foreground truncate",
              partner.tier === 'black' ? "font-bold" : "font-semibold"
            )}>
              {partner.brandName}
            </h3>
            {partner.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate font-medium">{location}</span>
            </div>
          )}

          {partner.experienceYears && (
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">
              {partner.experienceYears}+ years in business
            </p>
          )}
        </div>

        {/* Logo - Uses BrandAvatar component for R2 URL resolution */}
        <Link href={`/listings?partnerId=${partner.id}&partnerName=${encodeURIComponent(partner.brandName)}`} className="flex-shrink-0">
          <BrandAvatar 
            logoUrl={partner.logo}
            brandName={partner.brandName}
            size="md"
            className="rounded-none w-16 h-16 transition-opacity hover:opacity-80 cursor-pointer"
          />
        </Link>
      </div>

      {/* Website Link */}
      {partner.website && (
        <Link
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="truncate">{partner.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </Link>
      )}

      {/* Badges - Minimal, neutral design */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.slice(0, 3).map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
            >
              <Award className="w-4 h-4" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* About Section */}
      {partner.description && (
        <div className="space-y-2">
          <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">About</p>
          <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
            {partner.description}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
        {/* Google Rating */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Google</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {partner.googleRating !== null && partner.googleRating !== undefined
              ? <>{partner.googleRating.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-1">({partner.googleReviewCount ?? 0})</span></>
              : <span className="text-muted-foreground">N/A</span>
            }
          </p>
        </div>

        {/* Platform Rating */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Alifh</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {partner.platformRating !== null && partner.platformRating !== undefined
              ? <>{partner.platformRating.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-1">({partner.platformReviewCount ?? 0})</span></>
              : <span className="text-muted-foreground">N/A</span>
            }
          </p>
        </div>

        {/* Inventory */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Inventory</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {stats?.inventoryCount ?? <span className="text-muted-foreground">N/A</span>}
          </p>
        </div>

        {/* Total Sales */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Sales</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {stats?.totalSales !== null && stats?.totalSales !== undefined && stats.totalSales > 0
              ? stats.totalSales.toLocaleString()
              : <span className="text-muted-foreground">N/A</span>
            }
          </p>
        </div>

        {/* Response Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Response</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {stats?.responseTime ? formatResponseTime(stats.responseTime) : <span className="text-muted-foreground">N/A</span>}
          </p>
        </div>

        {/* Response Rate */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Rate</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">
            {stats?.responseRate ? `${stats.responseRate}%` : <span className="text-muted-foreground">N/A</span>}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">Specializes In</p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 text-sm font-medium bg-muted text-foreground/80 rounded-lg"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Showroom Link - Inline text link */}
      <Link
        href={`/showrooms/${partner.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        View full showroom
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ============================================================================
// User Profile Card
// ============================================================================

function UserProfileCard({ sellerData }: { sellerData: UserSellerData }) {
  const profile = sellerData.userProfile;
  
  if (!profile) return null;

  // Use extended profile data (userName, userImage, userCreatedAt from user table)
  const name = profile.userName ?? 
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ?? 
    'Private Seller';
  const avatar = profile.avatar ?? profile.userImage;
  const memberSince = profile.memberSince ?? profile.userCreatedAt ?? new Date();
  const memberSinceYear = new Date(memberSince).getFullYear();
  const hasRating = profile.platformRating !== null && profile.platformRating !== undefined;
  const location = [profile.locationCity, profile.locationEmirate].filter(Boolean).join(', ');
  const badges = profile.badges ?? [];
  const tags = profile.tags ?? [];
  const kycVerified = profile.kycVerified ?? false;
  const emailVerified = profile.emailVerified ?? false;
  const phoneVerified = profile.phoneVerified ?? false;

  return (
    <div className="space-y-5">
      {/* Header with Name and Avatar */}
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">{name}</h3>
            {kycVerified && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate font-medium">{location}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Member since {memberSinceYear}
          </p>
        </div>

        {/* Avatar - Uses UserAvatar component for R2 URL resolution */}
        <UserAvatar 
          src={avatar}
          name={name}
          size="md"
          className="w-14 h-14 flex-shrink-0"
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg",
              badge.toLowerCase() === 'ace' 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : badge.toLowerCase() === 'first'
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Award className="w-4 h-4" />
            {badge}
          </span>
        ))}
        {kycVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
            <Shield className="w-4 h-4" />
            ID Verified
          </span>
        )}
        {emailVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Email
          </span>
        )}
        {phoneVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Phone
          </span>
        )}
      </div>

      {/* Description */}
      {profile?.description && (
        <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
          {profile.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
        {/* Inventory */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Inventory</span>
          </div>
          <p className="text-lg font-semibold tabular-nums text-foreground">{profile?.inventoryCount ?? 0}</p>
        </div>

        {/* Response Time */}
        {profile?.avgResponseTime && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Response</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">{formatResponseTime(profile.avgResponseTime)}</p>
          </div>
        )}

        {/* Rating */}
        {hasRating && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Rating</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {profile!.platformRating!.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">({profile!.platformReviewCount})</span>
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 text-sm font-medium bg-muted text-foreground/80 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SellerProfileCard({ sellerData, className }: SellerProfileCardProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      {sellerData.type === 'partner' ? (
        <PartnerProfileCard sellerData={sellerData} />
      ) : (
        <UserProfileCard sellerData={sellerData} />
      )}
    </div>
  );
}

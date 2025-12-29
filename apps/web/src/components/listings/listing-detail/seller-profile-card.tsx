/**
 * Seller Profile Card Component
 * 
 * Displays partner or user seller information on the listing detail page sidebar.
 * Uses data from existing getDealerBaseProfile, calculatePartnerStats, and getUserProfileByUserId queries.
 * 
 * Image handling:
 * - Uses getPublicUrl from @/utils for R2 storage key resolution
 * - Partner logos/heroes use BrandAvatar and BrandHero components
 * - User avatars use UserAvatar component
 */

'use client';

import Link from 'next/link';
import { 
  BadgeCheck, 
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
  MessageCircle,
  Calendar
} from 'lucide-react';
import { cn } from '@/utils';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { BrandHero } from '@/components/partner/car-dealer/ui/brand-hero';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import type { SellerData, PartnerSellerData, UserSellerData } from './listing-detail-view';

interface SellerProfileCardProps {
  sellerData: SellerData;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
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
        <div className="relative -mx-5 -mt-5 mb-4 rounded-t-2xl overflow-hidden">
          <BrandHero 
            heroImageUrl={partner.heroImage} 
            brandName={partner.brandName}
            height="sm"
            className="h-32"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header with Logo and Brand Info */}
      <div className="flex items-start gap-4">
        {/* Logo - Uses BrandAvatar component for R2 URL resolution */}
        <BrandAvatar 
          logoUrl={partner.logo}
          brandName={partner.brandName}
          size="md"
          className="rounded-xl shadow-sm"
        />

        {/* Brand Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground truncate">{partner.brandName}</h3>
            {partner.isVerified && (
              <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {partner.experienceYears && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {partner.experienceYears}+ years in business
            </p>
          )}
        </div>
      </div>

      {/* Website Link */}
      {partner.website && (
        <Link
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="truncate">{partner.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        </Link>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {partner.tier === 'black' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-black text-white dark:bg-white dark:text-black rounded-full">
            <Sparkles className="w-3 h-3" />
            BLK Member
          </span>
        )}
        {partner.isVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
            <Shield className="w-3 h-3" />
            Alifh Certified
          </span>
        )}
        {badges.slice(0, 2).map((badge, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full"
          >
            <Award className="w-3 h-3" />
            {badge}
          </span>
        ))}
      </div>

      {/* About Section */}
      {partner.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">About</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {partner.description}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
        {/* Rating */}
        {hasRating && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {displayRating.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">({totalReviews})</span>
            </p>
          </div>
        )}

        {/* Experience */}
        {partner.experienceYears && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Experience</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{partner.experienceYears}+ yrs</p>
          </div>
        )}

        {/* Inventory */}
        {stats && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Inventory</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.inventoryCount}</p>
          </div>
        )}

        {/* Total Sales */}
        {stats && stats.totalSales > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Sales</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.totalSales.toLocaleString()}</p>
          </div>
        )}

        {/* Response Time */}
        {stats?.responseTime && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Response Time</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatResponseTime(stats.responseTime)}</p>
          </div>
        )}

        {/* Response Rate */}
        {stats?.responseRate && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Response Rate</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.responseRate}%</p>
          </div>
        )}
      </div>

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border/40">
          <h4 className="text-sm font-semibold text-foreground">Specializes In</h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium bg-muted/60 text-muted-foreground rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Showroom Link */}
      <Link
        href={`/showrooms/${partner.id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
      >
        View Showroom
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
  const userBasic = sellerData.userBasic;
  
  if (!profile && !userBasic) return null;

  // Combine data from profile and user basic info
  const name = userBasic?.name ?? 
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ?? 
    'Private Seller';
  const avatar = profile?.avatar ?? userBasic?.image;
  const memberSince = profile?.memberSince ?? userBasic?.createdAt ?? new Date();
  const memberSinceYear = new Date(memberSince).getFullYear();
  const hasRating = profile?.platformRating !== null && profile?.platformRating !== undefined;
  const location = [profile?.locationCity, profile?.locationEmirate].filter(Boolean).join(', ');
  const badges = profile?.badges ?? [];
  const tags = profile?.tags ?? [];
  const kycVerified = profile?.kycVerified ?? false;
  const emailVerified = profile?.emailVerified ?? userBasic?.emailVerified ?? false;
  const phoneVerified = profile?.phoneVerified ?? userBasic?.phoneVerified ?? false;

  return (
    <div className="space-y-5">
      {/* Header with Name and Avatar */}
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground truncate">{name}</h3>
            {kycVerified && (
              <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-0.5">
            Member since {memberSinceYear}
          </p>
        </div>

        {/* Avatar - Uses UserAvatar component for R2 URL resolution */}
        <UserAvatar 
          src={avatar}
          name={name}
          size="lg"
          className="w-14 h-14"
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full",
              badge.toLowerCase() === 'ace' 
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : badge.toLowerCase() === 'first'
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Award className="w-3 h-3" />
            {badge}
          </span>
        ))}
        {kycVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
            <Shield className="w-3 h-3" />
            ID Verified
          </span>
        )}
        {emailVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
            <BadgeCheck className="w-2.5 h-2.5" />
            Email
          </span>
        )}
        {phoneVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
            <BadgeCheck className="w-2.5 h-2.5" />
            Phone
          </span>
        )}
      </div>

      {/* Description */}
      {profile?.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {profile.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
        {/* Inventory */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Inventory</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{profile?.inventoryCount ?? 0}</p>
        </div>

        {/* Response Time */}
        {profile?.avgResponseTime && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Response Time</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatResponseTime(profile.avgResponseTime)}</p>
          </div>
        )}

        {/* Rating */}
        {hasRating && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {profile!.platformRating!.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">({profile!.platformReviewCount})</span>
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border/40">
          <h4 className="text-sm font-semibold text-foreground">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium bg-muted/60 text-muted-foreground rounded-full"
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
    <div className={cn(
      "p-5 bg-card border border-border/40 rounded-xl overflow-hidden",
      className
    )}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        {sellerData.type === 'partner' ? 'Showroom' : 'Seller'}
      </h4>
      
      {sellerData.type === 'partner' ? (
        <PartnerProfileCard sellerData={sellerData} />
      ) : (
        <UserProfileCard sellerData={sellerData} />
      )}
    </div>
  );
}

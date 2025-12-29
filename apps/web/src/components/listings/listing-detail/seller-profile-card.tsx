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
    <div className="space-y-4">
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
      <div className="flex items-start gap-3">
        {/* Logo - Uses BrandAvatar component for R2 URL resolution */}
        <BrandAvatar 
          logoUrl={partner.logo}
          brandName={partner.brandName}
          size="sm"
          className="rounded-lg flex-shrink-0"
        />

        {/* Brand Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
              {partner.brandName}
            </h3>
            {partner.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/70">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {partner.experienceYears && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
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
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Globe className="w-3 h-3" />
          <span className="truncate">{partner.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </Link>
      )}

      {/* Badges - Minimal, neutral design */}
      <div className="flex flex-wrap gap-1.5">
        {partner.tier === 'black' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-widest bg-black text-white dark:bg-white dark:text-black rounded">
            <Sparkles className="w-2.5 h-2.5" />
            BLK
          </span>
        )}
        {partner.isVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40">
            <Shield className="w-2.5 h-2.5" />
            Certified
          </span>
        )}
        {badges.slice(0, 2).map((badge, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40"
          >
            <Award className="w-2.5 h-2.5" />
            {badge}
          </span>
        ))}
      </div>

      {/* About Section */}
      {partner.description && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">About</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {partner.description}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/40">
        {/* Rating */}
        {hasRating && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-muted-foreground/70">Rating</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">
              {displayRating.toFixed(1)}
              <span className="text-[10px] font-normal text-muted-foreground/70 ml-1">({totalReviews})</span>
            </p>
          </div>
        )}

        {/* Experience */}
        {partner.experienceYears && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Experience</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{partner.experienceYears}+ yrs</p>
          </div>
        )}

        {/* Inventory */}
        {stats && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Car className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Inventory</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{stats.inventoryCount}</p>
          </div>
        )}

        {/* Total Sales */}
        {stats && stats.totalSales > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Sales</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{stats.totalSales.toLocaleString()}</p>
          </div>
        )}

        {/* Response Time */}
        {stats?.responseTime && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Response</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{formatResponseTime(stats.responseTime)}</p>
          </div>
        )}

        {/* Response Rate */}
        {stats?.responseRate && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Rate</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{stats.responseRate}%</p>
          </div>
        )}
      </div>

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">Specializes In</p>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((specialty, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Showroom Link - Secondary button style */}
      <Link
        href={`/showrooms/${partner.id}`}
        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium tracking-tight text-foreground border border-border/40 rounded-full hover:bg-secondary/50 transition-colors"
      >
        View Showroom
        <ExternalLink className="w-3 h-3" />
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
    <div className="space-y-4">
      {/* Header with Name and Avatar */}
      <div className="flex items-start justify-between gap-3">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">{name}</h3>
            {kycVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {location && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/70">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Member since {memberSinceYear}
          </p>
        </div>

        {/* Avatar - Uses UserAvatar component for R2 URL resolution */}
        <UserAvatar 
          src={avatar}
          name={name}
          size="md"
          className="w-12 h-12 flex-shrink-0"
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border border-border/40",
              badge.toLowerCase() === 'ace' 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : badge.toLowerCase() === 'first'
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Award className="w-2.5 h-2.5" />
            {badge}
          </span>
        ))}
        {kycVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40">
            <Shield className="w-2.5 h-2.5" />
            ID Verified
          </span>
        )}
        {emailVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40">
            <BadgeCheck className="w-2.5 h-2.5" />
            Email
          </span>
        )}
        {phoneVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40">
            <BadgeCheck className="w-2.5 h-2.5" />
            Phone
          </span>
        )}
      </div>

      {/* Description */}
      {profile?.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {profile.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/40">
        {/* Inventory */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Car className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground/70">Inventory</span>
          </div>
          <p className="text-sm font-bold tabular-nums text-foreground">{profile?.inventoryCount ?? 0}</p>
        </div>

        {/* Response Time */}
        {profile?.avgResponseTime && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground/70">Response</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">{formatResponseTime(profile.avgResponseTime)}</p>
          </div>
        )}

        {/* Rating */}
        {hasRating && (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-muted-foreground/70">Rating</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground">
              {profile!.platformRating!.toFixed(1)}
              <span className="text-[10px] font-normal text-muted-foreground/70 ml-1">({profile!.platformReviewCount})</span>
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded border border-border/40"
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
      "p-4 bg-card border border-border/40 rounded-2xl overflow-hidden",
      className
    )}>
      <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground/70 mb-4">
        {sellerData.type === 'partner' ? 'Showroom' : 'Seller'}
      </p>
      
      {sellerData.type === 'partner' ? (
        <PartnerProfileCard sellerData={sellerData} />
      ) : (
        <UserProfileCard sellerData={sellerData} />
      )}
    </div>
  );
}

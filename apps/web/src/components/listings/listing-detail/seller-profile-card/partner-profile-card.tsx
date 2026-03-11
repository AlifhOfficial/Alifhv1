'use client';

import Link from 'next/link';
import { 
  CheckCircle2, 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Award,
  Package,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { BrandHero } from '@/components/partner/car-dealer/ui/brand-hero';
import { useSellerStats } from '@/hooks/listings';
import type { PartnerSellerData } from '@/hooks/listings';
import { formatResponseTime } from './utils';

interface PartnerProfileCardProps {
  sellerData: PartnerSellerData;
}

export function PartnerProfileCard({ sellerData }: PartnerProfileCardProps) {
  const partner = sellerData.partner;
  const staffContact = sellerData.staffContact;
  
  const { stats, isLoading: statsLoading } = useSellerStats('partner', sellerData.partnerId, sellerData.partnerStats);
  
  if (!partner) return null;

  const isBlackTier = partner.tier === 'black';
  const location = [partner.city, partner.emirate].filter(Boolean).join(', ');
  const badges = partner.badges ?? [];
  const specialties = partner.specialties ?? [];

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <PartnerHeroSection heroImage={partner.heroImage} brandName={partner.brandName} />

      {/* Header with Logo and Brand Info */}
      <PartnerHeader 
        partner={partner} 
        isBlackTier={isBlackTier} 
        location={location} 
      />

      {/* Website & Showroom Links */}
      <PartnerLinks partner={partner} isBlackTier={isBlackTier} />

      {/* Badges */}
      <PartnerBadges badges={badges} />

      {/* About Section */}
      {partner.description && (
        <div className="space-y-2">
          <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">About</p>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
            {partner.description}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <PartnerStatsGrid 
        partner={partner} 
        stats={stats} 
        statsLoading={statsLoading} 
      />

      {/* Specialties */}
      <PartnerSpecialties specialties={specialties} />
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function PartnerHeroSection({ heroImage, brandName }: { heroImage?: string | null; brandName: string }) {
  if (!heroImage) return null;
  
  return (
    <div className="relative -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden">
      <BrandHero 
        heroImageUrl={heroImage} 
        brandName={brandName}
        height="sm"
        className="h-28"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

interface PartnerHeaderProps {
  partner: NonNullable<PartnerSellerData['partner']>;
  isBlackTier: boolean;
  location: string;
}

function PartnerHeader({ partner, isBlackTier, location }: PartnerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {/* Brand Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-lg sm:text-xl tracking-tight text-foreground truncate font-bold"
          )}>
            {partner.brandName}
          </h3>
          {isBlackTier ? (
            <span className="flex-shrink-0 px-1.5 h-5 inline-flex items-center text-[9px] font-black tracking-widest uppercase bg-black text-white">
              BLK
            </span>
          ) : partner.isVerified && (
            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
          )}
        </div>
        
        {location && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate font-semibold">{location}</span>
          </div>
        )}

        {partner.experienceYears && (
          <p className="text-sm text-muted-foreground mt-1.5 font-semibold">
            {partner.experienceYears}+ years in business
          </p>
        )}
      </div>

      {/* Logo */}
      <BrandAvatar 
        logoUrl={partner.logo}
        brandName={partner.brandName}
        size="md"
        className="rounded-none w-16 h-16 flex-shrink-0"
      />
    </div>
  );
}

interface PartnerLinksProps {
  partner: NonNullable<PartnerSellerData['partner']>;
  isBlackTier: boolean;
}

function PartnerLinks({ partner, isBlackTier }: PartnerLinksProps) {
  if (!partner.website && !(isBlackTier && partner.id)) return null;

  return (
    <div className="flex items-center gap-4">
      {partner.website && (
        <Link
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <span className="truncate">{partner.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </Link>
      )}
      {isBlackTier && partner.id && (
        <Link
          href={`/showroom/${partner.id}`}
          prefetch={false}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Visit Showroom</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
        </Link>
      )}
    </div>
  );
}

function PartnerBadges({ badges }: { badges: string[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.slice(0, 3).map((badge, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <Award className="w-4 h-4 text-amber-500" />
          {badge}
        </span>
      ))}
    </div>
  );
}

interface PartnerStatsGridProps {
  partner: NonNullable<PartnerSellerData['partner']>;
  stats: ReturnType<typeof useSellerStats>['stats'];
  statsLoading: boolean;
}

function PartnerStatsGrid({ partner, stats, statsLoading }: PartnerStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {/* Google Rating */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-muted-foreground/70">Google</span>
        </div>
        <p className="text-lg font-bold tabular-nums text-foreground">
          {partner.googleRating !== null && partner.googleRating !== undefined
            ? <>{partner.googleRating.toFixed(1)}<span className="text-sm font-medium text-muted-foreground ml-1">({partner.googleReviewCount ?? 0})</span></>
            : <span className="text-muted-foreground">N/A</span>
          }
        </p>
      </div>

      {/* Inventory - Clickable */}
      <Link 
        href={`/listings?partnerId=${partner.id}&partnerName=${encodeURIComponent(partner.brandName)}`}
        className="space-y-1 group"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground/70">Inventory</span>
        </div>
        {statsLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : stats && 'inventoryCount' in stats ? (
          <>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {stats.inventoryCount}
            </p>
            <span className="text-xs font-semibold text-primary group-hover:underline">View all →</span>
          </>
        ) : (
          <p className="text-lg font-bold text-muted-foreground">N/A</p>
        )}
      </Link>

      {/* Response Time */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground/70">Response</span>
        </div>
        <p className="text-lg font-bold tabular-nums text-foreground">
          {statsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : stats?.responseTime ? (
            formatResponseTime(stats.responseTime)
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </p>
      </div>

      {/* Response Rate */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground/70">Rate</span>
        </div>
        <p className="text-lg font-bold tabular-nums text-foreground">
          {statsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : stats?.responseRate ? (
            `${stats.responseRate}%`
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </p>
      </div>
    </div>
  );
}

function PartnerSpecialties({ specialties }: { specialties: string[] }) {
  if (specialties.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[13px] uppercase tracking-wider font-bold text-muted-foreground/70">Specializes In</p>
      <div className="flex flex-wrap gap-2">
        {specialties.map((specialty, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 text-sm font-semibold bg-muted text-foreground/80 rounded-lg"
          >
            {specialty}
          </span>
        ))}
      </div>
    </div>
  );
}

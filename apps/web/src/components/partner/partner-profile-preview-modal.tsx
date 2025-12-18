/**
 * Partner Profile Preview Modal - Alifh Design System
 * Displays detailed partner information in a modal
 * Following minimalist "Less is More" design principles
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  ExternalLink, 
  MapPin, 
  Star,
  Clock,
  Car,
  TrendingUp,
  CheckCircle2,
  Users,
  BarChart3,
  Award
} from 'lucide-react';
import { usePartnerMiniProfile } from '@/hooks/partner/use-partner-mini-profile';
import { BrandAvatar } from './ui/brand-avatar';
import { BrandHero } from './ui/brand-hero';

interface PartnerProfilePreviewModalProps {
  partnerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerProfilePreviewModal({
  partnerId,
  isOpen,
  onClose,
}: PartnerProfilePreviewModalProps) {
  const { data: partner, isLoading } = usePartnerMiniProfile(partnerId);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Format response time (convert minutes to readable format)
  const formatResponseTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `< ${Math.ceil(minutes / 15) * 15} minutes`;
    if (minutes < 1440) return `< ${Math.ceil(minutes / 60)} hour${minutes >= 120 ? 's' : ''}`;
    return '< 1 day';
  };

  // Format experience
  const formatExperience = (years: number | null) => {
    if (!years) return 'N/A';
    return `${years}+ year${years > 1 ? 's' : ''}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : partner ? (
          <div className="flex h-full max-h-[85vh]">
            {/* Left Side - Car Listing (70%) - Ghost State */}
            <div className="flex-[0.7] bg-background p-6">
              {/* Car Gallery - Ghost */}
              <div className="mb-4">
                <div className="relative aspect-[16/10] bg-muted/30 rounded-lg overflow-hidden mb-2 border border-border/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-foreground/80 backdrop-blur-sm rounded text-background text-xs font-medium">
                    1/4
                  </div>
                </div>
                
                {/* Thumbnails - Ghost */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-muted/30 rounded flex items-center justify-center border border-border/40">
                      <Car className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Car Details - Ghost */}
              <div className="space-y-3">
                {/* Title - Ghost */}
                <div className="space-y-1.5">
                  <div className="h-7 w-3/4 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted/30 rounded animate-pulse" />
                </div>

                {/* Price - Ghost */}
                <div className="flex items-baseline gap-2">
                  <div className="h-9 w-36 bg-muted/30 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-muted/30 rounded animate-pulse" />
                </div>

                {/* Description - Ghost */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-muted/30 rounded animate-pulse" />
                </div>

                {/* VIN - Ghost */}
                <div className="pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">VIN</span>
                    <div className="h-3 w-40 bg-muted/30 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Partner Profile (30%) */}
            <div className="flex-[0.3] bg-background border-l border-border/40 p-6">
              {/* Hero Image */}
              <BrandHero
                heroImageUrl={partner.heroImage}
                brandName={partner.brandName}
                height="sm"
                className="rounded-lg mb-4"
              />

            {/* Content */}
            <div>
              {/* Header */}
              <div className="mb-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-base font-semibold tracking-tight truncate">
                        {partner.brandName}
                      </h2>
                      {partner.isVerified && (
                        <div className="w-3.5 h-3.5 text-green-500 flex-shrink-0" title="Verified Partner">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Experience */}
                    {partner.experienceYears ? (
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatExperience(partner.experienceYears)} in business
                      </p>
                    ) : null}
                    {/* Location */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {partner.city && partner.emirate ? `${partner.city}, ${partner.emirate}` : 'Dubai, UAE'}
                    </p>
                    {/* Website Link */}
                    {partner.website && (
                      <Link
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </Link>
                    )}
                  </div>
                  <BrandAvatar
                    logoUrl={partner.logo}
                    brandName={partner.brandName}
                    size="sm"
                  />
                </div>

                {/* Badges in Header */}
                {partner.badges && partner.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {partner.badges.map((badge) => (
                      <div
                        key={badge}
                        className="px-2 py-1 bg-foreground text-background text-xs font-medium"
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BLK Member Badge */}
              {partner.tier === 'black' && (
                <div className="mb-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-foreground text-background">
                    <Award className="h-3 w-3" />
                    <span className="text-xs font-semibold">BLK Member</span>
                  </div>
                </div>
              )}

              {/* About */}
              {partner.description && (
                <div className="mb-3 pb-3 border-b border-border/40">
                  <h3 className="text-xs font-semibold mb-1.5">About</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {partner.description}
                  </p>
                </div>
              )}

              {/* Stats List */}
              <div className="space-y-2">
                {/* Rating */}
                {partner.platformRating && (
                  <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <span className="text-xs text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">
                        {partner.platformRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({partner.platformReviewCount})
                      </span>
                    </div>
                  </div>
                )}

                {/* Inventory */}
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Inventory</span>
                  <span className="text-xs font-semibold">
                    {partner.activeListings} cars
                  </span>
                </div>

                {/* Total Sales */}
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Total Sales</span>
                  <span className="text-xs font-semibold">
                    {partner.totalInventory}+ vehicles
                  </span>
                </div>

                {/* Response Time */}
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Response Time</span>
                  <span className="text-xs font-semibold">
                    {formatResponseTime(partner.avgResponseTime)}
                  </span>
                </div>

                {/* Response Rate */}
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Response Rate</span>
                  <span className="text-xs font-semibold">
                    {partner.responseRate ? `${Math.round(partner.responseRate * 100)}%` : 'N/A'}
                  </span>
                </div>

                {/* Customer Satisfaction */}
                {partner.platformRating && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">Customer Satisfaction</span>
                    <span className="text-xs font-semibold">
                      {Math.round((partner.platformRating / 5) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {partner.specialties && partner.specialties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <h3 className="text-xs font-semibold mb-1.5">Specializes in</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {partner.specialties.join(', ')}
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Partner not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

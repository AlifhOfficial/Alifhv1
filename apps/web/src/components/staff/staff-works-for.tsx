/**
 * Staff Works For Component
 * Clean minimal display of dealership information
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Building2, 
  ExternalLink,
  CheckCircle2,
  Star,
  Award,
} from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useAuth } from '@/providers/auth-provider';
import type { ExtendedUser } from '@/types/auth';

interface DealerProfile {
  id: string;
  brandName: string;
  companyNameLegal: string;
  logo: string | null;
  status: string;
  emirate: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  experienceYears: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  isVerified: boolean;
  badges: string[] | null;
}

interface StaffWorksForProps {
  initialProfile?: DealerProfile | null;
}

export function StaffWorksFor({ initialProfile }: StaffWorksForProps) {
  const { session, isLoading: sessionLoading } = useAuth();
  const user = session as unknown as ExtendedUser | null;
  const membership = user?.partnerMemberships?.[0];

  const { data: profile, isLoading: profileLoading, error } = useQuery<DealerProfile>({
    queryKey: ['staff', 'works-for', membership?.partnerId],
    queryFn: async () => {
      if (!membership) throw new Error('No partner membership found');
      const res = await fetch(`/api/partners/${membership.partnerId}/dealer-profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!membership?.partnerId,
    initialData: initialProfile ?? undefined,
    initialDataUpdatedAt: initialProfile ? Date.now() : undefined,
    staleTime: initialProfile ? 60_000 : 0,
  });

  const isLoading = sessionLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/50 rounded-xl shrink-0 animate-pulse" />
          <div className="flex-1 pt-1 sm:pt-2 space-y-2">
            <div className="h-5 sm:h-6 w-40 bg-secondary/50 rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-32 bg-secondary/50 rounded animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 bg-secondary/50 rounded animate-pulse" />
              <div className="h-5 w-20 bg-secondary/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
        {/* Cards Skeleton */}
        <div className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
        <div className="h-40 bg-secondary/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mb-4" />
          <h3 className="text-sm font-medium mb-1">Unable to Load Dealership</h3>
          <p className="text-xs text-muted-foreground">
            {error ? String(error) : 'No dealership data available'}
          </p>
        </div>
      </div>
    );
  }

  const location = [profile.city, profile.emirate].filter(Boolean).join(', ');
  const tier = membership?.partnerTier;
  const isBlackTier = tier === 'black';
  const badges = profile.badges ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* Header - Avatar + Brand Info */}
      <div className="flex items-start gap-3 sm:gap-5">
        <BrandAvatar
          logoUrl={profile.logo}
          brandName={profile.brandName}
          size="lg"
          className="w-16 h-16 sm:w-20 sm:h-20 shrink-0"
        />
        <div className="flex-1 min-w-0 pt-1 sm:pt-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">{profile.brandName}</h1>
            {isBlackTier ? (
              <span className="flex-shrink-0 px-1.5 h-5 inline-flex items-center text-[9px] font-black tracking-widest uppercase bg-black text-white">
                BLK
              </span>
            ) : profile.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{profile.companyNameLegal}</p>
          
          {/* Status & Tier badges */}
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-xs text-green-500">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {profile.status}
            </div>
            {tier && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded ${
                isBlackTier 
                  ? 'bg-foreground/10 text-foreground' 
                  : 'bg-blue-500/10 text-blue-500'
              }`}>
                {isBlackTier ? 'Black Tier' : 'Flow Tier'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {badges.map((badge, idx) => (
              <span 
                key={idx} 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-muted/30 text-foreground text-xs sm:text-sm font-semibold border border-border/40 inline-flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Contact Information</h3>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
          <div className="space-y-4">
            {location && (
              <div className="py-2 border-b border-border/20 last:border-0">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Location</p>
                <p className="text-sm font-medium text-foreground">{location}</p>
              </div>
            )}

            {profile.address && (
              <div className="py-2 border-b border-border/20 last:border-0">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Address</p>
                <p className="text-sm font-medium text-foreground">{profile.address}</p>
              </div>
            )}

            {profile.phone && (
              <div className="py-2 border-b border-border/20 last:border-0">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Phone</p>
                <p className="text-sm font-medium text-foreground">{profile.phone}</p>
              </div>
            )}

            {profile.email && (
              <div className="py-2 border-b border-border/20 last:border-0">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{profile.email}</p>
              </div>
            )}

            {profile.website && (
              <div className="py-2 border-b border-border/20 last:border-0">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Website</p>
                <Link 
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
                >
                  {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Business Info */}
      {(profile.experienceYears || profile.googleRating) && (
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Business Info</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
            <div className="space-y-4">
              {profile.experienceYears && (
                <div className="py-2 border-b border-border/20 last:border-0">
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Experience</p>
                  <p className="text-sm font-medium text-foreground">{profile.experienceYears}+ years in business</p>
                </div>
              )}

              {profile.googleRating && (
                <div className="py-2 border-b border-border/20 last:border-0">
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground/70 mb-1">Google Rating</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {profile.googleRating} ({profile.googleReviewCount ?? 0} reviews)
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Public Showroom Link (Black Tier only) */}
      {isBlackTier && (
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Public Presence</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 sm:p-5">
            <Link 
              href={`/showroom/${profile.id}`}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
            >
              View Public Showroom
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-muted-foreground/70 mt-1">See how customers view your dealership</p>
          </div>
        </section>
      )}
    </div>
  );
}

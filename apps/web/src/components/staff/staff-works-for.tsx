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
      <div className="py-8 lg:py-12 space-y-8 lg:space-y-10">
        <div className="flex items-start gap-5 lg:gap-8">
          <div className="w-20 h-20 lg:w-28 lg:h-28 bg-secondary/50 rounded-2xl shrink-0 animate-pulse" />
          <div className="flex-1 pt-2 lg:pt-3 space-y-3">
            <div className="h-7 lg:h-9 w-48 bg-secondary/50 rounded animate-pulse" />
            <div className="h-4 w-36 bg-secondary/50 rounded animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-20 bg-secondary/50 rounded animate-pulse" />
              <div className="h-6 w-24 bg-secondary/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="h-52 bg-secondary/50 rounded-xl animate-pulse" />
          <div className="h-52 bg-secondary/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-8 lg:py-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mb-5" />
          <h3 className="text-callout mb-2">Unable to Load Dealership</h3>
          <p className="text-subhead text-muted-foreground">
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
    <div className="py-8 lg:py-12 space-y-8 lg:space-y-10">

      {/* Header - Avatar + Brand Info */}
      <div className="flex items-start gap-4 lg:gap-6">
        <BrandAvatar
          logoUrl={profile.logo}
          brandName={profile.brandName}
          size="lg"
          className="w-14 h-14 lg:w-18 lg:h-18 shrink-0"
        />
        <div className="flex-1 min-w-0 pt-0.5 lg:pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-headline lg:text-title3 font-semibold tracking-tight truncate">{profile.brandName}</h1>
            {isBlackTier ? (
              <span className="flex-shrink-0 px-1.5 h-5 inline-flex items-center text-[9px] font-black tracking-widest uppercase bg-black text-white rounded-sm">
                BLK
              </span>
            ) : profile.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-caption1 lg:text-subhead text-muted-foreground mt-1 truncate">{profile.companyNameLegal}</p>

          {/* Status & Tier badges */}
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success-muted text-caption1 text-success">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {profile.status}
            </div>
            {tier && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded ${
                isBlackTier
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-primary-muted text-primary'
              }`}>
                {isBlackTier ? 'Black Tier' : 'Flow Tier'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-sidebar p-4">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-muted/30 text-foreground text-caption1 font-semibold border border-border/40 inline-flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-warning" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info Grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* Contact Information */}
        <section>
          <h3 className="text-subhead font-semibold tracking-tight text-foreground mb-3">Contact Information</h3>
          <div className="rounded-xl border border-border/40 bg-sidebar p-4 h-full">
            <div className="space-y-4">
              {location && (
                <div className="pb-4 border-b border-border/20">
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-subhead text-foreground">{location}</p>
                </div>
              )}
              {profile.address && (
                <div className="pb-4 border-b border-border/20">
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-subhead text-foreground">{profile.address}</p>
                </div>
              )}
              {profile.phone && (
                <div className="pb-4 border-b border-border/20">
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-subhead text-foreground">{profile.phone}</p>
                </div>
              )}
              {profile.email && (
                <div className="pb-4 border-b border-border/20">
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-subhead text-foreground">{profile.email}</p>
                </div>
              )}
              {profile.website && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Website</p>
                  <Link
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-subhead text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
                  >
                    {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Business Info + Public Presence */}
        <div className="flex flex-col gap-6 lg:gap-8">
          {(profile.experienceYears || profile.googleRating) && (
            <section>
              <h3 className="text-subhead font-semibold tracking-tight text-foreground mb-3">Business Info</h3>
              <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                <div className="space-y-4">
                  {profile.experienceYears && (
                    <div className="pb-4 border-b border-border/20">
                      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Experience</p>
                      <p className="text-subhead text-foreground">{profile.experienceYears}+ years in business</p>
                    </div>
                  )}
                  {profile.googleRating && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1">Google Rating</p>
                      <p className="text-subhead text-foreground flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-warning fill-amber-500" />
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
              <h3 className="text-subhead font-semibold tracking-tight text-foreground mb-3">Public Presence</h3>
              <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                <Link
                  href={`/showroom/${profile.id}`}
                  className="text-subhead text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
                >
                  View Public Showroom
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <p className="text-caption1 text-muted-foreground/70 mt-1.5">See how customers view your dealership</p>
              </div>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}

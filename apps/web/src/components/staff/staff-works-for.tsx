/**
 * Staff Works For Component
 * Displays the partner profile using SellerProfileCard component
 * Reuses existing listing detail seller card for consistency
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { SellerProfileCard } from '@/components/listings/listing-detail/seller-profile-card';
import { useAuth } from '@/providers/auth-provider';
import type { ExtendedUser } from '@/types/auth';
import type { PartnerSellerData } from '@/hooks/listings/use-listing-detail';

export function StaffWorksFor() {
  // Get session from AuthProvider (fetched ONCE, no polling)
  const { session, isLoading: sessionLoading } = useAuth();
  const user = session as unknown as ExtendedUser | null;
  const membership = user?.partnerMemberships?.[0];

  const { data: worksForData, isLoading: profileLoading, error } = useQuery<PartnerSellerData>({
    queryKey: ['staff', 'works-for', membership?.partnerId],
    queryFn: async () => {
      if (!membership) {
        throw new Error('No partner membership found');
      }
      
      // Fetch partner profile only (stats are loaded lazily by SellerProfileCard)
      const profileRes = await fetch(`/api/partners/${membership.partnerId}/dealer-profile`);
      
      if (!profileRes.ok) throw new Error(`Failed to fetch partner profile: ${profileRes.status}`);
      
      const profile = await profileRes.json();
      
      // Transform to PartnerSellerData structure (stats loaded separately by component)
      return {
        type: 'partner' as const,
        partnerId: membership.partnerId,
        partner: {
          id: profile.id,
          companyNameLegal: profile.companyNameLegal,
          brandName: profile.brandName,
          tradeLicense: profile.tradeLicense,
          status: profile.status,
          tier: profile.tier,
          email: profile.email,
          phone: profile.phone,
          website: profile.website,
          address: profile.address,
          emirate: profile.emirate,
          city: profile.city,
          locationLat: profile.locationLat,
          locationLng: profile.locationLng,
          showroomCount: profile.showroomCount ?? 1,
          logo: profile.logo,
          heroImage: profile.heroImage,
          description: profile.description,
          specialties: profile.specialties ?? [],
          experienceYears: profile.experienceYears,
          foundedYear: profile.foundedYear,
          googleReviewUrl: profile.googleReviewUrl,
          googleRating: profile.googleRating,
          googleReviewCount: profile.googleReviewCount ?? 0,
          platformRating: profile.platformRating,
          platformReviewCount: profile.platformReviewCount ?? 0,
          isVerified: profile.isVerified,
          badges: profile.badges ?? [],
          tags: profile.tags ?? [],
        },
        // Stats loaded separately by SellerProfileCard via useSellerStats hook
        partnerStats: null,
      };
    },
    enabled: !!membership?.partnerId,
  });

  const isLoading = sessionLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !worksForData) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="w-10 h-10 mb-4 text-muted-foreground/40" />
            <h3 className="text-base font-medium mb-1">Unable to load dealership</h3>
            <p className="text-sm text-muted-foreground">
              {error ? String(error) : 'No partner data available'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Dealership</h1>
          <p className="text-[15px] font-medium text-muted-foreground/70">
            You work at {worksForData.partner.brandName}
          </p>
        </div>

        {/* Partner Profile */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-4">
          <SellerProfileCard sellerData={worksForData} />
        </div>

      </div>
    </div>
  );
}
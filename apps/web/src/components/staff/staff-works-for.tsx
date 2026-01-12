/**
 * Staff Works For Component
 * Displays the partner profile using SellerProfileCard component
 * Reuses existing listing detail seller card for consistency
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle, Building2 } from 'lucide-react';
import { SellerProfileCard } from '@/components/listings/listing-detail/seller-profile-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import type { ExtendedUser } from '@/types/auth';
import type { PartnerSellerData } from '@/hooks/listings/use-listing-detail';

export function StaffWorksFor() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignReason, setResignReason] = useState('');

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
      
      // Fetch partner profile and stats (same endpoints as listing detail page)
      const [profileRes, statsRes] = await Promise.all([
        fetch(`/api/partners/${membership.partnerId}/dealer-profile`),
        fetch(`/api/partners/${membership.partnerId}/stats`)
      ]);
      
      if (!profileRes.ok) throw new Error(`Failed to fetch partner profile: ${profileRes.status}`);
      
      const profile = await profileRes.json();
      const stats = statsRes.ok ? await statsRes.json() : null;
      
      // Transform to PartnerSellerData structure
      return {
        type: 'partner' as const,
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
        partnerStats: stats ?? {
          inventoryCount: 0,
          totalSales: 0,
          responseRate: null,
          responseTime: null,
        },
      };
    },
    enabled: !!membership?.partnerId,
  });

  const isLoading = sessionLoading || profileLoading;
  const isOwner = membership?.staffRole === 'owner';

  const resignMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const res = await fetch('/api/partner/staff/resign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to resign');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Resigned Successfully',
        description: 'You have left the organization. Redirecting...',
      });
      queryClient.invalidateQueries();
      setTimeout(() => {
        router.push('/user-dashboard');
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Resign',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleResign = () => {
    resignMutation.mutate(resignReason || undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !worksForData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Unable to load partner information</h3>
          <p className="text-sm text-muted-foreground">
            {error ? String(error) : 'No partner data available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dealership</h1>
        <p className="text-sm text-muted-foreground">
          Your workplace at {worksForData.partner.brandName}
        </p>
      </div>

      {/* Partner Profile Card - Reusing existing component */}
      <div className="rounded-xl border border-border/40 bg-sidebar p-6">
        <SellerProfileCard sellerData={worksForData} />
      </div>

      {/* Resign Section - Only for non-owners */}
      {!isOwner && (
        <div className="rounded-xl border border-border/40 bg-sidebar p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-semibold text-foreground">Leave Organization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will remove your access to all partner features. This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResignModal(true)}
            className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            Resign from {worksForData.partner.brandName}
          </button>
        </div>
      )}

      {/* Resign Confirmation Modal */}
      {showResignModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResignModal(false)}
          />
          <div className="relative bg-sidebar rounded-xl border border-border/40 shadow-2xl max-w-md w-full p-6">
            <div className="space-y-5">
              {/* Header with Icon */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Confirm Resignation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">This action cannot be undone</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Content */}
              <div className="space-y-3">
                <p className="text-sm sm:text-[15px] text-foreground leading-relaxed">
                  Are you sure you want to resign from <span className="font-semibold">{worksForData.partner.brandName}</span>?
                </p>
                <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">You will lose access to:</p>
                
                <ul className="space-y-2 pl-1">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                    <span>Partner inventory and listings</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                    <span>Team messaging and collaboration</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                    <span>Customer leads and bookings</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                    <span>All staff-related features</span>
                  </li>
                </ul>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <label className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Reason for leaving <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  value={resignReason}
                  onChange={(e) => setResignReason(e.target.value)}
                  placeholder="Let us know why you're leaving..."
                  className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResignModal(false)}
                  disabled={resignMutation.isPending}
                  className="flex-1 px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResign}
                  disabled={resignMutation.isPending}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resignMutation.isPending ? 'Resigning...' : 'Confirm Resignation'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
/**
 * Staff Works For Component
 * Displays the partner profile information for the staff member
 * Following profile-view minimal design system
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Phone, MapPin, Globe, Star, Users, LogOut, AlertTriangle } from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useToast } from '@/hooks/use-toast';

interface PartnerProfile {
  id: string;
  companyNameLegal: string;
  brandName: string;
  email: string;
  phone: string;
  website?: string | null;
  address?: string | null;
  emirate?: string | null;
  city?: string | null;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier: 'standard' | 'gold' | 'platinum' | 'black';
  logo?: string | null;
  description?: string | null;
  specialties?: string[];
  experienceYears?: number | null;
  foundedYear?: number | null;
  googleRating?: number | null;
  googleReviewCount: number;
  platformRating?: number | null;
  platformReviewCount: number;
  showroomCount: number;
  isVerified: boolean;
  badges?: string[];
  tags?: string[];
}

export function StaffWorksFor() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignReason, setResignReason] = useState('');

  const { data: partnerData, isLoading, error } = useQuery({
    queryKey: ['staff', 'partner-profile'],
    queryFn: async () => {
      const userRes = await fetch('/api/auth/get-session');
      if (!userRes.ok) throw new Error('Failed to get session');
      const userSession = await userRes.json();
      
      if (!userSession.user?.partnerMemberships?.[0]) {
        throw new Error('No partner membership found');
      }
      
      const membership = userSession.user.partnerMemberships[0];
      
      const res = await fetch(`/api/partners/${membership.partnerId}/dealer-profile`);
      if (!res.ok) throw new Error(`Failed to fetch partner profile: ${res.status}`);
      
      const profile = await res.json();
      return {
        ...profile,
        staffRole: membership.staffRole,
        permissions: membership.permissions,
      };
    },
  });

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
      // Invalidate all queries to refresh session data
      queryClient.invalidateQueries();
      // Redirect to user dashboard after short delay
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

  const partner: (PartnerProfile & { staffRole?: string; permissions?: any }) | undefined = partnerData;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-secondary/50 rounded-xl w-48" />
          <div className="h-96 bg-secondary/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center py-24 rounded-xl border border-border">
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
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Works For</h1>
        <p className="text-sm text-muted-foreground">
          Details about the company you work for
        </p>
      </section>

      {/* Partner Overview */}
      <section className="space-y-8">
        <div className="rounded-xl border border-border p-8 space-y-8">
          
          {/* Company Header */}
          <div className="flex items-start gap-6">
            <BrandAvatar
              logoUrl={partner.logo}
              brandName={partner.brandName}
              size="lg"
            />

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold">{partner.brandName}</h2>
                  {partner.isVerified && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{partner.companyNameLegal}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  partner.status === 'active' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {partner.status}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground text-xs font-medium capitalize">
                  {partner.tier}
                </span>
                {partner.staffRole && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium capitalize">
                    {partner.staffRole}
                  </span>
                )}
              </div>

              {partner.description && (
                <p className="text-sm leading-relaxed">{partner.description}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/40">
            {partner.email && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </div>
                <p className="text-sm font-medium">{partner.email}</p>
              </div>
            )}
            
            {partner.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </div>
                <p className="text-sm font-medium">{partner.phone}</p>
              </div>
            )}

            {partner.website && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                </div>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {partner.website}
                </a>
              </div>
            )}

            {(partner.address || partner.city || partner.emirate) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location</span>
                </div>
                <p className="text-sm font-medium">
                  {[partner.address, partner.city, partner.emirate]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Statistics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
          <div className="p-8 text-center">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground mb-1">Showrooms</p>
            <p className="text-xl font-semibold">{partner.showroomCount || 1}</p>
          </div>

          {partner.platformRating && (
            <div className="p-8 text-center">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground mb-1">Platform Rating</p>
              <p className="text-xl font-semibold">{partner.platformRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{partner.platformReviewCount} reviews</p>
            </div>
          )}

          {partner.googleRating && (
            <div className="p-8 text-center">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground mb-1">Google</p>
              <p className="text-xl font-semibold">{partner.googleRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{partner.googleReviewCount} reviews</p>
            </div>
          )}

          {partner.experienceYears && (
            <div className="p-8 text-center">
              <Building2 className="w-5 h-5 text-foreground/50 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground mb-1">Experience</p>
              <p className="text-xl font-semibold">{partner.experienceYears}</p>
              <p className="text-xs text-muted-foreground mt-1">years</p>
            </div>
          )}
        </div>
      </section>

      {/* Badges & Tags */}
      {((partner.badges && partner.badges.length > 0) || 
        (partner.tags && partner.tags.length > 0) || 
        (partner.specialties && partner.specialties.length > 0)) && (
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Specialties & Badges</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {partner.specialties?.map((spec, index) => (
              <span 
                key={`spec-${index}`}
                className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium"
              >
                {spec}
              </span>
            ))}
            {partner.badges?.map((badge, index) => (
              <span 
                key={`badge-${index}`}
                className="px-3 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium"
              >
                {badge.replace(/_/g, ' ')}
              </span>
            ))}
            {partner.tags?.map((tag, index) => (
              <span 
                key={`tag-${index}`}
                className="px-3 py-1 rounded-md bg-foreground/5 text-foreground text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Resign Section */}
      {partner.staffRole !== 'owner' && (
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight text-red-500">Leave Organization</h3>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Resign from {partner.brandName}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will remove your access to all partner features including listings, messaging, and team collaboration. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowResignModal(true)}
                  className="px-5 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium transition-colors"
                >
                  Resign
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Resign Confirmation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResignModal(false)}
          />
          <div className="relative bg-background rounded-xl border border-border p-8 max-w-md w-full mx-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirm Resignation</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to resign from <span className="font-medium">{partner.brandName}</span>? 
                You will lose access to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Partner inventory and listings</li>
                <li>Team messaging and collaboration</li>
                <li>Customer leads and bookings</li>
                <li>All staff-related features</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Reason for leaving (optional)
              </label>
              <textarea
                value={resignReason}
                onChange={(e) => setResignReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-transparent text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResignModal(false)}
                disabled={resignMutation.isPending}
                className="flex-1 px-5 py-2.5 rounded-full border border-border hover:bg-secondary/10 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResign}
                disabled={resignMutation.isPending}
                className="flex-1 px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {resignMutation.isPending ? 'Resigning...' : 'Confirm Resign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

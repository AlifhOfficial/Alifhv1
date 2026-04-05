/**
 * Staff Overview Component
 * Dashboard overview for staff members
 * Following profile-view minimal design system
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  User, 
  Building2, 
  Clock,
  Phone,
  MapPin,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

interface StaffProfile {
  id: string;
  userId: string;
  partnerId: string;
  role: string;
  isOwner: boolean;
  isPrimaryContact: boolean;
  status: string;
  displayName: string | null;
  workPhone: string | null;
  usePersonalPhone: boolean;
  joinedAt: string;
  partner: {
    id: string;
    brandName: string;
    companyNameLegal: string;
    logo: string | null;
    emirate: string | null;
    city: string | null;
  };
}

export function StaffOverview() {
  const { data: staffProfile, isLoading } = useQuery<StaffProfile>({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      const res = await fetch('/api/staff/profile');
      if (!res.ok) throw new Error('Failed to fetch staff profile');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-secondary/50 rounded-xl" />
          <div className="h-64 bg-secondary/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center py-24">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-headline mb-2">No Staff Profile Found</h3>
          <p className="text-subhead text-muted-foreground">
            You are not currently employed at any dealership.
          </p>
        </div>
      </div>
    );
  }

  const hasWorkProfile = staffProfile.displayName || staffProfile.workPhone || staffProfile.usePersonalPhone;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      
      {/* Dealership Info */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Your Dealership</h3>
        </div>

        <div className="rounded-xl border border-border p-8 space-y-6">
          <div className="flex items-start gap-4">
            <BrandAvatar
              logoUrl={staffProfile.partner.logo}
              brandName={staffProfile.partner.brandName}
              size="md"
            />
            <div className="flex-1">
              <h2 className="text-title3 font-semibold mb-1">{staffProfile.partner.brandName}</h2>
              <p className="text-subhead text-muted-foreground mb-3">{staffProfile.partner.companyNameLegal}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-success-muted text-subhead text-success">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {staffProfile.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-2 text-subhead">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{staffProfile.role}</span>
            </div>
            {staffProfile.partner.city && (
              <div className="flex items-center gap-2 text-subhead">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{staffProfile.partner.city}, {staffProfile.partner.emirate}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-subhead">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Joined {new Date(staffProfile.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Work Identity */}
      <section className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Work Identity</h3>
          <Link 
            href="/staff-dashboard/profile"
            className="text-subhead text-primary hover:text-primary transition-colors"
          >
            Edit Profile
          </Link>
        </div>

        {hasWorkProfile ? (
          <div className="space-y-4">
            {staffProfile.displayName && (
              <div className="rounded-xl border border-border p-6 space-y-2">
                <div className="flex items-center gap-2 text-subhead text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>Display Name</span>
                </div>
                <p className="font-medium">{staffProfile.displayName}</p>
              </div>
            )}
            
            {(staffProfile.workPhone || staffProfile.usePersonalPhone) && (
              <div className="rounded-xl border border-border p-6 space-y-2">
                <div className="flex items-center gap-2 text-subhead text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Work Phone</span>
                </div>
                <p className="font-medium">
                  {staffProfile.usePersonalPhone 
                    ? 'Using personal phone' 
                    : staffProfile.workPhone}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-border">
            <User className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-subhead text-muted-foreground mb-6">
              Set up your work identity to interact with clients professionally
            </p>
            <Link 
              href="/staff-dashboard/profile"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-subhead transition-colors"
            >
              Set Up Profile
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-headline tracking-tight">Quick Access</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/staff-dashboard/works-for"
            className="group rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-medium mb-1">Dealership Details</h4>
            <p className="text-subhead text-muted-foreground">View your workplace information</p>
          </Link>

          <Link 
            href="/staff-dashboard/messaging"
            className="group rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-medium mb-1">Messages</h4>
            <p className="text-subhead text-muted-foreground">View customer inquiries</p>
          </Link>

          <Link 
            href="/staff-dashboard/profile"
            className="group rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                <User className="w-5 h-5 text-foreground/50" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-medium mb-1">Work Profile</h4>
            <p className="text-subhead text-muted-foreground">Manage your work identity</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

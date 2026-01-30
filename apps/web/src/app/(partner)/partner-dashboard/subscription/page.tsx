/**
 * Partner Billing & Subscription Management Page
 * 
 * TODO: Stripe integration will be rebuilt cleanly
 */

'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { CreditCard } from 'lucide-react';

export default function PartnerBillingPage() {
  const { session: user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Billing</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Manage your subscription and billing</p>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  // Get partner membership (owner only)
  const partnerMembership = (user as any).partnerMemberships?.find(
    (m: any) => m.staffRole === 'owner'
  );

  if (!partnerMembership) {
    redirect('/access-denied?reason=not-partner-owner');
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Billing</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Manage your subscription, view invoices, and update payment methods</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>
      
      {/* Placeholder - Stripe integration coming soon */}
      <div className="rounded-xl border border-border/40 bg-sidebar p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Billing Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We're working on a seamless billing experience. Your partner account is fully active in the meantime.
        </p>
      </div>
    </div>
  );
}

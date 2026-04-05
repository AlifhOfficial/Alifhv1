/**
 * Partner Billing & Subscription Management Page
 * 
 * Lightweight page that fetches all data from Stripe directly.
 * No heavy DB sync - Stripe is the source of truth.
 * Server-side auth for faster initial load.
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  CreditCard, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Types for API responses
interface SubscriptionData {
  status: string;
  plan: string;
  planDisplayName: string;
  priceAED: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  trialMonths: number | null; // Admin-set trial duration
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  subscription: { id: string; created: string } | null;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  hasStripeCustomer: boolean;
}

interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amount: number;
  amountPaid: number;
  currency: string;
  created: string | null;
  dueDate: string | null;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string;
  periodStart: string | null;
  periodEnd: string | null;
}

interface InvoicesData {
  invoices: Invoice[];
  upcomingInvoice: Invoice | null;
  hasMore: boolean;
}

// Format currency
const formatAED = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
};

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    active: { bg: 'bg-success-muted', text: 'text-success', icon: <CheckCircle2 className="w-3 h-3" /> },
    trialing: { bg: 'bg-primary-muted', text: 'text-primary', icon: <Clock className="w-3 h-3" /> },
    past_due: { bg: 'bg-warning-muted', text: 'text-warning', icon: <AlertCircle className="w-3 h-3" /> },
    canceled: { bg: 'bg-destructive-muted', text: 'text-destructive', icon: <AlertCircle className="w-3 h-3" /> },
    inactive: { bg: 'bg-muted', text: 'text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
    paid: { bg: 'bg-success-muted', text: 'text-success', icon: <CheckCircle2 className="w-3 h-3" /> },
    open: { bg: 'bg-warning-muted', text: 'text-warning', icon: <Clock className="w-3 h-3" /> },
    upcoming: { bg: 'bg-primary-muted', text: 'text-primary', icon: <Calendar className="w-3 h-3" /> },
  };
  
  const { bg, text, icon } = config[status] || config.inactive;
  
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption1', bg, text)}>
      {icon}
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

export default function PartnerBillingPage() {
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'flow' | 'black' | null>(null);

  // Fetch subscription data
  const { 
    data: subscription, 
    isLoading: subLoading,
    refetch: refetchSub,
    isRefetching: subRefetching,
  } = useQuery<{ success: boolean; data: SubscriptionData }>({
    queryKey: ['partner', 'billing', 'subscription'],
    queryFn: async () => {
      const res = await fetch('/api/partner/billing/subscription');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });

  // Fetch invoices
  const { 
    data: invoicesResponse,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
    isRefetching: invoicesRefetching,
  } = useQuery<{ success: boolean; data: InvoicesData }>({
    queryKey: ['partner', 'billing', 'invoices'],
    queryFn: async () => {
      const res = await fetch('/api/partner/billing/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
  });

  // Open Stripe portal mutation
  const openPortalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/partner/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to open billing portal');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });

  // Create checkout session mutation
  const checkoutMutation = useMutation({
    mutationFn: async (plan: 'flow' | 'black') => {
      const res = await fetch('/api/partner/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });

  const handleCheckout = async (plan: 'flow' | 'black') => {
    setCheckoutPlan(plan);
    try {
      await checkoutMutation.mutateAsync(plan);
    } finally {
      setCheckoutPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      await openPortalMutation.mutateAsync();
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefresh = () => {
    refetchSub();
    refetchInvoices();
  };

  const subData = subscription?.data;
  const invoices = invoicesResponse?.data?.invoices || [];
  const upcomingInvoice = invoicesResponse?.data?.upcomingInvoice;
  const isLoading = subLoading || invoicesLoading;
  const isRefreshing = subRefetching || invoicesRefetching;

  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    if (!subData?.trialEnd) return null;
    const trialEnd = new Date(subData.trialEnd);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-callout sm:text-headline font-semibold text-foreground">Billing</h1>
          <p className="text-caption2 sm:text-caption1 text-muted-foreground/60 mt-0.5">
            Manage your subscription, view invoices, and update payment methods
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {/* Subscription Card Skeleton */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-7 w-40" />
            </div>
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28 ml-auto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <Skeleton className="h-10 w-40 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
          
          {/* Invoice Table Skeleton */}
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="divide-y divide-border/30">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && subData && (
        <>
          {/* Subscription Status Card */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-6 space-y-4">
            {/* Plan Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-headline font-semibold text-foreground">{subData.planDisplayName}</h2>
                  <StatusBadge status={subData.status} />
                </div>
                <p className="text-title2 font-bold text-foreground">
                  {subData.priceAED.toLocaleString()} <span className="text-subhead font-normal text-muted-foreground">AED/month</span>
                </p>
              </div>
            </div>
            
            {/* Billing Details */}
            <div className="pt-2">
              {/* Trial billing breakdown */}
              {subData.status === 'trialing' && daysRemaining !== null && (
                <div className="space-y-3">
                  {subData.trialMonths && (
                    <div className="grid grid-cols-2 gap-4 text-subhead">
                      <span className="text-muted-foreground">Agreed trial</span>
                      <span className="font-medium text-foreground text-right">
                        {subData.trialMonths} month{subData.trialMonths > 1 ? 's' : ''} free
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-subhead">
                    <span className="text-muted-foreground">Current charge</span>
                    <span className="font-semibold text-success text-right">0 AED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-subhead">
                    <span className="text-muted-foreground">Founding access ends</span>
                    <span className="font-medium text-foreground text-right">{formatDate(subData.trialEnd)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-subhead">
                    <span className="text-muted-foreground">First charge</span>
                    <span className="font-medium text-foreground text-right">
                      {subData.priceAED.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-caption1 text-primary pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{daysRemaining} days remaining in founding period</span>
                  </div>
                </div>
              )}
              
              {/* Active subscription info */}
              {subData.status === 'active' && subData.currentPeriodEnd && !subData.cancelAtPeriodEnd && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-subhead">
                    <span className="text-muted-foreground">Next billing</span>
                    <span className="font-medium text-foreground text-right">{formatDate(subData.currentPeriodEnd)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-subhead">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground text-right">{subData.priceAED.toLocaleString()} AED</span>
                  </div>
                </div>
              )}
              
              {/* Cancellation notice */}
              {subData.cancelAtPeriodEnd && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-subhead text-warning">
                    <AlertCircle className="w-4 h-4" />
                    <span>Subscription ends {formatDate(subData.cancelAt || subData.currentPeriodEnd)}</span>
                  </div>
                  <p className="text-caption1 text-muted-foreground">
                    You&apos;ll lose access after this date
                  </p>
                </div>
              )}
              
              {/* Payment Method Display */}
              {subData.paymentMethod && (
                <div className="flex items-center gap-2 text-subhead text-muted-foreground mt-3">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">{subData.paymentMethod.brand}</span>
                  <span>•••• {subData.paymentMethod.last4}</span>
                  <span className="text-caption1">
                    ({subData.paymentMethod.expMonth}/{subData.paymentMethod.expYear})
                  </span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="pt-4 flex flex-wrap gap-3">
              {/* No active subscription - show both plan options */}
              {(subData.status === 'inactive' || subData.status === 'canceled') && (
                <>
                  <button
                    onClick={() => handleCheckout('flow')}
                    disabled={checkoutPlan !== null}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-subhead hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {checkoutPlan === 'flow' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Subscribe to Flow
                  </button>
                  <button
                    onClick={() => handleCheckout('black')}
                    disabled={checkoutPlan !== null}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-subhead hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {checkoutPlan === 'black' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Subscribe to Black
                  </button>
                </>
              )}

              {/* Active or trialing subscription - can manage billing */}
              {(subData.status === 'active' || subData.status === 'trialing') && subData.hasStripeCustomer && (
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-subhead hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Manage Billing
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Payment */}
          {upcomingInvoice && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-subhead text-foreground">Upcoming Payment</p>
                    <p className="text-caption1 text-muted-foreground">
                      {formatDate(upcomingInvoice.dueDate)}
                    </p>
                  </div>
                </div>
                <p className="text-headline font-semibold text-foreground">
                  {formatAED(upcomingInvoice.amount)}
                </p>
              </div>
            </div>
          )}

          {/* Invoices */}
          <div className="rounded-xl border border-border/40 bg-sidebar">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-subhead text-foreground">Invoices</h3>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-subhead text-muted-foreground">No invoices yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="[&_tr]:border-0">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="text-caption1">Invoice</TableHead>
                    <TableHead className="text-caption1">Date</TableHead>
                    <TableHead className="text-caption1">Amount</TableHead>
                    <TableHead className="text-caption1">Status</TableHead>
                    <TableHead className="text-caption1 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-0">
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-0">
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-subhead">{invoice.number || invoice.id.slice(0, 8)}</p>
                          <p className="text-caption1 text-muted-foreground">{invoice.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-subhead text-muted-foreground">
                        {formatDate(invoice.created || invoice.paidAt)}
                      </TableCell>
                      <TableCell className="text-subhead">
                        {formatAED(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status || 'unknown'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {invoice.hostedInvoiceUrl && (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                              title="View invoice"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                          {invoice.invoicePdf && (
                            <a
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

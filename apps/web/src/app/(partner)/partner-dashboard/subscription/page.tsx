/**
 * Partner Billing & Subscription Management Page
 * 
 * Lightweight page that fetches all data from Stripe directly.
 * No heavy DB sync - Stripe is the source of truth.
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { 
  CreditCard, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  Crown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    active: { bg: 'bg-green-500/10', text: 'text-green-500', icon: <CheckCircle className="w-3 h-3" /> },
    trialing: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: <Sparkles className="w-3 h-3" /> },
    past_due: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: <AlertCircle className="w-3 h-3" /> },
    canceled: { bg: 'bg-red-500/10', text: 'text-red-500', icon: <AlertCircle className="w-3 h-3" /> },
    inactive: { bg: 'bg-muted', text: 'text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
    paid: { bg: 'bg-green-500/10', text: 'text-green-500', icon: <CheckCircle className="w-3 h-3" /> },
    open: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: <Clock className="w-3 h-3" /> },
    upcoming: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: <Calendar className="w-3 h-3" /> },
  };
  
  const { bg, text, icon } = config[status] || config.inactive;
  
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', bg, text)}>
      {icon}
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

export default function PartnerBillingPage() {
  const { session: user, isLoading: authLoading } = useAuth();
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
    enabled: !!user,
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
    enabled: !!user,
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
        window.open(data.data.url, '_blank');
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

  if (authLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Billing</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Manage your subscription and billing</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-muted/20 rounded-xl" />
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
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Billing</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">
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
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-4">Loading billing...</p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && subData && (
        <>
          {/* Subscription Status Card */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-6 space-y-6">
            {/* Plan Header */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                subData.plan === 'black' ? 'bg-gradient-to-br from-zinc-900 to-zinc-700' : 'bg-gradient-to-br from-blue-600 to-blue-400'
              )}>
                {subData.plan === 'black' ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{subData.planDisplayName}</h2>
                  <StatusBadge status={subData.status} />
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {subData.priceAED.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">AED/month</span>
                </p>
              </div>
            </div>
            
            {/* Billing Details */}
            <div className="border-t border-border/30 pt-4">
              {/* Trial billing breakdown */}
              {subData.status === 'trialing' && daysRemaining !== null && (
                <div className="space-y-3">
                  {subData.trialMonths && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <span className="text-muted-foreground">Agreed trial</span>
                      <span className="font-medium text-foreground text-right">
                        {subData.trialMonths} month{subData.trialMonths > 1 ? 's' : ''} free
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-muted-foreground">Charged today</span>
                    <span className="font-semibold text-green-500 text-right">0 AED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-muted-foreground">Founding access ends</span>
                    <span className="font-medium text-foreground text-right">{formatDate(subData.trialEnd)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-muted-foreground">First charge</span>
                    <span className="font-medium text-foreground text-right">
                      {subData.priceAED.toLocaleString()} AED
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-500 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{daysRemaining} days remaining in founding period</span>
                  </div>
                </div>
              )}
              
              {/* Active subscription info */}
              {subData.status === 'active' && subData.currentPeriodEnd && !subData.cancelAtPeriodEnd && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-muted-foreground">Next billing</span>
                    <span className="font-medium text-foreground text-right">{formatDate(subData.currentPeriodEnd)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground text-right">{subData.priceAED.toLocaleString()} AED</span>
                  </div>
                </div>
              )}
              
              {/* Cancellation notice */}
              {subData.cancelAtPeriodEnd && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Subscription ends {formatDate(subData.cancelAt || subData.currentPeriodEnd)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll lose access after this date
                  </p>
                </div>
              )}
              
              {/* Payment Method Display */}
              {subData.paymentMethod && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t border-border/30">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">{subData.paymentMethod.brand}</span>
                  <span>•••• {subData.paymentMethod.last4}</span>
                  <span className="text-xs">
                    ({subData.paymentMethod.expMonth}/{subData.paymentMethod.expYear})
                  </span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="border-t border-border/30 pt-4 flex flex-wrap gap-3">
              {/* Subscribe/Add Payment buttons for trial/inactive users without payment */}
              {(subData.status === 'trialing' || subData.status === 'inactive') && !subData.paymentMethod && (
                <>
                  {subData.plan === 'black' ? (
                    <button
                      onClick={() => handleCheckout('black')}
                      disabled={checkoutPlan !== null}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 text-white text-sm font-medium hover:from-zinc-800 hover:to-zinc-600 transition-all disabled:opacity-50"
                    >
                      {checkoutPlan === 'black' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      Add Payment Method
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCheckout('flow')}
                        disabled={checkoutPlan !== null}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {checkoutPlan === 'flow' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Add Payment Method
                      </button>
                      <button
                        onClick={() => handleCheckout('black')}
                        disabled={checkoutPlan !== null}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50"
                      >
                        {checkoutPlan === 'black' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4" />
                        )}
                        Upgrade to Black
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Manage Subscription button - show for anyone with payment method or active subscription */}
              {(subData.paymentMethod || subData.status === 'active') && subData.hasStripeCustomer && (
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Manage Subscription
                </button>
              )}

              {/* Upgrade button for Flow users (active or trialing with payment) */}
              {(subData.status === 'active' || (subData.status === 'trialing' && subData.paymentMethod)) && subData.plan === 'flow' && (
                <button
                  onClick={() => handleCheckout('black')}
                  disabled={checkoutPlan !== null}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 text-white text-sm font-medium hover:from-zinc-800 hover:to-zinc-600 transition-all disabled:opacity-50"
                >
                  {checkoutPlan === 'black' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  Upgrade to Black
                </button>
              )}

              {/* Downgrade button for active Black users only (not during trial) */}
              {subData.status === 'active' && subData.plan === 'black' && (
                <button
                  onClick={() => handleCheckout('flow')}
                  disabled={checkoutPlan !== null}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {checkoutPlan === 'flow' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  Downgrade to Flow
                </button>
              )}

              {/* Resubscribe buttons for cancelled/inactive users with payment method */}
              {(subData.status === 'canceled' || subData.status === 'inactive') && subData.hasStripeCustomer && (
                <>
                  <button
                    onClick={() => handleCheckout('flow')}
                    disabled={checkoutPlan !== null}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {checkoutPlan === 'flow' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Subscribe to Flow
                  </button>
                  <button
                    onClick={() => handleCheckout('black')}
                    disabled={checkoutPlan !== null}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 text-white text-sm font-medium hover:from-zinc-800 hover:to-zinc-600 transition-all disabled:opacity-50"
                  >
                    {checkoutPlan === 'black' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4" />
                    )}
                    Subscribe to Black
                  </button>
                </>
              )}
              
              {/* Help text for what Manage does */}
              {(subData.paymentMethod || subData.status === 'active') && subData.hasStripeCustomer && (
                <p className="w-full text-xs text-muted-foreground">
                  Update payment method, cancel subscription, or download invoices
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Payment */}
          {upcomingInvoice && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Upcoming Payment</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(upcomingInvoice.dueDate)}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatAED(upcomingInvoice.amount)}
                </p>
              </div>
            </div>
          )}

          {/* Invoices */}
          <div className="rounded-xl border border-border/40 bg-sidebar">
            <div className="p-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Invoices</h3>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Invoice</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm">{invoice.number || invoice.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{invoice.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invoice.created || invoice.paidAt)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
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

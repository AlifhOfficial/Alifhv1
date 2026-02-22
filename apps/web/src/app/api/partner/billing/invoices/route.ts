/**
 * API: Partner Billing Invoices
 * GET /api/partner/billing/invoices
 * 
 * Fetches invoice history directly from Stripe.
 * Returns paid, open, and upcoming invoices with download links.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe/config';
import { getUserById } from '@alifh/database';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be partner owner
    const partnerMembership = sessionUser.partnerMemberships?.find(
      (m) => m.staffRole === 'owner'
    );
    if (!partnerMembership) {
      return NextResponse.json(
        { error: 'Only partner owners can access billing' },
        { status: 403 }
      );
    }

    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Billing not configured' },
        { status: 503 }
      );
    }

    // Get user's Stripe customer ID
    const user = await getUserById(sessionUser.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: {
          invoices: [],
          hasMore: false,
        },
      });
    }

    const stripe = getStripeClient();

    // Parse pagination params
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const startingAfter = searchParams.get('starting_after') || undefined;

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit,
      starting_after: startingAfter,
    });

    // Transform to clean response format
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status, // 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
      amount: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      paidAt: invoice.status_transitions?.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
        : null,
      hostedInvoiceUrl: invoice.hosted_invoice_url, // View in browser
      invoicePdf: invoice.invoice_pdf, // Download PDF
      description: invoice.description || invoice.lines.data[0]?.description || 'Subscription',
      periodStart: invoice.period_start 
        ? new Date(invoice.period_start * 1000).toISOString()
        : null,
      periodEnd: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : null,
    }));

    // Get upcoming invoice if subscription exists
    let upcomingInvoice = null;
    try {
      const upcoming = await stripe.invoices.createPreview({
        customer: user.stripeCustomerId,
      });
      upcomingInvoice = {
        id: 'upcoming',
        number: null,
        status: 'upcoming',
        amount: upcoming.amount_due,
        currency: upcoming.currency,
        dueDate: upcoming.next_payment_attempt 
          ? new Date(upcoming.next_payment_attempt * 1000).toISOString()
          : null,
        description: 'Upcoming payment',
        periodStart: upcoming.period_start
          ? new Date(upcoming.period_start * 1000).toISOString()
          : null,
        periodEnd: upcoming.period_end
          ? new Date(upcoming.period_end * 1000).toISOString()
          : null,
      };
    } catch {
      // No upcoming invoice (no active subscription)
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        upcomingInvoice,
        hasMore: invoices.has_more,
      },
    });
  } catch (error) {
    console.error('[API] Partner billing invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

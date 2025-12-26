/**
 * Partner Consignment Leads Queries
 *
 * @module queries/consignment/partner-consignment-leads-query
 */

import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { consignmentLead } from '../../schema/consignment';
import { carListing } from '../../schema/listing';
import { user } from '../../schema/auth';

export interface GetPartnerConsignmentLeadsOptions {
  status?: string | null;
  isPriority?: boolean;
  limit?: number;
  offset?: number;
}

export async function getPartnerConsignmentLeadStats(partnerId: string) {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      new: sql<number>`count(*) filter (where ${consignmentLead.status} = 'new')`,
      viewed: sql<number>`count(*) filter (where ${consignmentLead.status} = 'viewed')`,
      contacted: sql<number>`count(*) filter (where ${consignmentLead.status} = 'contacted')`,
      inNegotiation: sql<number>`count(*) filter (where ${consignmentLead.status} = 'in_negotiation')`,
      accepted: sql<number>`count(*) filter (where ${consignmentLead.status} = 'accepted')`,
      rejected: sql<number>`count(*) filter (where ${consignmentLead.status} = 'rejected')`,
    })
    .from(consignmentLead)
    .where(eq(consignmentLead.partnerId, partnerId));

  return stats;
}

export async function getPartnerConsignmentLeads(
  partnerId: string,
  options: GetPartnerConsignmentLeadsOptions = {}
) {
  const { status, isPriority = false, limit = 20, offset = 0 } = options;

  const conditions = [eq(consignmentLead.partnerId, partnerId)];
  if (status) {
    conditions.push(eq(consignmentLead.status, status as any));
  }
  if (isPriority) {
    conditions.push(eq(consignmentLead.isPriority, true));
  }

  const [leads, countResult, stats] = await Promise.all([
    db
      .select({
        lead: consignmentLead,
        listing: carListing,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(consignmentLead)
      .leftJoin(carListing, eq(consignmentLead.listingId, carListing.id))
      .leftJoin(user, eq(consignmentLead.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(consignmentLead.isPriority), desc(consignmentLead.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(consignmentLead)
      .where(and(...conditions)),

    getPartnerConsignmentLeadStats(partnerId),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    leads,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    stats,
  };
}

export async function getPartnerConsignmentLeadById(partnerId: string, leadId: string) {
  const lead = await db.query.consignmentLead.findFirst({
    where: and(eq(consignmentLead.id, leadId), eq(consignmentLead.partnerId, partnerId)),
    with: {
      listing: true,
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  return lead ?? null;
}

export async function markPartnerConsignmentLeadViewed(partnerId: string, leadId: string): Promise<void> {
  const lead = await db.query.consignmentLead.findFirst({
    where: and(eq(consignmentLead.id, leadId), eq(consignmentLead.partnerId, partnerId)),
    columns: {
      id: true,
      status: true,
      viewedAt: true,
      viewCount: true,
    },
  });

  if (!lead || lead.status !== 'new') return;

  const now = new Date();
  await db
    .update(consignmentLead)
    .set({
      status: 'viewed',
      viewedAt: lead.viewedAt ?? now,
      viewCount: (lead.viewCount || 0) + 1,
      updatedAt: now,
    })
    .where(and(eq(consignmentLead.id, leadId), eq(consignmentLead.partnerId, partnerId)));
}

export async function applyPartnerConsignmentLeadAction(input: {
  partnerId: string;
  leadId: string;
  actorUserId: string;
  action: string;
  data?: any;
}) {
  const lead = await db.query.consignmentLead.findFirst({
    where: and(eq(consignmentLead.id, input.leadId), eq(consignmentLead.partnerId, input.partnerId)),
  });

  if (!lead) return null;

  const now = new Date();
  let updates: Partial<typeof consignmentLead.$inferInsert> = {
    updatedAt: now,
  };

  switch (input.action) {
    case 'view':
      updates = {
        ...updates,
        status: 'viewed',
        viewedAt: lead.viewedAt || now,
        viewCount: (lead.viewCount || 0) + 1,
      };
      break;
    case 'interested':
      updates = { ...updates, status: 'interested', interestedAt: now };
      break;
    case 'contact':
      updates = {
        ...updates,
        status: 'contacted',
        contactedAt: now,
        contactMethod: input.data?.contactMethod || 'message',
      };
      break;
    case 'negotiate':
      updates = {
        ...updates,
        status: 'in_negotiation',
        offerAmount: input.data?.offerAmount,
        offerTerms: input.data?.offerTerms,
        offerExpiresAt: input.data?.offerExpiresAt ? new Date(input.data.offerExpiresAt) : undefined,
      };
      break;
    case 'accept':
      updates = {
        ...updates,
        status: 'accepted',
        acceptedAt: now,
        acceptedByUserId: input.actorUserId,
        dealValue: input.data?.dealValue,
        dealNotes: input.data?.dealNotes,
      };
      break;
    case 'reject':
      updates = {
        ...updates,
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: 'partner',
        rejectionReason: input.data?.rejectionReason,
      };
      break;
    case 'priority':
      updates = { ...updates, isPriority: !lead.isPriority };
      break;
    case 'notes':
      updates = {
        ...updates,
        partnerNotes: input.data?.partnerNotes,
        internalNotes: input.data?.internalNotes,
      };
      break;
    case 'follow-up':
      updates = {
        ...updates,
        followUpAt: input.data?.followUpAt ? new Date(input.data.followUpAt) : null,
        followUpCount: (lead.followUpCount || 0) + 1,
      };
      break;
    default:
      return { error: 'Invalid action' } as const;
  }

  const [updated] = await db
    .update(consignmentLead)
    .set(updates)
    .where(and(eq(consignmentLead.id, input.leadId), eq(consignmentLead.partnerId, input.partnerId)))
    .returning();

  return updated ?? null;
}


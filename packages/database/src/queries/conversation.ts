/**
 * Conversation Queries
 * Handles conversation creation, retrieval, and participant management
 */

import { db } from '../index';
import { conversation, conversationParticipant, user, carListing, partner, userProfile, partnerStaff } from '../schema';
import { eq, and, desc, or, sql, inArray, isNull, not } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// Types
// ============================================================================

export interface ConversationWithDetails {
  id: string;
  type: string;
  status: string;
  listingId: string | null;
  partnerId: string | null;
  subject: string | null;
  lastMessageAt: Date;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  myLastReadAt: Date | null;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  otherParticipant: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    lastReadAt: Date | null;
    lastSeenAt?: Date | null;
  } | null;
  listing: {
    id: string;
    title: string;
    thumbnail: string | null;
    partnerId?: string | null;
  } | null;
  partner: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
}

export interface ConversationParticipantInfo {
  userId: string;
  unreadCount: number;
  lastReadAt: Date | null;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
}

export interface ConversationParticipantWithProfile {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  lastReadAt: Date | null;
}

// ============================================================================
// Create Conversation
// ============================================================================

/**
 * Create or get existing conversation for a listing inquiry
 * Ensures only one conversation per buyer-seller-listing combo
 */
export async function createOrGetConversation(params: {
  initiatedBy: string;
  otherUserId: string;
  listingId?: string;
  partnerId?: string;
  type?: 'direct' | 'inquiry' | 'negotiation' | 'booking' | 'consignment' | 'support' | 'system';
  subject?: string;
}): Promise<string> {
  const { initiatedBy, otherUserId, listingId, subject } = params;

  // Derive partnerId from listing when present (partner listings should resolve to partner identity)
  let derivedPartnerId: string | undefined = params.partnerId;
  if (!derivedPartnerId && listingId) {
    const listing = await db
      .select({ partnerId: carListing.partnerId })
      .from(carListing)
      .where(eq(carListing.id, listingId))
      .limit(1);
    derivedPartnerId = listing[0]?.partnerId ?? undefined;
  }

  // Auto-detect conversation type if not specified
  let conversationType = params.type;
  if (!conversationType) {
    if (listingId) {
      conversationType = 'inquiry'; // Listing-based = inquiry
    } else if (derivedPartnerId) {
      conversationType = 'inquiry'; // Partner-based = inquiry
    } else {
      conversationType = 'direct'; // User-to-user = direct
    }
  }

  // Check if conversation already exists
  if (listingId) {
    const existingQuery = await db
      .select({ id: conversation.id })
      .from(conversation)
      .innerJoin(
        conversationParticipant,
        eq(conversationParticipant.conversationId, conversation.id)
      )
      .where(
        and(
          eq(conversation.listingId, listingId),
          inArray(conversationParticipant.userId, [initiatedBy, otherUserId])
        )
      )
      .groupBy(conversation.id)
      .having(sql`count(distinct ${conversationParticipant.userId}) = 2`);

    if (existingQuery.length > 0) {
      // Backfill partnerId if missing (keeps inbox scoping consistent for older conversations)
      if (derivedPartnerId) {
        await db
          .update(conversation)
          .set({ partnerId: derivedPartnerId })
          .where(and(eq(conversation.id, existingQuery[0].id), isNull(conversation.partnerId)));
      }
      return existingQuery[0].id;
    }
  } else {
    // For direct messages (no listing), check if conversation exists between these two users
    const existingDirectQuery = await db
      .select({ id: conversation.id })
      .from(conversation)
      .innerJoin(
        conversationParticipant,
        eq(conversationParticipant.conversationId, conversation.id)
      )
      .where(
        and(
          eq(conversation.type, 'direct'),
          isNull(conversation.listingId),
          inArray(conversationParticipant.userId, [initiatedBy, otherUserId])
        )
      )
      .groupBy(conversation.id)
      .having(sql`count(distinct ${conversationParticipant.userId}) = 2`);

    if (existingDirectQuery.length > 0) {
      return existingDirectQuery[0].id;
    }
  }

  // Create new conversation
  const conversationId = createId();

  // Note: neon-http does not support transactions. We perform inserts sequentially and
  // best-effort cleanup if participant insertion fails.
  let conversationInserted = false;
  try {
    await db.insert(conversation).values({
      id: conversationId,
      type: conversationType,
      status: 'active',
      initiatedBy,
      listingId: listingId || null,
      partnerId: derivedPartnerId || null,
      subject: subject || null,
      lastMessageAt: new Date(),
      messageCount: 0,
    });
    conversationInserted = true;

    await db.insert(conversationParticipant).values([
      {
        id: createId(),
        conversationId,
        userId: initiatedBy,
        unreadCount: 0,
        role: 'member',
        notificationsEnabled: true,
      },
      {
        id: createId(),
        conversationId,
        userId: otherUserId,
        unreadCount: 0,
        role: 'member',
        notificationsEnabled: true,
      },
    ]);
  } catch (error) {
    if (conversationInserted) {
      try {
        await db
          .delete(conversationParticipant)
          .where(eq(conversationParticipant.conversationId, conversationId));
      } catch {
        // ignore cleanup errors
      }

      try {
        await db.delete(conversation).where(eq(conversation.id, conversationId));
      } catch {
        // ignore cleanup errors
      }
    }

    throw error;
  }

  return conversationId;
}

// ============================================================================
// Get Conversations
// ============================================================================

/**
 * Get all conversations for a user with details
 * Includes other participant info, unread counts, and listing context
 */
export async function getUserConversations(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
    partnerIds?: string[];
    partnerScope?: 'only' | 'exclude';
  } = {}
): Promise<ConversationWithDetails[]> {
  const { limit = 50, offset = 0, includeArchived = false, partnerIds, partnerScope } = options;

  const whereConditions = [];
  if (!includeArchived) {
    whereConditions.push(eq(conversationParticipant.isArchived, false));
  }

  if (partnerScope === 'only' && partnerIds?.length) {
    whereConditions.push(
      or(
        inArray(conversation.partnerId, partnerIds),
        inArray(carListing.partnerId, partnerIds)
      )
    );
  }

  if (partnerScope === 'exclude' && partnerIds?.length) {
    whereConditions.push(
      and(
        or(isNull(conversation.partnerId), not(inArray(conversation.partnerId, partnerIds))),
        or(isNull(carListing.partnerId), not(inArray(carListing.partnerId, partnerIds)))
      )
    );
  }

  // SINGLE optimized query - fetches everything including other participant via subquery
  // Eliminates second round-trip to database (~50ms savings)
  const results = await db
    .select({
      // Conversation fields
      id: conversation.id,
      type: conversation.type,
      status: conversation.status,
      listingId: conversation.listingId,
      partnerId: conversation.partnerId,
      subject: conversation.subject,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: conversation.lastMessagePreview,
      messageCount: conversation.messageCount,
      // Current user's participant data
      unreadCount: conversationParticipant.unreadCount,
      isArchived: conversationParticipant.isArchived,
      isMuted: conversationParticipant.isMuted,
      isPinned: conversationParticipant.isPinned,
      lastReadAt: conversationParticipant.lastReadAt,
      // Listing data (joined)
      listingTitle: sql<string | null>`CASE WHEN ${carListing.id} IS NOT NULL THEN concat(${carListing.year}, ' ', ${carListing.make}, ' ', ${carListing.model}) ELSE NULL END`,
      listingThumbnail: carListing.thumbnail,
      listingPartnerId: carListing.partnerId,
      // Partner data (joined)
      partnerName: partner.brandName,
      partnerLogo: partner.logo,
      // Other participant via correlated subquery (single query instead of two!)
      otherParticipantId: sql<string | null>`(
        SELECT cp2.user_id FROM conversation_participant cp2 
        WHERE cp2.conversation_id = ${conversation.id} 
        AND cp2.user_id != ${userId} 
        LIMIT 1
      )`,
      otherParticipantName: sql<string | null>`(
        SELECT u.name FROM conversation_participant cp2 
        JOIN "user" u ON u.id = cp2.user_id
        WHERE cp2.conversation_id = ${conversation.id} 
        AND cp2.user_id != ${userId} 
        LIMIT 1
      )`,
      otherParticipantAvatar: sql<string | null>`(
        SELECT up.avatar FROM conversation_participant cp2 
        LEFT JOIN user_profile up ON up.user_id = cp2.user_id
        WHERE cp2.conversation_id = ${conversation.id} 
        AND cp2.user_id != ${userId} 
        LIMIT 1
      )`,
      otherParticipantLastReadAt: sql<Date | null>`(
        SELECT cp2.last_read_at FROM conversation_participant cp2 
        WHERE cp2.conversation_id = ${conversation.id} 
        AND cp2.user_id != ${userId} 
        LIMIT 1
      )`,
      otherParticipantLastSeenAt: sql<Date | null>`(
        SELECT up.last_active_at FROM conversation_participant cp2 
        LEFT JOIN user_profile up ON up.user_id = cp2.user_id
        WHERE cp2.conversation_id = ${conversation.id} 
        AND cp2.user_id != ${userId} 
        LIMIT 1
      )`,
      // Check if other participant is staff of the partner (to decide whether to show brand or user avatar)
      otherParticipantIsStaff: sql<boolean>`(
        SELECT EXISTS(
          SELECT 1 FROM partner_staff ps
          WHERE ps.user_id = (
            SELECT cp2.user_id FROM conversation_participant cp2 
            WHERE cp2.conversation_id = ${conversation.id} 
            AND cp2.user_id != ${userId} 
            LIMIT 1
          )
          AND ps.partner_id = COALESCE(${conversation.partnerId}, ${carListing.partnerId})
          AND ps.status = 'active'
        )
      )`,
    })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      and(
        eq(conversationParticipant.conversationId, conversation.id),
        eq(conversationParticipant.userId, userId),
        isNull(conversationParticipant.leftAt) // Only show conversations where user hasn't left
      )
    )
    .leftJoin(carListing, eq(carListing.id, conversation.listingId))
    .leftJoin(
      partner,
      sql`${partner.id} = COALESCE(${conversation.partnerId}, ${carListing.partnerId})`
    )
    .where(whereConditions.length ? and(...whereConditions) : undefined)
    .orderBy(desc(conversation.lastMessageAt))
    .limit(limit)
    .offset(offset);

  if (results.length === 0) {
    return [];
  }

  return results.map((row) => {
    const effectivePartnerId = row.partnerId ?? row.listingPartnerId;
    const hasPartner = effectivePartnerId && row.partnerName;
    // Only show partner brand if the OTHER participant is staff (not the current user)
    // This means: customer sees partner brand, staff sees customer's real avatar
    const showPartnerBrand = hasPartner && row.otherParticipantIsStaff;

    return {
      id: row.id,
      type: row.type,
      status: row.status,
      listingId: row.listingId,
      partnerId: row.partnerId,
      subject: row.subject,
      lastMessageAt: row.lastMessageAt,
      lastMessagePreview: row.lastMessagePreview,
      messageCount: row.messageCount,
      unreadCount: row.unreadCount,
      myLastReadAt: row.lastReadAt,
      isArchived: row.isArchived,
      isMuted: row.isMuted,
      isPinned: row.isPinned,
      // Show partner brand only when other participant is staff, otherwise show their real info
      otherParticipant: row.otherParticipantId
        ? {
            id: row.otherParticipantId,
            name: showPartnerBrand ? row.partnerName : row.otherParticipantName,
            avatarUrl: showPartnerBrand ? row.partnerLogo : row.otherParticipantAvatar,
            // Convert DB timestamp strings to Date objects
            lastReadAt: row.otherParticipantLastReadAt
              ? new Date(row.otherParticipantLastReadAt)
              : null,
            lastSeenAt: row.otherParticipantLastSeenAt
              ? new Date(row.otherParticipantLastSeenAt)
              : null,
          }
        : null,
      listing: row.listingId && row.listingTitle
        ? {
            id: row.listingId,
            title: row.listingTitle,
            thumbnail: row.listingThumbnail,
            partnerId: row.listingPartnerId,
          }
        : null,
      partner: effectivePartnerId && row.partnerName
        ? {
            id: effectivePartnerId,
            name: row.partnerName,
            logo: row.partnerLogo,
          }
        : null,
    };
  });
}

/**
 * Get a single conversation by ID with participant verification
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  const conversations = await getUserConversations(userId, { limit: 1 });
  return conversations.find((c) => c.id === conversationId) || null;
}

/**
 * Find existing conversation between buyer and seller for a listing
 */
export async function getConversationByListing(
  userId: string,
  listingId: string,
  otherUserId?: string
): Promise<string | null> {
  const query = await db
    .select({ id: conversation.id })
    .from(conversation)
    .innerJoin(
      conversationParticipant,
      eq(conversationParticipant.conversationId, conversation.id)
    )
    .where(
      and(
        eq(conversation.listingId, listingId),
        eq(conversationParticipant.userId, userId)
      )
    );

  if (query.length === 0) return null;

  // If otherUserId specified, verify they're in the conversation
  if (otherUserId) {
    const hasOtherUser = await db
      .select({ id: conversationParticipant.id })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, query[0].id),
          eq(conversationParticipant.userId, otherUserId)
        )
      );

    if (hasOtherUser.length === 0) return null;
  }

  return query[0].id;
}

// ============================================================================
// Update Conversation
// ============================================================================

/**
 * Mark conversation as read for a user
 */
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const now = new Date();
  
  await Promise.all([
    // Update conversation participant
    db
      .update(conversationParticipant)
      .set({
        unreadCount: 0,
        lastReadAt: now,
      })
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, userId)
        )
      ),
    
    // Update user's lastActiveAt
    db
      .update(userProfile)
      .set({ lastActiveAt: now })
      .where(eq(userProfile.userId, userId)),
  ]);
}

/**
 * Update conversation participant settings
 */
export async function updateConversationSettings(
  conversationId: string,
  userId: string,
  settings: {
    isMuted?: boolean;
    isArchived?: boolean;
    isPinned?: boolean;
    notificationsEnabled?: boolean;
  }
): Promise<void> {
  await db
    .update(conversationParticipant)
    .set(settings)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        eq(conversationParticipant.userId, userId)
      )
    );
}

/**
 * Get conversation participants
 */
export async function getConversationParticipants(
  conversationId: string
): Promise<ConversationParticipantInfo[]> {
  const participants = await db
    .select({
      userId: conversationParticipant.userId,
      unreadCount: conversationParticipant.unreadCount,
      lastReadAt: conversationParticipant.lastReadAt,
      isMuted: conversationParticipant.isMuted,
      isArchived: conversationParticipant.isArchived,
      isPinned: conversationParticipant.isPinned,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        isNull(conversationParticipant.leftAt)
      )
    );

  return participants;
}

/**
 * Get conversation participants with their profile info (for group chat seen status)
 */
export async function getConversationParticipantsWithProfiles(
  conversationId: string
): Promise<ConversationParticipantWithProfile[]> {
  const participants = await db
    .select({
      userId: conversationParticipant.userId,
      lastReadAt: conversationParticipant.lastReadAt,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatar: userProfile.avatar,
    })
    .from(conversationParticipant)
    .innerJoin(user, eq(user.id, conversationParticipant.userId))
    .leftJoin(userProfile, eq(userProfile.userId, conversationParticipant.userId))
    .where(
      and(
        eq(conversationParticipant.conversationId, conversationId),
        isNull(conversationParticipant.leftAt)
      )
    );

  return participants.map(p => ({
    userId: p.userId,
    name: [p.firstName, p.lastName].filter(Boolean).join(' ') || null,
    avatarUrl: p.avatar,
    lastReadAt: p.lastReadAt,
  }));
}

/**
 * Get total unread count for user across all conversations
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const result = await db
    .select({
      total: sql<number>`sum(${conversationParticipant.unreadCount})::int`,
    })
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.userId, userId),
        eq(conversationParticipant.isArchived, false)
      )
    );

  return result[0]?.total || 0;
}

// ============================================================================
// Partner Internal (Team Chat) Conversations
// V1: Disabled for launch - keeping schema intact for V2
// ============================================================================

// Team chat functions removed for V1 launch:
// - getOrCreatePartnerTeamConversation
// - addUserToPartnerTeamConversation
// - removeUserFromPartnerTeamConversation
// - getPartnerTeamConversation
//
// These will be re-implemented in V2 with proper caching and
// deferred initialization (not on every page load)

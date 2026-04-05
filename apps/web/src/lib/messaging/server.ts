import {
  getConversationParticipants,
  getMessages,
  getScopedUnreadCount,
  getUserConversations,
} from '@alifh/database';

type SessionUserLike = {
  id: string;
  partnerMemberships?: Array<{ partnerId?: string | null }> | null;
};

function serializeDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function getSerializedConversationsForUser(
  user: SessionUserLike,
  options: {
    scope?: 'personal' | 'staff';
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  } = {}
) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const includeArchived = options.includeArchived ?? false;
  const partnerIds = (user.partnerMemberships ?? []).map((m) => m.partnerId).filter(Boolean) as string[];
  const partnerScope =
    partnerIds.length > 0
      ? options.scope === 'staff'
        ? 'only'
        : options.scope === 'personal'
          ? 'exclude'
          : undefined
      : undefined;

  const conversations = await getUserConversations(user.id, {
    limit,
    offset,
    includeArchived,
    partnerIds,
    partnerScope,
  });

  const totalUnread =
    await getScopedUnreadCount(user.id, {
      includeArchived,
      partnerIds,
      partnerScope,
    });

  return {
    conversations: conversations.map((conversation) => ({
      ...conversation,
      lastMessageAt: serializeDate(conversation.lastMessageAt) ?? new Date(0).toISOString(),
      myLastReadAt: serializeDate(conversation.myLastReadAt),
      otherParticipant: conversation.otherParticipant
        ? {
            ...conversation.otherParticipant,
            lastReadAt: serializeDate(conversation.otherParticipant.lastReadAt),
            lastSeenAt: serializeDate(conversation.otherParticipant.lastSeenAt),
          }
        : null,
    })),
    totalUnread,
    hasMore: conversations.length === limit,
  };
}

export async function getSerializedMessagesPageForUser(
  userId: string,
  conversationId: string,
  options: {
    limit?: number;
    cursor?: string;
  } = {}
) {
  const limit = options.limit ?? 50;
  const cursor = options.cursor;
  const isFirstPage = !cursor;

  const [messages, participants] = await Promise.all([
    getMessages(conversationId, {
      limit,
      cursor,
      userId,
    } as any),
    isFirstPage ? getConversationParticipants(conversationId) : Promise.resolve([]),
  ]);

  const otherParticipant = isFirstPage
    ? participants.find((participant) => participant.userId !== userId)
    : null;

  return {
    messages: messages.map((message) => ({
      ...message,
      deliveredAt: serializeDate(message.deliveredAt),
      readAt: serializeDate(message.readAt),
      editedAt: serializeDate(message.editedAt),
      createdAt: serializeDate(message.createdAt) ?? new Date(0).toISOString(),
    })),
    hasMore: messages.length === limit,
    nextCursor:
      messages.length === limit
        ? serializeDate(messages[messages.length - 1]?.createdAt)
        : null,
    ...(isFirstPage && {
      otherParticipantLastReadAt: serializeDate(otherParticipant?.lastReadAt),
    }),
  };
}

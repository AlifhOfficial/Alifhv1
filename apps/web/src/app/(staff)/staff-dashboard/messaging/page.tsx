/**
 * Staff Messaging Page
 * V1: Customer inquiries only (team chat disabled for launch)
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { ChatContainer } from '@/components/messaging';
import { getUserConversations } from '@alifh/database';
import type { Conversation } from '@/hooks/messaging';

export default async function MessagingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/?auth=signin');
  }

  const partnerIds = (user.partnerMemberships ?? []).map((m) => m.partnerId).filter(Boolean);
  const conversations = await getUserConversations(user.id, {
    limit: 50,
    offset: 0,
    includeArchived: false,
    partnerIds,
    partnerScope: partnerIds.length > 0 ? 'only' : undefined,
  });

  const initialData = {
    conversations: conversations.map((conversation): Conversation => ({
      ...conversation,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      myLastReadAt: conversation.myLastReadAt?.toISOString() ?? null,
      otherParticipant: conversation.otherParticipant
        ? {
            ...conversation.otherParticipant,
            lastReadAt: conversation.otherParticipant.lastReadAt?.toISOString() ?? null,
            lastSeenAt: conversation.otherParticipant.lastSeenAt?.toISOString() ?? null,
          }
        : null,
    })),
    totalUnread: conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    hasMore: conversations.length === 50,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatContainer
        userId={user.id}
        inbox="staff"
        className="flex-1 min-h-0"
        initialData={initialData}
      />
    </div>
  );
}

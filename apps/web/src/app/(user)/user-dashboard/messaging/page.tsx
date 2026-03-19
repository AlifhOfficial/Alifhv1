/**
 * User Messaging Page
 * Personal inbox for direct messages
 * Server-side data fetch for instant load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { ChatContainer } from '@/components/messaging';
import { getUserConversations, getMessages, getConversationParticipants } from '@alifh/database';
import type { Conversation, InitialMessagesData } from '@/hooks/messaging';

interface PageProps {
  searchParams: Promise<{ conversationId?: string }>;
}

export default async function MessagingPage({ searchParams }: PageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/?auth=signin');
  }

  const { conversationId: urlConversationId } = await searchParams;

  // Fetch conversations server-side for instant display (no client waterfall)
  const partnerIds = (user.partnerMemberships ?? []).map((m) => m.partnerId).filter(Boolean);
  const conversations = await getUserConversations(user.id, {
    limit: 50,
    offset: 0,
    includeArchived: false,
    partnerIds,
    // Exclude staff conversations - personal inbox only
    partnerScope: partnerIds.length > 0 ? 'exclude' : undefined,
  });

  // Determine which conversation to prefetch messages for
  // Prefer URL param, fall back to first conversation with messages
  const targetConversationId = urlConversationId 
    || conversations.find(c => c.messageCount > 0)?.id;
  
  // Prefetch messages for the target conversation
  let initialMessages: { conversationId: string; data: InitialMessagesData } | undefined;
  if (targetConversationId) {
    try {
      const [messages, participants] = await Promise.all([
        getMessages(targetConversationId, { limit: 50, userId: user.id }),
        getConversationParticipants(targetConversationId),
      ]);
      const otherParticipant = participants.find(p => p.userId !== user.id);
      initialMessages = {
        conversationId: targetConversationId,
        data: {
          messages: messages.map(m => ({
            ...m,
            createdAt: m.createdAt,
            sender: m.sender,
          })),
          hasMore: messages.length === 50,
          nextCursor: messages.length === 50 ? messages[messages.length - 1].createdAt.toISOString() : null,
          otherParticipantLastReadAt: otherParticipant?.lastReadAt?.toISOString() ?? null,
        },
      };
    } catch {
      // Silently fail - client will fetch
    }
  }

  // Serialize dates for client component
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
        inbox="personal"
        className="flex-1 min-h-0"
        initialData={initialData}
        initialMessages={initialMessages}
      />
    </div>
  );
}

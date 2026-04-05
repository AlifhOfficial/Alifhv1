/**
 * Navbar Messaging - Quick access to messages
 * Shows recent conversations with unread count badge
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useConversations, type Conversation } from '@/hooks/messaging';
import { useWebSocket } from '@/hooks/messaging/use-websocket';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NavbarMessagingProps {
  userId?: string;
  onOpenChat?: (conversation: Conversation) => void;
}

export function NavbarMessaging({ userId, onOpenChat }: NavbarMessagingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const unreadCountKey = useMemo(
    () => ['messaging-unread-count', userId, 'personal'] as const,
    [userId]
  );
  const conversationsCacheKey = useMemo(
    () => ['conversations', userId, 'personal', 50] as const,
    [userId]
  );

  const { data: unreadCountData } = useQuery<{ unreadCount: number }>({
    queryKey: unreadCountKey,
    queryFn: async () => {
      const res = await fetch('/api/conversations/unread-count', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch unread count');
      }
      const data = (await res.json()) as { unreadCount?: number };
      return { unreadCount: data.unreadCount ?? 0 };
    },
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { data: conversationsCache } = useQuery<{
    pages?: Array<{ totalUnread?: number }>;
  }>({
    queryKey: conversationsCacheKey,
    queryFn: async () => ({ pages: [] }),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const totalUnread = useMemo(() => {
    const cachedTotal = conversationsCache?.pages?.[0]?.totalUnread;
    if (typeof cachedTotal === 'number') {
      return cachedTotal;
    }
    return unreadCountData?.unreadCount ?? 0;
  }, [conversationsCache?.pages, unreadCountData?.unreadCount]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe((msg) => {
      if (msg.type !== 'new_message') return;
      if (msg.userId === userId) return;

      queryClient.setQueryData(unreadCountKey, (old: { unreadCount: number } | undefined) => ({
        unreadCount: Math.max(0, (old?.unreadCount ?? 0) + 1),
      }));
    });

    return unsubscribe;
  }, [queryClient, subscribe, unreadCountKey, userId]);
  const hasUnread = totalUnread > 0;

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-messaging-dropdown]')) setIsOpen(false);
    };
    setTimeout(() => document.addEventListener('click', handle), 0);
    return () => document.removeEventListener('click', handle);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen]);

  const handleOpenChat = useCallback((conversation: Conversation) => {
    setIsOpen(false);
    if (conversation.unreadCount > 0) {
      queryClient.setQueryData(unreadCountKey, (old: { unreadCount: number } | undefined) => ({
        unreadCount: Math.max(0, (old?.unreadCount ?? 0) - conversation.unreadCount),
      }));
    }
    if (onOpenChat) { onOpenChat(conversation); return; }
    router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
  }, [onOpenChat, queryClient, router, unreadCountKey]);

  if (!userId) return null;

  return (
    <div className="relative hidden sm:block" data-messaging-dropdown>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
        aria-label="Messages"
      >
        <MessageCircle className="size-4" />
        {hasUnread && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-favorite" />
        )}
      </button>

      {isOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />}

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-sidebar border border-sidebar-border rounded-2xl shadow-2xl z-[70] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-subhead font-semibold text-sidebar-foreground">Messages</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <NavbarMessagingDropdown userId={userId} onSelectConversation={handleOpenChat} />
          </div>

          <div className="border-t border-sidebar-border">
            <Link
              href="/user-dashboard/messaging"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-subhead font-semibold text-primary hover:bg-sidebar-accent transition-colors"
            >
              View all messages
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NavbarMessagingDropdown({
  userId,
  onSelectConversation,
}: {
  userId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}) {
  const { conversations: allConversations, isLoading } = useConversations({
    userId,
    scope: 'personal',
    limit: 50,
    enabled: !!userId,
  });

  const conversations = allConversations
    .filter((c) => c.messageCount > 0)
    .sort(
      (a, b) =>
        new Date(String(b.lastMessageAt)).getTime() - new Date(String(a.lastMessageAt)).getTime()
    )
    .slice(0, 5);

  const groups = Object.values(
    conversations.reduce((acc, conv) => {
      const key = conv.partner?.id || conv.otherParticipant?.id || 'unknown';
      if (!acc[key]) {
        acc[key] = { user: conv.partner || conv.otherParticipant, isPartner: !!conv.partner, conversations: [] };
      }
      acc[key].conversations.push(conv);
      return acc;
    }, {} as Record<string, { user: any; isPartner: boolean; conversations: Conversation[] }>)
  )
    .map((group) => ({
      ...group,
      conversations: [...group.conversations].sort(
        (a, b) =>
          new Date(String(b.lastMessageAt)).getTime() - new Date(String(a.lastMessageAt)).getTime()
      ),
    }))
    .sort((a, b) => {
      const aLatest = a.conversations[0]?.lastMessageAt;
      const bLatest = b.conversations[0]?.lastMessageAt;
      return new Date(String(bLatest ?? 0)).getTime() - new Date(String(aLatest ?? 0)).getTime();
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-14">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
        <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-subhead text-foreground/60">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="py-2 px-2">
      {groups.map((group) => (
        <GroupRow key={group.user?.id || 'unknown'} group={group} onSelect={onSelectConversation} />
      ))}
    </div>
  );
}

// ─── Group Row ────────────────────────────────────────────────────────────────

interface GroupRowProps {
  group: { user: any; isPartner: boolean; conversations: Conversation[] };
  onSelect: (conversation: Conversation) => void;
}

function GroupRow({ group, onSelect }: GroupRowProps) {
  const { user, isPartner, conversations } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = user?.name || 'User';
  const hasUnread = conversations.some((c) => c.unreadCount > 0);
  const isOnline = conversations.some((c) => c.otherParticipant?.isOnline);

  const handleRowClick = () => {
    setIsExpanded((v) => !v);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((v) => !v);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
    }
  };

  return (
    <div className="mb-1">
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-left cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="relative flex-shrink-0">
          {isPartner ? (
            <BrandAvatar logoUrl={user?.logo} brandName={displayName} size="sm" className="w-9 h-9" />
          ) : (
            <UserAvatar src={user?.avatarUrl} name={displayName} size="md" className="w-9 h-9" />
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border-2 border-sidebar" />
          )}
        </div>

        <span className={cn(
          'flex-1 text-subhead truncate',
          hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/90'
        )}>
          {displayName}
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasUnread && <span className="w-1.5 h-1.5 bg-favorite rounded-full" />}
          <button
            type="button"
            onClick={handleChevronClick}
            className="p-1 -m-1 rounded-md hover:bg-sidebar-accent"
            aria-label={isExpanded ? 'Collapse conversations' : 'Expand conversations'}
          >
            <ChevronRight className={cn(
              'w-4 h-4 text-muted-foreground/40 transition-transform',
              isExpanded && 'rotate-90'
            )} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-[22px] mb-2 pl-3.5 border-l border-sidebar-border/50 flex flex-col gap-1.5">
          {conversations.map((conv) => (
            <NestedItem key={conv.id} conversation={conv} onClick={() => onSelect(conv)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Nested Item ──────────────────────────────────────────────────────────────

function NestedItem({ conversation, onClick }: { conversation: Conversation; onClick: () => void }) {
  const { lastMessagePreview, lastMessageAt, unreadCount, listing } = conversation;
  const hasUnread = unreadCount > 0;

  const lastMessageDate = (() => {
    if (!lastMessageAt) return null;
    const d = lastMessageAt instanceof Date ? lastMessageAt : new Date(String(lastMessageAt));
    return isNaN(d.getTime()) ? null : d;
  })();

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors',
        hasUnread && 'bg-sidebar-accent/25'
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className={cn(
          'text-footnote truncate',
          hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/80'
        )}>
          {listing?.title || 'General'}
        </span>
        {lastMessageDate && (
          <span className="text-caption2 text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(lastMessageDate, { addSuffix: false })}
          </span>
        )}
      </div>
      <p className="text-caption1 truncate text-muted-foreground/60">
        {lastMessagePreview || 'No messages'}
      </p>
    </button>
  );
}

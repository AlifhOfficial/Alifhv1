/**
 * Navbar Messaging - Quick access to messages
 * Shows recent conversations with unread count badge
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useConversations, type Conversation } from '@/hooks/messaging';
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

  const { conversations: allConversations, isLoading } = useConversations({
    userId,
    scope: 'personal',
    limit: 50,
    enabled: !!userId,
  });

  const hasUnread = allConversations.some((c) => c.unreadCount > 0);
  const conversations = allConversations
    .filter((c) => c.messageCount > 0)
    .sort((a, b) => (b.unreadCount > 0 ? 1 : 0) - (a.unreadCount > 0 ? 1 : 0))
    .slice(0, 5);

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
    if (onOpenChat) { onOpenChat(conversation); return; }
    router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
  }, [onOpenChat, router]);

  const groups = Object.values(
    conversations.reduce((acc, conv) => {
      const key = conv.partner?.id || conv.otherParticipant?.id || 'unknown';
      if (!acc[key]) {
        acc[key] = { user: conv.partner || conv.otherParticipant, isPartner: !!conv.partner, conversations: [] };
      }
      acc[key].conversations.push(conv);
      return acc;
    }, {} as Record<string, { user: any; isPartner: boolean; conversations: Conversation[] }>)
  );

  if (!userId) return null;

  return (
    <div className="relative hidden sm:block" data-messaging-dropdown>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
        aria-label="Messages"
      >
        <MessageCircle className="size-4" />
        {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
      </button>

      {isOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />}

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-sidebar border border-sidebar-border rounded-2xl shadow-2xl z-[70] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-[15px] font-semibold text-sidebar-foreground">Messages</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground/60">No messages yet</p>
              </div>
            ) : (
              <div className="py-2 px-2">
                {groups.map((group) => (
                  <GroupRow key={group.user?.id || 'unknown'} group={group} onSelect={handleOpenChat} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-sidebar-border">
            <Link
              href="/user-dashboard/messaging"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-primary hover:bg-sidebar-accent transition-colors"
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

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-left"
      >
        <div className="relative flex-shrink-0">
          {isPartner ? (
            <BrandAvatar logoUrl={user?.logo} brandName={displayName} size="sm" className="w-9 h-9" />
          ) : (
            <UserAvatar src={user?.avatarUrl} name={displayName} size="md" className="w-9 h-9" />
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-sidebar" />
          )}
        </div>

        <span className={cn(
          'flex-1 text-sm truncate',
          hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/90'
        )}>
          {displayName}
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasUnread && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
          <ChevronRight className={cn(
            'w-4 h-4 text-muted-foreground/40 transition-transform',
            isExpanded && 'rotate-90'
          )} />
        </div>
      </button>

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
          'text-[13px] truncate',
          hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/80'
        )}>
          {listing?.title || 'General'}
        </span>
        {lastMessageDate && (
          <span className="text-[11px] text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(lastMessageDate, { addSuffix: false })}
          </span>
        )}
      </div>
      <p className="text-xs truncate text-muted-foreground/60">
        {lastMessagePreview || 'No messages'}
      </p>
    </button>
  );
}

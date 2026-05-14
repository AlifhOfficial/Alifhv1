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
import { MESSAGING_CONVERSATIONS_PAGE_SIZE } from '@alifh/shared';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type Scope = 'personal' | 'staff';
type NavGroupUser = NonNullable<Conversation['partner']> | NonNullable<Conversation['otherParticipant']>;

type NavGroup = {
  user: NavGroupUser | null;
  isPartner: boolean;
  conversations: Conversation[];
};

interface NavbarMessagingProps {
  userId?: string;
  showStaffScope?: boolean;
  onOpenChat?: (conversation: Conversation) => void;
}

export function NavbarMessaging({ userId, showStaffScope = false, onOpenChat }: NavbarMessagingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<Scope>('personal');
  const router = useRouter();

  const { conversations: personalConversations, isLoading: isLoadingPersonal } = useConversations({
    userId,
    scope: 'personal',
    limit: MESSAGING_CONVERSATIONS_PAGE_SIZE * 2,
    enabled: !!userId,
  });

  const { conversations: staffConversations, isLoading: isLoadingStaff } = useConversations({
    userId,
    scope: 'staff',
    limit: MESSAGING_CONVERSATIONS_PAGE_SIZE * 2,
    enabled: !!userId && showStaffScope,
  });

  const activeScope = showStaffScope ? scope : 'personal';
  const allConversations = activeScope === 'personal' ? personalConversations : staffConversations;
  const isLoading = activeScope === 'personal' ? isLoadingPersonal : isLoadingStaff;
  const personalUnread = personalConversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const staffUnread = showStaffScope ? staffConversations.reduce((sum, c) => sum + c.unreadCount, 0) : 0;

  const conversations = allConversations
    .filter((c) => c.messageCount > 0)
    .sort(
      (a, b) =>
        new Date(String(b.lastMessageAt)).getTime() - new Date(String(a.lastMessageAt)).getTime()
    )
    .slice(0, 5);

  const groups = Object.values(
    conversations.reduce((acc, conv) => {
      const isStaffScope = activeScope === 'staff';
      const groupUser = isStaffScope ? conv.otherParticipant : (conv.partner ?? conv.otherParticipant);
      const key = groupUser?.id || 'unknown';

      if (!acc[key]) {
        acc[key] = {
          user: groupUser as NavGroupUser | null,
          isPartner: !isStaffScope && !!conv.partner,
          conversations: [],
        };
      }
      acc[key].conversations.push(conv);
      return acc;
    }, {} as Record<string, NavGroup>)
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

  useEffect(() => {
    if (!showStaffScope && scope === 'staff') {
      setScope('personal');
    }
  }, [showStaffScope, scope]);

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
    const messagingBasePath = activeScope === 'staff'
      ? '/staff-dashboard/messaging'
      : '/user-dashboard/messaging';
    router.push(`${messagingBasePath}?conversationId=${conversation.id}`);
  }, [activeScope, onOpenChat, router]);

  if (!userId) return null;

  const displayUnread = personalUnread + staffUnread;

  return (
    <div className="relative hidden compact:block" data-messaging-dropdown>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
        aria-label="Messages"
      >
        <MessageCircle className="size-4" />
        {displayUnread > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-5 h-5 px-1 bg-favorite text-primary-foreground text-caption2 font-semibold rounded-full border-2 border-background tabular-nums">
            {displayUnread > 9 ? '9+' : displayUnread}
          </span>
        )}
      </button>

      {isOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />}

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-sidebar border border-sidebar-border rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col">
          {/* Tabs */}
          {showStaffScope ? (
            <div className="flex border-b border-sidebar-border">
              <button
                onClick={() => setScope('personal')}
                className={cn(
                  'flex-1 px-4 py-3 text-subhead font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
                  scope === 'personal'
                    ? 'text-sidebar-foreground border-b-2 border-sidebar-border'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground/80'
                )}
              >
                Personal
                {personalUnread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-favorite text-primary-foreground text-caption2 font-semibold rounded-full tabular-nums">
                    {personalUnread > 9 ? '9+' : personalUnread}
                  </span>
                )}
              </button>
              <button
                onClick={() => setScope('staff')}
                className={cn(
                  'flex-1 px-4 py-3 text-subhead font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
                  scope === 'staff'
                    ? 'text-sidebar-foreground border-b-2 border-sidebar-border'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground/80'
                )}
              >
                Staff
                {staffUnread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-favorite text-primary-foreground text-caption2 font-semibold rounded-full tabular-nums">
                    {staffUnread > 9 ? '9+' : staffUnread}
                  </span>
                )}
              </button>
            </div>
          ) : null}

          <div className="max-h-[400px] overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-subhead font-medium text-foreground/60">No messages yet</p>
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
              href={activeScope === 'staff' ? '/staff-dashboard/messaging' : '/user-dashboard/messaging'}
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

// ─── Group Row ────────────────────────────────────────────────────────────────

interface GroupRowProps {
  group: NavGroup;
  onSelect: (conversation: Conversation) => void;
}

function GroupRow({ group, onSelect }: GroupRowProps) {
  const { user, isPartner, conversations } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = user?.name || 'User';
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
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
            <BrandAvatar logoUrl={(user as NonNullable<Conversation['partner']>)?.logo} brandName={displayName} size="sm" className="w-9 h-9" />
          ) : (
            <UserAvatar src={(user as NonNullable<Conversation['otherParticipant']>)?.avatarUrl} name={displayName} size="md" className="w-9 h-9" />
          )}
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-sidebar bg-success" />
          )}
        </div>

        <span className={cn(
          'flex-1 text-subhead truncate',
          hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/90'
        )}>
          {displayName}
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {totalUnread > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-favorite text-primary-foreground text-caption2 font-semibold leading-none tabular-nums">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
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
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={cn(
            'text-footnote truncate',
            hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/80'
          )}>
            {listing?.title || 'General'}
          </span>
          {hasUnread && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-favorite text-primary-foreground text-caption2 font-semibold rounded-full flex-shrink-0 tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
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

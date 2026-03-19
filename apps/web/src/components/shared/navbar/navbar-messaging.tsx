/**
 * Navbar Messaging - Quick access to messages
 * Shows recent conversations with unread count badge
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { useConversations, useUnreadCount, type Conversation } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NavbarMessagingProps {
  userId?: string;
  onOpenChat: (conversation: Conversation) => void;
}

export function NavbarMessaging({ userId, onOpenChat }: NavbarMessagingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const MAX_DROPDOWN_CONVERSATIONS = 5;
  const { unreadCount } = useUnreadCount(userId, undefined, { enableFetch: false });
  const { conversations, isLoading } = useConversations({
    userId,
    scope: 'personal',
    limit: MAX_DROPDOWN_CONVERSATIONS,
    enabled: isOpen,
  });

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-messaging-dropdown]')) {
        setIsOpen(false);
      }
    };
    
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleOpenChat = useCallback((conversation: Conversation) => {
    setIsOpen(false);
    onOpenChat(conversation);
  }, [onOpenChat]);

  // Keep the dropdown aligned with the lightweight fetch: max 5 real conversations, no empty threads
  const visibleConversations = conversations
    .filter((conversation) => conversation.messageCount > 0)
    .slice(0, MAX_DROPDOWN_CONVERSATIONS);

  const groupedConversations = visibleConversations.reduce((groups, conversation) => {
    const key = conversation.partner?.id || conversation.otherParticipant?.id || 'unknown';
    if (!groups[key]) {
      groups[key] = {
        user: conversation.partner || conversation.otherParticipant,
        isPartner: !!conversation.partner,
        conversations: [],
      };
    }
    groups[key].conversations.push(conversation);
    return groups;
  }, {} as Record<string, { user: any; isPartner: boolean; conversations: Conversation[] }>);

  const allGroups = Object.values(groupedConversations);

  return (
    <div className="relative" data-messaging-dropdown>
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
        aria-label="Messages"
      >
        <MessageCircle className="size-4" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-96 bg-sidebar border border-sidebar-border rounded-xl shadow-xl z-[70] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
              Messages
            </h3>
            {unreadCount > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : allGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-[15px] font-semibold text-foreground/80">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Start a conversation from any listing
                </p>
              </div>
            ) : (
              <div className="py-1.5">
                {allGroups.map((group) => (
                  <ConversationGroup
                    key={group.user?.id || 'unknown'}
                    group={group}
                    onSelectConversation={handleOpenChat}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border">
            <Link
              href="/user-dashboard/messaging"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-primary hover:bg-sidebar-accent transition-colors"
            >
              View all messages
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Conversation Group (for same user/partner)
// ============================================================================

interface ConversationGroupProps {
  group: {
    user: any;
    isPartner: boolean;
    conversations: Conversation[];
  };
  onSelectConversation: (conversation: Conversation) => void;
}

function ConversationGroup({ group, onSelectConversation }: ConversationGroupProps) {
  const { user, isPartner, conversations } = group;
  const [isExpanded, setIsExpanded] = useState(conversations.length === 1);

  const displayName = user?.name || 'User';
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const hasUnread = totalUnread > 0;
  const isOnline = conversations.some((conversation) => conversation.otherParticipant?.isOnline);

  // If only one conversation, show it directly without grouping
  if (conversations.length === 1) {
    return (
      <ConversationPreviewItem
        conversation={conversations[0]}
        onClick={() => onSelectConversation(conversations[0])}
      />
    );
  }

  return (
    <div>
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full text-left px-4 py-3 hover:bg-sidebar-accent/50 transition-colors rounded-lg',
          'flex items-center gap-3'
        )}
      >
        <div className="relative flex-shrink-0">
          {isPartner ? (
            <BrandAvatar
              logoUrl={user?.logo}
              brandName={displayName}
              size="sm"
              className="w-10 h-10"
            />
          ) : (
            <UserAvatar
              src={user?.avatarUrl}
              name={displayName}
              size="md"
              className="w-10 h-10"
            />
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              'text-sm truncate',
              hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground'
            )}>
              {displayName}
            </h4>
            <span className="text-xs text-muted-foreground">
              ({conversations.length})
            </span>
            {hasUnread && (
              <span className="ml-auto flex-shrink-0 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>
        </div>
        <ChevronRight className={cn(
          'w-4 h-4 text-muted-foreground/60 transition-transform',
          isExpanded && 'rotate-90'
        )} />
      </button>

      {/* Expanded Conversations with connector lines */}
      {isExpanded && (
        <div className="ml-7 mt-1 mb-2 space-y-0.5">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="relative pl-6">
              {/* Smooth curved connector */}
              <svg 
                className="absolute left-0 top-0 w-5 h-6 text-muted-foreground/40"
                viewBox="0 0 20 24"
                fill="none"
              >
                <path 
                  d="M2 0 L2 12 Q2 18 10 18 L20 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <ConversationPreviewItem
                conversation={conversation}
                onClick={() => onSelectConversation(conversation)}
                isGrouped
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Conversation Preview Item
// ============================================================================

interface ConversationPreviewItemProps {
  conversation: Conversation;
  onClick: () => void;
  isGrouped?: boolean;
}

function ConversationPreviewItem({ conversation, onClick, isGrouped = false }: ConversationPreviewItemProps) {
  const {
    otherParticipant,
    lastMessagePreview,
    lastMessageAt,
    unreadCount,
    partner,
    listing,
  } = conversation;

  const displayName = partner?.name || otherParticipant?.name || 'User';
  const isPartnerBrand = !!partner;
  const hasUnread = unreadCount > 0;
  const isOnline = otherParticipant?.isOnline ?? false;

  const safeDate = (value: unknown): Date | null => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const lastMessageDate = safeDate(lastMessageAt);

  // Grouped/nested conversation style (shown under parent group)
  if (isGrouped) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left py-2 px-3 hover:bg-sidebar-accent/60 transition-colors rounded-md',
          hasUnread && 'bg-sidebar-accent/40'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Listing title or conversation context */}
          <span className={cn(
            'text-[13px] truncate flex-1',
            hasUnread ? 'font-semibold text-sidebar-foreground' : 'text-sidebar-foreground/90'
          )}>
            {listing?.title || 'General'}
          </span>
          
          {/* Time and unread badge */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {lastMessageDate && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(lastMessageDate, { addSuffix: false })}
              </span>
            )}
            {hasUnread && (
              <span className="w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>
        </div>
        
        {/* Message preview */}
        <p className={cn(
          'text-xs truncate mt-1',
          hasUnread ? 'text-muted-foreground' : 'text-muted-foreground/70'
        )}>
          {lastMessagePreview || 'No messages'}
        </p>
      </button>
    );
  }

  // Non-grouped conversation style (standalone)
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-sidebar-accent/50 transition-colors rounded-lg',
        hasUnread && 'bg-sidebar-accent/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {isPartnerBrand ? (
            <BrandAvatar
              logoUrl={partner?.logo}
              brandName={partner?.name || 'Partner'}
              size="sm"
              className="w-10 h-10"
            />
          ) : (
            <UserAvatar
              src={otherParticipant?.avatarUrl}
              name={displayName}
              size="md"
              className="w-10 h-10"
            />
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar" />
          )}
          
          {/* Unread indicator dot */}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-sidebar" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              className={cn(
                'text-sm truncate',
                hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground'
              )}
            >
              {displayName}
            </h4>
            {lastMessageDate && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(lastMessageDate, { addSuffix: false })}
              </span>
            )}
          </div>
          
          {/* Listing context */}
          {listing && (
            <p className="text-xs text-muted-foreground truncate mb-1">
              Re: {listing.title}
            </p>
          )}
          
          {/* Message preview */}
          <p
            className={cn(
              'text-[13px] truncate leading-normal',
              hasUnread ? 'text-sidebar-foreground/90' : 'text-muted-foreground/80'
            )}
          >
            {lastMessagePreview || 'No messages'}
          </p>
        </div>
      </div>
    </button>
  );
}

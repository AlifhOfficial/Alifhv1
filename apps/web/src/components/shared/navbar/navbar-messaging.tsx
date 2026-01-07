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
  
  // Only fetch conversations when dropdown is opened
  const { conversations, isLoading } = useConversations({ userId, scope: 'personal', enabled: isOpen });
  // Keep unread count always active for badge display
  const { unreadCount } = useUnreadCount(userId);

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

  // Get top 3 recent conversations
  const recentConversations = conversations?.slice(0, 3) ?? [];

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
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-sidebar border border-sidebar-border rounded-xl shadow-lg z-[70] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border">
            <h3 className="text-base font-semibold tracking-tight text-sidebar-foreground">
              Messages
            </h3>
            {unreadCount > 0 && (
              <span className="text-[13px] font-medium text-rose-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-[15px] font-medium text-muted-foreground">No messages yet</p>
                <p className="text-[13px] text-muted-foreground/70 mt-1.5 leading-relaxed">
                  Start a conversation from any listing
                </p>
              </div>
            ) : (
              <div className="py-1.5">
                {recentConversations.map((conversation) => (
                  <ConversationPreviewItem
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => handleOpenChat(conversation)}
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
              className="flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium text-primary hover:bg-sidebar-accent transition-colors"
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
// Conversation Preview Item
// ============================================================================

interface ConversationPreviewItemProps {
  conversation: Conversation;
  onClick: () => void;
}

function ConversationPreviewItem({ conversation, onClick }: ConversationPreviewItemProps) {
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

  const safeDate = (value: unknown): Date | null => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const lastMessageDate = safeDate(lastMessageAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors',
        hasUnread && 'bg-sidebar-accent/50'
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
                'text-[15px] truncate',
                hasUnread ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/90'
              )}
            >
              {displayName}
            </h4>
            {lastMessageDate && (
              <span className="text-[12px] text-muted-foreground/80 flex-shrink-0">
                {formatDistanceToNow(lastMessageDate, { addSuffix: false })}
              </span>
            )}
          </div>
          
          {/* Listing context */}
          {listing && (
            <p className="text-[12px] text-muted-foreground/70 truncate mb-0.5">
              Re: {listing.title}
            </p>
          )}
          
          {/* Message preview */}
          <p
            className={cn(
              'text-[14px] truncate leading-snug',
              hasUnread ? 'text-sidebar-foreground/80 font-medium' : 'text-muted-foreground/70'
            )}
          >
            {lastMessagePreview || 'No messages'}
          </p>
        </div>
      </div>
    </button>
  );
}

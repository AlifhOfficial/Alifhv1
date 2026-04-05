/**
 * User Conversation Group - Revvup Design System
 * Groups multiple conversations with the same customer/user under a collapsible header
 * Used in staff inbox to show all inquiries from the same customer
 */

'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { ConversationListItem } from './conversation-list-item';
import { cn } from '@/utils/cn';
import type { Conversation } from '@/hooks/messaging';

// Derived type from Conversation
type ConversationParticipant = NonNullable<Conversation['otherParticipant']>;

interface UserConversationGroupProps {
  user: ConversationParticipant;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  defaultExpanded?: boolean;
}

export function UserConversationGroup({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  defaultExpanded = false,
}: UserConversationGroupProps) {
  // Auto-expand if any conversation in this group is active
  const hasActiveConversation = conversations.some(c => c.id === activeConversationId);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasActiveConversation);
  
  // Calculate total unread for the group
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Get online status from any conversation with this user
  const isOnline = conversations.some(c => c.otherParticipant?.isOnline);

  return (
    <div>
      {/* User Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full py-3 px-3 text-left transition-colors duration-150 hover:bg-sidebar rounded-xl',
          'flex items-center gap-3'
        )}
      >
        {/* User Avatar with Online Indicator */}
        <div className="relative flex-shrink-0">
          <UserAvatar
            src={user.avatarUrl}
            name={user.name || 'User'}
            size="md"
            className="w-9 h-9"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-sidebar rounded-full" />
          )}
        </div>

        {/* User Name */}
        <span className={cn(
          'flex-1 text-subhead truncate',
          totalUnread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'
        )}>
          {user.name || 'Unknown User'}
        </span>

        {/* Right side: unread dot + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalUnread > 0 && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
          <ChevronRight className={cn(
            'w-4 h-4 text-muted-foreground/40 transition-transform',
            isExpanded && 'rotate-90'
          )} />
        </div>
      </button>
      
      {/* Nested Conversations */}
      {isExpanded && (
        <div className="ml-[22px] mt-0.5 mb-2 pl-4 border-l border-border/50 flex flex-col gap-1">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              inbox="staff"
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
}

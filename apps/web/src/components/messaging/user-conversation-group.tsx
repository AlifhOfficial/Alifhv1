/**
 * User Conversation Group - Alifh Design System
 * Groups multiple conversations with the same customer/user under a collapsible header
 * Used in staff inbox to show all inquiries from the same customer
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
        {/* User Avatar */}
        <UserAvatar
          src={user.avatarUrl}
          name={user.name || 'User'}
          size="md"
          className="w-9 h-9 flex-shrink-0"
        />
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground truncate">
              {user.name || 'Unknown User'}
            </h3>
            {conversations.length > 1 && (
              <span className="text-xs font-medium text-muted-foreground/50">
                {conversations.length}
              </span>
            )}
            {totalUnread > 0 && (
              <span className="w-2 h-2 flex-shrink-0 bg-red-500 rounded-full ml-auto" />
            )}
          </div>
        </div>
        
        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0 text-muted-foreground/60">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>
      
      {/* Nested Conversations */}
      {isExpanded && (
        <div className="ml-7 mt-1 mb-3 space-y-1">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="relative pl-6">
              {/* Smooth curved connector */}
              <svg 
                className="absolute left-0 top-0 w-5 h-7 text-muted-foreground/60"
                viewBox="0 0 20 28"
                fill="none"
              >
                <path 
                  d="M2 0 L2 14 Q2 22 10 22 L20 22" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <ConversationListItem
                conversation={conversation}
                inbox="staff"
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation(conversation.id)}
                isNested
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

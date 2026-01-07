/**
 * Partner Conversation Group - Alifh Design System
 * Groups multiple conversations with the same partner under a collapsible header
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { ConversationListItem } from './conversation-list-item';
import { cn } from '@/utils/cn';
import type { Conversation, ConversationPartner } from '@/hooks/messaging';

interface PartnerConversationGroupProps {
  partner: ConversationPartner;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  defaultExpanded?: boolean;
}

export function PartnerConversationGroup({
  partner,
  conversations,
  activeConversationId,
  onSelectConversation,
  defaultExpanded = false,
}: PartnerConversationGroupProps) {
  // Auto-expand if any conversation in this group is active
  const hasActiveConversation = conversations.some(c => c.id === activeConversationId);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasActiveConversation);
  
  // Calculate total unread for the group
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  
  // Get most recent message time
  const mostRecentAt = conversations.reduce((latest, c) => {
    const convTime = new Date(c.lastMessageAt).getTime();
    return convTime > latest ? convTime : latest;
  }, 0);

  return (
    <div>
      {/* Partner Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full py-3.5 px-4 text-left transition-colors duration-150 hover:bg-muted/25 rounded-xl',
          'flex items-center gap-3',
          hasActiveConversation && 'bg-muted/10'
        )}
      >
        {/* Partner Avatar */}
        <BrandAvatar
          logoUrl={partner.logo}
          brandName={partner.name}
          size="sm"
          className="w-10 h-10 flex-shrink-0"
        />
        
        {/* Partner Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground truncate">
              {partner.name}
            </h3>
            {conversations.length > 1 && (
              <small className="text-xs text-muted-foreground/70">
                ({conversations.length})
              </small>
            )}
            {totalUnread > 0 && (
              <small className="text-xs flex-shrink-0 w-5 h-5 font-semibold bg-red-500 text-white rounded-full flex items-center justify-center ml-auto">
                {totalUnread > 9 ? '9+' : totalUnread}
              </small>
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
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <ConversationListItem
                conversation={conversation}
                inbox="personal"
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

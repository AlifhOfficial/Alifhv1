/**
 * Partner Conversation Group - Revvup Design System
 * Groups multiple conversations with the same partner under a collapsible header
 */

'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { ConversationListItem } from './conversation-list-item';
import { cn } from '@/utils/cn';
import type { Conversation } from '@/hooks/messaging';
import Link from 'next/link';

// Derived type from Conversation
type ConversationPartner = NonNullable<Conversation['partner']>;

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
  const isOnline = conversations.some(c => c.otherParticipant?.isOnline);
  
  // Get most recent message time
  const _mostRecentAt = conversations.reduce((latest, c) => {
    const convTime = new Date(c.lastMessageAt).getTime();
    return convTime > latest ? convTime : latest;
  }, 0);

  return (
    <div>
      {/* Partner Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full py-3 px-3 text-left transition-colors duration-150 hover:bg-sidebar rounded-xl',
          'flex items-center gap-3'
        )}
      >
        {/* Partner Avatar */}
        <div className="relative flex-shrink-0">
          <BrandAvatar
            logoUrl={partner.logo}
            brandName={partner.name}
            size="sm"
            className="w-9 h-9"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-sidebar rounded-full" />
          )}
        </div>

        {/* Partner Name */}
        <Link
          href={`/listings?partnerId=${partner.id}&partnerName=${encodeURIComponent(partner.name)}&sort=relevance`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex-1 text-subhead truncate hover:text-primary hover:underline transition-colors',
            totalUnread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'
          )}
        >
          {partner.name}
        </Link>

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
              inbox="personal"
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

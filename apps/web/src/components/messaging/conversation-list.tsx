/**
 * Conversation List - Alifh Design System
 * Sidebar showing all user conversations
 * 
 * For personal inbox:
 * - Direct (P2P) conversations shown flat
 * - Partner conversations grouped by partner with nested listing-based chats
 * 
 * For staff inbox:
 * - Customer inquiries grouped by user with nested listing-based chats
 * - V1: Team chat disabled for launch
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ConversationListItem } from './conversation-list-item';
import { PartnerConversationGroup } from './partner-conversation-group';
import { UserConversationGroup } from './user-conversation-group';
import type { Conversation, ConversationPartner, ConversationParticipant } from '@/hooks/messaging';
import { cn } from '@/utils/cn';

interface ConversationListProps {
  inbox?: 'personal' | 'staff';
  conversations: Conversation[];
  isLoading: boolean;
  totalUnread: number;
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
}

export function ConversationList({
  inbox = 'personal',
  conversations,
  isLoading,
  totalUnread,
  activeConversationId,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const displayName =
      inbox === 'personal' && conv.partner ? conv.partner.name : conv.otherParticipant?.name;
    return (
      displayName?.toLowerCase().includes(query) ||
      conv.listing?.title?.toLowerCase().includes(query) ||
      conv.lastMessagePreview?.toLowerCase().includes(query)
    );
  });

  // For personal inbox, separate direct conversations from partner conversations
  // Partner conversations get grouped by partner
  // For staff inbox, group customer inquiries by user
  const { directConversations, partnerGroups, userGroups } = useMemo(() => {
    if (inbox === 'staff') {
      // Staff inbox: group by customer (user)
      // V1: Team chat disabled - only customer inquiries
      const userMap = new Map<string, { user: ConversationParticipant; conversations: Conversation[] }>();

      for (const conv of filteredConversations) {
        // Skip partner_internal (team chat) - disabled for V1
        if (conv.type === 'partner_internal') continue;
        
        if (conv.otherParticipant) {
          // Customer inquiry - group by userId
          const userId = conv.otherParticipant.id;
          const existing = userMap.get(userId);
          if (existing) {
            existing.conversations.push(conv);
          } else {
            userMap.set(userId, {
              user: conv.otherParticipant,
              conversations: [conv],
            });
          }
        }
      }

      // Sort user groups by most recent message
      const groups = Array.from(userMap.values()).sort((a, b) => {
        const aLatest = Math.max(...a.conversations.map(c => new Date(c.lastMessageAt).getTime()));
        const bLatest = Math.max(...b.conversations.map(c => new Date(c.lastMessageAt).getTime()));
        return bLatest - aLatest;
      });

      // Sort conversations within each group by most recent
      groups.forEach(group => {
        group.conversations.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });

      return { directConversations: [], partnerGroups: [], userGroups: groups };
    }

    // Personal inbox: group by partner
    const direct: Conversation[] = [];
    const partnerMap = new Map<string, { partner: ConversationPartner; conversations: Conversation[] }>();

    for (const conv of filteredConversations) {
      // Direct/P2P conversations have type 'direct' OR no partnerId
      if (conv.type === 'direct' || !conv.partnerId || !conv.partner) {
        direct.push(conv);
      } else {
        // Partner conversation - group by partnerId
        const existing = partnerMap.get(conv.partnerId);
        if (existing) {
          existing.conversations.push(conv);
        } else {
          partnerMap.set(conv.partnerId, {
            partner: conv.partner,
            conversations: [conv],
          });
        }
      }
    }

    // Sort partner groups by most recent message
    const groups = Array.from(partnerMap.values()).sort((a, b) => {
      const aLatest = Math.max(...a.conversations.map(c => new Date(c.lastMessageAt).getTime()));
      const bLatest = Math.max(...b.conversations.map(c => new Date(c.lastMessageAt).getTime()));
      return bLatest - aLatest;
    });

    // Sort conversations within each group by most recent
    groups.forEach(group => {
      group.conversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    });

    return { directConversations: direct, partnerGroups: groups, userGroups: [] };
  }, [filteredConversations, inbox]);

  // Combine for sorting: interleave based on most recent activity
  const sortedItems = useMemo(() => {
    if (inbox === 'staff') {
      // Staff inbox: customer groups only (no team chat in V1)
      type StaffListItem = 
        | { type: 'user-group'; user: ConversationParticipant; conversations: Conversation[] };

      const items: StaffListItem[] = [];

      // Add user groups
      for (const group of userGroups) {
        items.push({ type: 'user-group', ...group });
      }

      return { type: 'staff-grouped' as const, items };
    }

    // Personal inbox
    type ListItem = 
      | { type: 'direct'; conversation: Conversation }
      | { type: 'partner-group'; partner: ConversationPartner; conversations: Conversation[] };

    const items: ListItem[] = [];

    // Add direct conversations
    for (const conv of directConversations) {
      items.push({ type: 'direct', conversation: conv });
    }

    // Add partner groups
    for (const group of partnerGroups) {
      items.push({ type: 'partner-group', ...group });
    }

    // Sort by most recent activity
    items.sort((a, b) => {
      const aTime = a.type === 'direct'
        ? new Date(a.conversation.lastMessageAt).getTime()
        : Math.max(...a.conversations.map(c => new Date(c.lastMessageAt).getTime()));
      const bTime = b.type === 'direct'
        ? new Date(b.conversation.lastMessageAt).getTime()
        : Math.max(...b.conversations.map(c => new Date(c.lastMessageAt).getTime()));
      return bTime - aTime;
    });

    return { type: 'grouped' as const, items };
  }, [inbox, userGroups, directConversations, partnerGroups]);

  return (
    <div className={cn('flex flex-col h-full min-h-0 bg-background border-r border-border', className)}>
      {/* Header */}
      <div className="p-5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2>Messages</h2>
          {totalUnread > 0 && (
            <small className="bg-blue-500 text-white font-medium px-2 py-0.5 rounded-full min-w-[18px] text-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </small>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 rounded-xl transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              <p className="text-muted-foreground">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
            </div>
          </div>
        ) : sortedItems.type === 'staff-grouped' ? (
          // Staff inbox: grouped by customer (V1: no team chat)
          <div className="px-2 py-2 space-y-1">
            {sortedItems.items.map((item) => (
              <UserConversationGroup
                key={item.user.id}
                user={item.user}
                conversations={item.conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={onSelectConversation}
              />
            ))}
          </div>
        ) : (
          // Personal inbox: grouped by partner + direct chats
          <div className="px-2 py-2 space-y-1">
            {sortedItems.items.map((item) =>
              item.type === 'direct' ? (
                <ConversationListItem
                  key={item.conversation.id}
                  conversation={item.conversation}
                  inbox={inbox}
                  isActive={item.conversation.id === activeConversationId}
                  onClick={() => onSelectConversation(item.conversation.id)}
                />
              ) : (
                <PartnerConversationGroup
                  key={item.partner.id}
                  partner={item.partner}
                  conversations={item.conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={onSelectConversation}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

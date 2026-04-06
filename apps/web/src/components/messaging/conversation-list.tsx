/**
 * Conversation List - Revvup Design System
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

import { useState, useMemo, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Search, MessageCircle, PanelLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerConversationGroup } from './partner-conversation-group';
import { UserConversationGroup } from './user-conversation-group';
import type { Conversation } from '@/hooks/messaging';
import { cn } from '@/utils/cn';

// Derived types from Conversation
type ConversationPartner = NonNullable<Conversation['partner']>;
type ConversationParticipant = NonNullable<Conversation['otherParticipant']>;

function lastMessageTime(value: Conversation['lastMessageAt']) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function latestConversationTime(conversations: Conversation[]) {
  return Math.max(...conversations.map((c) => lastMessageTime(c.lastMessageAt)));
}

interface ConversationListProps {
  inbox?: 'personal' | 'staff';
  conversations: Conversation[];
  isLoading: boolean;
  totalUnread: number;
  activeConversationId?: string;
  listOpen: boolean;
  onListToggle: (open: boolean) => void;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
  // Pagination
  hasMore?: boolean;
  isFetchingMore?: boolean;
  fetchMore?: () => void;
}

export function ConversationList({
  inbox = 'personal',
  conversations,
  isLoading,
  totalUnread,
  activeConversationId,
  listOpen,
  onListToggle,
  onSelectConversation,
  className,
  hasMore = false,
  isFetchingMore = false,
  fetchMore,
}: ConversationListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSetSearchQuery = useDebouncedCallback((v: string) => setSearchQuery(v), 300);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearchQuery(value);
  };

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll trigger
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetchingMore || !fetchMore) return;
    
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Trigger when within 200px of bottom
    if (scrollBottom < 200) {
      fetchMore();
    }
  }, [hasMore, isFetchingMore, fetchMore]);

  // Filter conversations by search query AND only show conversations with messages
  const filteredConversations = conversations.filter((conv) => {
    // Don't show conversations with no messages (user backed off before sending)
    if (conv.messageCount === 0) return false;
    
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
  const { directConversations: _directConversations, partnerGroups, userGroups } = useMemo(() => {
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

      // Sort user groups by most recent activity
      const groups = Array.from(userMap.values()).sort((a, b) => {
        return latestConversationTime(b.conversations) - latestConversationTime(a.conversations);
      });

      // Sort conversations within each group by most recent activity
      groups.forEach(group => {
        group.conversations.sort((a, b) => {
          return lastMessageTime(b.lastMessageAt) - lastMessageTime(a.lastMessageAt);
        });
      });

      return { directConversations: [], partnerGroups: [], userGroups: groups };
    }

    // Personal inbox: group by partner OR by user (for multiple convos with same person)
    const partnerMap = new Map<string, { partner: ConversationPartner; conversations: Conversation[] }>();
    const userMap = new Map<string, { user: ConversationParticipant; conversations: Conversation[] }>();

    for (const conv of filteredConversations) {
      if (conv.partnerId && conv.partner) {
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
      } else if (conv.otherParticipant) {
        // User conversation - group by other user ID
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

    // Sort partner groups by most recent activity
    const partnerGroups = Array.from(partnerMap.values()).sort((a, b) => {
      return latestConversationTime(b.conversations) - latestConversationTime(a.conversations);
    });

    // Sort user groups by most recent activity
    const userGroups = Array.from(userMap.values()).sort((a, b) => {
      return latestConversationTime(b.conversations) - latestConversationTime(a.conversations);
    });

    // Sort conversations within each group by most recent activity
    partnerGroups.forEach(group => {
      group.conversations.sort((a, b) => {
        return lastMessageTime(b.lastMessageAt) - lastMessageTime(a.lastMessageAt);
      });
    });

    userGroups.forEach(group => {
      group.conversations.sort((a, b) => {
        return lastMessageTime(b.lastMessageAt) - lastMessageTime(a.lastMessageAt);
      });
    });

    return { directConversations: [], partnerGroups, userGroups };
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
      | { type: 'user-group'; user: ConversationParticipant; conversations: Conversation[] }
      | { type: 'partner-group'; partner: ConversationPartner; conversations: Conversation[] };

    const items: ListItem[] = [];

    // Add user groups
    for (const group of userGroups) {
      items.push({ type: 'user-group', ...group });
    }

    // Add partner groups
    for (const group of partnerGroups) {
      items.push({ type: 'partner-group', ...group });
    }

    // Sort by most recent activity
    items.sort((a, b) => {
      return latestConversationTime(b.conversations) - latestConversationTime(a.conversations);
    });

    return { type: 'grouped' as const, items };
  }, [inbox, userGroups, partnerGroups]);

  return (
    <div className={cn(
      'flex flex-col h-full w-full min-h-0 bg-background transition-all duration-200 overscroll-contain',
      !listOpen && 'w-0 overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <h1 className="text-callout sm:text-headline font-semibold text-foreground">Messages</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onListToggle(false)}
              className={cn(
                "hidden lg:block p-1 sm:p-1.5 -mr-1 text-muted-foreground/60 hover:text-foreground transition-all duration-200",
                !listOpen && "opacity-0 pointer-events-none w-0 p-0 -mr-0"
              )}
              title="Hide messages"
              aria-hidden={!listOpen}
              tabIndex={listOpen ? 0 : -1}
            >
              <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Search - only show when expanded */}
        {listOpen && (
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-caption1 sm:text-subhead font-medium bg-muted/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:bg-muted rounded-lg transition-colors"
            />
          </div>
        )}
      </div>

      {/* Conversations List - only show when expanded */}
      {listOpen && (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain" onScroll={handleScroll}>
        {isLoading ? (
          <div className="px-2 py-2 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3 px-3">
                <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-sidebar flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/40" />
              </div>
              <p className="text-caption1 sm:text-subhead font-medium text-muted-foreground/70">
                {searchQuery ? 'No results' : 'No messages'}
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
          // Personal inbox: grouped by user + partner
          <div className="px-2 py-2 space-y-1">
            {sortedItems.items.map((item) => {
              if (item.type === 'user-group') {
                return (
                  <UserConversationGroup
                    key={item.user.id}
                    user={item.user}
                    conversations={item.conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={onSelectConversation}
                  />
                );
              }
              return (
                <PartnerConversationGroup
                  key={item.partner.id}
                  partner={item.partner}
                  conversations={item.conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={onSelectConversation}
                />
              );
            })}
          </div>
        )}
        
        {/* Load more indicator */}
        {isFetchingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Scroll trigger sentinel */}
        {hasMore && !isFetchingMore && (
          <div ref={loadMoreRef} className="h-1" />
        )}
      </div>
      )}
    </div>
  );
}

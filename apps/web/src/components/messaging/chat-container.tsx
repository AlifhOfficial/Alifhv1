/**
 * Chat Container - Revvup Design System
 * Conversation list + chat window layoutsxs
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MessageCircle, PanelLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/messaging';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/utils/cn';
import type { Conversation, InitialMessagesData } from '@/hooks/messaging';

interface ChatContainerProps {
  userId: string;
  inbox?: 'personal' | 'staff';
  className?: string;
  initialData?: {
    conversations: Conversation[];
    totalUnread: number;
    hasMore: boolean;
  };
  initialMessages?: {
    conversationId: string;
    data: InitialMessagesData;
  };
}

function ChatContainerInner({ userId, inbox = 'personal', className, initialData, initialMessages }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const urlConversationId = searchParams?.get('conversationId');
  
  // Derive selected ID from URL, with local override for user selection
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(undefined);
  const [showMobileOverride, setShowMobileOverride] = useState<boolean | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [selectionVersion, setSelectionVersion] = useState(0);
  // Track which IDs we've already tried to refetch (prevent infinite loop)
  const [refetchedIds, setRefetchedIds] = useState<Set<string>>(new Set());
  
  // URL takes precedence, but allow local selection to override
  const selectedId = urlConversationId || localSelectedId;
  // Show mobile if URL has conversation OR user manually selected one
  const showMobile = showMobileOverride ?? !!selectedId;

  // useConversations includes real-time WebSocket updates for messages, unread counts, and sorting
  const { conversations, isLoading, totalUnread, refetch, hasMore, isFetchingMore, fetchMore } = useConversations({
    userId,
    scope: inbox,
    limit: 50,
    initialData,
  });

  // Fetch if conversation not in list (newly created) - but only once per ID
  useEffect(() => {
    if (selectedId && !isLoading && !refetchedIds.has(selectedId)) {
      const exists = conversations.some(c => c.id === selectedId);
      if (!exists) {
        setRefetchedIds(prev => new Set(prev).add(selectedId));
        refetch();
      }
    }
  }, [selectedId, conversations, isLoading, refetch, refetchedIds]);

  const selected = conversations.find(c => c.id === selectedId);

  const handleClose = () => {
    setLocalSelectedId(undefined);
    setShowMobileOverride(false);
    setListOpen(true); // Reopen the list when closing chat
    
    // Clear URL param if present (otherwise close button won't work when opened via URL)
    if (urlConversationId && pathname) {
      router.replace(pathname, { scroll: false });
    }
  };

  return (
    <div className={cn('flex h-full min-h-0 lg:gap-3 overflow-hidden overscroll-contain', className)}>
      {/* List Panel - Rounded window like sidebar on desktop, full on mobile */}
      <div className={cn(
        'flex-shrink-0 min-h-0 transition-all duration-200 overflow-hidden',
        'rounded-xl bg-background',
        listOpen ? 'w-full lg:w-80 xl:w-96' : 'w-0',
        showMobile && 'hidden lg:flex'
      )}>
        <ConversationList
          inbox={inbox}
          conversations={conversations}
          isLoading={isLoading}
          totalUnread={totalUnread}
          activeConversationId={selectedId}
          listOpen={listOpen}
          onListToggle={setListOpen}
          onSelectConversation={(id) => {
            setSelectionVersion((v) => v + 1);
            queryClient.invalidateQueries({
              queryKey: queryKeys.messaging.messages(id),
              exact: true,
              refetchType: 'none',
            });
            setLocalSelectedId(id);
            setShowMobileOverride(true);
            // Update URL for consistency (back button, refresh, sharing)
            if (pathname) {
              router.replace(`${pathname}?conversationId=${id}`, { scroll: false });
            }
          }}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          fetchMore={fetchMore}
        />
      </div>

      {/* Chat Panel - Rounded window like sidebar on desktop, clean on mobile */}
      <div className={cn(
        'flex-1 min-w-0 min-h-0 hidden lg:flex relative overflow-hidden',
        'lg:rounded-xl lg:border lg:border-border bg-background lg:shadow-sm',
        showMobile && 'flex'
      )}>
          {/* Show list button when collapsed AND no chat selected */}
          {!listOpen && !selected && !selectedId && (
            <button
              onClick={() => setListOpen(true)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 rounded-lg shadow-sm"
              title="Show messages"
            >
              <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
          {selected ? (
            <ChatWindow
              key={`${selected.id}:${selectionVersion}`}
              conversationId={selected.id}
              userId={userId}
              conversationType={selected.type}
              otherParticipant={selected.otherParticipant || undefined}
              listing={selected.listing || undefined}
              partner={selected.partner || undefined}
              unreadCount={selected.unreadCount}
              myLastReadAt={selected.myLastReadAt}
              inbox={inbox}
              onBack={handleClose}
              initialMessages={initialMessages?.conversationId === selected.id ? initialMessages.data : undefined}
            />
          ) : selectedId && isLoading ? (
            // Loading state when conversation ID is selected but not yet in list
            <div className="flex flex-col h-full w-full">
              {/* Header skeleton */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              {/* Messages skeleton */}
              <div className="flex-1 p-4 flex flex-col-reverse gap-2 sm:gap-3">
                <Skeleton className="h-9 w-36 rounded-2xl rounded-br-md self-end" />
                <Skeleton className="h-12 w-44 rounded-2xl rounded-bl-md self-start" />
                <Skeleton className="h-8 w-28 rounded-2xl rounded-br-md self-end" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-sidebar/30">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-sidebar/80 flex items-center justify-center border border-border/30">
                  <MessageCircle className="w-7 h-7 sm:w-9 sm:h-9 text-muted-foreground/50 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-subhead sm:text-callout font-semibold text-foreground/80">No conversation selected</p>
                  <p className="text-caption1 sm:text-subhead text-muted-foreground/60">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

export function ChatContainer(props: ChatContainerProps) {
  return (
    <Suspense fallback={
      <div className={cn('flex h-full min-h-0 gap-3 overflow-hidden items-center justify-center rounded-xl border border-border bg-background shadow-sm', props.className)}>
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 stroke-[1.5] animate-pulse" />
      </div>
    }>
      <ChatContainerInner {...props} />
    </Suspense>
  );
}

/**
 * Chat Container - Alifh Design System
 * Conversation list + chat window layout
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MessageCircle, PanelLeft, Loader2 } from 'lucide-react';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { useConversations } from '@/hooks/messaging';
import { cn } from '@/utils/cn';

interface ChatContainerProps {
  userId: string;
  inbox?: 'personal' | 'staff';
  className?: string;
}

function ChatContainerInner({ userId, inbox = 'personal', className }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlConversationId = searchParams?.get('conversationId');
  
  // Derive selected ID from URL, with local override for user selection
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(undefined);
  const [showMobileOverride, setShowMobileOverride] = useState<boolean | null>(null);
  const [listOpen, setListOpen] = useState(true);
  // Track which IDs we've already tried to refetch (prevent infinite loop)
  const [refetchedIds, setRefetchedIds] = useState<Set<string>>(new Set());
  
  // URL takes precedence, but allow local selection to override
  const selectedId = urlConversationId || localSelectedId;
  // Show mobile if URL has conversation OR user manually selected one
  const showMobile = showMobileOverride ?? !!selectedId;

  // useConversations includes real-time WebSocket updates for messages, unread counts, and sorting
  const { conversations, isLoading, totalUnread, refetch } = useConversations({ userId, scope: inbox, limit: 50 });

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
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden border-t border-border/50', className)}>
      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* List - Full width on mobile when visible, fixed width on desktop */}
        <div className={cn(
          'flex-shrink-0 transition-all duration-200',
          listOpen ? 'w-full lg:w-80 xl:w-96' : 'w-0 lg:w-0',
          showMobile && 'hidden lg:block'
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
              setLocalSelectedId(id);
              setShowMobileOverride(true);
              // Update URL for consistency (back button, refresh, sharing)
              if (pathname) {
                router.replace(`${pathname}?conversationId=${id}`, { scroll: false });
              }
            }}
          />
        </div>

        {/* Chat - Full width on mobile, flex on desktop */}
        <div className={cn('flex-1 min-w-0 hidden lg:flex relative', showMobile && 'flex')}>
          {/* Show list button when collapsed AND no chat selected */}
          {!listOpen && !selected && !selectedId && (
            <button
              onClick={() => setListOpen(true)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 rounded-lg shadow-sm"
              title="Show messages"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          {selected ? (
            <ChatWindow
              key={selected.id}
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
            />
          ) : selectedId && isLoading ? (
            // Loading state when conversation ID is selected but not yet in list
            <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center h-full w-full bg-background">
              <div className="text-center space-y-3 sm:space-y-4">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground animate-spin" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground/70">Loading conversation...</p>
              </div>
            </div>
          ) : (
            <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center h-full w-full bg-background">
              <div className="text-center space-y-3 sm:space-y-4">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/40 stroke-[1.5]" />
                <p className="text-xs sm:text-sm font-medium text-muted-foreground/70">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatContainer(props: ChatContainerProps) {
  return (
    <Suspense fallback={
      <div className={cn('flex h-full min-h-0 flex-col overflow-hidden items-center justify-center', props.className)}>
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 stroke-[1.5] animate-pulse" />
      </div>
    }>
      <ChatContainerInner {...props} />
    </Suspense>
  );
}

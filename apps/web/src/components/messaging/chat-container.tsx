/**
 * Chat Container - Alifh Design System
 * Conversation list + chat window layout
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, PanelLeft } from 'lucide-react';
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
  const urlConversationId = searchParams?.get('conversationId');
  
  const [selectedId, setSelectedId] = useState<string | undefined>(urlConversationId || undefined);
  const [showMobile, setShowMobile] = useState(!!urlConversationId);
  const [listOpen, setListOpen] = useState(true);

  const { conversations, isLoading, totalUnread } = useConversations({ userId, scope: inbox });

  useEffect(() => {
    if (urlConversationId) {
      setSelectedId(urlConversationId);
      setShowMobile(true);
    }
  }, [urlConversationId]);

  const selected = conversations.find(c => c.id === selectedId);

  const handleClose = () => {
    setSelectedId(undefined);
    setShowMobile(false);
    setListOpen(true); // Reopen the list when closing chat
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden border-t border-border/50', className)}>
      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* List */}
        <div className={cn(
          'flex-shrink-0 transition-all duration-200',
          listOpen ? 'w-full lg:w-96' : 'w-0 lg:w-0',
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
            onSelectConversation={(id) => { setSelectedId(id); setShowMobile(true); }}
          />
        </div>

        {/* Chat */}
        <div className={cn('flex-1 min-w-0 hidden lg:flex relative', showMobile && 'flex')}>
          {/* Show list button when collapsed AND no chat selected */}
          {!listOpen && !selected && (
            <button
              onClick={() => setListOpen(true)}
              className="absolute top-4 left-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 rounded-lg shadow-sm"
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
              inbox={inbox}
              onBack={handleClose}
            />
          ) : (
            <div className="min-h-[400px] flex items-center justify-center h-full w-full bg-background">
              <div className="text-center space-y-4">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 stroke-[1.5]" />
                <p className="text-[15px] text-muted-foreground">such empty ZZZZ</p>
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

/**
 * Chat Container - Alifh Design System
 * Conversation list + chat window layout
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { WebSocketStatus } from './websocket-status';
import { useConversations } from '@/hooks/messaging';
import { cn } from '@/utils/cn';

interface ChatContainerProps {
  userId: string;
  inbox?: 'personal' | 'staff';
  className?: string;
}

export function ChatContainer({ userId, inbox = 'personal', className }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const urlConversationId = searchParams?.get('conversationId');
  
  const [selectedId, setSelectedId] = useState<string | undefined>(urlConversationId || undefined);
  const [showMobile, setShowMobile] = useState(!!urlConversationId);

  const { conversations, isLoading, totalUnread } = useConversations({ userId, scope: inbox });

  useEffect(() => {
    if (urlConversationId) {
      setSelectedId(urlConversationId);
      setShowMobile(true);
    }
  }, [urlConversationId]);

  const selected = conversations.find(c => c.id === selectedId);

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
      {/* Status */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-4 py-2">
        <WebSocketStatus showText />
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* List */}
        <div className={cn('w-full lg:w-96 flex-shrink-0', showMobile && 'hidden lg:block')}>
          <ConversationList
            inbox={inbox}
            conversations={conversations}
            isLoading={isLoading}
            totalUnread={totalUnread}
            activeConversationId={selectedId}
            onSelectConversation={(id) => { setSelectedId(id); setShowMobile(true); }}
          />
        </div>

        {/* Chat */}
        <div className={cn('flex-1 min-w-0 hidden lg:flex', showMobile && 'flex')}>
          {selected ? (
            <ChatWindow
              conversationId={selected.id}
              userId={userId}
              conversationType={selected.type}
              otherParticipant={selected.otherParticipant || undefined}
              listing={selected.listing || undefined}
              partner={selected.partner || undefined}
              inbox={inbox}
              onBack={() => setShowMobile(false)}
            />
          ) : (
            <div className="min-h-[400px] flex items-center justify-center h-full w-full bg-background">
              <div className="text-center space-y-3">
                <svg className="w-16 h-16 mx-auto text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <p className="text-sm text-muted-foreground">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Messaging Module - Mobile Chat Overlay Component
 * Full-screen chat interface for mobile devices
 */

"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  X,
  ArrowLeft,
  User,
  MoreHorizontal
} from 'lucide-react';
import { useChatWindows, useChatWindowStore } from '@/stores/useChatWindowStore';
import { MessageThread } from '../MessageThread';
import { MessageInput } from '../MessageInput';
import { UserStatus } from './UserStatus';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSocket } from '@/hooks/use-socket';
import { cn } from '@/lib/utils';

export function MobileChatOverlay() {
  const windows = useChatWindows();
  const { closeChatWindow, markAsRead, updateLastActivity } = useChatWindowStore();
  const { user: currentUser } = useCurrentUser();
  const [selectedWindow, setSelectedWindow] = useState<ReturnType<typeof useChatWindows>[0] | null>(null);

  // Socket.IO integration for typing indicators
  const { isConnected, startTyping, stopTyping } = useSocket({
    userId: currentUser?.id,
  });

  // Auto-select the first window that's not minimized
  useEffect(() => {
    const activeWindow = windows.find(w => !w.isMinimized);
    if (activeWindow && !selectedWindow) {
      setSelectedWindow(activeWindow);
    }
  }, [windows, selectedWindow]);

  const handleClose = () => {
    if (selectedWindow) {
      closeChatWindow(selectedWindow.conversationId);
      setSelectedWindow(null);
    }
  };

  const handleBack = () => {
    setSelectedWindow(null);
  };

  if (windows.length === 0) {
    return null;
  }

  const otherParticipant = selectedWindow?.conversation.participants.find((p: any) => 
    p.id !== currentUser?.id
  ) || selectedWindow?.conversation.participants[0];

  if (windows.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose} />
        <div className="relative h-full w-full bg-background flex flex-col safe-area-inset-top safe-area-inset-bottom" style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {!selectedWindow ? (
            /* Window Selection */
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
                <h2 className="text-lg font-semibold">Active Chats</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {windows.map((window) => {
                  const participant = window.conversation.participants.find((p: any) => 
                    p.id !== window.conversation.participantIds[0]
                  ) || window.conversation.participants[0];
                  
                  return (
                    <div
                      key={window.conversationId}
                      className="flex items-center gap-4 px-4 py-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedWindow(window)}
                    >
                      {participant?.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-12 h-12 object-cover rounded-full shadow-sm border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shadow-sm border border-border">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">
                          {participant?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {window.conversation.lastMessagePreview || 'No recent messages'}
                        </p>
                      </div>
                      
                      {window.unreadCount > 0 && (
                        <span className="bg-alifh-blue text-white text-sm px-2 py-1 rounded-full min-w-[24px] text-center font-medium">
                          {window.unreadCount > 99 ? '99+' : window.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Chat View */
            <>
              {/* Header */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {otherParticipant?.avatar ? (
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="w-8 h-8 object-cover rounded-full shadow-sm border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shadow-sm border border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {otherParticipant?.name || 'Unknown User'}
                  </h3>
                  <UserStatus 
                    userId={otherParticipant?.id || ''} 
                    lastActiveAt={otherParticipant?.lastActiveAt}
                    size="sm"
                    variant="full"
                    showText={true}
                  />
                </div>
                
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages - Use existing MessageThread component */}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId={selectedWindow.conversationId}
                  userId={currentUser?.id || ''}
                  onMessagesRead={(messageIds) => {
                    // Mark as read when messages are seen
                    markAsRead(selectedWindow.conversationId);
                  }}
                />
              </div>

              {/* Input - Use existing MessageInput component */}
              <div className="border-t border-border">
                <MessageInput
                  conversationId={selectedWindow.conversationId}
                  userId={currentUser?.id || ''}
                  userName={currentUser?.name || 'User'}
                  startTyping={startTyping}
                  stopTyping={stopTyping}
                  onMessageSent={() => {
                    // Update last activity when message is sent
                    updateLastActivity(selectedWindow.conversationId, new Date());
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

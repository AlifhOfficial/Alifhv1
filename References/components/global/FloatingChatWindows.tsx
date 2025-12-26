/**
 * Messaging Module - Floating Chat Windows
 * Using existing components with floating styling
 */

"use client";

import { useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { useChatWindowStore } from '@/stores/useChatWindowStore';
import { MessageThread } from '../MessageThread';
import { MessageInput } from '../MessageInput';
import { ConversationHeader } from '../ConversationHeader';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useSocket } from '@/hooks/use-socket';
import type { ConversationResponseDTO } from '@/modules/messaging';
import { cn } from '@/lib/utils';
import { useSharedUserStatus } from '@/hooks/use-shared-user-status';
import { formatDistanceToNow } from 'date-fns';
import { Zap, Moon, Cloud, Heart, Activity, Flame, Sparkles } from 'lucide-react';

interface FloatingConversationHeaderProps {
  conversation: ConversationResponseDTO;
  currentUserId: string;
}

function FloatingConversationHeader({ conversation, currentUserId }: FloatingConversationHeaderProps) {
  const { userStatus, updateUserStatus } = useSharedUserStatus();
  
  // Get other participant
  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
  
  // Initialize user status if we have lastActiveAt data
  useEffect(() => {
    if (otherParticipant && otherParticipant.lastActiveAt) {
      const existingStatus = userStatus[otherParticipant.id];
      if (!existingStatus) {
        updateUserStatus(otherParticipant.id, {
          isOnline: false,
          lastSeen: otherParticipant.lastActiveAt
        });
      }
    }
  }, [otherParticipant, updateUserStatus, userStatus]);

  if (!otherParticipant) return null;

  const currentStatus = userStatus[otherParticipant.id];
  const isOnline = currentStatus?.isOnline || false;
  const lastSeen = currentStatus?.lastSeen;

  const formatLastSeen = (lastSeenDate: string) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`; // 7 days
    return formatDistanceToNow(date, { addSuffix: false });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          {otherParticipant.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.name}
              className="w-9 h-9 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-alifh-blue to-alifh-blue-dark rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {otherParticipant.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {otherParticipant.name}
          </h4>
          {otherParticipant.role && otherParticipant.role.toLowerCase() !== 'user' && (
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
              {otherParticipant.role.toLowerCase()}
            </div>
          )}
        </div>
      </div>

      {/* Right: Status Icon with Heartbeat Animation */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isOnline ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Moon className="w-3 h-3 text-rose-500 fill-rose-500" />
              <span className="absolute -top-0.5 -right-0.5 text-[7px] text-rose-400 font-serif italic animate-pulse">✦</span>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Active now</span>
          </div>
        ) : lastSeen ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              {formatLastSeen(lastSeen)}
            </span>
            <div className="relative">
              <Moon className="w-3 h-3 text-purple-500 fill-purple-500" />
              <span className="absolute -top-0.5 -right-0.5 text-[7px] text-purple-400 animate-pulse font-serif italic">z</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Cloud className="w-3 h-3 text-slate-500 fill-slate-400" />
            <span className="text-xs text-muted-foreground font-medium">Away</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface FloatingChatWindowProps {
  window: {
    conversationId: string;
    conversation: ConversationResponseDTO;
    position: number;
    isMinimized: boolean;
    unreadCount: number;
  };
}

function FloatingChatWindow({ window }: FloatingChatWindowProps) {
  const { 
    closeChatWindow, 
    minimizeChatWindow, 
    maximizeChatWindow, 
    markAsRead, 
    updateLastActivity 
  } = useChatWindowStore();
  
  const { user: currentUser } = useCurrentUser();
  
  // Get other participant for header display
  const otherParticipant = window.conversation.participants.find((p: any) => 
    p.id !== currentUser?.id
  ) || window.conversation.participants[0];

  // Socket.IO integration for typing indicators
  const { isConnected, startTyping, stopTyping } = useSocket({
    userId: currentUser?.id,
  });

  // Update last activity when window is accessed
  useEffect(() => {
    updateLastActivity(window.conversationId, new Date());
  }, [window.conversationId, updateLastActivity]);

  const handleMinimize = () => {
    if (window.isMinimized) {
      maximizeChatWindow(window.conversationId);
    } else {
      minimizeChatWindow(window.conversationId);
    }
  };

  const handleClose = () => {
    closeChatWindow(window.conversationId);
  };

  const handleMessagesRead = async (messageIds: string[]) => {
    markAsRead(window.conversationId);
    
    try {
      await fetch("/api/v1/messaging/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: window.conversationId,
          messageIds,
          userId: currentUser?.id,
        }),
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleMessageSent = () => {
    console.log("📤 Message sent successfully in floating window");
  };

  return (
    <div
      className={cn(
        "fixed bg-background border border-border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out z-50 flex flex-col backdrop-blur-md",
        "hidden lg:block", // Hide on mobile
        window.isMinimized ? "h-auto" : "h-[500px]", // Fixed height for expanded
        "w-[350px]" // Fixed width
      )}
      style={{
        right: `${20 + (window.position * 370)}px`, // 350px width + 20px spacing
        bottom: '20px'
      }}
    >
      {/* Floating Window Header with ConversationHeader */}
      <div 
        className={cn(
          "flex items-center border-b border-border/50 bg-muted/30 rounded-t-xl flex-shrink-0 overflow-hidden",
          window.isMinimized && "border-b-0 cursor-pointer hover:bg-muted/50 rounded-xl"
        )}
        onClick={window.isMinimized ? handleMinimize : undefined}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {!window.isMinimized ? (
            // Custom floating header with better UI/UX
            <FloatingConversationHeader 
              conversation={window.conversation} 
              currentUserId={currentUser?.id || ''} 
            />
          ) : (
            // Minimized view - just name and unread count
            <div className="flex items-center gap-3 px-3 py-2">
              {otherParticipant?.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="text-sm font-semibold truncate text-foreground max-w-[150px]">
                  {otherParticipant?.name || 'Unknown User'}
                </h4>
              </div>
              
              {window.unreadCount > 0 && (
                <span className="bg-alifh-blue text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center font-medium flex-shrink-0">
                  {window.unreadCount > 99 ? '99+' : window.unreadCount}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0 px-2">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={window.isMinimized ? "Maximize" : "Minimize"}
          >
            {window.isMinimized ? (
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Content - Only show when not minimized */}
      {!window.isMinimized && (
        <div className="flex flex-col" style={{ height: '438px' }}> {/* Fixed height: 500px total - 62px header */}
          {/* Messages Thread - Fixed height container */}
          <div className="overflow-hidden" style={{ height: '350px' }}> {/* Fixed height for messages */}
            <MessageThread
              conversationId={window.conversationId}
              userId={currentUser?.id || ''}
              onMessagesRead={handleMessagesRead}
              className="h-full w-full max-w-full !px-2 !py-2"
              compact={true}
            />
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="border-t border-border/50" style={{ height: '88px' }}> {/* Fixed height for input */}
            <MessageInput
              conversationId={window.conversationId}
              userId={currentUser?.id || ''}
              userName={currentUser?.name || 'User'}
              onMessageSent={handleMessageSent}
              startTyping={startTyping}
              stopTyping={stopTyping}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FloatingChatWindows() {
  const { windows } = useChatWindowStore();

  return (
    <>
      {/* Floating Chat Windows using existing components */}
      {windows.map((window) => (
        <FloatingChatWindow key={window.conversationId} window={window} />
      ))}
    </>
  );
}

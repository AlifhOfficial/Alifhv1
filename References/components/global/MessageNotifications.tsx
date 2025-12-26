/**
 * Messaging Module - Global Message Notifications Component
 * Shows unread message count and recent messages in the profile dropdown
 */

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { 
  MessageSquare, 
  User, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Circle,
  Bird
} from 'lucide-react';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useGlobalUnreadCount, useRecentConversations, useChatWindowActions } from '@/hooks/use-global-messaging';
import { useSocket } from '@/hooks/use-socket';
import { cn } from '@/lib/utils';

interface MessageNotificationsProps {
  className?: string;
  onClose?: () => void;
}

export function MessageNotifications({ className, onClose }: MessageNotificationsProps) {
  const { data: session } = useSession();
  const { unreadCount, loading: unreadLoading, refresh: refreshUnread } = useGlobalUnreadCount();
  const { conversations, loading: conversationsLoading, refresh: refreshConversations } = useRecentConversations(5);
  const { openChat } = useChatWindowActions();
  const [isExpanded, setIsExpanded] = useState(false);

  // Listen to socket events for real-time updates
  const { isConnected } = useSocket({
    userId: session?.user?.id || '',
    onMessage: () => {
      // Refresh data when new message arrives
      refreshUnread();
      refreshConversations();
    },
    onConversationUpdated: () => {
      // Refresh conversations when updated
      refreshConversations();
    },
    onMessageRead: () => {
      // Refresh unread count when messages are read
      refreshUnread();
      refreshConversations();
    },
  });

  const handleOpenConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      openChat(conversation);
      onClose?.();
    }
  };

  const loading = unreadLoading || conversationsLoading;

  return (
    <div className={cn("w-full max-w-sm", className)}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Messages</span>
          <Link 
            href="/user/messages"
            className="opacity-60 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            title="Open Messages"
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </Link>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/user/messages"
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            View all
          </Link>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto border-t border-border/50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500/30 border-t-blue-500"></div>
            </div>
          ) : conversations.length > 0 ? (
            <div className="py-2">
              {conversations.map((conversation) => {
                const otherParticipant = conversation.participants.find(p => 
                  p.id !== conversation.participantIds[0]
                ) || conversation.participants[0];

                const isUnread = conversation.unreadCount > 0;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "mx-2 px-3 py-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border-l-2 mb-1",
                      isUnread ? "border-l-blue-500 bg-muted/30" : "border-l-transparent"
                    )}
                    onClick={() => handleOpenConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {otherParticipant?.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-muted flex items-center justify-center rounded-full flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={cn(
                            "text-sm truncate",
                            isUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
                          )}>
                            {otherParticipant?.name || 'Unknown User'}
                          </h4>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                              </span>
                            )}
                            
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] text-center font-medium">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Last Message Preview */}
                        {conversation.lastMessagePreview && (
                          <p className={cn(
                            "text-sm text-muted-foreground truncate",
                            isUnread && "font-medium"
                          )}>
                            {conversation.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No recent conversations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Message Badge Component for showing unread notifications
 * Used on ProfileAvatar in navbar
 */
export function MessageBadge({ className }: { className?: string }) {
  const { unreadCount, loading } = useGlobalUnreadCount();

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      "absolute -top-1 -right-1 z-10",
      className
    )}>
      {/* Modern notification badge */}
      <div className="relative">
        <div className="flex items-center justify-center min-w-[18px] h-[18px] bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg border-2 border-background backdrop-blur-sm">
          <span className="leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-blue-400/40 rounded-full animate-ping scale-110 opacity-60" />
      </div>
    </div>
  );
}

/**
 * Messaging UI - Inbox List Component
 * Shows all conversations for a user with real-time updates
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Search, User, Zap, WifiOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "@/hooks/use-socket";
import { useSharedUserStatus } from "@/hooks/use-shared-user-status";
import type { ConversationResponseDTO } from "../../application/dtos";

interface InboxListProps {
  userId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isConnected?: boolean;
  connectionError?: string | null;
}

export function InboxList({
  userId,
  selectedConversationId,
  onSelectConversation,
  isConnected = false,
  connectionError = null,
}: InboxListProps) {
  const [conversations, setConversations] = useState<ConversationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use shared user status
  const { userStatus, updateUserStatus } = useSharedUserStatus();

  // Handle real-time conversation updates
  const handleNewMessage = useCallback((message: any) => {
    console.log("📨 New message for inbox:", message);
    setConversations((prev) => 
      prev.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessagePreview: message.content || "New message",
            lastMessageAt: new Date(message.createdAt),
            unreadCount: message.senderId === userId ? conv.unreadCount : conv.unreadCount + 1,
          };
        }
        return conv;
      })
    );
  }, [userId]);

  const handleConversationUpdated = useCallback((data: { 
    conversationId: string; 
    lastMessagePreview: string; 
    lastMessageAt: Date 
  }) => {
    console.log("💬 Conversation updated:", data);
    setConversations((prev) => 
      prev.map((conv) => 
        conv.id === data.conversationId 
          ? { ...conv, ...data, lastMessageAt: new Date(data.lastMessageAt) }
          : conv
      )
    );
  }, []);

  const handleMessagesRead = useCallback((data: { messageIds: string[]; userId: string; readAt: string; conversationId?: string }) => {
    console.log("👁️ Messages read, clearing unread count:", data);
    setConversations((prev) => 
      prev.map((conv) => {
        // If conversationId is provided, clear unread count for that specific conversation
        if (data.conversationId && conv.id === data.conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        // If no conversationId, we need to check if the user reading is the current user
        // and reduce unread count (this is a fallback, ideally conversationId should be provided)
        if (!data.conversationId && data.userId === userId) {
          return {
            ...conv,
            unreadCount: Math.max(0, conv.unreadCount - data.messageIds.length)
          };
        }
        return conv;
      })
    );
  }, [userId]);

  const handleUserStatusChanged = useCallback((data: { userId: string; isOnline: boolean; lastSeen: string }) => {
    console.log(`📡 User status changed in inbox:`, {
      userId: data.userId,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen,
      userShortId: data.userId.substring(0, 8)
    });
    updateUserStatus(data.userId, {
      isOnline: data.isOnline,
      lastSeen: data.lastSeen
    });
  }, [updateUserStatus]);

  // Initialize socket for inbox updates
  const { isConnected: socketConnected } = useSocket({
    userId,
    onMessage: handleNewMessage,
    onConversationUpdated: handleConversationUpdated,
    onMessageRead: handleMessagesRead,
    onUserStatusChanged: handleUserStatusChanged,
  });

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/v1/messaging/conversations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load conversations only once on mount or when userId changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== userId);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="p-5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
              </>
            ) : connectionError ? (
              <>
                <WifiOff className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Offline</span>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Connecting</span>
              </>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-3 text-sm border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p.id !== userId
              );
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-100 dark:hover:bg-muted/30 ${
                    isSelected ? "bg-gray-200 dark:bg-muted/50" : ""
                  }`}
                >
                  <div className="flex gap-3 items-center overflow-hidden">
                    {/* Avatar - Round with Online Indicator */}
                    <div className="flex-shrink-0 relative">
                      {otherParticipant?.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-11 h-11 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-muted/80 flex items-center justify-center rounded-full">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-1 overflow-hidden">
                        <h3
                          className={`text-sm font-medium truncate ${
                            hasUnread ? "text-foreground" : "text-foreground/90"
                          }`}
                        >
                          {otherParticipant?.name || "Unknown User"}
                        </h3>
                        <span className="text-xs text-muted-foreground/80 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between overflow-hidden">
                        <p
                          className={`text-sm truncate pr-2 min-w-0 flex-1 ${
                            hasUnread
                              ? "text-foreground/80 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conversation.lastMessagePreview || "No messages yet"}
                        </p>
                        {hasUnread && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full min-w-[18px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

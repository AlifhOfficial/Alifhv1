/**
 * Messaging UI - Message Thread Component
 * Displays messages in a conversation with real-time updates
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import type { MessageResponseDTO } from "../../application/dtos";

interface MessageThreadProps {
  conversationId: string;
  userId: string;
  onMessagesRead?: (messageIds: string[]) => void;
  className?: string;
  compact?: boolean;
}

export function MessageThread({
  conversationId,
  userId,
  onMessagesRead,
  className,
  compact = false,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle new messages in real-time
  const handleNewMessage = useCallback((message: MessageResponseDTO) => {
    console.log("📨 New message received:", message);
    // Only add if it belongs to this conversation
    if (message.conversationId !== conversationId) {
      console.log("❌ Message not for this conversation, ignoring");
      return;
    }
    
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) {
        console.log("⚠️ Message already exists, skipping");
        return prev;
      }
      console.log("✅ Adding new message to thread");
      return [...prev, message];
    });
    setTimeout(() => scrollToBottom(), 100);
  }, [conversationId]);

  // Handle message read status updates
  const handleMessageRead = useCallback((data: { messageIds: string[]; userId: string; readAt: string }) => {
    console.log("📖 Messages marked as read:", data);
    setMessages((prev) =>
      prev.map((msg) =>
        data.messageIds.includes(msg.id) ? { ...msg, readAt: new Date(data.readAt) } : msg
      )
    );
  }, []);

  // Handle typing indicators
  const handleTypingStart = useCallback((data: { userId: string; userName: string }) => {
    if (data.userId === userId) return; // Don't show own typing
    console.log("⌨️ User started typing:", data);
    setTypingUsers((prev) => new Set(prev).add(data.userId));
  }, [userId]);

  const handleTypingStop = useCallback((data: { userId: string }) => {
    console.log("⌨️ User stopped typing:", data);
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  }, []);

  // Initialize socket with real-time handlers
  const { isConnected } = useSocket({
    userId,
    conversationId,
    onMessage: handleNewMessage,
    onMessageRead: handleMessageRead,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
  });



  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Mark messages as read when they come into view
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const unreadMessageIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.getAttribute("data-message-id"))
          .filter((id): id is string => id !== null);

        if (unreadMessageIds.length > 0 && onMessagesRead) {
          onMessagesRead(unreadMessageIds);
        }
      },
      { threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, [onMessagesRead]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/messaging/conversations/${conversationId}/messages?userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        // Scroll to bottom immediately when loading messages (not smooth)
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 50);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "overflow-y-auto overflow-x-hidden space-y-1 bg-background w-full",
      compact ? "px-2 py-1 h-full" : "px-4 py-2 flex-1",
      className
    )}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isOwn = message.senderId === userId;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
            
            // Find the very last read message from the current user (Instagram-like seen behavior)
            const ownReadMessages = messages.filter(m => m.senderId === userId && m.readAt);
            const lastReadMessage = ownReadMessages.length > 0 ? ownReadMessages[ownReadMessages.length - 1] : null;
            const showSeenStatus = isOwn && message.readAt && message.id === lastReadMessage?.id || false;
            
            // Get other user's avatar for seen status
            const otherUserAvatar = messages.find(m => m.senderId !== userId)?.senderAvatar || undefined;

            return (
              <div
                key={message.id}
                data-message-id={!isOwn && !message.readAt ? message.id : undefined}
                ref={(el) => {
                  if (el && !isOwn && !message.readAt && observerRef.current) {
                    observerRef.current.observe(el);
                  }
                }}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showSeenStatus={showSeenStatus}
                  otherUserAvatar={otherUserAvatar}
                  compact={compact}
                />
              </div>
            );
          })}
          
          {typingUsers.size > 0 && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

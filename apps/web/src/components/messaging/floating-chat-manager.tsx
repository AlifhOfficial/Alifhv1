/**
 * Floating Chat Manager - Global chat window orchestrator
 * Manages multiple floating chat windows at the bottom-right of the screen
 */

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { FloatingChatWindow } from './floating-chat-window';
import type { Conversation } from '@/hooks/messaging';

// Maximum number of floating chat windows visible at once
const MAX_VISIBLE_CHATS = 3;

interface ChatWindowState {
  conversation: Conversation;
  isMinimized: boolean;
}

interface FloatingChatContextValue {
  openChat: (conversation: Conversation) => void;
  closeChat: (conversationId: string) => void;
  minimizeChat: (conversationId: string) => void;
  maximizeChat: (conversationId: string) => void;
  isOpen: (conversationId: string) => boolean;
  openChats: ChatWindowState[];
}

const FloatingChatContext = createContext<FloatingChatContextValue | null>(null);

export function useFloatingChat() {
  const context = useContext(FloatingChatContext);
  if (!context) {
    throw new Error('useFloatingChat must be used within a FloatingChatProvider');
  }
  return context;
}

/**
 * Safe version of useFloatingChat that returns a no-op implementation
 * if not wrapped in FloatingChatProvider
 */
export function useFloatingChatSafe(): FloatingChatContextValue {
  const context = useContext(FloatingChatContext);
  
  // Return no-op implementation if no provider
  if (!context) {
    return {
      openChat: () => {},
      closeChat: () => {},
      minimizeChat: () => {},
      maximizeChat: () => {},
      isOpen: () => false,
      openChats: [],
    };
  }
  
  return context;
}

interface FloatingChatProviderProps {
  children: ReactNode;
  userId?: string;
}

export function FloatingChatProvider({ children, userId }: FloatingChatProviderProps) {
  const [openChats, setOpenChats] = useState<ChatWindowState[]>([]);

  const openChat = useCallback((conversation: Conversation) => {
    setOpenChats((prev) => {
      // Check if already open
      const existingIndex = prev.findIndex((c) => c.conversation.id === conversation.id);
      
      if (existingIndex !== -1) {
        // If minimized, maximize it and move to front
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], isMinimized: false };
        // Move to front (rightmost position)
        const [item] = updated.splice(existingIndex, 1);
        return [item, ...updated];
      }
      
      // Add new chat to front
      const newChat: ChatWindowState = { conversation, isMinimized: false };
      const updated = [newChat, ...prev];
      
      // Limit visible chats, close the oldest if exceeding limit
      if (updated.length > MAX_VISIBLE_CHATS) {
        return updated.slice(0, MAX_VISIBLE_CHATS);
      }
      
      return updated;
    });
  }, []);

  const closeChat = useCallback((conversationId: string) => {
    setOpenChats((prev) => prev.filter((c) => c.conversation.id !== conversationId));
  }, []);

  const minimizeChat = useCallback((conversationId: string) => {
    setOpenChats((prev) =>
      prev.map((c) =>
        c.conversation.id === conversationId ? { ...c, isMinimized: true } : c
      )
    );
  }, []);

  const maximizeChat = useCallback((conversationId: string) => {
    setOpenChats((prev) =>
      prev.map((c) =>
        c.conversation.id === conversationId ? { ...c, isMinimized: false } : c
      )
    );
  }, []);

  const isOpen = useCallback(
    (conversationId: string) => openChats.some((c) => c.conversation.id === conversationId),
    [openChats]
  );

  const value: FloatingChatContextValue = {
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    isOpen,
    openChats,
  };

  return (
    <FloatingChatContext.Provider value={value}>
      {children}
      
      {/* Render floating chat windows */}
      {userId && openChats.map((chatState, index) => (
        <FloatingChatWindow
          key={chatState.conversation.id}
          conversation={chatState.conversation}
          userId={userId}
          position={index}
          isMinimized={chatState.isMinimized}
          onMinimize={() => minimizeChat(chatState.conversation.id)}
          onMaximize={() => maximizeChat(chatState.conversation.id)}
          onClose={() => closeChat(chatState.conversation.id)}
        />
      ))}
    </FloatingChatContext.Provider>
  );
}

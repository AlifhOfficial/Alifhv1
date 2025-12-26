/**
 * Messaging Module - Mini Chat Widget Component
 * Compact chat interface for the profile dropdown
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { 
  MessageSquare, 
  Send,
  Minimize2,
  X,
  User,
  Loader2,
  ArrowDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useGlobalUnreadCount, useRecentConversations, useChatWindowActions } from '@/hooks/use-global-messaging';
import { useSocket } from '@/hooks/use-socket';
import { UserStatus } from './UserStatus';
import type { ConversationResponseDTO, MessageResponseDTO } from '@/modules/messaging';
import { cn } from '@/lib/utils';

interface MiniChatWidgetProps {
  className?: string;
  onClose?: () => void;
  onExpand?: () => void;
}

export function MiniChatWidget({ className, onClose, onExpand }: MiniChatWidgetProps) {
  const { data: session } = useSession();
  const { conversations, loading, refresh: refreshConversations } = useRecentConversations(3);
  const { openChat } = useChatWindowActions();
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponseDTO | null>(null);
  const [messages, setMessages] = useState<MessageResponseDTO[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLInputElement>(null);

  // Listen to socket events for real-time updates
  const { isConnected } = useSocket({
    userId: session?.user?.id || '',
    onMessage: () => {
      // Refresh conversations when new message arrives
      refreshConversations();
    },
    onConversationUpdated: () => {
      // Refresh conversations when updated
      refreshConversations();
    },
  });

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(
          `/api/v1/messaging/conversations/${selectedConversation.id}/messages?limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/v1/messaging/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          text: messageText.trim(),
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage.message]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleOpenConversation = (conversation: ConversationResponseDTO) => {
    openChat(conversation);
    onClose?.();
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const otherParticipant = selectedConversation?.participants.find((p: any) => 
    p.id !== selectedConversation.participantIds[0]
  ) || selectedConversation?.participants[0];

  return (
    <div className={cn(
      "w-80 bg-background border border-border rounded-lg shadow-lg transition-all duration-200",
      isExpanded ? "h-96" : "h-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-alifh-blue" />
          <span className="text-sm font-medium">Quick Chat</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleExpand}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          <button
            onClick={onExpand}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Open full messages"
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground rotate-45" />
          </button>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-alifh-blue" />
        </div>
      ) : (
        <>
          {/* Conversation List (when no conversation selected or multiple conversations) */}
          {(!selectedConversation || conversations.length > 1) && (
            <div className="border-b border-border/50">
              <div className="max-h-20 overflow-y-auto">
                {conversations.map((conversation) => {
                  const participant = conversation.participants.find((p: any) => 
                    p.id !== conversation.participantIds[0]
                  ) || conversation.participants[0];
                  
                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedConversation?.id === conversation.id && "bg-alifh-blue/10 border-l-2 border-l-alifh-blue"
                      )}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      {participant?.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-6 h-6 object-cover shadow-sm border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-muted flex items-center justify-center shadow-sm border border-border flex-shrink-0">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant?.name || 'Unknown'}</p>
                        {conversation.lastMessagePreview && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessagePreview}
                          </p>
                        )}
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <span className="bg-alifh-blue text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenConversation(conversation);
                        }}
                        className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open in floating window"
                      >
                        <ArrowDown className="w-3 h-3 text-muted-foreground rotate-45" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Conversation Chat */}
          {selectedConversation && (
            <>
              {/* Chat Header */}
              {otherParticipant && (
                <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50 bg-muted/20">
                  {otherParticipant.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.name}
                      className="w-6 h-6 object-cover shadow-sm border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-muted flex items-center justify-center shadow-sm border border-border flex-shrink-0">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{otherParticipant.name}</h4>
                    <UserStatus 
                      userId={otherParticipant.id} 
                      lastActiveAt={otherParticipant.lastActiveAt}
                      size="sm"
                      variant="compact"
                      showText={true}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleOpenConversation(selectedConversation)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Open in floating window"
                  >
                    <ArrowDown className="w-3 h-3 text-muted-foreground rotate-45" />
                  </button>
                </div>
              )}

              {/* Messages */}
              <div className={cn(
                "flex-1 overflow-y-auto p-3 space-y-2",
                isExpanded ? "h-56" : "h-32"
              )}>
                {messages.length > 0 ? (
                  messages.slice(-5).map((message) => {
                    const isOwn = message.senderId === selectedConversation.participantIds[0];
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2 max-w-[85%]",
                          isOwn ? "justify-end ml-auto" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm break-words",
                          isOwn
                            ? "bg-alifh-blue text-white rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}>
                          <p>{message.text}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No messages yet
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-full bg-muted/30 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-alifh-blue focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="p-2 bg-alifh-blue text-white rounded-full hover:bg-alifh-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* No Conversations State */}
          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 px-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No recent conversations
              </p>
              <button
                onClick={onExpand}
                className="mt-2 text-xs text-alifh-blue hover:text-alifh-blue/80 transition-colors"
              >
                Start a conversation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

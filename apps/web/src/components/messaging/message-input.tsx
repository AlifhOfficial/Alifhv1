/**
 * Message Input Component - Alifh Design System
 * Text input with send button and media upload
 */

'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Send, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MessageInputProps {
  onSend: (text: string, mediaUrl?: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
  resetKey?: string;
  /** Compact mode for floating chat windows */
  compact?: boolean;
  /** Listing preview to show above input (for first message) */
  listingPreview?: { id: string; title: string; thumbnail: string | null };
  /** Handler to dismiss the listing preview */
  onDismissListing?: () => void;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  initialText,
  resetKey,
  compact = false,
  listingPreview,
  onDismissListing,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isTypingRef = useRef(false);
  const isMountedRef = useRef(false);

  // Focus helper - use click() to force Chrome focus
  const focusTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    
    // Chrome workaround: click then focus
    el.click();
    el.focus();
    
    // Move cursor to end
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, [disabled]);

  // Initial mount focus with visibility check
  useEffect(() => {
    isMountedRef.current = true;
    
    // Wait for layout then focus
    const raf = requestAnimationFrame(() => {
      // Check if page is visible (Chrome blocks focus on hidden tabs)
      if (document.visibilityState === 'visible') {
        focusTextarea();
      }
    });
    
    // Also focus on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        setTimeout(focusTextarea, 50);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [focusTextarea]);

  // Reset state when conversation changes (resetKey)
  // Note: We intentionally exclude onTyping from deps to avoid resetting
  // on every render when onTyping is an inline function
  useEffect(() => {
    if (!resetKey) return;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Reset typing state on conversation switch
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onTyping?.(false);
    
    // Focus after conversation switch (small delay for DOM update)
    setTimeout(() => focusTextarea(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, focusTextarea]);

  useEffect(() => {
    if (!initialText) return;
    if (text.trim().length > 0) return;
    setText(initialText);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    // Intentionally only depends on initialText/resetKey (not `text`) to avoid
    // re-applying while the user is typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText, resetKey]);

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled) return;

    // Clear immediately for snappy UX (optimistic)
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Clear typing state
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }

    // Fire and forget - don't block UI
    onSend(trimmedText).catch(() => {
      // Error handled silently - UI already updated optimistically
    });
    
    // Focus after sending
    focusTextarea();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

    if (onTyping) {
      const hasText = e.target.value.trim().length > 0;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Debounce: only send typing event after 500ms of no typing
      typingTimeoutRef.current = setTimeout(() => {
        const nextTyping = hasText && e.target.value.trim().length > 0;
        
        if (nextTyping !== isTypingRef.current) {
          isTypingRef.current = nextTyping;
          onTyping(nextTyping);
        }

        // Auto-stop typing after 3 seconds
        if (nextTyping) {
          setTimeout(() => {
            if (isTypingRef.current) {
              isTypingRef.current = false;
              onTyping(false);
            }
          }, 3000);
        }
      }, 500); // Wait 500ms before sending typing event
    }
  };

  return (
    <div className={cn(
      'border-t border-border/50 bg-background/95 backdrop-blur-sm',
      compact ? 'px-2.5 py-2' : 'px-4 py-3'
    )}>
      {/* Listing Preview Card */}
      {listingPreview && (
        <div className="mb-3 relative">
          <div className="rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm">
            <div className="flex gap-3 p-3">
              {listingPreview.thumbnail ? (
                <img 
                  src={listingPreview.thumbnail} 
                  alt={listingPreview.title} 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                />
              ) : (
                <div className="w-20 h-20 bg-muted/40 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex items-center">
                <p className="text-sm font-semibold text-foreground line-clamp-2">
                  {listingPreview.title}
                </p>
              </div>
              {onDismissListing && (
                <button
                  onClick={onDismissListing}
                  className="flex-shrink-0 p-1.5 hover:bg-secondary/50 rounded-lg transition-colors self-start"
                  aria-label="Remove preview"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={cn(
        'flex items-center bg-muted/20 border border-border/40 rounded-2xl min-w-0 overflow-hidden w-full',
        compact ? 'p-1' : 'p-1.5 lg:p-2'
      )}>
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          autoFocus
          tabIndex={0}
          className={cn(
            'flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none min-w-0 overflow-hidden focus:outline-none focus:ring-0',
            compact ? 'max-h-16 text-[13px] py-1 px-2' : 'max-h-24 lg:max-h-32 text-sm py-1.5 lg:py-2 px-2 lg:px-3'
          )}
          style={{
            minHeight: '18px',
            height: 'auto',
          }}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            'rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-1',
            compact ? 'p-1.5' : 'p-2',
            text.trim() && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-muted text-muted-foreground'
          )}
          aria-label="Send message"
        >
          <Send className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>
      </div>

      {/* Hint - hide in compact mode */}
      {!compact && (
        <small className="text-xs text-muted-foreground/70 mt-2 px-1 block">
          Press Enter to send, Shift + Enter for new line
        </small>
      )}
    </div>
  );
}

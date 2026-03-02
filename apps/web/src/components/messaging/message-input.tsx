/**
 * Message Input Component - Revvup Design System
 * Text input with send button and media upload
 */

'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { Send, MapPin } from 'lucide-react';
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
  onRequestLocation?: () => void;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  initialText,
  resetKey,
  compact = false,
  onRequestLocation,
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
      'flex-shrink-0 bg-background',
      compact ? 'px-2.5 py-2' : 'px-3 sm:px-4 py-2.5 sm:py-3'
    )}>
      <div className={cn(
        'flex items-center gap-2',
        compact ? 'gap-1.5' : 'gap-2'
      )}>
        {/* Location Button - Circle */}
        {onRequestLocation && (
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={disabled}
            className={cn(
              'flex-shrink-0 rounded-full border border-border bg-sidebar transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center',
              compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11',
              'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50'
            )}
            aria-label="Share location"
            title="Share location"
          >
            <MapPin className={compact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} />
          </button>
        )}

        {/* Text Input - Pill shaped */}
        <div className={cn(
          'flex-1 bg-sidebar border border-border rounded-full min-w-0 overflow-hidden flex items-center',
          compact ? 'px-4 h-8' : 'px-4 sm:px-5 h-10 sm:h-11'
        )}>
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
              'w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none overflow-hidden focus:outline-none focus:ring-0 font-medium',
              compact ? 'max-h-16 text-[13px]' : 'max-h-20 sm:max-h-24 lg:max-h-32 text-[13px] sm:text-sm'
            )}
            style={{
              minHeight: '20px',
              height: 'auto',
            }}
          />
        </div>

        {/* Send Button - Circle */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            'flex-shrink-0 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center',
            compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11',
            text.trim() && !disabled
              ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-sidebar border-border text-muted-foreground/50'
          )}
          aria-label="Send message"
        >
          <Send className={compact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'} />
        </button>
      </div>

      {/* Hint - hide in compact mode and on mobile */}
      {!compact && (
        <p className="hidden sm:block text-xs font-medium text-muted-foreground/50 mt-1.5 sm:mt-2 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      )}
    </div>
  );
}

/**
 * Typing Indicator - Alifh Design System
 * Instagram-style "typing..." text indicator
 */

'use client';

import { cn } from '@/utils/cn';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <small className={cn('text-muted-foreground/70 italic', className)}>
      typing...
    </small>
  );
}

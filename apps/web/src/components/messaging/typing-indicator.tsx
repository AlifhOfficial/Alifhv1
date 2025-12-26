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
    <span className={cn('text-xs text-muted-foreground italic', className)}>
      typing...
    </span>
  );
}

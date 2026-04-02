/**
 * Toast Hook - Sonner Migration Wrapper
 * 
 * Provides backward compatibility for old useToast() API
 * while using Sonner under the hood.
 * 
 * NEW CODE: Just import { toast } from 'sonner' directly
 * LEGACY CODE: Can still use this hook temporarily
 * 
 * @deprecated Use `import { toast } from 'sonner'` directly in new code
 */

'use client';

import { toast } from 'sonner';

/**
 * Legacy toast wrapper for backward compatibility
 * 
 * OLD USAGE:
 * ```ts
 * const { toast } = useToast();
 * toast({ title: 'Success', description: 'Done', variant: 'default' });
 * ```
 * 
 * NEW USAGE (Preferred):
 * ```ts
 * import { toast } from 'sonner';
 * toast.success('Done');
 * ```
 */
const SYNC_NOTE = 'Changes may take 5–10 min to appear everywhere.';

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = 'default',
      action: _action,
    }: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive' | 'success';
      action?: any;
    }) => {
      const message = description || title || 'Notification';
      // For non-error toasts, append sync note if no description provided
      const desc = variant === 'destructive'
        ? description
        : description || SYNC_NOTE;
      
      switch (variant) {
        case 'destructive':
          return toast.error(title || 'Error', { description: desc });
        case 'success':
          return toast.success(title || 'Success', { description: desc });
        default:
          return toast(title || message, { description: desc });
      }
    },
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}

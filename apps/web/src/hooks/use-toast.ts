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
export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = 'default',
      action,
    }: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive' | 'success';
      action?: any;
    }) => {
      const message = description || title || 'Notification';
      
      switch (variant) {
        case 'destructive':
          return toast.error(title || 'Error', { description });
        case 'success':
          return toast.success(title || 'Success', { description });
        default:
          return toast(title || message, { description });
      }
    },
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}

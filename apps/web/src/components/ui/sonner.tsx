'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Custom Sonner Toaster - Alifh Design System
 * 
 * Pre-configured toast notification container with:
 * - Theme-aware styling (light/dark mode support)
 * - Close button on all toasts
 * - Proper positioning and spacing
 * - Consistent typography with design system
 * - Sidebar color scheme for consistency
 */
function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      offset={16}
      gap={12}
      closeButton
      richColors
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-sidebar group-[.toaster]:text-sidebar-foreground group-[.toaster]:border-sidebar-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl',
          title: 'group-[.toast]:text-sm group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-sm group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-sidebar-primary group-[.toast]:text-sidebar-primary-foreground group-[.toast]:rounded-md group-[.toast]:text-xs group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-sidebar-accent group-[.toast]:text-sidebar-accent-foreground group-[.toast]:rounded-md group-[.toast]:text-xs group-[.toast]:font-medium',
          closeButton:
            'group-[.toast]:bg-sidebar group-[.toast]:text-muted-foreground group-[.toast]:border-sidebar-border group-[.toast]:hover:bg-sidebar-accent group-[.toast]:hover:text-sidebar-accent-foreground',
          success:
            'group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900 group-[.toaster]:border-emerald-200 dark:group-[.toaster]:bg-emerald-950/50 dark:group-[.toaster]:text-emerald-100 dark:group-[.toaster]:border-emerald-900/50',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950/50 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-900/50',
          warning:
            'group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-950/50 dark:group-[.toaster]:text-amber-100 dark:group-[.toaster]:border-amber-900/50',
          info:
            'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950/50 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-900/50',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

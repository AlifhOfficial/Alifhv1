'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Custom Sonner Toaster - Revvup Design System
 * 
 * Pre-configured toast notification container with:
 * - Theme-aware styling (light/dark/charcoal mode support)
 * - Close button on all toasts
 * - Proper positioning and spacing
 * - Consistent typography with design system
 * - Sidebar color scheme for consistency
 */
function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  // Map charcoal to dark for Sonner (it only accepts light/dark/system)
  // Our Tailwind config treats charcoal as a dark variant so styles apply correctly
  const sonnerTheme = theme === 'charcoal' ? 'dark' : theme;

  return (
    <Sonner
      theme={sonnerTheme as ToasterProps['theme']}
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
          title: 'group-[.toast]:text-subhead group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-subhead group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-sidebar-primary group-[.toast]:text-sidebar-primary-foreground group-[.toast]:rounded-md group-[.toast]:text-caption1 group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-sidebar-accent group-[.toast]:text-sidebar-accent-foreground group-[.toast]:rounded-md group-[.toast]:text-caption1 group-[.toast]:font-medium',
          closeButton:
            'group-[.toast]:bg-sidebar group-[.toast]:text-muted-foreground group-[.toast]:border-sidebar-border group-[.toast]:hover:bg-sidebar-accent group-[.toast]:hover:text-sidebar-accent-foreground',
          success:
            'group-[.toaster]:bg-success-muted group-[.toaster]:text-success group-[.toaster]:border-success/20',
          error:
            'group-[.toaster]:bg-destructive-muted group-[.toaster]:text-destructive group-[.toaster]:border-destructive/20',
          warning:
            'group-[.toaster]:bg-warning-muted group-[.toaster]:text-warning group-[.toaster]:border-warning/20',
          info:
            'group-[.toaster]:bg-primary-muted group-[.toaster]:text-primary group-[.toaster]:border-primary/20',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

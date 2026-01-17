/**
 * Smart Feedback Link
 * Routes to the appropriate dashboard feedback page based on user context
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function FeedbackLink() {
  const pathname = usePathname();
  
  // Determine which dashboard we're in
  let feedbackHref = '/user-dashboard/feedback';
  
  if (pathname.startsWith('/partner-dashboard')) {
    feedbackHref = '/partner-dashboard/feedback';
  } else if (pathname.startsWith('/staff-dashboard')) {
    feedbackHref = '/staff-dashboard/feedback';
  }
  
  return (
    <SidebarMenuButton asChild tooltip="Feedback" className="font-semibold tracking-tight">
      <Link href={feedbackHref}>
        <Send className="size-4" />
        <span>Feedback</span>
      </Link>
    </SidebarMenuButton>
  );
}

/**
 * Staff Messaging Page
 * V1: Customer inquiries only (team chat disabled for launch)
 * Client-side: auth sourced from context (layout already guards access server-side)
 */

'use client';

import { useAuth } from '@/providers/auth-provider';
import { ChatContainer } from '@/components/messaging';

export default function MessagingPage() {
  const { session: user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatContainer
        userId={user.id}
        inbox="staff"
        className="flex-1 min-h-0"
      />
    </div>
  );
}

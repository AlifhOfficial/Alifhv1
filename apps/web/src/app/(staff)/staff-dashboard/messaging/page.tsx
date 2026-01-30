/**
 * Staff Messaging Page
 * V1: Customer inquiries only (team chat disabled for launch)
 */

'use client';

import { Loader2 } from "lucide-react";
import { ChatContainer } from "@/components/messaging";
import { useAuth } from "@/providers/auth-provider";

export default function MessagingPage() {
  const { session, isLoading } = useAuth();

  // Show loading state while session is being fetched
  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-3.5rem)] -m-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Guard against missing session
  if (!session?.id) {
    return (
      <div className="h-[calc(100dvh-3.5rem)] -m-4 flex items-center justify-center">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-3.5rem)] -m-4 flex flex-col overflow-hidden">
      <ChatContainer userId={session.id} inbox="staff" className="flex-1 min-h-0" />
    </div>
  );
}

'use client';

import { Loader2 } from "lucide-react";
import { ChatContainer } from "@/components/messaging";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";

export default function MessagingPage() {
  const { session, isLoading } = useAuth();

  // Show loading state while session is being fetched
  if (isLoading) {
    return (
      <div className="h-full flex">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r border-border/40 p-4 space-y-3 hidden sm:block">
          <Skeleton className="h-10 w-full rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
        {/* Main Chat Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="flex justify-end">
              <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-64 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guard against missing session
  if (!session?.id) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatContainer userId={session.id} inbox="personal" className="flex-1 min-h-0" />
    </div>
  );
}

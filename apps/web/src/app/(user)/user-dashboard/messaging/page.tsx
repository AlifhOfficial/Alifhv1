'use client';

import { ChatContainer } from "@/components/messaging";
import { useAuth } from "@/providers/auth-provider";

export default function MessagingPage() {
  const { session } = useAuth();

  return (
    <div className="h-[calc(100vh-3.5rem)] -m-4">
      <ChatContainer userId={session?.id} inbox="personal" />
    </div>
  );
}

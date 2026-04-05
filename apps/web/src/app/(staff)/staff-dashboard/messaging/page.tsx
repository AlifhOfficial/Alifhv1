/**
 * Staff Messaging Page
 * V1: Customer inquiries only (team chat disabled for launch)
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { ChatContainer } from '@/components/messaging';

export default async function MessagingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/?auth=signin');
  }

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

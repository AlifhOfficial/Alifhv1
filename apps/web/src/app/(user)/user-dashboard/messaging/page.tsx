/**
 * User Messaging Page
 * Personal inbox for direct messages
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
        inbox="personal"
        className="flex-1 min-h-0"
      />
    </div>
  );
}

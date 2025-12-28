/**
 * Staff Messaging Page
 * V1: Customer inquiries only (team chat disabled for launch)
 */

import { ChatContainer } from "@/components/messaging";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MessagingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="h-[calc(100vh-3.5rem)] -m-4">
      <ChatContainer userId={user.id} inbox="staff" />
    </div>
  );
}

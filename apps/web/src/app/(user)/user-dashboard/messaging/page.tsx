import { ChatContainer } from "@/components/messaging";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export default async function MessagingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="h-full">
      <ChatContainer userId={user.id} inbox="personal" />
    </div>
  );
}

/**
 * Settings Page - Account Management
 * Privacy controls, preferences, and account actions
 */

import { SettingsView } from "@/components/profile";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return <SettingsView userName={user.name} userEmail={user.email} />;
}

/**
 * Settings Page - Account Management
 * Privacy controls, preferences, and account actions
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getCurrentUserProfileBundle } from '@/lib/current-user-profile';
import { SettingsView } from "@/components/profile";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const initialData = await getCurrentUserProfileBundle(user);

  return <SettingsView initialData={initialData} />;
}

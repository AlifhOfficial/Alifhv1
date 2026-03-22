/**
 * Profile Page - Revvup Design System
 * Ultra-minimal, Apple/Tesla-inspired premium experience
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getCurrentUserProfileBundle } from '@/lib/current-user-profile';
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const initialData = await getCurrentUserProfileBundle(user);

  return <ProfileView initialData={initialData} />;
}

/**
 * Profile Page - Alifh Design System
 * Ultra-minimal, Apple/Tesla-inspired premium experience
 */

import { ProfileView } from "@/components/profile/profile-view";
import { requireAuth } from "@/lib/auth/roles";

export default async function ProfilePage() {
  const user = await requireAuth();

  return <ProfileView userName={user.name} userEmail={user.email} />;
}

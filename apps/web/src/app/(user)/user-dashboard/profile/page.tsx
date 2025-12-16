/**
 * Profile Page - Alifh Design System
 * Ultra-minimal, Apple/Tesla-inspired premium experience
 */

import { ProfileView } from "@/components/profile";
import { requireAuth } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAuth();

  return <ProfileView userName={user.name} userEmail={user.email} />;
}

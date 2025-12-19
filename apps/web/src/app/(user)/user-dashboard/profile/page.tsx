/**
 * Profile Page - Alifh Design System
 * Ultra-minimal, Apple/Tesla-inspired premium experience
 */

import { ProfileView } from "@/components/profile";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return <ProfileView userName={user.name} userEmail={user.email} />;
}

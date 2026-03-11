/**
 * Profile Page - Revvup Design System
 * Ultra-minimal, Apple/Tesla-inspired premium experience
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getUserProfileByUserId, ensureUserProfile, calculateUserStats, db, passkey, eq } from '@alifh/database';
import { ProfileView } from "@/components/profile";
import type { UserProfileResponse } from '@/hooks/profile/user/use-user-profile';

async function attachAvatarUrl(profile: any) {
  if (!profile.avatar) {
    return { ...profile, avatarUrl: null };
  }

  if (profile.avatar.startsWith('http')) {
    return { ...profile, avatarUrl: profile.avatar };
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) {
    return { ...profile, avatarUrl: null };
  }

  const cacheBuster = profile.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();
  return {
    ...profile,
    avatarUrl: `${publicUrl.replace(/\/$/, '')}/${profile.avatar}?v=${cacheBuster}`,
  };
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  let profile = await getUserProfileByUserId(user.id);
  if (!profile) {
    profile = await ensureUserProfile(user.id);
  }

  const profileWithAvatar = await attachAvatarUrl(profile);
  const [stats, passkeys] = await Promise.all([
    calculateUserStats(user.id),
    db.select({
      id: passkey.id,
      name: passkey.name,
      createdAt: passkey.createdAt,
    })
    .from(passkey)
    .where(eq(passkey.userId, user.id))
    .orderBy(passkey.createdAt),
  ]);

  const initialData: UserProfileResponse = {
    profile: profileWithAvatar,
    stats,
    passkeys,
  };

  return <ProfileView initialData={initialData} />;
}

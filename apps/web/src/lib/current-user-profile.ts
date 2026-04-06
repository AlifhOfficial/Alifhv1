import {
  db,
  ensureCurrentUserProfile,
  eq,
  getCurrentUserProfileByUserId,
  passkey,
} from '@alifh/database';
import type { ExtendedUser } from '@/types/auth';
import type { UserProfile, UserProfileResponse } from '@/hooks/profile/user/use-user-profile';
import { getCachedUserStats } from '@/lib/user-stats-cache';

async function attachAvatarUrl(profile: UserProfile) {
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

function mergeSessionFields(profile: Awaited<ReturnType<typeof ensureCurrentUserProfile>>, user: ExtendedUser): UserProfile {
  return {
    ...profile,
    emailVerified: user.emailVerified,
    phoneNumberVerified: user.phoneNumberVerified ?? false,
  };
}

export async function getCurrentUserProfileBundle(user: ExtendedUser): Promise<UserProfileResponse> {
  let profile = await getCurrentUserProfileByUserId(user.id);
  if (!profile) {
    profile = await ensureCurrentUserProfile(user.id);
  }

  const profileWithSession = mergeSessionFields(profile, user);
  const profileWithAvatar = await attachAvatarUrl(profileWithSession);

  const [stats, passkeys] = await Promise.all([
    getCachedUserStats(user.id),
    db.select({
      id: passkey.id,
      name: passkey.name,
      createdAt: passkey.createdAt,
    })
      .from(passkey)
      .where(eq(passkey.userId, user.id))
      .orderBy(passkey.createdAt),
  ]);

  return {
    profile: profileWithAvatar,
    stats,
    passkeys,
  };
}

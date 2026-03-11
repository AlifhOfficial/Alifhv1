import { getSessionUser } from '@/lib/auth/session-context';
import { getStaffProfileWithPartner, getUserProfileByUserId, ensureUserProfile, calculateUserStats, db, passkey, eq } from '@alifh/database';
import { StaffProfileForm } from "@/components/staff/staff-profile-form";
import type { UserProfileResponse } from '@/hooks/profile/user/use-user-profile';

async function attachAvatarUrl(profile: any) {
  if (!profile.avatar) return { ...profile, avatarUrl: null };
  if (profile.avatar.startsWith('http')) return { ...profile, avatarUrl: profile.avatar };
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) return { ...profile, avatarUrl: null };
  const cacheBuster = profile.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();
  return {
    ...profile,
    avatarUrl: `${publicUrl.replace(/\/$/, '')}/${profile.avatar}?v=${cacheBuster}`,
  };
}

export default async function StaffProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [staffProfile, rawUserProfile, stats, passkeys] = await Promise.all([
    getStaffProfileWithPartner(user.id),
    getUserProfileByUserId(user.id).then((profile) => profile ?? ensureUserProfile(user.id)),
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

  const initialUserProfile: UserProfileResponse = {
    profile: await attachAvatarUrl(rawUserProfile),
    stats,
    passkeys,
  };

  return <StaffProfileForm initialProfile={staffProfile as any} initialUserProfile={initialUserProfile} />;
}

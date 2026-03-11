/**
 * Staff Works For Page
 * Shows the partner profile that the staff member works for
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getDealerBaseProfile } from '@alifh/database';
import { StaffWorksFor } from '@/components/staff/staff-works-for';

function attachImageUrls(profile: any) {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl) return { ...profile, logoUrl: null, heroImageUrl: null };
  const cacheBuster = profile.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();
  return {
    ...profile,
    logoUrl: profile.logo
      ? (profile.logo.startsWith('http') ? profile.logo : `${publicUrl.replace(/\/$/, '')}/${profile.logo}?v=${cacheBuster}`)
      : null,
    heroImageUrl: profile.heroImage
      ? (profile.heroImage.startsWith('http') ? profile.heroImage : `${publicUrl.replace(/\/$/, '')}/${profile.heroImage}?v=${cacheBuster}`)
      : null,
  };
}

export default async function StaffWorksForPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const membership = user.partnerMemberships?.[0];
  if (!membership?.partnerId) return null;

  const profile = await getDealerBaseProfile(membership.partnerId);

  return <StaffWorksFor initialProfile={profile ? attachImageUrls(profile) : null} />;
}

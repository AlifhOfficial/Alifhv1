/**
 * Partner Basic Profile Page
 * Quick edit for essential dealer information (30 base fields)
 * - Brand info, location, contact
 * - Logo, hero image
 * - Description, specialties
 * 
 * For full settings including features/hours/notifications, see /profile
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerBasicProfileForm } from "@/components/partner/car-dealer/partner-basic-profile-form";
import { calculatePartnerStats, getDealerBaseProfile } from '@alifh/database';

function attachImageUrls(profile: any) {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicUrl || !profile) return profile;
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

export default async function PartnerBasicProfilePage() {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  const partnerId = (user as any).partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  const [profile, stats] = await Promise.all([
    getDealerBaseProfile(partnerId),
    calculatePartnerStats(partnerId),
  ]);

  return (
    <PartnerBasicProfileForm
      partnerId={partnerId}
      initialProfile={attachImageUrls(profile)}
      initialStats={stats}
    />
  );
}

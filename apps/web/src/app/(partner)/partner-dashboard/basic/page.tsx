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
import { PartnerBasicProfileForm } from "@/components/partner";

export default async function PartnerBasicProfilePage() {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  const partnerId = (user as any).partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerBasicProfileForm partnerId={partnerId} />;
}

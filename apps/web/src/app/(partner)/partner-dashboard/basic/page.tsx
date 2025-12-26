/**
 * Partner Basic Profile Page
 * Quick edit for essential dealer information (30 base fields)
 * - Brand info, location, contact
 * - Logo, hero image
 * - Description, specialties
 * 
 * For full settings including features/hours/notifications, see /profile
 */

import { PartnerBasicProfileForm } from "@/components/partner";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PartnerBasicProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get the first active partner membership
  const partnerId = user.partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerBasicProfileForm partnerId={partnerId} />;
}

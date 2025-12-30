/**
 * Partner Basic Profile Page
 * Quick edit for essential dealer information (30 base fields)
 * - Brand info, location, contact
 * - Logo, hero image
 * - Description, specialties
 * 
 * For full settings including features/hours/notifications, see /profile
 */

'use client';

import { PartnerBasicProfileForm } from "@/components/partner";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

export default function PartnerBasicProfilePage() {
  const { session } = useAuth();
  
  if (!session) redirect('/');

  // Get the first active partner membership
  const partnerId = (session as any).partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerBasicProfileForm partnerId={partnerId} />;
}

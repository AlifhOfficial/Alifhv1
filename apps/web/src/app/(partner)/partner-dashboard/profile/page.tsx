/**
 * Partner Comprehensive Profile Page
 * Full detailed settings including:
 * - Features (delivery, test drives, financing)
 * - Business hours
 * - Notification preferences
 * - Gallery images
 * - All media assets
 * 
 * For quick edits of basic info, see /basic
 */

'use client';

import { PartnerProfileComprehensiveForm } from "@/components/partner";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

export default function PartnerProfileSettingsPage() {
  const { session } = useAuth();
  
  if (!session) redirect('/');

  // Get the first active partner membership
  const partnerId = (session as any).partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerProfileComprehensiveForm partnerId={partnerId} />;
}

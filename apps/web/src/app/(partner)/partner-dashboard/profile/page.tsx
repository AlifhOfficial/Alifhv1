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

import { PartnerProfileComprehensiveForm } from "@/components/partner";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PartnerProfileSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get the first active partner membership
  const partnerId = user.partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerProfileComprehensiveForm partnerId={partnerId} />;
}

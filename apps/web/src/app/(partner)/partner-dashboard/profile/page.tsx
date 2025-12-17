import { PartnerProfileView } from "@/components/partner/partner-profile-view";
import { requireAuth } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export default async function PartnerProfileSettingsPage() {
  const user = await requireAuth();

  // Get the first active partner membership
  const partnerId = user.partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerProfileView partnerId={partnerId} />;
}

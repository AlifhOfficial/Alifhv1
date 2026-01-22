/**
 * Partner Profile Settings Page
 * Redirects to basic profile - comprehensive form deprecated
 */

import { redirect } from "next/navigation";

export default function PartnerProfileSettingsPage() {
  // Redirect to basic profile page
  redirect("/partner-dashboard/basic");
}

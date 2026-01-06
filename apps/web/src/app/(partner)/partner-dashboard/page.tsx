/**
 * Partner Dashboard Root
 * Redirects to the main insights overview
 */

import { redirect } from 'next/navigation';

export default function PartnerDashboardPage() {
  redirect('/partner-dashboard/insights');
}

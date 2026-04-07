/**
 * Admin Communications Page
 * Manage incoming contact messages and inquiries
 */

import { Metadata } from 'next';
import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminCommunicationsView } from '@/components/communications';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Communications | Admin Dashboard',
  description: REVVUP_META_DESCRIPTION,
};

export default function AdminCommunicationsPage() {
  return (
    <DashboardDisplayArea>
      <AdminCommunicationsView />
    </DashboardDisplayArea>
  );
}

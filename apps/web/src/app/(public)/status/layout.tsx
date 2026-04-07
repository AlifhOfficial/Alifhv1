import type { Metadata } from 'next'
const STATUS_META_DESCRIPTION =
  'Revvup system status and uptime. Check service health, incidents, and maintenance updates.';

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: STATUS_META_DESCRIPTION,
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

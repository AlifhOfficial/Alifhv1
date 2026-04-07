import type { Metadata } from 'next'
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: REVVUP_META_DESCRIPTION,
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

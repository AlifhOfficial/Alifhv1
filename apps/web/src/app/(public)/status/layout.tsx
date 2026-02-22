import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: 'Current status and uptime information for Revvup services',
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

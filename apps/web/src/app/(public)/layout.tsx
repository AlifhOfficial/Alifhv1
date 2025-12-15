/**
 * Public Layout
 * Wraps all public-facing pages with navbar
 */

import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      {children}
    </>
  );
}

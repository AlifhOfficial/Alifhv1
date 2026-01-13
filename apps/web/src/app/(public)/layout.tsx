/**
 * Public Layout
 * Wraps all public-facing pages with navbar and footer
 */

import { Suspense } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/pages/home/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}

function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl h-14 sm:h-16" />
  );
}

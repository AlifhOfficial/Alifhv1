/**
 * Public Layout
 * Wraps all public-facing pages with navbar and footer
 */

import { Suspense } from 'react';
import { Navbar, Footer } from '@/components/shared';
import { GlobalChatProvider } from '@/components/shared/providers/global-chat-provider';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalChatProvider>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main>
        {children}
      </main>
      <Footer />
    </GlobalChatProvider>
  );
}

function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl h-14 sm:h-16" />
  );
}

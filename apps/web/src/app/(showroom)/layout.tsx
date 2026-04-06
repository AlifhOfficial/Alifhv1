/**
 * Showroom Layout
 * Showroom pages have their own ShowroomFooter, so we exclude the main site footer
 */

import { Suspense } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { GlobalChatProvider } from '@/components/shared/providers/global-chat-provider';

export default function ShowroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalChatProvider>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      {children}
    </GlobalChatProvider>
  );
}

function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl h-14 compact:h-16" />
  );
}

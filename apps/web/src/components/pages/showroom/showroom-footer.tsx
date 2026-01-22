/**
 * Showroom Footer
 * Minimal. Just the essentials.
 */

import Link from 'next/link';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomFooterProps {
  showroom: ShowroomData;
}

export function ShowroomFooter({ showroom }: ShowroomFooterProps) {
  const partner = showroom.partner;
  const theme = getAmbientTheme(showroom.ambientStyle);

  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/40">
      <div className={`max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ${theme.bodyClass} text-muted-foreground`}>
        <p>© {new Date().getFullYear()} {partner.brandName}</p>
        <Link href="/" className="hover:text-foreground transition-colors">
          Powered by Alifh
        </Link>
      </div>
    </footer>
  );
}

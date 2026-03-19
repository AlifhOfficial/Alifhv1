import Link from 'next/link';
import { navItems, type NavItem } from '@/lib/navigation';
import { PublicNavbarMenu } from './public-navbar-menu';
import { PublicThemeToggle } from './public-theme-toggle';
import { PublicNavbarAuthControls } from './public-navbar-auth-controls';

export type { NavItem };

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background">
      <div className="flex h-14 items-center max-w-[1600px] mx-auto px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-baseline">
          <Link
            href="/"
            className="inline-flex flex-shrink-0 items-baseline rounded-md pl-0 pr-4 py-2.5"
            suppressHydrationWarning
          >
            <span
              aria-label="Revvup"
              className="text-zinc-900 dark:text-white"
              suppressHydrationWarning
            >
              <span
                className="wordmark-geom block leading-none"
                style={{ fontSize: 20 }}
              >
                Revvup
              </span>
            </span>
          </Link>

          <PublicNavbarMenu navItems={navItems} />
        </div>

        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <PublicThemeToggle />
          <PublicNavbarAuthControls navItems={navItems} />
        </div>
      </div>
    </nav>
  );
}

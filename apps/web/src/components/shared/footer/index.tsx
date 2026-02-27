/**
 * Footer Component - Revvup
 * Clean, minimal, modern
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { footerSections, footerBottomLinks } from '@/lib/navigation';
import { Logo } from '@/components/shared/logo';

function SellLink({ className }: { className?: string }) {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "create listings",
    redirectTo: "/user-dashboard/listings/new",
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
    } else {
      openModal();
    }
  };

  return (
    <>
      <a href="/user-dashboard/listings/new" onClick={handleClick} className={className}>
        Sell
      </a>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-sidebar rounded-t-3xl">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
        
        {/* Main Content */}
        <div className="py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            
            {/* Brand */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo width={100} height={30} />
              </Link>
              <p className="text-sm text-muted-foreground/60 mt-3 max-w-[200px]">
                More than a marketplace.<br />Join the Revolution.
              </p>
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-14">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
                    {section.title}
                  </p>
                  <ul className="space-y-2.5">
                    {section.links.map((item) => (
                      <li key={item.label}>
                        {item.href === "/user-dashboard/listings/new" ? (
                          <SellLink className="text-sm text-foreground/70 hover:text-foreground transition-colors" />
                        ) : (
                          <Link 
                            href={item.href} 
                            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} AISH CAPITALS FZCO · Dubai
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {footerBottomLinks.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

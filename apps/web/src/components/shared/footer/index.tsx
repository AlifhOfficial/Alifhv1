import Link from 'next/link';
import { footerSections, footerBottomLinks } from '@/lib/navigation';
import { FooterSellLink } from './sell-link';

export function Footer() {
  return (
    <footer className="bg-sidebar rounded-t-3xl">
      <div className="max-w-[1600px] mx-auto px-6 large:px-10">
        
        {/* Main Content */}
        <div className="py-10 large:py-14">
          <div className="flex flex-col large:flex-row large:items-start large:justify-between gap-10">
            
            {/* Brand */}
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="wordmark-geom text-foreground" style={{ fontSize: 40 }}>
                  Revvup
                </span>
              </Link>
              <p className="text-subhead text-muted-foreground/60 mt-3 max-w-[200px]">
                More than a marketplace.<br />Join the Revolution.
              </p>
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 compact:grid-cols-4 gap-8 large:gap-14">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <p className="text-caption1 font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
                    {section.title}
                  </p>
                  <ul className="space-y-2.5">
                    {section.links.map((item) => (
                      <li key={item.label}>
                        {item.href === "/user-dashboard/listings/new" ? (
                          <FooterSellLink className="text-subhead text-foreground/70 hover:text-foreground transition-colors" />
                        ) : (
                          <Link 
                            href={item.href} 
                            className="text-subhead text-foreground/70 hover:text-foreground transition-colors"
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
        <div className="py-4 border-t border-border/40 flex flex-col compact:flex-row compact:items-center compact:justify-between gap-3">
          <p className="text-caption1 text-muted-foreground/50">
            © {new Date().getFullYear()} AISH CAPITALS FZCO · Dubai
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {footerBottomLinks.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className="text-caption1 text-muted-foreground/50 hover:text-foreground transition-colors"
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

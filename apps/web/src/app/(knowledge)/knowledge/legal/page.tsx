/**
 * Legal & Finance - Library Index
 * All guides related to insurance, registration, and regulatory matters
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Legal & Finance | Alifh Knowledge Hub',
  description: 'Guides for car insurance, RTA registration, financing, and legal requirements in UAE.',
};

const guides: Array<{
  title: string;
  description: string;
  href: string;
  readTime: string;
}> = [
  // Guides will be added here
];

export default function LegalPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            Knowledge
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Legal & Finance</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          Navigate the regulatory landscape with confidence. Insurance options, RTA procedures, 
          financing, and legal requirements for vehicle ownership in UAE.
        </p>
      </header>

      {/* Guides List */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Guides</h2>
        </div>
        
        {guides.length > 0 ? (
          <div className="space-y-3">
            {guides.map((guide) => (
              <Link 
                key={guide.href}
                href={guide.href} 
                className="flex items-center justify-between p-4 rounded-xl bg-muted/15 border border-border/40 hover:bg-muted/30 transition-colors group"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground/60">{guide.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/40">{guide.readTime}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground/50">
              Guides coming soon
            </p>
            <p className="text-xs text-muted-foreground/40 mt-2">
              We&apos;re working on comprehensive legal and finance guides
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

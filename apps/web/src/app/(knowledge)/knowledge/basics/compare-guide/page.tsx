/**
 * Compare Cars Guide - How to use the comparison tool
 * Following Alifh Design System
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Scale, Share2, CheckCircle2, Sparkles, Car, FileKey2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Compare Cars - Side-by-Side Comparison Guide | Alifh',
  description: 'Learn how to use our free car comparison tool. Compare up to 3 cars side by side with specs, pricing, and features in UAE.',
  keywords: ['compare cars UAE', 'car comparison tool', 'compare vehicles Dubai', 'side by side car comparison'],
};

export default function CompareGuidePage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            Getting Started
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">How to Compare Cars</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          A guide to using our free comparison tool. Compare up to 3 cars side by side 
          and make informed decisions.
        </p>
        <div className="flex gap-3 text-xs text-muted-foreground/50">
          <span>3 min read</span>
          <span>•</span>
          <span>Updated Jan 2026</span>
        </div>
      </header>

      {/* Quick CTA */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/15">
        <div className="flex-1">
          <p className="text-sm font-medium">Ready to compare?</p>
          <p className="text-xs text-muted-foreground/60">Start comparing cars right now</p>
        </div>
        <Link
          href="/tools/compare"
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
        >
          Compare Cars
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Section 1: What it does */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">What is the Compare Tool?</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          The <strong className="text-foreground">Compare Cars</strong> tool lets you view up to 3 vehicles 
          side by side. See specifications, pricing, mileage, and features at a glance—making it easier to 
          spot the best value.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Scale, title: 'Side by Side', desc: 'View all specs in one place', color: 'text-orange-500' },
            { icon: Sparkles, title: 'Highlights', desc: 'Notable values are marked', color: 'text-green-500' },
            { icon: Share2, title: 'Shareable', desc: 'Send links to friends', color: 'text-blue-500' },
            { icon: FileKey2, title: 'VIN Search', desc: 'Find cars by VIN number', color: 'text-purple-500' },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-card/50 rounded-xl border border-border/40 space-y-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: How to use */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">How to Use It</h2>
        </div>

        <div className="space-y-3">
          {[
            { step: '1', title: 'Open the tool', detail: 'Go to Compare Cars from the Tools menu or search bar' },
            { step: '2', title: 'Add cars', detail: 'Click "Add car to compare" and search by make, model, or VIN' },
            { step: '3', title: 'Review specs', detail: 'Scroll through all specifications grouped by category' },
            { step: '4', title: 'Share or decide', detail: 'Copy the link to share or remove cars to try different combos' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground/60">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Search by VIN */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Search by VIN</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Have a VIN number? You can search for cars directly using the 17-character VIN. If the car is 
          listed on Alifh, it will appear instantly.
        </p>

        <div className="flex gap-3 px-4 py-3 bg-muted/15 border border-border/40 rounded-lg text-xs">
          <span className="text-base">💡</span>
          <p className="text-muted-foreground/70">
            <strong className="text-blue-500">Tip:</strong> VIN search also works in the main search bar. 
            Type a VIN anywhere and we&apos;ll find the car for you.
          </p>
        </div>
      </section>

      {/* Section 4: What gets compared */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">What Gets Compared</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          The comparison table shows all available specifications grouped into categories:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            'Price & Mileage',
            'Year & Age',
            'Engine & Power',
            'Transmission',
            'Fuel Type & Economy',
            'Body Type & Doors',
            'Seating Capacity',
            'Exterior & Interior',
            'Regional Specs',
            'Warranty Status',
            'Seller Type',
            'Feature Count',
          ].map((spec) => (
            <div key={spec} className="flex items-center gap-2 text-xs text-muted-foreground/70 py-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-500/70" />
              <span>{spec}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Highlights */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Understanding Highlights</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Values shown in <span className="text-green-500 font-medium">green</span> indicate notable 
          differences that may benefit you:
        </p>

        <div className="space-y-2">
          {[
            { label: 'Lower price', desc: 'The lowest price among compared cars' },
            { label: 'Lower mileage', desc: 'Fewer kilometers driven' },
            { label: 'Newer year', desc: 'Most recent model year' },
            { label: 'More features', desc: 'Highest feature count' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{item.label}</p>
                <p className="text-xs text-muted-foreground/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-4 py-3 bg-muted/15 border border-border/40 rounded-lg text-xs">
          <span className="text-base">⚖️</span>
          <p className="text-muted-foreground/70">
            <strong className="text-foreground">Note:</strong> Highlights are neutral and factual. They don&apos;t 
            indicate a &quot;winner&quot;—just differences worth noting. Always verify details during inspection.
          </p>
        </div>
      </section>

      {/* Section 6: Sharing */}
      <section className="space-y-4">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">Sharing Comparisons</h2>
        </div>
        
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          Click the <strong className="text-foreground">Share</strong> button to copy a link. Anyone with 
          the link can see the same comparison—great for discussing options with family or friends.
        </p>

        <p className="text-xs text-muted-foreground/50">
          The link includes the car IDs in the URL, so your comparison stays intact when shared.
        </p>
      </section>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/40 text-center space-y-4">
        <Car className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Ready to compare?</p>
          <p className="text-xs text-muted-foreground/60">Add up to 3 cars and see how they stack up</p>
        </div>
        <Link
          href="/tools/compare"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Start Comparing
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

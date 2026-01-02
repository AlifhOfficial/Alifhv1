/**
 * Knowledge Center Landing Page
 * Clean navigation hub for all knowledge resources
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Car Knowledge Center | Essential Guides for UAE Buyers',
  description: 'Learn everything about buying, selling, and owning cars in UAE. Expert guides for Dubai, Abu Dhabi car buyers.',
  keywords: ['car buying guide UAE', 'Dubai car guide', 'VIN guide', 'UAE car knowledge'],
};

export default function KnowledgePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-medium tracking-tight mb-6">
            Knowledge Center
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground/70 leading-relaxed">
            Essential guides for the modern car buyer in UAE
          </p>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="pb-20">
              <div className="mb-20">
                <h2 className="text-3xl font-medium mb-6">Getting Started</h2>
              </div>

              {/* Featured Article - Large */}
              <Link href="/knowledge/basics/vin-guide" className="group block mb-16">
                <article>
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[21/9] relative">
                      <Image
                        src="/Marketing_Assets/Knowledge/k1.png"
                        alt="VIN Number Guide"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-medium group-hover:text-foreground/70 transition-colors">
                      What is a VIN Number?
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Understanding the Vehicle Identification Number—a unique code that tells the complete story 
                      of your vehicle's origin, specifications, and history.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground/50 pt-1">
                      <span>Getting Started</span>
                      <span>•</span>
                      <span>Jan 2, 2026</span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Grid of Coming Soon Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/Marketing_Assets/Knowledge/k2.png"
                        alt="GCC Specifications"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Understanding GCC Specs
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Exploring the critical differences between GCC-spec and imported vehicles.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>

                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-orange-400/10 via-red-500/10 to-pink-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Car Inspection Checklist
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      A comprehensive guide to evaluating vehicle condition before purchase.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Buying & Selling Section */}
            <section id="buying-selling" className="pb-20 border-t border-border/40 pt-20">
              <div className="mb-16">
                <h2 className="text-3xl font-medium mb-6">Buying & Selling</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-indigo-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Buying Used Cars in Dubai
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Understanding pricing dynamics and finding exceptional value.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>

                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-400/10 via-fuchsia-500/10 to-pink-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Car Valuation Guide
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Examining factors that influence price and depreciation curves.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>

                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-400/10 via-orange-500/10 to-red-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Negotiation Tips
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      The psychology and strategy of achieving mutually beneficial outcomes.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Legal & Finance Section */}
            <section id="legal-finance" className="pb-20 border-t border-border/40 pt-20">
              <div className="mb-16">
                <h2 className="text-3xl font-medium mb-6">Legal & Finance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-rose-400/10 via-pink-500/10 to-red-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Car Insurance in UAE
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Understanding coverage options and regional requirements.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>

                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-emerald-400/10 via-teal-500/10 to-cyan-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Vehicle Registration
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      The RTA registration process and documentation requirements.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Maintenance Section */}
            <section id="maintenance" className="pb-20 border-t border-border/40 pt-20">
              <div className="mb-16">
                <h2 className="text-3xl font-medium mb-6">Maintenance & Care</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-violet-400/10 via-purple-500/10 to-indigo-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Common Car Issues
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Recognizing early signs through sound and performance.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>

                <article className="group opacity-50">
                  <div className="mb-6 rounded-3xl overflow-hidden border border-border/40">
                    <div className="aspect-[4/3] bg-gradient-to-br from-lime-400/10 via-green-500/10 to-emerald-600/10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium">
                      Service Schedule
                    </h3>
                    <p className="text-base text-muted-foreground/70 leading-relaxed">
                      Timing interventions to maximize vehicle longevity.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/50 pt-1">
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Footer Content - Simplified */}
            <section className="pb-20 border-t border-border/40 pt-20">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-medium">About This Knowledge Center</h2>
                  <p className="text-base text-muted-foreground/60 leading-relaxed max-w-2xl">
                    Crafted specifically for the UAE automotive landscape—understanding GCC specifications, 
                    RTA procedures, and the unique dynamics of the regional market.
                  </p>
                </div>
              </div>
            </section>
    </>
  );
}

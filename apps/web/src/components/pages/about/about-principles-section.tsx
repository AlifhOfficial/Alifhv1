/**
 * About Principles Section
 * What we stand for - matching vision page card style
 */

'use client';

import Image from 'next/image';
import { Heart, BanIcon, CheckCircle2, Clock } from 'lucide-react';

export function AboutPrinciplesSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Principles
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            What We Won't Compromise.
            <br />
            <span className="text-muted-foreground">Ever.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src="/Abstract/pic5.png"
            alt="Our principles"
            fill
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          These aren't marketing slogans. They're the rules we live by, 
          even when it would be easier not to.
        </p>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-primary text-primary-foreground">
            <Heart className="w-5 h-5 text-primary-foreground/70 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Users first</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">Every decision starts with you.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <BanIcon className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">No ads, ever</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Your attention isn't for sale.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <CheckCircle2 className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Quality over quantity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Real listings only. No spam.</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
            <Clock className="w-5 h-5 text-primary/80 mb-3" />
            <h3 className="text-base font-semibold mb-1.5">Long-term thinking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Trust takes time to build.</p>
          </div>
        </div>

      </div>
    </section>
  );
}

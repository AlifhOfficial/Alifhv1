/**
 * About Vision Section
 * More than a marketplace. The ecosystem.
 */

'use client';

import Image from 'next/image';

export function AboutVisionSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          <div className="space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              Vision
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-[1.15]">
              More than a marketplace.
              <br />
              <span className="text-muted-foreground/60">The complete automotive ecosystem.</span>
            </h2>
          </div>
          <div className="text-[15px] text-muted-foreground leading-relaxed">
            <p>
              We're still building. Still learning. Still figuring some things out. 
              But we're doing it the right way, and we think that matters.
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[3/1] overflow-hidden rounded-lg mb-16">
          <Image
            src="/Abstract/rsxx9.png"
            alt="Alifh Vision"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Verticals */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Cars', desc: 'Buy, sell, consign' },
            { name: 'Plates', desc: 'Premium numbers' },
            { name: 'Performance', desc: 'Upgrades & parts' },
            { name: 'Care', desc: 'Service & maintenance' },
            { name: 'Knowledge', desc: 'Guides & resources' },
            { name: 'Events', desc: 'Meets & track days' },
          ].map((item, i) => (
            <div key={i} className={`p-5 rounded-lg ${i === 0 ? 'bg-[#0066FF] text-white' : 'border border-border/40 bg-sidebar'}`}>
              <h3 className={`text-[15px] font-semibold mb-1 ${i === 0 ? '' : 'text-foreground'}`}>{item.name}</h3>
              <p className={`text-[13px] ${i === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

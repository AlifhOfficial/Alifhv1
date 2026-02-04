/**
 * About Vision Section
 * Where we're going. The ecosystem.
 */

'use client';

import Image from 'next/image';

export function AboutVisionSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            The Vision
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            More than a marketplace.
            <br />
            <span className="text-muted-foreground">The automotive ecosystem.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-lg mb-8">
          <Image
            src="/Abstract/pic4.png"
            alt="Revvup Vision"
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Description below image - Small paragraphs */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
          <p className="text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
            Cars are just the start. We're building an automotive ecosystem—plates, performance parts, maintenance, knowledge, events. Everything enthusiasts need in one place, with the same philosophy: honest, clean, no games.
          </p>
        </div>

        {/* Verticals */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Cars', desc: 'Buy & sell', active: true },
            { name: 'Plates', desc: 'Coming soon', active: false },
            { name: 'Performance', desc: 'Coming soon', active: false },
            { name: 'Care', desc: 'Coming soon', active: false },
            { name: 'Knowledge', desc: 'Coming soon', active: false },
            { name: 'Events', desc: 'Coming soon', active: false },
          ].map((item, i) => (
            <div key={i} className={`p-5 rounded-xl ${item.active ? 'bg-primary text-primary-foreground' : 'border border-border/40 bg-sidebar'}`}>
              <h3 className={`text-base font-semibold mb-1 ${item.active ? '' : 'text-foreground'}`}>{item.name}</h3>
              <p className={`text-sm ${item.active ? 'text-white/70' : 'text-muted-foreground/60'}`}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

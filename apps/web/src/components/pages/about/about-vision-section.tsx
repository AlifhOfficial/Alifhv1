/**
 * About Vision Section
 * Where we're headed - matching vision page style
 */

'use client';

import Image from 'next/image';
import { Car, CreditCard, Wrench, BookOpen, Calendar, Tag } from 'lucide-react';

export function AboutVisionSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            What's Next
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Cars Are Just the Start.
            <br />
            <span className="text-muted-foreground">More coming soon.</span>
          </h2>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-sidebar border border-border/40 mb-12">
          <Image
            src="/Abstract/pic4.png"
            alt="Revvup Vision"
            fill
            className="object-cover"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
          Same philosophy. Same standards. We're expanding to cover everything 
          car enthusiasts in the UAE need.
        </p>

        {/* Verticals as feature cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-xl bg-primary text-primary-foreground text-center">
            <Car className="w-5 h-5 text-primary-foreground/70 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Cars</h3>
            <p className="text-xs text-primary-foreground/70 mt-1">Live</p>
          </div>
          <div className="p-5 rounded-xl border border-border/40 bg-sidebar text-center">
            <Tag className="w-5 h-5 text-primary/80 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Plates</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Soon</p>
          </div>
          <div className="p-5 rounded-xl border border-border/40 bg-sidebar text-center">
            <Wrench className="w-5 h-5 text-primary/80 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Parts</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Soon</p>
          </div>
          <div className="p-5 rounded-xl border border-border/40 bg-sidebar text-center">
            <CreditCard className="w-5 h-5 text-primary/80 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Services</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Soon</p>
          </div>
          <div className="p-5 rounded-xl border border-border/40 bg-sidebar text-center">
            <BookOpen className="w-5 h-5 text-primary/80 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Guides</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Soon</p>
          </div>
          <div className="p-5 rounded-xl border border-border/40 bg-sidebar text-center">
            <Calendar className="w-5 h-5 text-primary/80 mx-auto mb-2" />
            <h3 className="text-sm font-semibold">Events</h3>
            <p className="text-xs text-muted-foreground/60 mt-1">Soon</p>
          </div>
        </div>

      </div>
    </section>
  );
}

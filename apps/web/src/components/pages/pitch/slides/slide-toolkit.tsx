/**
 * Slide: The Toolkit
 * Dashboard, Leads, Analytics.
 */

'use client';

import Image from 'next/image';
import { BrowserWindow } from '../shared/browser-window';

export function SlideTheToolkit() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-sidebar py-24">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Dealer Toolkit
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Dashboard. Leads. Analytics.
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Everything you need in one place.
          </p>
        </div>

        {/* Browser Window */}
        <div className="max-w-5xl mx-auto">
          <BrowserWindow url="revvup.ae/partner">
            <Image
              src="/Marketing/Partner_dashboard_shots/overviewtab.png"
              alt="Partner Dashboard"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
          </BrowserWindow>
        </div>

      </div>
    </section>
  );
}

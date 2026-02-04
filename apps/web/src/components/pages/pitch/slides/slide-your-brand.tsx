/**
 * Slide: Your Brand
 * Live inventory, trust metrics.
 */

'use client';

import { BrowserWindow } from '../shared/browser-window';

export function SlideYourBrand() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-background py-24">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Your Brand
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Live Inventory. Trust Metrics.
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            We show your full inventory, response time, Google rating—everything that builds trust.
          </p>
        </div>

        {/* Browser Window with Video */}
        <div className="max-w-5xl mx-auto">
          <BrowserWindow url="revvup.ae/showroom">
            <video
              src="/Marketing/lookgood6.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </BrowserWindow>
        </div>

      </div>
    </section>
  );
}

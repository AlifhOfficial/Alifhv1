/**
 * Badges Hero Section - Revvup Badges Page
 * Clean hero - simple and direct
 */

import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { signin } from '@/components/pages/marketing-image-assets';

export function BadgesHeroSection() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Recognition
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Badges at Revvup.
            <br />
            <span className="text-muted-foreground">Earned. Not bought.</span>
          </h1>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1] overflow-hidden rounded-lg">
          <Image
            src={signin}
            alt="Revvup Badges"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mt-8 leading-relaxed">
          Hand-picked by Team Revvup. Recognition for those who embody our values.
        </p>

      </div>
    </section>
  );
}

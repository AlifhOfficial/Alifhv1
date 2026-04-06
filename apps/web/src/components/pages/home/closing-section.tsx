import { MarketingImage as Image } from '@/components/pages/marketing-image';
import Link from 'next/link';
import { MacOSWindow } from '@/components/ui/macos-window';
import { revx9 } from '@/components/pages/marketing-image-assets';
import { PublicSellButton } from '@/components/shared/public-sell-button';

export function ClosingSection() {
  return (
    <section className="relative bg-background">

      {/* Section 1: Philosophy with Infographic */}
      <div className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Built by car people
            </span>
            <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
              We get it.
            </h2>
          </div>

          {/* Infographic */}
          <div className="mb-12">
            <CarPeopleInfographic />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center mb-12 leading-relaxed">
            We built the marketplace we wished existed in Dubai. Free for private sellers, built for new and used cars, with no fees, no clutter, just cars.
          </p>

          {/* CTA - Main page CTA */}
          <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
            <Link
              href="/listings"
              className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
            >
              Browse Cars
            </Link>
            <PublicSellButton className="w-full compact:w-auto h-11 px-8 bg-muted text-foreground text-subhead font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center">
              Sell Your Car
            </PublicSellButton>
          </div>
        </div>
      </div>

    </section>
  );
}

// ============================================================================
// INFOGRAPHIC: Car People - Video in macOS window
// ============================================================================

function CarPeopleInfographic() {
  return (
    <MacOSWindow url="revvup.ae" contentClassName="relative w-full aspect-[4/3] compact:aspect-[16/9] regular:aspect-[2.4/1]">
      <Image
        src={revx9}
        alt="Revvup closing showcase"
        fill
        className="object-cover object-center object-[center_35%]"
        priority
        sizes="(max-width: 1600px) 100vw, 1600px"
      />
    </MacOSWindow>
  );
}

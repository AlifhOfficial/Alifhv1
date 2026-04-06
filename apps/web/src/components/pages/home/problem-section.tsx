import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { MousePointer2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m3, m5, m7 } from '@/components/pages/marketing-image-assets';

export function ProblemSection() {
  return (
    <div className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Problem
          </span>
          
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Listing fees?
            <br />
            <span className="text-muted-foreground">Not here.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ProblemInfographic />
        </div>

        {/* Description */}
        <p className="text-callout text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
          Most car listing sites in Dubai charge AED 500–1,000 just to post. Then they want more to "boost" your ad. We don't charge private sellers anything. Ever.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: The Problem - Animated cursor comparison
// ============================================================================

function ProblemInfographic() {
  return (
    <>
      <MacOSWindow url="car-marketplace.ae" contentClassName="flex flex-col regular:flex-row aspect-[3/4] compact:aspect-[4/3] regular:aspect-[16/9] large:aspect-[2.4/1] overflow-visible">
        {/* Left - Others: Cluttered fees */}
        <div className="flex-1 p-4 compact:p-8 large:p-16 flex flex-col items-center justify-center border-b regular:border-b-0 regular:border-r border-white/5 min-h-[200px] compact:min-h-0 overflow-visible">
          <span className="text-caption2 compact:text-caption1 text-white/30 mb-4 compact:mb-8 large:mb-10">Others</span>
          
          <div className="relative flex items-center justify-center gap-1 compact:gap-2 large:gap-4 w-full max-w-full py-4 px-6 compact:px-4">
            {/* Left car image - hidden on mobile */}
            <div className="relative hidden compact:block w-24 large:w-44 xlarge:w-56 aspect-[4/3] rounded-lg large:rounded-xl overflow-hidden border border-white/10 -rotate-3 opacity-60 flex-shrink-0">
              <Image src={m3} alt="" fill className="object-cover" sizes="(max-width: 1280px) 176px, 224px" />
            </div>
            
            {/* Main car image - center */}
            <div className="relative w-40 compact:w-48 large:w-72 xlarge:w-[380px] aspect-[4/3] rounded-lg large:rounded-xl overflow-hidden border border-white/10 z-10 flex-shrink-0">
              <Image src={m5} alt="" fill className="object-cover opacity-70" sizes="(max-width: 640px) 160px, (max-width: 1280px) 288px, 380px" />
            </div>
            
            {/* Right car image - hidden on mobile */}
            <div className="relative hidden compact:block w-24 large:w-44 xlarge:w-56 aspect-[4/3] rounded-lg large:rounded-xl overflow-hidden border border-white/10 rotate-3 opacity-60 flex-shrink-0">
              <Image src={m7} alt="" fill className="object-cover" sizes="(max-width: 1280px) 176px, 224px" />
            </div>
            
            {/* Fee badges */}
            <div className="absolute -top-2 compact:-top-3 large:-top-4 right-4 compact:right-2 large:-right-2 px-1.5 compact:px-3 large:px-4 py-0.5 compact:py-1 large:py-2 rounded-md bg-destructive text-[7px] compact:text-caption2 large:text-caption1 font-bold text-white shadow-xl rotate-3 z-20">
              AED 999
              {/* Chaotic cursor - near AED 999 */}
              <div 
                className="absolute -bottom-3 -left-3 compact:-bottom-4 compact:-left-4 large:-bottom-6 large:-left-6"
                style={{ animation: 'cursor-chaos 2.5s ease-in-out infinite' }}
              >
                <MousePointer2 className="w-3 h-3 compact:w-4 compact:h-4 large:w-6 large:h-6 text-white/70 fill-white/20 drop-shadow-lg" />
                <div 
                  className="absolute -inset-1 compact:-inset-2 rounded-full border-2 border-white/30"
                  style={{ animation: 'click-ripple 2.5s ease-in-out infinite' }}
                />
              </div>
            </div>
            <div className="absolute top-8 compact:top-12 large:top-16 left-4 compact:left-2 large:-left-2 px-1 compact:px-2 large:px-3 py-0.5 compact:py-1 large:py-1.5 rounded-md bg-orange-500 text-[6px] compact:text-[9px] large:text-caption2 font-semibold text-white shadow-lg -rotate-6">
              Boost +49
            </div>
            <div className="absolute bottom-0 compact:-bottom-1 large:-bottom-2 right-8 compact:right-12 large:right-16 px-1 compact:px-2 large:px-3 py-0.5 compact:py-1 large:py-1.5 rounded-md bg-warning text-[6px] compact:text-[9px] large:text-caption2 font-semibold text-white shadow-lg rotate-2">
              Feature
            </div>
          </div>
          
          <p className="text-[9px] compact:text-caption2 large:text-caption1 text-white/30 mt-4 compact:mt-6 large:mt-10">Pay for everything</p>
        </div>
        
        {/* Right - Revvup: Clean proposition */}
        <div className="w-full regular:w-[200px] large:w-[280px] xlarge:w-[360px] p-6 compact:p-10 large:p-16 flex flex-col items-center justify-center min-h-[180px] compact:min-h-0">
          <span className="text-caption2 compact:text-caption1 text-primary mb-4 compact:mb-6 large:mb-10">Revvup</span>
          
          <div className="flex flex-col items-center">
            {/* Giant zero */}
            <div 
              className="text-display1 compact:text-display3 large:text-display4 xlarge:text-display5 font-bold text-primary leading-none"
              style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
            >
              0
            </div>
            <span className="text-caption1 compact:text-subhead large:text-callout text-primary/80 font-medium mt-1 compact:mt-2">fees</span>
          </div>
          
          <p className="text-[9px] compact:text-caption2 large:text-caption1 text-white/30 mt-4 compact:mt-6 large:mt-10">Just list</p>
        </div>
      </MacOSWindow>
    </>
  );
}

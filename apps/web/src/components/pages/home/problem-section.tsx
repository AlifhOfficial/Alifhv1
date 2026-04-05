import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { MousePointer2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m3, m5, m7 } from '@/components/pages/marketing-image-assets';

export function ProblemSection() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Problem
          </span>
          
          <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
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
      <MacOSWindow url="car-marketplace.ae" contentClassName="flex flex-col md:flex-row aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.4/1] overflow-visible">
        {/* Left - Others: Cluttered fees */}
        <div className="flex-1 p-4 sm:p-8 lg:p-16 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 min-h-[200px] sm:min-h-0 overflow-visible">
          <span className="text-[10px] sm:text-caption1 font-medium text-white/30 mb-4 sm:mb-8 lg:mb-10">Others</span>
          
          <div className="relative flex items-center justify-center gap-1 sm:gap-2 lg:gap-4 w-full max-w-full py-4 px-6 sm:px-4">
            {/* Left car image - hidden on mobile */}
            <div className="relative hidden sm:block w-24 lg:w-44 xl:w-56 aspect-[4/3] rounded-lg lg:rounded-xl overflow-hidden border border-white/10 -rotate-3 opacity-60 flex-shrink-0">
              <Image src={m3} alt="" fill className="object-cover" sizes="(max-width: 1280px) 176px, 224px" />
            </div>
            
            {/* Main car image - center */}
            <div className="relative w-40 sm:w-48 lg:w-72 xl:w-[380px] aspect-[4/3] rounded-lg lg:rounded-xl overflow-hidden border border-white/10 z-10 flex-shrink-0">
              <Image src={m5} alt="" fill className="object-cover opacity-70" sizes="(max-width: 640px) 160px, (max-width: 1280px) 288px, 380px" />
            </div>
            
            {/* Right car image - hidden on mobile */}
            <div className="relative hidden sm:block w-24 lg:w-44 xl:w-56 aspect-[4/3] rounded-lg lg:rounded-xl overflow-hidden border border-white/10 rotate-3 opacity-60 flex-shrink-0">
              <Image src={m7} alt="" fill className="object-cover" sizes="(max-width: 1280px) 176px, 224px" />
            </div>
            
            {/* Fee badges */}
            <div className="absolute -top-2 sm:-top-3 lg:-top-4 right-4 sm:right-2 lg:-right-2 px-1.5 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-2 rounded-md bg-red-500 text-[7px] sm:text-[10px] lg:text-caption1 font-bold text-white shadow-xl rotate-3 z-20">
              AED 999
              {/* Chaotic cursor - near AED 999 */}
              <div 
                className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 lg:-bottom-6 lg:-left-6"
                style={{ animation: 'cursor-chaos 2.5s ease-in-out infinite' }}
              >
                <MousePointer2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white/70 fill-white/20 drop-shadow-lg" />
                <div 
                  className="absolute -inset-1 sm:-inset-2 rounded-full border-2 border-white/30"
                  style={{ animation: 'click-ripple 2.5s ease-in-out infinite' }}
                />
              </div>
            </div>
            <div className="absolute top-8 sm:top-12 lg:top-16 left-4 sm:left-2 lg:-left-2 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md bg-orange-500 text-[6px] sm:text-[9px] lg:text-caption2 font-semibold text-white shadow-lg -rotate-6">
              Boost +49
            </div>
            <div className="absolute bottom-0 sm:-bottom-1 lg:-bottom-2 right-8 sm:right-12 lg:right-16 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md bg-amber-600 text-[6px] sm:text-[9px] lg:text-caption2 font-semibold text-white shadow-lg rotate-2">
              Feature
            </div>
          </div>
          
          <p className="text-[9px] sm:text-[10px] lg:text-caption1 text-white/30 mt-4 sm:mt-6 lg:mt-10">Pay for everything</p>
        </div>
        
        {/* Right - Revvup: Clean proposition */}
        <div className="w-full md:w-[200px] lg:w-[280px] xl:w-[360px] p-6 sm:p-10 lg:p-16 flex flex-col items-center justify-center min-h-[180px] sm:min-h-0">
          <span className="text-[10px] sm:text-caption1 font-medium text-primary mb-4 sm:mb-6 lg:mb-10">Revvup</span>
          
          <div className="flex flex-col items-center">
            {/* Giant zero */}
            <div 
              className="text-display1 sm:text-display3 lg:text-display4 xl:text-display5 font-bold text-primary leading-none"
              style={{ animation: 'glow-zero 3s ease-in-out infinite' }}
            >
              0
            </div>
            <span className="text-caption1 sm:text-subhead lg:text-callout text-primary/80 font-medium mt-1 sm:mt-2">fees</span>
          </div>
          
          <p className="text-[9px] sm:text-[10px] lg:text-caption1 text-white/30 mt-4 sm:mt-6 lg:mt-10">Just list</p>
        </div>
      </MacOSWindow>
    </>
  );
}

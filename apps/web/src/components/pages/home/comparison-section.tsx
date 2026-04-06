import { MarketingImage as Image } from '@/components/pages/marketing-image';
import { CheckCircle2 } from 'lucide-react';
import { MacOSWindow } from '@/components/ui/macos-window';
import { m8, m12 } from '@/components/pages/marketing-image-assets';

const COMPARISON_DATA = [
  { label: 'Listing cost', others: 'AED 500–1,000+', alifh: 'Free' },
  { label: 'Get seen', others: 'Pay to rank higher', alifh: 'Quality ranks higher' },
  { label: 'Ads', others: 'Everywhere', alifh: 'None' },
  { label: 'Duplicates', others: 'Same car reposted', alifh: 'One listing per car' },
  { label: 'Test drives', others: 'Phone calls', alifh: 'Book online' },
  { label: 'Old listings', others: 'Stay forever', alifh: 'Auto-removed' },
];

export function ComparisonSection() {
  return (
    <div className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
            The Difference
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            Us vs them.
            <br />
            <span className="text-muted-foreground">You decide.</span>
          </h2>
        </div>

        {/* Infographic */}
        <div className="mb-12">
          <ComparisonInfographic />
        </div>

        {/* Clean Comparison Grid - like partner compare */}
        <div className="grid compact:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-4xl mx-auto">
          
          {/* Others */}
          <div className="p-8 bg-sidebar">
            <p className="text-subhead font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">Typical platforms</p>
            <div className="space-y-6">
              {COMPARISON_DATA.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-subhead text-muted-foreground">{item.label}</span>
                  <span className="text-subhead text-foreground/60">{item.others}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revvup */}
          <div className="p-8 bg-primary text-primary-foreground">
            <p className="text-subhead font-semibold uppercase tracking-wider text-white/60 mb-8">Revvup</p>
            <div className="space-y-6">
              {COMPARISON_DATA.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-subhead text-white/70">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-subhead font-semibold">{item.alifh}</span>
                    <CheckCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INFOGRAPHIC: Buyer's perspective - What they actually see
// ============================================================================

function ComparisonInfographic() {
  return (
    <>
      <MacOSWindow url="car-listings.com" contentClassName="flex flex-col regular:flex-row aspect-[3/4] compact:aspect-[4/3] regular:aspect-[16/9] large:aspect-[2.4/1]">
        {/* Left - Others: Cluttered feed with media */}
        <div className="w-full regular:w-[40%] flex flex-col border-b regular:border-b-0 regular:border-r border-white/5 p-4 compact:p-6 large:p-12">
          <span className="text-caption2 compact:text-caption1 text-white/40 mb-3 compact:mb-4 large:mb-6">Elsewhere</span>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div 
              className="w-full max-w-[200px] compact:max-w-[240px] large:max-w-[260px] space-y-2 compact:space-y-2.5 large:space-y-3"
              style={{ animation: 'scroll-feed 6s ease-in-out infinite' }}
            >
              {/* Ad banner */}
              <div className="h-6 compact:h-7 large:h-8 rounded-md compact:rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center">
                <span className="text-[7px] compact:text-[8px] large:text-caption2 text-warning/70 font-medium tracking-wide">SPONSORED</span>
              </div>
              
              {/* Listing with image */}
              <div className="p-1.5 compact:p-2 large:p-2.5 rounded-md compact:rounded-lg bg-white/5 border border-white/10">
                <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-1.5 compact:mb-2">
                  <Image src={m8} alt="" className="w-full h-full object-cover opacity-70 grayscale-[30%]" sizes="(max-width: 768px) 200px, 260px" />
                </div>
                <div className="h-1.5 compact:h-2 large:h-2.5 w-3/4 rounded bg-white/15" />
              </div>
              
              {/* Your listing - buried and faded */}
              <div className="p-1.5 compact:p-2 large:p-2.5 rounded-md compact:rounded-lg bg-white/5 border border-white/5 opacity-40">
                <div className="aspect-[16/9] rounded overflow-hidden bg-white/10 mb-1.5 compact:mb-2">
                  <Image src={m12} alt="" className="w-full h-full object-cover opacity-50 grayscale" sizes="(max-width: 768px) 200px, 260px" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-1 compact:h-1.5 large:h-2 w-1/2 rounded bg-white/10" />
                  <p className="text-[6px] compact:text-[7px] large:text-[9px] text-white/40">Your listing</p>
                </div>
              </div>
              
              {/* Ad */}
              <div className="h-5 compact:h-6 large:h-7 rounded-md compact:rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <span className="text-[6px] compact:text-[7px] large:text-[9px] text-white/30">AD</span>
              </div>
            </div>
          </div>
          
          <p className="text-[7px] compact:text-[8px] large:text-caption1 text-white/30 mt-2 compact:mt-3 large:mt-5 text-center">Buried in the noise</p>
        </div>
        
        {/* Right - Revvup: Clean "No Noise" */}
        <div className="w-full regular:w-[60%] flex flex-col p-4 compact:p-6 large:p-12 min-h-[180px] compact:min-h-0">
          <span className="text-caption2 compact:text-caption1 text-primary mb-3 compact:mb-4 large:mb-6">Revvup</span>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-title1 compact:text-display1 large:text-display3 xlarge:text-display5 font-bold text-white tracking-tight">
                No Noise
              </p>
              <p className="text-subhead compact:text-callout large:text-title3 text-white/40 mt-2 compact:mt-4 large:mt-6">Just cars.</p>
            </div>
          </div>
          
          <p className="text-[8px] compact:text-[9px] large:text-caption1 text-primary/70 text-center">Your car. Seen. Sold.</p>
        </div>
      </MacOSWindow>
    </>
  );
}

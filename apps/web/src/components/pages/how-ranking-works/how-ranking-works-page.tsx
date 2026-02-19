/**
 * How Ranking Works Page
 * 
 * Principles-based explainer — values, not math.
 * Clean, confident, non-corporate Revvup tone.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getStaticUrl } from '@/utils';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';
import { MacOSWindow } from '@/components/ui/macos-window';

export function HowRankingWorksPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCreateListing = () => {
    if (session) {
      router.push('/user-dashboard/listings/new');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <main className="bg-background">
      
      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Transparency
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              How listings rank.
              <br />
              <span className="text-muted-foreground">No boosts. Just quality.</span>
            </h1>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.4/1] overflow-hidden rounded-lg">
            <Image
              src={getStaticUrl("/Abstract/rsxx2.png")}
              alt="Revvup Ranking"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
          </div>

          {/* Description below image */}
          <p className="text-base text-muted-foreground max-w-lg mx-auto text-center mt-8 leading-relaxed">
            Revvup doesn't sell boosts or promoted listings. Visibility is earned through quality, transparency, and genuine buyer interest.
          </p>
        </div>
      </section>

      {/* Do's and Don'ts - Grid comparison like partner page */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              The rules are simple
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              What works. What doesn't.
            </h2>
          </div>

          {/* Comparison Grid - Same pattern as partner-compare-section */}
          <div className="grid sm:grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 max-w-5xl mx-auto">
            
            {/* What Helps */}
            <div className="p-8 bg-primary text-primary-foreground">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-8">What helps</p>
              <div className="space-y-6">
                {[
                  { title: 'Clear, real photos', desc: 'Multiple angles, good lighting' },
                  { title: 'Honest descriptions', desc: 'Features, condition, history' },
                  { title: 'Quick responses', desc: 'Reply fast, build trust' },
                  { title: 'Genuine buyer interest', desc: 'Saves, favourites, bookings' },
                  { title: 'Verified status', desc: 'Builds buyer confidence' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Doesn't Help */}
            <div className="p-8 bg-sidebar">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-8">What doesn't</p>
              <div className="space-y-6">
                {[
                  { title: 'Reposting', desc: 'Doesn\'t reset your ranking' },
                  { title: 'Editing to bump', desc: 'Small changes don\'t help' },
                  { title: 'Fake engagement', desc: 'Detected and ignored' },
                  { title: 'Misleading info', desc: 'Hurts your ranking' },
                  { title: 'Low effort', desc: 'Buyers scroll past' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section - Now with Infographic instead of image */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Why we rank this way
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Quality wins.
              <br />
              <span className="text-muted-foreground">That's the point.</span>
            </h2>
          </div>

          {/* Infographic */}
          <div className="mb-12">
            <WhyQualityInfographic />
          </div>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-lg mx-auto text-center leading-relaxed">
            Other platforms let you pay for visibility. We don't think that's fair. On Revvup, the best listings rise — not the biggest ad budgets.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 md:gap-20 pt-8 border-t border-border/40 mt-12">
            <div className="text-center space-y-1">
              <p className="text-xl font-semibold tracking-tight text-primary">0</p>
              <span className="text-sm text-muted-foreground">Paid boosts</span>
            </div>
            <div className="w-px h-10 bg-border/30 hidden sm:block" />
            <div className="text-center space-y-1">
              <p className="text-xl font-semibold tracking-tight text-primary">0</p>
              <span className="text-sm text-muted-foreground">Promoted listings</span>
            </div>
            <div className="w-px h-10 bg-border/30 hidden sm:block" />
            <div className="text-center space-y-1">
              <p className="text-xl font-semibold tracking-tight text-primary">100%</p>
              <span className="text-sm text-muted-foreground">Quality-based</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Ready?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Put effort in.
              <br />
              <span className="text-muted-foreground">Get visibility out.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleCreateListing}
                className="w-full sm:w-auto h-11 px-8 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
              >
                Create a Listing
              </button>
              <Link
                href="/listings"
                className="w-full sm:w-auto h-11 px-8 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
              >
                Browse Listings
              </Link>
            </div>
            
            <div className="pt-2">
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Have questions? Talk to us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </main>
  );
}

// ============================================================================
// INFOGRAPHIC: Ranking comparison - macOS window style like problem-section
// ============================================================================

function WhyQualityInfographic() {
  return (
    <div className="relative w-full rounded-lg overflow-visible bg-sidebar border border-border/40">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glow-quality {
          0%, 100% { text-shadow: 0 0 40px rgba(0, 102, 255, 0.3); }
          50% { text-shadow: 0 0 60px rgba(0, 102, 255, 0.5); }
        }
      `}</style>

      <div className="flex flex-col-reverse md:flex-row">
        {/* Left - Others: macOS window with paid rankings (80%) */}
        <div className="w-full md:w-[80%] flex flex-col items-center justify-center md:border-r border-t md:border-t-0 border-border/20 p-3 sm:p-6 lg:p-8">
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 mb-3 sm:mb-6">Others</span>
          
          {/* macOS Window Frame */}
          <div className="relative w-full max-w-2xl lg:max-w-3xl">
            <MacOSWindow url="marketplace.ae" contentClassName="p-4 sm:p-8 lg:p-12 flex items-center justify-center overflow-visible">
                <div className="relative">
                  {/* Car image */}
                  <div className="w-36 sm:w-56 lg:w-80 aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={getStaticUrl("/Marketing/m7.jpeg")} 
                      alt="" 
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  
                  {/* Paid ranking badges */}
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-4 px-2 sm:px-4 py-1 sm:py-2 rounded-md bg-amber-500 text-[8px] sm:text-xs font-bold text-white shadow-xl rotate-3 z-10">
                    PAID #1
                  </div>
                  <div className="absolute top-8 sm:top-14 -left-2 sm:-left-4 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-amber-600 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg -rotate-6 z-10">
                    +Boost
                  </div>
                  <div className="absolute -bottom-1 sm:-bottom-3 right-4 sm:right-10 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md bg-amber-700 text-[7px] sm:text-[11px] font-semibold text-white shadow-lg rotate-2 z-10">
                    Featured
                  </div>
                </div>
            </MacOSWindow>
          </div>
          
          <p className="text-[9px] sm:text-xs text-muted-foreground/50 mt-4 sm:mt-8 text-center">Pay to rank</p>
        </div>
        
        {/* Right - Revvup: Quality-based (20%) */}
        <div className="w-full md:w-[20%] flex flex-col items-center justify-center py-6 md:py-4 px-4 sm:p-6">
          <span className="text-[10px] sm:text-xs font-medium text-primary mb-3 sm:mb-4">Revvup</span>
          
          <div className="flex flex-col items-center text-center">
            <div 
              className="text-primary leading-none"
              style={{ animation: 'glow-quality 3s ease-in-out infinite' }}
            >
              <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
            </div>
            <span className="text-[10px] sm:text-xs text-primary/80 font-medium mt-2 sm:mt-3">Quality</span>
            <span className="text-[9px] sm:text-xs text-primary/60 mt-0.5">ranks</span>
          </div>
          
          <p className="text-[8px] sm:text-[10px] text-primary/50 mt-3 sm:mt-6">Earn visibility</p>
        </div>
      </div>
    </div>
  );
}

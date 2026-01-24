/**
 * How Ranking Works Page
 * 
 * Principles-based explainer — values, not math.
 * Clean, confident, non-corporate Alifh tone.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  FileText, 
  MessageCircle, 
  Heart, 
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ImageOff,
  FileWarning,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

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
          
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Transparency
            </p>
            <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight mb-4">
              How Listings Rank on Alifh.
              <br />
              <span className="text-muted-foreground/70">No boosts. No tricks. Just quality.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Alifh does not sell boosts or promoted listings. Listings earn visibility through quality, transparency, and genuine buyer interest — not payment.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] overflow-hidden rounded-lg mb-12">
            <Image
              src="/Abstract/rsxx5.png"
              alt="Alifh Ranking"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
          </div>

          {/* Core Principle */}
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We believe buyers deserve to see the most genuine, complete, and relevant cars — not the ones where sellers paid the most. Ranking on Alifh is designed to reward effort, honesty, and real demand.
            </p>
          </div>
        </div>
      </section>

      {/* What Helps */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              What helps your listing
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Earn Visibility.
              <br />
              <span className="text-muted-foreground/70">Don't buy it.</span>
            </h2>
          </div>

          {/* Helps Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Camera className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Clear, real photos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Multiple angles. Good lighting. Show the actual car — not stock images.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <FileText className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Honest, complete descriptions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tell buyers what they need to know. Features, condition, history.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <MessageCircle className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Responding quickly</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Buyers appreciate sellers who reply. Fast responses help your listing perform better.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <CheckCircle2 className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Useful details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Features, specs, and tags. Help buyers understand your car.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <Heart className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Genuine buyer interest</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Favourites, saves, test drive bookings. Real demand matters.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <ShieldCheck className="w-5 h-5 text-[#0066FF] mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Verified sellers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verified dealers and trusted private sellers build confidence with buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Doesn't Help */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              What doesn't help
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Gaming Doesn't Work Here.
              <br />
              <span className="text-muted-foreground/70">We designed it that way.</span>
            </h2>
          </div>

          {/* Doesn't Help Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <RefreshCw className="w-5 h-5 text-red-500/70 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Reposting the same car</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deleting and reposting doesn't reset your ranking. We track original publish dates.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <AlertTriangle className="w-5 h-5 text-amber-500/70 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Editing to "bump"</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Small edits to trigger updates don't improve visibility.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <XCircle className="w-5 h-5 text-red-500/70 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Artificial engagement</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fake views or manufactured interest is detectable and ignored.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <FileWarning className="w-5 h-5 text-amber-500/70 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Misleading descriptions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Inaccurate info or missing VINs hurt trust — and ranking.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-background">
              <ImageOff className="w-5 h-5 text-red-500/70 mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">Low-effort listings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Poor photos, empty descriptions. Buyers scroll past. So does the algorithm.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alifh uses anti-abuse protections to keep the marketplace fair for everyone. Manipulation doesn't improve ranking — it may reduce it.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Focus on presenting your car honestly. That's what the system is built to reward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/Abstract/rsx7.png"
                alt="Abstract"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Why we rank this way
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
                Quality Wins.
                <br />
                <span className="text-muted-foreground/70">That's the whole point.</span>
              </h2>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                Other platforms let you pay for visibility. We don't think that's fair to buyers or honest sellers. On Alifh, the best listings rise — not the ones with the biggest ad budget.
              </p>
              
              <div className="flex items-center gap-8 pt-4 border-t border-border/40">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
                  <div className="text-xs text-muted-foreground">Paid boosts</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">0</div>
                  <div className="text-xs text-muted-foreground">Promoted listings</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-semibold tracking-tight text-[#0066FF]">100%</div>
                  <div className="text-xs text-muted-foreground">Quality-based</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Ready?
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
              Put effort in.
              <br />
              <span className="text-muted-foreground/70">Get visibility out.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleCreateListing}
                className="w-full sm:w-auto h-11 px-8 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF]/90 transition-colors flex items-center justify-center shadow-sm"
              >
                Create a Listing
              </button>
              <Link
                href="/listings"
                className="w-full sm:w-auto h-11 px-8 bg-muted border border-border/40 text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
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

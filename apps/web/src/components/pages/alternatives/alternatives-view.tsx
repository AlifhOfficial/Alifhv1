/**
 * Alternatives Guide - Simple, Readable Guide Format
 * Focus on readability and education
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

function SellButton() {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: "create listings",
    redirectTo: "/user-dashboard/listings/new",
  });

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
    } else {
      openModal();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full compact:w-auto h-11 px-8 bg-muted text-foreground text-subhead font-semibold rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center"
      >
        List Your Car Free
      </button>
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </>
  );
}

export function AlternativesView() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
              Complete Guide
            </p>
            <h1 className="text-title3 font-semibold text-foreground tracking-tight mb-4">
              Your guide to selling cars without paying fees
            </h1>
            <p className="text-subhead text-muted-foreground leading-relaxed">
              Everything you need to know about choosing a car marketplace in Dubai. Read this before you list.
            </p>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <article className="pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Section 1: The Problem */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. The Problem with Most Car Listing Sites
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                If you've tried selling a car in Dubai, you know the drill. Most platforms charge you AED 500 to AED 1,000 just to post your listing. Then they want more money to "boost" your ad so people actually see it.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                You pay, your listing goes live, but it disappears behind sponsored ads from dealers who paid even more. Your car gets buried. You don't get calls. So they tell you to pay again to boost it.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                It's a cycle designed to extract as much money as possible from private sellers like you.
              </p>
            </div>
          </section>

          {/* Section 2: What You Should Expect */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. What a Fair Marketplace Should Look Like
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">01</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">No listing fees for private sellers</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">If you're selling your own car, you shouldn't pay to list it. Period.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">02</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">Quality ranks, not payment</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">Good photos and honest descriptions should rank higher than ads that paid more.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">03</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">No duplicate listings</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">One car, one listing. No spam or re-posts cluttering results.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">04</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">No banner ads or sponsored listings</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">When you browse cars, you should see cars—not ads, not promotions, not upsells.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">05</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">Test drive booking online</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">Buyers should be able to request test drives without endless phone tag.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-3 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">06</span>
                  <div>
                    <p className="text-subhead font-semibold text-foreground mb-1">Expired listings removed automatically</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">Sold cars should disappear. Buyers shouldn't waste time on outdated listings.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: The Comparison */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. How Revvup Compares
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                We built Revvup because we were frustrated with the same issues. Here's what's different:
              </p>
            </div>
            
            <div className="mt-4 space-y-3">
              <ComparisonItem 
                title="Listing Fees"
                typical="AED 500–1,000 per listing"
                revvup="Free forever"
              />
              <ComparisonItem 
                title="Boost/Featured Fees"
                typical="AED 200–500 extra"
                revvup="No paid boosts exist"
              />
              <ComparisonItem 
                title="How Listings Rank"
                typical="Pay more = rank higher"
                revvup="Quality wins (photos, details, transparency)"
              />
              <ComparisonItem 
                title="Duplicates"
                typical="Same car reposted multiple times"
                revvup="One car, one listing"
              />
              <ComparisonItem 
                title="Banner Ads"
                typical="Multiple per page"
                revvup="Zero ads anywhere"
              />
              <ComparisonItem 
                title="Test Drive Booking"
                typical="Call back and forth"
                revvup="Buyers book online, you approve"
              />
              <ComparisonItem 
                title="Page Speed"
                typical="Slow (ad-heavy)"
                revvup="Blazing fast"
              />
              <ComparisonItem 
                title="Expired Listings"
                typical="Stay visible forever"
                revvup="Auto-removed after expiry"
              />
            </div>
          </section>

          {/* Section 4: Why It Matters */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. Why This Actually Matters
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-foreground leading-relaxed">
                <span className="font-semibold">You save money.</span> If you list one car, you save AED 500+. If you're a dealer listing 20 cars a month, you save AED 10,000+ monthly in listing fees alone.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">You reach real buyers.</span> No sponsored ads means your listing doesn't get buried. Quality matters more than payment.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">No duplicates.</span> One car, one listing. No spam or re-posts cluttering results. Buyers see real inventory.
              </p>
              <p className="text-subhead text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Less time wasted.</span> Online test drive booking means fewer calls. Auto-expiry means no outdated listings. Faster experience for everyone.
              </p>
            </div>
          </section>

          {/* Section 5: Common Questions */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. Common Questions
            </h3>
            <div className="space-y-3">
              <FAQGuideItem 
                question="Is it really free forever?"
                answer="Yes. We don't charge private sellers listing fees, boost fees, or renewal fees. Ever. We make money from dealer subscriptions, not from you."
              />
              <FAQGuideItem 
                question="Can I list multiple cars?"
                answer="Yes, as many as you want. There's no limit."
              />
              <FAQGuideItem 
                question="How do I switch from another platform?"
                answer="Copy your listing details, upload your photos, and post. No approval delays. You can keep your listings on other platforms too if you want."
              />
              <FAQGuideItem 
                question="What if I'm a dealer?"
                answer="We have dealer plans with unlimited listings for a flat monthly fee. No commission. No pay-per-listing. Check our dealer partner page."
              />
              <FAQGuideItem 
                question="Do I need to provide my VIN?"
                answer="Yes, we collect VIN to prevent abuse and keep the marketplace clean. Whether to display it publicly is your choice."
              />
            </div>
          </section>

          {/* Section 6: Getting Started */}
          <section className="mb-10">
            <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Getting Started
            </h3>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-foreground leading-relaxed mb-4">
                Ready to try a better way? Here's what to do:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">01</span>
                  <p className="text-subhead text-muted-foreground leading-relaxed pt-0.5">Browse existing listings to see how the platform works</p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">02</span>
                  <p className="text-subhead text-muted-foreground leading-relaxed pt-0.5">Create a free account (takes 30 seconds)</p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">03</span>
                  <p className="text-subhead text-muted-foreground leading-relaxed pt-0.5">Post your listing with photos and details</p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-border/20">
                  <span className="flex-shrink-0 text-subhead font-semibold text-primary">04</span>
                  <p className="text-subhead text-muted-foreground leading-relaxed pt-0.5">Buyers book test drives online, you approve and meet</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-12 rounded-xl border border-border/40 bg-sidebar p-8 text-center">
            <p className="text-subhead font-semibold text-foreground mb-2">Try It Free</p>
            <p className="text-subhead text-muted-foreground mb-6 leading-relaxed">
              No credit card. No approval wait. List your car in 2 minutes.
            </p>
            <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
              <Link
                href="/listings"
                className="w-full compact:w-auto h-11 px-8 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
              >
                Browse Cars
              </Link>
              <SellButton />
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-border/40">
            <div className="flex items-center justify-between">
              <p className="text-caption1 text-muted-foreground/70">
                © 2026 AISH CAPITALS FZCO
              </p>
              <Link 
                href="/" 
                className="text-caption1 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </article>

    </div>
  );
}

function ComparisonItem({ title, typical, revvup }: { title: string; typical: string; revvup: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <p className="text-subhead font-semibold text-foreground mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-1" />
          <div>
            <p className="text-caption1 text-muted-foreground/60 mb-1">Typical platforms</p>
            <p className="text-subhead text-muted-foreground leading-relaxed">{typical}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="text-caption1 text-primary/70 mb-1">Revvup</p>
            <p className="text-subhead text-foreground font-semibold leading-relaxed">{revvup}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQGuideItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <p className="text-subhead font-semibold text-foreground mb-2">{question}</p>
      <p className="text-subhead text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}

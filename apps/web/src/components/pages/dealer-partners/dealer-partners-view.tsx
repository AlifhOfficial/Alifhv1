/**
 * Dealer Partners View - Partnership Program Landing Page
 * Direct, honest tone matching the pitch deck
 * Focus: SALES and LOYALTY - not features
 */

import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Shield, Handshake, Zap } from 'lucide-react';

export function DealerPartnersView() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">
              Dealer Partnership Program
            </p>
            <h1 className="text-title3 font-semibold text-foreground tracking-tight mb-4">
              How to get more sales
            </h1>
            <p className="text-subhead text-muted-foreground leading-relaxed">
              Not features. Not fluff. Just sales. Because that's all you actually care about.
            </p>
          </div>

          {/* The One Word */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center mb-6">
            <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-4">
              The one word that separates us
            </p>
            <p className="text-title1 font-bold text-foreground tracking-tight mb-4">
              LOYALTY
            </p>
            <p className="text-subhead text-muted-foreground leading-relaxed max-w-md mx-auto">
              "They take your money AND compete against you. We take your money and work FOR you."
            </p>
          </div>
          
          {/* Quick link to visual features */}
          <div className="text-center mb-8">
            <Link
              href="/partner"
              className="text-subhead text-muted-foreground hover:text-foreground transition-colors"
            >
              Prefer visuals? See the platform →
            </Link>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <article className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Section 1: Why Us */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              01. Why Revvup?
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Handshake className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-subhead font-semibold text-foreground mb-1">We only win when you make a sale</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    Other platforms charge per listing, take commission, and sell their own inventory. They win even when you don't sell. We only succeed when you succeed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-3 border-t border-border/20">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-subhead font-semibold text-foreground mb-1">We're not your competitor</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    We don't sell cars. We can't compete with you because we're not in that business. All our energy goes into getting quality buyers to YOUR listings.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-3 border-t border-border/20">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-subhead font-semibold text-foreground mb-1">Your channel, not another platform</p>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    We're infrastructure for YOUR dealership. Tools that help you sell. Support when you need it. Marketing your inventory. That's it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: The Comparison */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02. How We Compare
            </h2>
            
            <div className="space-y-3">
              <ComparisonItem 
                title="Listing Model"
                typical="Pay per listing (AED 500-1,000 each)"
                revvup="Flat subscription, unlimited listings"
              />
              <ComparisonItem 
                title="Commission"
                typical="Take a cut of your sales"
                revvup="Zero commission, ever"
              />
              <ComparisonItem 
                title="Competition"
                typical="Platform sells their own cars"
                revvup="We don't sell cars — only YOU do"
              />
              <ComparisonItem 
                title="When They Win"
                typical="Whether you sell or not"
                revvup="Only when you sell"
              />
              <ComparisonItem 
                title="Boost Fees"
                typical="Pay extra to be seen"
                revvup="Quality ranks, not payment"
              />
              <ComparisonItem 
                title="Support"
                typical="Email a ticket, wait days"
                revvup="Direct WhatsApp to our team"
              />
              <ComparisonItem 
                title="Feature Requests"
                typical="Submit and forget"
                revvup="If it impacts sales, it goes to the top of our roadmap"
              />
            </div>
          </section>

          {/* Section 2.5: The Pricing (Simple) */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              02.5 The Pricing
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-6 space-y-6">
              
              {/* Header with Founder Badge */}
              <div className="text-center pb-4 border-b border-border/20">
                <p className="text-subhead text-foreground leading-relaxed">
                  Two plans. Same platform. Same features. Same rankings. No pay-to-rank.
                </p>
                <p className="text-caption1 text-muted-foreground mt-2">
                  Pricing may adjust as we scale. Limited rate-lock spots for early commitments.
                </p>
              </div>
              
              {/* Pricing Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg bg-background/50 border border-primary/30">
                  <p className="text-caption1 uppercase tracking-widest text-primary mb-3">Flow</p>
                  <p className="text-title2 font-bold text-foreground mb-1">
                    AED 7,000<span className="text-subhead font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-subhead text-muted-foreground mb-4">Unlimited listings, full analytics, all tools</p>
                  <p className="text-caption1 text-primary font-medium">→ Most dealers start here</p>
                </div>
                <div className="p-5 rounded-lg bg-background/50 border border-border/20">
                  <p className="text-caption1 uppercase tracking-widest text-muted-foreground mb-3">Black</p>
                  <p className="text-title2 font-bold text-foreground mb-1">
                    AED 21,000<span className="text-subhead font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-subhead text-muted-foreground mb-4">Everything in Flow + custom branding</p>
                  <p className="text-caption1 text-muted-foreground font-medium">→ For established showrooms</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <p className="text-subhead text-muted-foreground">Per showroom. Zero commission. Forever.</p>
                <Link
                  href="/pricing"
                  className="text-subhead text-primary hover:text-primary/80 transition-colors"
                >
                  Full details →
                </Link>
              </div>
            </div>
          </section>

          {/* Section 3: The Honest Truth */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              03. Let's Be Real
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
              <p className="text-subhead text-foreground leading-relaxed">
                <span className="font-semibold">There won't be magic on day one.</span> You won't list and get 50 calls tomorrow. This is an investment. Like any good investment:
              </p>
              
              <div className="grid gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Short-term:</span> Quiet start</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Medium-term:</span> Momentum builds</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Long-term:</span> You win</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 rounded-xl border border-primary/40 bg-sidebar p-5">
              <p className="text-subhead font-semibold text-foreground mb-2">Why now is the perfect time</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Less competition</span> — your listings get more visibility</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Rate-lock opportunity</span> — limited spots for early commitments</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">Direct line to our team</span> — shape the platform</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-subhead text-muted-foreground"><span className="font-medium text-foreground">First-mover advantage</span> — dominate when we scale</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Real Partnership */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              04. What Partnership Actually Looks Like
            </h2>
            <div className="space-y-3">
                <PartnershipScenario 
                  scenario="You need a feature"
                  others="Submit a ticket, wait 6 months"
                  revvup="If it impacts sales, it goes to our roadmap"
                />
                <PartnershipScenario 
                  scenario="Technical issue"
                  others="Email support@..."
                  revvup="Direct WhatsApp to our team"
                />
                <PartnershipScenario 
                  scenario="Sales are slow"
                  others="Buy more boosts!"
                  revvup="Let's analyze and fix the real problem"
                />
            </div>
          </section>

          {/* Section 5: The Vision */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              05. The Long-Term Vision
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead font-semibold text-foreground mb-4">
                You run your business. We run your operations.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                  <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-3">You Focus On</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Sourcing cars
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Customer relationships
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Negotiations
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Closing deals
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-sidebar border border-primary/40">
                  <p className="text-caption1 uppercase tracking-widest text-primary/70 mb-3">We Handle</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Listings & leads
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Test drive bookings
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Platform tools
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Marketing & analytics
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-subhead text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/20">
                The end goal? You rely on us completely. Not because you have to — <span className="font-medium text-foreground">because you trust us</span>. One platform. One dashboard. One partner.
              </p>
            </div>
          </section>

          {/* Section 6: Features (Secondary) */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              06. Yes, Our Features Are Better Too
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
              <p className="text-subhead text-muted-foreground leading-relaxed">
                But that's not why you should join. You should join for sales. Still, here's what you get:
              </p>
              
              <div className="grid gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">Better organized than legacy platforms</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">Better executed than traditional marketplaces</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">No duplicate listings cluttering results</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">Quality-based ranking (no paid boosts)</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">Online test drive booking</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-subhead text-foreground">Blazing fast, no ads anywhere</p>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-border/20">
                <p className="text-subhead text-foreground font-semibold">
                  If you find something we don't have... we'll build it.
                </p>
                <p className="text-subhead text-muted-foreground mt-1">
                  Zero tolerance for gaps. This is YOUR platform.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Common Questions */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              07. Common Questions
            </h2>
            <div className="space-y-3">
              <FAQItem 
                question="But you don't have enough buyers yet"
                answer="You're right. We're in the adoption phase. That's exactly why you get better visibility now. The dealers who waited for other platforms to be 'big enough' paid full price. Plus, keep your current listings — just add us as a second channel. Test it risk-free."
              />
              <FAQItem 
                question="I'm locked into a contract with another platform"
                answer="Keep that contract. Don't cancel. Just add Revvup as an additional channel. Most dealers multi-list anyway. The question is whether you want a channel that charges per listing AND competes with you, or one that doesn't."
              />
              <FAQItem 
                question="Your platform looks empty"
                answer="It's not empty — it's clean. No clutter, no dealer ads competing for attention, no sponsored listings pushing you down. When buyers come to Revvup, they see YOUR cars. Not 50 boosted ads burying your inventory. That's by design."
              />
              <FAQItem 
                question="What's your commission?"
                answer="Zero. We don't take commission. Ever. Flat subscription fee, unlimited listings. Your margins are yours."
              />
              <FAQItem 
                question="Why should I trust you?"
                answer="You shouldn't. Not yet. That's why we offer founding partners three months of full access — no credit card, no lock-ins. Don't trust our words — test the platform. Judge us on results. If we earn your trust, great. If not, you walk away having lost nothing."
              />
            </div>
          </section>

          {/* Section 8: The Honest Close */}
          <section className="mb-10">
            <h2 className="text-subhead font-bold tracking-tight text-foreground mb-3">
              08. We're Not Perfect
            </h2>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <p className="text-subhead text-muted-foreground leading-relaxed mb-4">
                And we're not pretending to be.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-caption1 text-muted-foreground/60 mb-1">What we're NOT</p>
                    <p className="text-subhead text-muted-foreground leading-relaxed">The biggest yet. The flashiest. Perfect.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-caption1 text-primary/70 mb-1">What we ARE</p>
                    <p className="text-subhead text-foreground font-semibold leading-relaxed">Focused. Committed. Honest. Building for you.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-12">
            <div className="rounded-xl border border-primary/40 bg-sidebar p-8">
              <div className="text-center mb-6">
                <p className="text-headline font-bold text-foreground mb-2">
                  Founding Dealer Program
                </p>
                <p className="text-subhead text-muted-foreground">
                  Limited access. No credit card. No lock-ins.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                  <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-2">What You Get</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Full platform access
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Unlimited listings
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Direct support line
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Rate-lock eligibility
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border/20">
                  <p className="text-caption1 uppercase tracking-widest text-muted-foreground/70 mb-2">What We Ask</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      Three months to prove value
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      List your inventory honestly
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      Tell us what doesn't work
                    </div>
                    <div className="flex items-center gap-2 text-subhead text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      Judge us on results
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link
                  href="/user-dashboard/requests"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-10 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Apply for Founding Program
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-subhead text-muted-foreground mt-4">
                  List alongside any other platform. Limited rate-lock spots available.
                </p>
              </div>
            </div>
          </section>

          {/* Final Statement */}
          <section className="mt-12 text-center">
            <div className="rounded-xl border border-border/40 bg-sidebar p-8">
              <p className="text-subhead text-muted-foreground mb-4">
                They charge you AND compete against you.
              </p>
              <p className="text-headline font-bold text-foreground">
                We charge you TO work for you.
              </p>
              <p className="text-subhead text-primary mt-4 font-medium">
                Let's get you more sales.
              </p>
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

// Component: Comparison Item
function ComparisonItem({ title, typical, revvup }: { title: string; typical: string; revvup: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <p className="text-subhead font-semibold text-foreground mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-1" />
          <div>
            <p className="text-caption1 text-muted-foreground/60 mb-1">Others</p>
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

// Component: Partnership Scenario
function PartnershipScenario({ scenario, others, revvup }: { scenario: string; others: string; revvup: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/50 p-4">
      <p className="text-subhead font-semibold text-foreground mb-3">{scenario}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-1" />
          <div>
            <p className="text-caption1 text-muted-foreground/60 mb-1">Others</p>
            <p className="text-subhead text-muted-foreground leading-relaxed">{others}</p>
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

// Component: FAQ Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <p className="text-subhead font-semibold text-foreground mb-2">{question}</p>
      <p className="text-subhead text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}

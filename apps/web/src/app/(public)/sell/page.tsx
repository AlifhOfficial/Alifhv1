/**
 * Sell Your Car Page - High-Intent Landing Page
 * Converts visitors before redirecting to auth flow
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Zap, Clock, Camera, MessageSquare } from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { faqData, type FAQItem } from '@/data/faq-data';

const faqPool = faqData.flatMap((category) => category.items);
const sellFaqs: FAQItem[] = [
  'users-free-listing',
  'users-no-boosts',
  'users-test-drives',
]
  .map((id) => faqPool.find((item) => item.id === id))
  .filter((item): item is FAQItem => Boolean(item));

const sellFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: sellFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function SellPage() {
  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={sellFaqSchema} />
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-5">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              For Private Sellers
            </span>
            <h1 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
              List free.
              <br />
              <span className="text-muted-foreground">Sell fast.</span>
            </h1>
          </div>

          {/* Hero Infographic */}
          <div className="mb-12">
            <SellHeroInfographic />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-md mx-auto text-center mb-12 leading-relaxed">
            No fees. No boosts. No ads. Just your car, seen by real buyers.
          </p>

          {/* CTA */}
          <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
            <Link href="/user-dashboard/listings/new">
              <Button size="lg" className="w-full compact:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
                List Your Car
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="w-full compact:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
                Browse Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              How It Works
            </span>
            <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
              List in minutes.
            </h2>
          </div>

          {/* Steps Infographic */}
          <div className="mb-12">
            <StepsInfographic />
          </div>

          {/* Description */}
          <p className="text-callout text-muted-foreground max-w-md mx-auto text-center leading-relaxed">
            Photos. VIN. Price. Done.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Why Revvup
            </span>
            <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
              Built for you.
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid compact:grid-cols-2 large:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            <FeatureCard 
              icon={CheckCircle2}
              title="Free forever"
              description="No listing fees. No payment required."
            />
            <FeatureCard 
              icon={Shield}
              title="No duplicates"
              description="One car, one listing. Clean results."
            />
            <FeatureCard 
              icon={Zap}
              title="No paid boosts"
              description="Quality ranks. Not money."
            />
            <FeatureCard 
              icon={Clock}
              title="Test drives"
              description="Buyers book. You approve."
            />
            <FeatureCard 
              icon={Camera}
              title="Unlimited photos"
              description="Show every angle."
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Direct chat"
              description="No middlemen."
            />
          </div>
        </div>
      </section>

      <div className="sr-only">
        Best place to sell a car in UAE: Revvup is free forever for private sellers, has no ads,
        no paid boosts, and online test drive booking.
      </div>

      {/* FAQ */}
      <section className="pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-title3 font-semibold">Common Questions</h2>
          {sellFaqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-border/40 bg-sidebar p-5">
              <h3 className="text-subhead font-semibold">{faq.question}</h3>
              <p className="text-subhead text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="pt-28 pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-5">
            <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
              Ready to sell?
            </h2>
          </div>

          {/* CTA */}
          <div className="flex flex-col compact:flex-row items-center justify-center gap-3">
            <Link href="/user-dashboard/listings/new">
              <Button size="lg" className="w-full compact:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
                List Your Car
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12 pt-8 border-t border-border/40">
            <span className="text-subhead flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />Free for private sellers
            </span>
            <span className="text-subhead flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />No commission
            </span>
            <span className="text-subhead flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />Based in Dubai
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// HERO INFOGRAPHIC - Comparison
// ============================================================================

function SellHeroInfographic() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-sidebar">
      {/* Window Content */}
      <div className="flex flex-col regular:flex-row min-h-[450px] compact:min-h-[500px] large:min-h-[550px]">
        {/* Left - Others */}
        <div className="flex-1 p-10 compact:p-14 large:p-20 flex flex-col items-center justify-center border-b regular:border-b-0 regular:border-r border-border/40">
          <span className="text-caption1 text-muted-foreground/50 mb-10">Others</span>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-md bg-destructive-muted border border-destructive/20">
                <span className="text-subhead font-semibold text-destructive">AED 500–1,000</span>
              </div>
              <span className="text-caption1 text-muted-foreground/50">to list</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                <span className="text-subhead font-semibold text-orange-500">+AED 49–199</span>
              </div>
              <span className="text-caption1 text-muted-foreground/50">to boost</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-md bg-warning-muted border border-warning/20">
                <span className="text-subhead font-semibold text-warning">+AED 99</span>
              </div>
              <span className="text-caption1 text-muted-foreground/50">to feature</span>
            </div>
          </div>
        </div>
        
        {/* Right - Revvup */}
        <div className="w-full regular:w-[300px] large:w-[400px] p-10 compact:p-14 large:p-20 flex flex-col items-center justify-center">
          <span className="text-caption1 text-primary mb-10">Revvup</span>
          
          <div className="flex flex-col items-center">
            <div className="text-display3 compact:text-display4 large:text-display5 font-bold text-primary leading-none">
              0
            </div>
            <span className="text-callout text-primary/70 font-medium mt-2">fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEPS INFOGRAPHIC
// ============================================================================

function StepsInfographic() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-sidebar min-h-[500px] compact:min-h-[550px] large:min-h-[600px] flex items-center justify-center">
      {/* Placeholder - content coming later */}
      <p className="text-subhead text-muted-foreground/30">Coming soon</p>
    </div>
  );
}

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-sidebar">
      <Icon className="w-5 h-5 text-primary/80 mb-3" />
      <h3 className="text-callout font-semibold mb-1">{title}</h3>
      <p className="text-subhead text-muted-foreground">{description}</p>
    </div>
  );
}

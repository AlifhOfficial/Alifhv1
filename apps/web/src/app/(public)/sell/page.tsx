/**
 * Sell Your Car Page - High-Intent Landing Page
 * Converts visitors before redirecting to auth flow
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Zap, Clock, Camera, MessageSquare } from 'lucide-react';

export default function SellPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-5">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              For Private Sellers
            </span>
            <h1 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/user-dashboard/listings/new">
              <Button size="lg" className="w-full sm:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
                List Your Car
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
                Browse Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              How It Works
            </span>
            <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
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
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-subhead font-semibold uppercase tracking-wider text-primary">
              Why Revvup
            </span>
            <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Built for you.
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
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

      {/* Closing CTA Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 space-y-5">
            <h2 className="text-title2 sm:text-title1 lg:text-display font-semibold tracking-tight">
              Ready to sell?
            </h2>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/user-dashboard/listings/new">
              <Button size="lg" className="w-full sm:w-auto h-11 px-8 text-subhead font-semibold rounded-lg">
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
      <div className="flex flex-col md:flex-row min-h-[450px] sm:min-h-[500px] lg:min-h-[550px]">
        {/* Left - Others */}
        <div className="flex-1 p-10 sm:p-14 lg:p-20 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40">
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
        <div className="w-full md:w-[300px] lg:w-[400px] p-10 sm:p-14 lg:p-20 flex flex-col items-center justify-center">
          <span className="text-caption1 text-primary mb-10">Revvup</span>
          
          <div className="flex flex-col items-center">
            <div className="text-display3 sm:text-display4 lg:text-display5 font-bold text-primary leading-none">
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
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-sidebar min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] flex items-center justify-center">
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

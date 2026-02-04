/**
 * Sell Your Car Page - High-Intent Landing Page
 * Converts visitors before redirecting to auth flow
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Shield, Zap, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sell Your Car in Dubai — Free Forever | Revvup',
  description: 'List your car free in UAE. No listing fees, no boosts, no ads. VIN required. Book test drives online. Private sellers pay nothing. Ever.',
  keywords: 'sell my car dubai, sell car uae, list car free dubai, post car ad free dubai, sell car dubai free, best place to sell car dubai, how to sell car dubai, free car listing uae',
  openGraph: {
    title: 'Sell Your Car in Dubai — Free Forever | Revvup',
    description: 'List your car free in UAE. No fees, no boosts, no ads. VIN required.',
    type: 'website',
    url: 'https://revvup.ae/sell',
  },
  alternates: {
    canonical: 'https://revvup.ae/sell',
  },
};

export default function SellPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Sell Your Car.
              <span className="block text-primary mt-2">Free. Forever.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              No listing fees. No paid boosts. No sponsored ads. Just list your car and reach serious buyers in UAE.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/user-dashboard/listings/new">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 rounded-full">
                  List Your Car Free
                </Button>
              </Link>
              <Link href="/listings">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 rounded-full">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell on Revvup */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Private Sellers Choose Revvup
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We built the marketplace sellers deserve. No gimmicks, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Check className="h-6 w-6" />}
              title="Free Forever"
              description="List unlimited cars. Zero listing fees. No payment required. Ever."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="VIN Required"
              description="Every listing shows VIN number. Builds trust with serious buyers."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="No Paid Boosts"
              description="Your listing ranks by quality, not by who pays more. Fair ranking for everyone."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Test Drive Bookings"
              description="Buyers book test drives online. You stay in control of your schedule."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              List your car in minutes. It's that simple.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              <Step
                number={1}
                title="Create Your Free Listing"
                description="Add photos, details, and your car's VIN. No credit card needed."
              />
              <Step
                number={2}
                title="Reach Serious Buyers"
                description="Your listing appears to buyers across UAE. No sponsored competitors above you."
              />
              <Step
                number={3}
                title="Manage Test Drives"
                description="Accept or decline test drive requests. Chat with buyers directly."
              />
              <Step
                number={4}
                title="Sell Your Car"
                description="Close the deal. We never take a commission or transaction fee."
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/user-dashboard/listings/new">
              <Button size="lg" className="text-base px-8 rounded-full">
                Get Started — It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Sellers, Not Algorithms
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Other platforms charge listing fees, boost fees, and commissions. We don't. 
              Your car deserves to be seen without paying for visibility. That's why Revvup is free for private sellers. Always.
            </p>
            <div className="mt-10">
              <Link href="/user-dashboard/listings/new">
                <Button size="lg" className="text-base px-8 rounded-full">
                  List Your Car Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          {number}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

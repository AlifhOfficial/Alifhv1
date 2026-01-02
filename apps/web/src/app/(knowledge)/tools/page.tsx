/**
 * Car Tools Landing Page
 * SEO-optimized page for automotive tools and utilities
 * Target: UAE market, especially Dubai
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Calculator, FileText, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';

export const metadata: Metadata = {
  title: 'Free Car Tools - VIN Decoder, Valuation & More | Alifh UAE',
  description: 'Free automotive tools for car buyers and sellers in UAE. VIN decoder, car valuation calculator, and vehicle guides for Dubai, Abu Dhabi and all Emirates.',
  keywords: ['VIN decoder UAE', 'car valuation Dubai', 'vehicle tools', 'car checker UAE', 'free car tools Dubai', 'VIN check Abu Dhabi'],
  openGraph: {
    title: 'Free Car Tools - VIN Decoder & Valuation | Alifh',
    description: 'Essential free tools for car buyers in UAE. Decode VINs, check valuations, and make informed decisions.',
    type: 'website',
  },
};

const tools = [
  {
    title: 'VIN Decoder',
    description: 'Decode any 17-character VIN to reveal vehicle specifications, history, and authenticity. Essential for buying used cars in UAE.',
    icon: Search,
    iconColor: 'text-blue-500',
    href: '/tools/vin-decoder',
    badge: 'Most Popular',
    features: [
      'Instant VIN verification',
      'Complete vehicle specs',
      'Make, model, year details',
      'Free & unlimited checks'
    ]
  },
  {
    title: 'Car Valuation',
    description: 'Get AI-powered market value estimates for any vehicle in the UAE. Compare prices and understand fair value.',
    icon: Calculator,
    iconColor: 'text-green-500',
    href: '/tools/valuation',
    badge: 'Beta',
    features: [
      'AI-powered estimates',
      'UAE market data',
      'Quality Index score',
      'Price trend analysis'
    ]
  },
  {
    title: 'Vehicle History',
    description: 'Check accident records, ownership history, and service records for vehicles in UAE.',
    icon: FileText,
    iconColor: 'text-purple-500',
    href: '/tools/history',
    badge: 'Coming Soon',
    features: [
      'Accident reports',
      'Ownership history',
      'Service records',
      'Insurance claims'
    ]
  },
  {
    title: 'Compare Cars',
    description: 'Compare up to 3 cars side by side. Specifications, features, and pricing at a glance.',
    icon: Wrench,
    iconColor: 'text-orange-500',
    href: '/tools/compare',
    badge: 'New',
    features: [
      'Up to 3 cars side-by-side',
      'Shareable comparison links',
      'All specs highlighted',
      'Search by VIN supported'
    ]
  }
];

const guides = [
  { title: 'What is a VIN?', href: '/knowledge/vin-guide' },
  { title: 'Buying Used Cars in Dubai', href: '/knowledge/buying-guide' },
  { title: 'Understanding GCC Specs', href: '/knowledge/gcc-specs' },
  { title: 'Car Insurance UAE', href: '/knowledge/insurance' },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Free Car Tools for UAE
            </h1>
            <p className="text-xl text-muted-foreground/80 mb-10 leading-relaxed">
              Essential automotive tools and resources for car buyers and sellers across Dubai, Abu Dhabi, and all Emirates. 
              Make informed decisions with our free verification and valuation tools.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span>UAE-specific data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isAvailable = tool.badge !== 'Coming Soon';
              
              return (
                <Link
                  key={tool.href}
                  href={isAvailable ? tool.href : '#'}
                  className={`group relative p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl transition-all duration-300 ${
                    isAvailable 
                      ? 'hover:bg-card/80 hover:border-border hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5' 
                      : 'opacity-50 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-muted/70 transition-all duration-300">
                      <Icon className={cn("w-6 h-6", tool.iconColor)} />
                    </div>
                    {tool.badge && (
                      <span className="px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full text-xs font-medium backdrop-blur-sm text-muted-foreground">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-foreground/80 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {tool.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isAvailable && (
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all">
                      Try it now
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Knowledge Section */}
      <section className="pb-24 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto pt-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Knowledge Center</h2>
            <p className="text-lg text-muted-foreground">
              Learn about VINs, buying cars in UAE, and making smart automotive decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/80 hover:border-border hover:shadow-md hover:shadow-black/5 transition-all duration-300"
              >
                <h3 className="font-medium mb-2 group-hover:text-foreground transition-colors">
                  {guide.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground/70 group-hover:text-muted-foreground group-hover:gap-3 transition-all">
                  Read guide
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              View all guides
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
          <h2>Why Use Alifh Car Tools?</h2>
          <p>
            Whether you're buying or selling a car in Dubai, Abu Dhabi, or anywhere in the UAE, our free automotive tools 
            help you make informed decisions. From VIN decoding to market valuations, we provide the essential resources 
            you need to navigate the used car market with confidence.
          </p>

          <h3>VIN Decoder for UAE Cars</h3>
          <p>
            Our VIN decoder instantly verifies any 17-character Vehicle Identification Number and reveals complete vehicle 
            specifications. Perfect for checking used cars before purchase in Dubai, Abu Dhabi, Sharjah, or any emirate. 
            Verify the make, model, year, engine type, and more in seconds.
          </p>

          <h3>Trusted by UAE Car Buyers</h3>
          <p>
            Thousands of buyers and sellers across the UAE use Alifh tools every month to verify vehicles, check values, 
            and make better automotive decisions. All our tools are free, require no registration, and provide instant results.
          </p>
        </div>
      </section>
    </div>
  );
}

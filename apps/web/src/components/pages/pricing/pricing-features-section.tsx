/**
 * Pricing Features Section
 * Two-column feature breakdown - Flow vs Black
 */

'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { PricingPdfGenerator } from './pricing-pdf-generator';

type FeatureValue = boolean | string | number;

interface Feature {
  name: string;
  description?: string;
  flow: FeatureValue;
  black: FeatureValue;
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

const featureCategories: FeatureCategory[] = [
  {
    name: 'Listings & Media',
    features: [
      { name: 'Unlimited listings', flow: true, black: true, description: 'List your entire inventory' },
      { name: 'Unlimited revisions', flow: true, black: true, description: 'Update anytime, no extra cost' },
      { name: 'High-quality images', flow: 'Up to 20', black: 'Extended on request' },
      { name: 'Additional images (free)', flow: true, black: true },
      { name: 'Spotlight listings', flow: '1', black: '5', description: 'Showcase your best cars' },
      { name: 'Instant activation', flow: true, black: true, description: 'Go live in under a minute' },
    ],
  },
  {
    name: 'Booking & Leads',
    features: [
      { name: 'Test drive booking', flow: true, black: true, description: 'Customers book directly' },
      { name: 'Custom availability', flow: true, black: true, description: 'Set your schedule' },
      { name: 'Lead contact details', flow: true, black: true, description: 'Get buyer info upfront' },
      { name: 'Booking analytics', flow: true, black: true, description: 'See what converts' },
      { name: 'Lead funnel', flow: true, black: true, description: 'Buyers open to consignment & offers' },
      { name: 'Lead tracking', flow: true, black: true, description: 'Never lose a prospect' },
    ],
  },
  {
    name: 'Messaging',
    features: [
      { name: 'Thread-based messaging', flow: true, black: true, description: 'Every conversation tied to a listing' },
      { name: 'Multi-inquiry consolidation', flow: true, black: true, description: 'One thread per customer' },
      { name: 'Brand-facing communication', flow: true, black: true, description: 'Your brand, not individual staff' },
    ],
  },
  {
    name: 'Team Management',
    features: [
      { name: 'Unlimited staff accounts', flow: true, black: true, description: 'Add your whole team' },
      { name: 'Owner & staff roles', flow: true, black: true, description: 'Different access levels' },
      { name: 'Staff dashboard', flow: true, black: true, description: 'Personal workspace for each member' },
      { name: 'Inventory reassignment', flow: true, black: true, description: 'Bookings follow the car' },
      { name: 'Team performance', flow: true, black: true, description: 'Know who is performing' },
    ],
  },
  {
    name: 'Analytics',
    features: [
      { name: 'Inventory metrics', flow: true, black: true },
      { name: 'Sales tracking', flow: true, black: true },
      { name: 'View insights', flow: true, black: true, description: 'See what buyers look at' },
      { name: 'Business insights', flow: true, black: true, description: 'Data to grow your business' },
      { name: 'Staff breakdowns', flow: true, black: true },
    ],
  },
  {
    name: 'Platform & Support',
    features: [
      { name: 'Business profile', flow: true, black: true },
      { name: 'Verified badge', flow: true, black: true, description: 'Stand out as trusted' },
      { name: 'Platform support', flow: true, black: true },
      { name: 'Security', flow: true, black: true, description: 'Industry-standard protection' },
    ],
  },
];

// Black-exclusive features
const blackExclusiveFeatures = [
  {
    name: 'Brand & Showroom',
    features: [
      { name: 'Custom showroom page', description: 'Your brand, fully expressed' },
      { name: 'Black signature branding', description: 'Distinctive presence across platform' },
      { name: 'Founder statement', description: 'Tell your story' },
      { name: 'Awards showcase' },
      { name: 'Services display', description: 'Highlight what you offer' },
      { name: 'Custom CTAs', description: 'Direct buyers to your resources' },
      { name: 'Social links' },
      { name: 'Staff showcase', description: 'Display your team publicly' },
    ],
  },
  {
    name: 'Media',
    features: [
      { name: 'Video uploads', description: 'Bring listings to life' },
      { name: 'Embedded media', description: 'Link external content' },
      { name: 'Extended image limits', description: 'More than 20 per listing' },
      { name: '5 Spotlight listings', description: 'vs 1 in Flow' },
    ],
  },
  {
    name: 'Support & Priority',
    features: [
      { name: 'Dedicated support', description: 'Direct line to our team' },
      { name: 'Priority beta access', description: 'Try new features first' },
      { name: 'Priority feedback', description: 'Your input shapes the product' },
      { name: 'Uptime SLA' },
      { name: 'Public stats showcase', description: 'Display ratings & feedback' },
    ],
  },
];

function FlowCategorySection({ category, isExpanded, onToggle }: { 
  category: FeatureCategory; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-sidebar-border/40 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-6 hover:bg-muted/20 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">{category.name}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
        )}
      </button>
      
      {isExpanded && (
        <div className="border-t border-sidebar-border/30 pb-2">
          {category.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-3 px-6"
            >
              <Check className="w-4 h-4 text-[#0066FF] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground">{feature.name}</p>
                {feature.description && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlackCategorySection({ category, isExpanded, onToggle }: { 
  category: { name: string; features: { name: string; description?: string }[] }; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-sidebar-border/40 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-6 hover:bg-muted/20 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">{category.name}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
        )}
      </button>
      
      {isExpanded && (
        <div className="border-t border-sidebar-border/30 pb-2">
          {category.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-3 px-6"
            >
              <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-foreground">{feature.name}</p>
                {feature.description && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PricingFeaturesSection() {
  const [expandedFlow, setExpandedFlow] = useState<Set<string>>(new Set());
  const [expandedBlack, setExpandedBlack] = useState<Set<string>>(new Set());

  const toggleFlowCategory = (categoryName: string) => {
    setExpandedFlow(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const toggleBlackCategory = (categoryName: string) => {
    setExpandedBlack(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const toggleAllFlow = () => {
    if (expandedFlow.size > 0) {
      setExpandedFlow(new Set());
    } else {
      setExpandedFlow(new Set(featureCategories.map(c => c.name)));
    }
  };

  const toggleAllBlack = () => {
    if (expandedBlack.size > 0) {
      setExpandedBlack(new Set());
    } else {
      setExpandedBlack(new Set(blackExclusiveFeatures.map(c => c.name)));
    }
  };

  const totalFlowFeatures = featureCategories.reduce((acc, cat) => acc + cat.features.length, 0);
  const totalBlackFeatures = blackExclusiveFeatures.reduce((acc, cat) => acc + cat.features.length, 0);

  return (
    <section id="features" className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* Section Header */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Details
              </p>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Full feature breakdown
              </h2>
            </div>
            <PricingPdfGenerator 
              flowCategories={featureCategories}
              blackCategories={blackExclusiveFeatures}
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
          
          {/* Flow Section */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#0066FF]" />
                <h3 className="text-lg font-semibold text-foreground">Flow</h3>
                <span className="text-xs text-muted-foreground hidden sm:inline">{totalFlowFeatures} features</span>
              </div>
              <button 
                onClick={toggleAllFlow}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {expandedFlow.size > 0 ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Everything you need to run your showroom.</p>
            
            <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
              {featureCategories.map((category) => (
                <FlowCategorySection
                  key={category.name}
                  category={category}
                  isExpanded={expandedFlow.has(category.name)}
                  onToggle={() => toggleFlowCategory(category.name)}
                />
              ))}
            </div>
          </div>

          {/* Black Section */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 px-1.5 h-5 inline-flex items-center text-[9px] font-black tracking-widest uppercase bg-black text-white">
                  BLK
                </span>
                <h3 className="text-lg font-semibold text-foreground">Black adds</h3>
                <span className="text-xs text-muted-foreground hidden sm:inline">{totalBlackFeatures} extras</span>
              </div>
              <button 
                onClick={toggleAllBlack}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {expandedBlack.size > 0 ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Everything in Flow, plus white-glove branding.</p>
            
            <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
              {blackExclusiveFeatures.map((category) => (
                <BlackCategorySection
                  key={category.name}
                  category={category}
                  isExpanded={expandedBlack.has(category.name)}
                  onToggle={() => toggleBlackCategory(category.name)}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

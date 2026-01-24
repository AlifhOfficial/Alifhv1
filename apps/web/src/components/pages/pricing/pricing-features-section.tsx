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
      { name: 'Unlimited car listings', flow: true, black: true, description: 'List your entire inventory with no limits' },
      { name: 'Unlimited edits & updates', flow: true, black: true, description: 'Change prices, photos, details anytime' },
      { name: 'Up to 20 high-quality images', flow: true, black: true, description: 'Show every angle of each car' },
      { name: 'Extra images on request', flow: true, black: true, description: 'Need more than 20? Just ask (free)' },
      { name: '1 Black listing included', flow: true, black: '5', description: 'Premium format for cars that deserve more' },
      { name: 'Go live in under a minute', flow: true, black: true, description: 'No waiting—listings activate instantly' },
    ],
  },
  {
    name: 'Test Drive Booking System',
    features: [
      { name: 'Built-in booking calendar', flow: true, black: true, description: 'Customers book test drives directly' },
      { name: 'Set your own schedule', flow: true, black: true, description: 'Choose your available days and times' },
      { name: 'Booking preferences', flow: true, black: true, description: 'Control how and when you receive bookings' },
      { name: 'Lead contact details', flow: true, black: true, description: 'Get buyer name, phone, and email upfront' },
      { name: 'Booking status tracking', flow: true, black: true, description: 'Mark completed, no-show, rescheduled' },
      { name: 'Booking performance stats', flow: true, black: true, description: 'See what converts and what doesn\'t' },
    ],
  },
  {
    name: 'Lead Funnel',
    features: [
      { name: 'Access to consented leads', flow: true, black: true, description: 'Buyers who want offers from dealers' },
      { name: 'Consignment opportunities', flow: true, black: true, description: 'Connect with sellers open to consignment' },
      { name: 'Custom lead filters', flow: true, black: true, description: 'Set your criteria, see matching leads' },
      { name: 'Pre-qualified prospects', flow: true, black: true, description: 'Only serious sellers, no tire-kickers' },
    ],
  },
  {
    name: 'Messaging',
    features: [
      { name: 'Thread-based conversations', flow: true, black: true, description: 'Every chat is tied to a specific car' },
      { name: 'One thread per customer', flow: true, black: true, description: 'Multiple inquiries stay organized' },
      { name: 'Your brand, not staff names', flow: true, black: true, description: 'Customers message your dealership' },
    ],
  },
  {
    name: 'Team & Roles',
    features: [
      { name: 'Owner & staff accounts', flow: true, black: true, description: 'Different access for different roles' },
      { name: 'Unlimited staff members', flow: true, black: true, description: 'Add your entire sales team' },
      { name: 'Personal staff dashboards', flow: true, black: true, description: 'Each person manages their own cars' },
      { name: 'Inventory reassignment', flow: true, black: true, description: 'Move cars between staff—bookings follow' },
      { name: 'Staff performance tracking', flow: true, black: true, description: 'See who\'s closing deals' },
    ],
  },
  {
    name: 'Owner Controls',
    features: [
      { name: 'Full inventory overview', flow: true, black: true, description: 'See all cars, filter by staff' },
      { name: 'All bookings & stats in one place', flow: true, black: true, description: 'Monitor every test drive' },
      { name: 'Brand profile control', flow: true, black: true, description: 'Manage your public dealership page' },
      { name: 'Staff management', flow: true, black: true, description: 'Invite, edit, or remove team members' },
      { name: 'In-depth analytics', flow: true, black: true, description: 'Track performance across your business' },
    ],
  },
  {
    name: 'Inventory Management',
    features: [
      { name: 'Status tracking', flow: true, black: true, description: 'Active, sold, archived, draft, and more' },
      { name: 'Quick status updates', flow: true, black: true, description: 'Mark sold or archive in one click' },
      { name: 'Organized workflow', flow: true, black: true, description: 'Filter and sort your inventory easily' },
    ],
  },
  {
    name: 'Analytics & Insights',
    features: [
      { name: 'Inventory value & count', flow: true, black: true, description: 'Know what you have at a glance' },
      { name: 'Sales performance', flow: true, black: true, description: 'Track sold cars and revenue' },
      { name: 'View & engagement stats', flow: true, black: true, description: 'See which cars get attention' },
      { name: 'Popular listings', flow: true, black: true, description: 'Know your hottest inventory' },
      { name: 'Staff breakdowns', flow: true, black: true, description: 'Performance by team member' },
    ],
  },
  {
    name: 'Platform & Trust',
    features: [
      { name: 'Business profile page', flow: true, black: true, description: 'Your dealership on Alifh' },
      { name: 'Verified dealer badge', flow: true, black: true, description: 'Build trust with buyers' },
      { name: 'Platform support', flow: true, black: true, description: 'Help when you need it' },
      { name: 'Secure & protected', flow: true, black: true, description: 'Industry-standard security' },
    ],
  },
];

// Black-exclusive features
const blackExclusiveFeatures = [
  {
    name: 'Brand & Showroom',
    features: [
      { name: 'Custom showroom page', description: 'A branded page for your dealership' },
      { name: 'Black signature branding', description: 'Stand out across the platform' },
      { name: 'Founder statement', description: 'Tell your story in your own words' },
      { name: 'Awards showcase', description: 'Display your achievements' },
      { name: 'Services display', description: 'Highlight financing, warranty, trade-in' },
      { name: 'Custom buttons & links', description: 'Direct buyers to your website or resources' },
      { name: 'Social media links', description: 'Connect your Instagram, YouTube, etc.' },
      { name: 'Staff showcase', description: 'Introduce your team publicly' },
    ],
  },
  {
    name: 'Media & Visibility',
    features: [
      { name: 'Showroom video', description: 'Brand video on your showroom page' },
      { name: 'Embedded media', description: 'Link YouTube tours, walkarounds, etc.' },
      { name: 'Extended image limits', description: 'More than 20 images per listing' },
      { name: '5 Black listings', description: 'More room for your premium inventory' },
    ],
  },
  {
    name: 'Priority Support',
    features: [
      { name: 'Dedicated support line', description: 'Direct access to our team' },
      { name: 'Early access to new features', description: 'Try updates before anyone else' },
      { name: 'Priority feedback', description: 'Your input shapes the product' },
      { name: 'Public stats display', description: 'Show your ratings & reviews' },
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

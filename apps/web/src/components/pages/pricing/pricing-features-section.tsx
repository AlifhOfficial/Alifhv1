/**
 * Pricing Features Section
 * Minimal two-column feature breakdown - Flow vs Black
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Plus, Minus } from 'lucide-react';

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

interface SimpleFeature {
  name: string;
  description?: string;
}

interface SimpleCategory {
  name: string;
  features: SimpleFeature[];
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
    name: 'Test Drive Booking',
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
      { name: 'Business profile page', flow: true, black: true, description: 'Your dealership on Revvup' },
      { name: 'Verified dealer badge', flow: true, black: true, description: 'Build trust with buyers' },
      { name: 'Platform support', flow: true, black: true, description: 'Help when you need it' },
      { name: 'Secure & protected', flow: true, black: true, description: 'Industry-standard security' },
    ],
  },
];

// Black-exclusive features
const blackExclusiveFeatures: SimpleCategory[] = [
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

function CategoryAccordion({ 
  name, 
  features, 
  isExpanded, 
  onToggle,
  variant = 'flow'
}: { 
  name: string;
  features: SimpleFeature[];
  isExpanded: boolean;
  onToggle: () => void;
  variant?: 'flow' | 'black';
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="group w-full flex items-center justify-between py-3.5 text-left transition-colors"
      >
        <span className="text-subhead font-medium text-foreground/90 group-hover:text-foreground transition-colors">
          {name}
        </span>
        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border/60 group-hover:border-border transition-colors">
          {isExpanded ? (
            <Minus className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Plus className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="pb-4 space-y-2.5">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 pl-0.5">
              <CheckCircle2 
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  variant === 'black' ? 'text-foreground' : 'text-primary'
                }`} 
              />
              <div className="space-y-0.5">
                <p className="text-subhead font-medium text-foreground/80">{feature.name}</p>
                {feature.description && (
                  <p className="text-footnote text-muted-foreground leading-relaxed">{feature.description}</p>
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
    <section id="features" className="pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Section Header */}
        <div className="mb-16 border-t border-border/20 pt-16">
          <h2 className="text-title2 sm:text-title1 font-semibold tracking-tight mb-2">
            Full feature breakdown
          </h2>
          <p className="text-muted-foreground text-subhead">
            Everything included in each plan
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Flow Section */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <h3 className="text-headline font-semibold tracking-tight">Flow</h3>
                <span className="text-caption1 text-muted-foreground tabular-nums">
                  {totalFlowFeatures} features
                </span>
              </div>
              <button 
                onClick={toggleAllFlow}
                className="text-caption1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedFlow.size > 0 ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            
            {/* Feature List */}
            <div className="divide-y divide-border/30">
              {featureCategories.map((category) => (
                <CategoryAccordion
                  key={category.name}
                  name={category.name}
                  features={category.features}
                  isExpanded={expandedFlow.has(category.name)}
                  onToggle={() => toggleFlowCategory(category.name)}
                  variant="flow"
                />
              ))}
            </div>
          </div>

          {/* Black Section */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <h3 className="text-headline font-semibold tracking-tight">Black adds</h3>
                <span className="text-caption1 text-muted-foreground tabular-nums">
                  {totalBlackFeatures} extras
                </span>
              </div>
              <button 
                onClick={toggleAllBlack}
                className="text-caption1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedBlack.size > 0 ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            
            {/* Feature List */}
            <div className="divide-y divide-border/30">
              {blackExclusiveFeatures.map((category) => (
                <CategoryAccordion
                  key={category.name}
                  name={category.name}
                  features={category.features}
                  isExpanded={expandedBlack.has(category.name)}
                  onToggle={() => toggleBlackCategory(category.name)}
                  variant="black"
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

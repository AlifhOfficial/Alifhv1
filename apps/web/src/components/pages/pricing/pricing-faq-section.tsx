/**
 * Pricing FAQ Section
 * Common questions, honest answers - clean accordion style
 */

'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function PricingFaqSection() {
  const faqs = [
    {
      id: 'black-listing',
      q: 'What is a Black listing?',
      a: 'A Black listing is a premium presentation format for cars that deserve more than a standard listing. Not every car is the same—some are worth significantly more and deserve a richer showcase. Black listings give those cars the visual treatment they merit, with an elevated design. Flow includes 1 Black listing, Black tier includes 5.',
    },
    {
      id: 'rankings',
      q: 'Will Black get me better rankings?',
      a: 'No. Listings rank the same for all partners. There is no boost, no priority placement, no algorithmic advantage. Black is about how your brand is presented—not how your listings perform.',
    },
    {
      id: 'missing-features',
      q: 'Is Flow missing anything?',
      a: 'No. Flow includes every feature we offer—unlimited listings, full analytics, lead management, staff accounts, and all platform tools. Nothing is held back. Black adds branding and white-glove service, not functionality.',
    },
    {
      id: 'recommend',
      q: 'Which plan do you recommend?',
      a: 'Flow. For almost every dealer, Flow is the right choice. It\'s complete, fairly priced, and built to scale. Black exists for partners who want premium brand presentation and dedicated support—but it\'s not better, just different.',
    },
    {
      id: 'black-limited',
      q: 'Why is Black availability limited?',
      a: 'Black includes hands-on account management, custom branding work, and priority support. That level of attention doesn\'t scale infinitely. We limit Black spots to ensure every partner in the tier gets the service they\'re paying for.',
    },
    {
      id: 'unbiased',
      q: 'How do you keep results unbiased?',
      a: 'Simple: we don\'t sell ranking boosts. Every listing—Flow or Black—competes on the same terms. What you pay affects your brand presentation and support level, never your visibility or placement.',
    },
    {
      id: 'black-price',
      q: 'Why is Black 3× the price?',
      a: 'Black is not about more features or better rankings. It\'s about brand presence, premium positioning, and dedicated attention—including custom branding, priority support, and deeper visibility into your business performance.',
    },
    {
      id: 'showroom',
      q: 'What counts as a "showroom"?',
      a: 'A showroom refers to a single physical dealership location operating under one brand and inventory team. Each showroom subscription includes unlimited listings, staff accounts, and full access to the platform.',
    },
    {
      id: 'branches',
      q: 'We have multiple branches. Can we use one subscription?',
      a: 'At the moment, each physical showroom requires its own subscription. This ensures clean inventory separation, accurate analytics, and proper brand representation per location. If you operate multiple branches and need a custom setup, contact us to discuss options.',
    },
    {
      id: 'switch',
      q: 'Can I switch between Flow and Black?',
      a: 'Yes. You can upgrade from Flow to Black at any time—subject to availability. Downgrades are also supported and take effect at the next billing cycle.',
    },
    {
      id: 'small-inventory',
      q: 'What if I only have 5 cars right now?',
      a: 'Flow is designed to scale with you. Whether you list 5 cars or 500, the platform, tools, and pricing remain the same.',
    },
    {
      id: 'trial',
      q: 'Is there a free trial?',
      a: 'We don\'t offer free trials. Instead, we focus on transparent pricing, full feature access, and hands-on support from day one.',
    },
    {
      id: 'price-change',
      q: 'Will the price stay at AED 7,000?',
      a: 'Flow is currently priced at AED 7,000 per showroom. As the platform evolves, pricing for new customers may change. Existing partners will always be notified in advance of any updates.',
    },
    {
      id: 'payments',
      q: 'How are payments handled?',
      a: 'All payments are processed securely via Stripe. Alifh does not store card details. Billing, invoicing, and compliance are handled by Stripe’s industry-standard infrastructure.',
    }
 ];

  return (
    <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            Questions
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Common questions
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-xl border border-border/40 bg-sidebar overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="border-b border-border/30 last:border-0"
              >
                <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-muted/30 transition-colors [&>svg]:text-muted-foreground/50 [&[data-state=open]]:bg-muted/20">
                  <span className="text-base font-medium pr-4">
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-base text-muted-foreground">
            Not sure which plan fits?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Reach out
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}

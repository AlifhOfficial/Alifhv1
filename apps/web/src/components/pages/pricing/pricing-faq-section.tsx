/**
 * Pricing FAQ Section
 * Common questions, honest answers
 */

'use client';

import Link from 'next/link';

export function PricingFaqSection() {
  const faqs: { q: string; a: string; link?: string }[] = [
    {
      q: 'What counts as a "showroom"?',
      a: 'One physical location with one inventory. If you have multiple branches, each needs its own subscription. This keeps pricing fair for everyone.',
    },
    {
      q: 'We have multiple branches. Can we use one subscription?',
      a: 'Each showroom location requires its own Flow subscription. Contact us for multi-location pricing if you operate 3+ branches.',
    },
    {
      q: 'Will the price stay at AED 7,000?',
      a: 'This is launch pricing. It may change in the future as we add more features. Early partners will be grandfathered at favorable rates.',
    },
    {
      q: 'Can I switch between Flow and Black?',
      a: 'Yes. Month-to-month. Upgrade or downgrade anytime. No penalties.',
    },
    {
      q: 'What if I only have 5 cars right now?',
      a: 'We get it. Flow is built for established showrooms. If you\'re just starting out, check out Alifh Next—a program designed for smaller dealers to grow with us. Learn more →',
      link: '/become-partner?plan=next',
    },
    {
      q: 'Is there a free trial?',
      a: 'We\'re considering it for early partners. Contact us to discuss.',
    },
    {
      q: 'Why is Black 3x the price?',
      a: 'It\'s not about features—it\'s about time. Custom showroom pages, dedicated onboarding, brand consultation, quarterly reviews. That\'s intensive human work. If you don\'t need it, don\'t pay for it.',
    },
    {
      q: 'Will Black get me better rankings?',
      a: 'No. Rankings are quality-based for everyone. Black gives you brand tailoring and concierge support—not visibility advantages.',
    },
  ];

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-tight">
            Honest answers.
            <br />
            <span className="text-muted-foreground/70">No sales talk.</span>
          </h2>
        </div>

        {/* FAQ grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-lg border border-border/40 bg-background">
              <h3 className="text-sm font-medium text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.a.replace(' Learn more →', '')}
              </p>
              {faq.link && (
                <Link href={faq.link} className="inline-block mt-3 text-sm text-[#0066FF] hover:underline font-medium">
                  Learn more →
                </Link>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

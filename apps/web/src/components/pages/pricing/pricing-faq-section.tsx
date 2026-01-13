/**
 * Pricing FAQ Section
 * Common questions, honest answers
 */

'use client';

export function PricingFaqSection() {
  const faqs = [
    {
      q: 'Can I switch between Flow and Black?',
      a: 'Yes. Month-to-month. Upgrade or downgrade anytime. No penalties.',
    },
    {
      q: 'What if I only have 5 cars right now?',
      a: 'Flow still makes sense. You\'re paying for the infrastructure, not per-car. As you grow, the value compounds.',
    },
    {
      q: 'Do you offer discounts for annual contracts?',
      a: 'Not right now. We prefer month-to-month flexibility. No lock-ins. No games.',
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
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

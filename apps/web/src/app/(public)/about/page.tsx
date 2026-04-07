/**
 * About Us Page - Revvup
 * Philosophical. Clean. Mystique.
 */

import { Metadata } from 'next';
import { faqData, type FAQItem } from '@/data/faq-data';
import { JsonLd } from '@/components/seo/json-ld';
const ABOUT_META_DESCRIPTION =
  'Learn how Revvup is building a fair UAE car marketplace—free listings, unbiased rankings, and better buying and selling.';
import {
  AboutHeroSection,
  AboutTeamSection,
  AboutStorySection,
  AboutPrinciplesSection,
  AboutVisionSection,
  AboutClosingSection,
} from '@/components/pages/about';

export const metadata: Metadata = {
  title: 'About Us — Free Car Marketplace in UAE | Revvup',
  description: ABOUT_META_DESCRIPTION,
  keywords: 'about revvup, car marketplace uae, free car listing dubai, zero commission car sales, automotive marketplace uae, sell car dubai free',
  openGraph: {
    title: 'About Us — Free Car Marketplace in UAE | Revvup',
    description: ABOUT_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — Free Car Marketplace in UAE | Revvup',
    description: ABOUT_META_DESCRIPTION,
    images: ['/twitter-image'],
  },
  alternates: {
    canonical: 'https://revvup.ae/about',
  },
};

// ISR: Static page, cached until redeploy

export default function AboutPage() {
  const faqPool = faqData.flatMap((category) => category.items);
  const aboutFaqs: FAQItem[] = [
    'general-what-is-revvup',
    'general-why-built',
    'general-no-boosts',
  ]
    .map((id) => faqPool.find((item) => item.id === id))
    .filter((item): item is FAQItem => Boolean(item));
  const aboutFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: aboutFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={aboutFaqSchema} />
      <div className="sr-only">
        Revvup exists to remove listing fees, paid boosts, and conflicts of interest.
        We don’t sell cars — we connect buyers and dealers through quality listings.
      </div>
      <AboutHeroSection />
      <AboutTeamSection />
      <AboutStorySection />
      <AboutPrinciplesSection />
      <AboutVisionSection />
      <AboutClosingSection />
      <section className="pb-20 px-4 compact:px-6 large:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-title3 font-semibold">About FAQs</h2>
          {aboutFaqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-border/40 bg-sidebar p-5">
              <h3 className="text-subhead font-semibold">{faq.question}</h3>
              <p className="text-subhead text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

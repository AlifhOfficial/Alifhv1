/**
 * SEO Schema Component - Renders JSON-LD structured data
 * Safe for client and server components
 */

'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: object;
}

/**
 * Renders structured data as JSON-LD in a script tag
 * Google reads this to show rich snippets in search results
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="afterInteractive"
    />
  );
}

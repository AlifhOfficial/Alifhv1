const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://revvup.ae';

function buildLlmsTxt(): string {
  const lines = [
    '# Revvup',
    '',
    '> Revvup is a UAE car marketplace for buying and selling cars with fee-free private listings and quality-first ranking.',
    '',
    '## Primary URLs',
    `${BASE_URL}/`,
    `${BASE_URL}/listings`,
    `${BASE_URL}/sell`,
    `${BASE_URL}/partner`,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/about`,
    `${BASE_URL}/faq`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/black`,
    '',
    '## Policy URLs',
    `${BASE_URL}/terms-of-service`,
    `${BASE_URL}/privacy-policy`,
    `${BASE_URL}/acceptable-use-policy`,
    `${BASE_URL}/intellectual-property`,
    `${BASE_URL}/disclaimer`,
    '',
    '## Discovery',
    `${BASE_URL}/sitemap.xml`,
    '',
    '## Notes',
    '- This file is intended for AI systems and LLM-based crawlers to discover canonical public pages.',
    '- Dynamic inventory and showroom URLs are available via sitemap.',
  ];

  return lines.join('\n');
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

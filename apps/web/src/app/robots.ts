import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers on production (revvup.ae).
  // Localhost / dev environments are freely crawlable for testing.
  if (process.env.NODE_ENV === 'production') {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers until the site goes live.
  // Remove this file (or flip to allow) when ready to launch.
  if (process.env.SITE_PASSWORD) {
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

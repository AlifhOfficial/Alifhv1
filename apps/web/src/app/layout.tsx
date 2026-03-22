import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/components/shared/providers/theme-provider'
import { QueryProvider } from '@/components/shared/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from '@/components/ui/sonner'
import { getSessionUser } from '@/lib/auth/session-context'
import {
  BRAND_APPLE_TOUCH_ICON_URL,
  BRAND_FAVICON_ICO_URL,
  BRAND_FAVICON_PNG_URL,
  BRAND_FAVICON_SVG_URL,
  BRAND_LOGO_SCHEMA_URL,
} from '@/lib/brand-assets'

const geomFont = localFont({
  src: '../../public/assets/fonts/Geom-Black.ttf',
  weight: '900',
  style: 'normal',
  display: 'swap',
  preload: false, // wordmark-only font — preloading globally causes unused-preload warnings
  variable: '--font-geom',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://revvup.ae'),
  title: 'Revvup — Buy & Sell Cars in the UAE | Free. Forever.',
  description: 'The UAE\'s car marketplace built for dealers and buyers. No commissions. No listing fees. Quality-based rankings. Free forever. revvup.ae',
  openGraph: {
    title: 'Revvup — More than a marketplace.',
    description: 'UAE\'s first flat-subscription car marketplace. Dealers pay one price, rank on quality — not payment. Free for buyers. Forever.',
    type: 'website',
    siteName: 'Revvup',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Revvup UAE car marketplace — buy and sell cars free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revvup — More than a marketplace.',
    description: 'UAE\'s first flat-subscription car marketplace. Dealers pay one price, rank on quality — not payment. Free for buyers. Forever.',
    images: ['/twitter-image'],
  },
  icons: {
    icon: [
      { url: BRAND_FAVICON_SVG_URL, type: 'image/svg+xml' },
      { url: BRAND_FAVICON_ICO_URL, sizes: 'any' },
      { url: BRAND_FAVICON_PNG_URL, sizes: '32x32', type: 'image/png' },
    ],
    apple: BRAND_APPLE_TOUCH_ICON_URL,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Revvup',
  },
  other: {
    'logo': BRAND_LOGO_SCHEMA_URL,
  },
  formatDetection: {
    telephone: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialSession = await getSessionUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link key="preconnect-cdn" rel="preconnect" href="https://cdn.revvup.ae" />
        <link key="preconnect-gfonts" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="preconnect-gstatic" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link key="inter-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" />
        <link key="favicon-svg" rel="icon" type="image/svg+xml" href={BRAND_FAVICON_SVG_URL} />
        <link key="favicon-png" rel="icon" type="image/png" sizes="32x32" href={BRAND_FAVICON_PNG_URL} />
        <link key="favicon-ico" rel="shortcut icon" href={BRAND_FAVICON_ICO_URL} />
        {/* Safari pinned tab icon */}
        <link key="mask-icon" rel="mask-icon" href="/favicon.svg" color="#000000" />
        {/* PWA - Apple Touch Icon */}
        <link key="apple-touch-icon" rel="apple-touch-icon" sizes="180x180" href={BRAND_APPLE_TOUCH_ICON_URL} />
        <meta key="apple-webapp-capable" name="apple-mobile-web-app-capable" content="yes" />
        <meta key="mobile-webapp-capable" name="mobile-web-app-capable" content="yes" />
        <meta key="color-scheme" name="color-scheme" content="dark" />
        <meta key="apple-status-bar" name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geomFont.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider initialSession={initialSession}>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

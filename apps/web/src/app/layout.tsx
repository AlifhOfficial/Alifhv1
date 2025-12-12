import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Alifh - Vehicle Marketplace',
  description: 'Buy and sell vehicles with AI-powered valuations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/favicon-dark.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const updateFavicon = () => {
                const link = document.querySelector("link[rel*='icon'][type='image/svg+xml']");
                if (link) {
                  link.href = '/favicon.svg?v=' + Date.now();
                }
              };
              
              window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
            })();
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

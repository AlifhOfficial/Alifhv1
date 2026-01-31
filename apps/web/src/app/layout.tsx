import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/providers/theme-provider'
import { QueryProvider } from '@/components/shared/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { GlobalChatProvider } from '@/components/shared/providers/global-chat-provider'
import { Toaster } from '@/components/ui/sonner'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://alifh.ae'),
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
        {/* Inter Font - Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
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
          <AuthProvider>
            <QueryProvider>
              <GlobalChatProvider>
                {children}
              </GlobalChatProvider>
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

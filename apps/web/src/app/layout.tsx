import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/providers/theme-provider'
import { QueryProvider } from '@/components/shared/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { GlobalChatProvider } from '@/components/shared/providers/global-chat-provider'
import { Toaster } from '@/components/ui/sonner'
import { getSessionUser } from '@/lib/auth/session-context'
import { getFavoriteStatusForListings, getSuperlikeQuotaForUser, getUserConversations } from '@alifh/database'

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://revvup.ae'),
  title: 'Revvup - Vehicle Marketplace',
  description: 'Buy and sell vehicles with AI-powered valuations',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Revvup',
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
  const initialFavoritesStatus = initialSession
    ? await (async () => {
        const [{ favorites, superlikes }, quota] = await Promise.all([
          getFavoriteStatusForListings(initialSession.id),
          getSuperlikeQuotaForUser(initialSession.id),
        ]);
        return {
          favorites,
          superlikes,
          quota: {
            currentMonthSuperlikesUsed: quota.currentMonthSuperlikesUsed,
            maxSuperlikesPerMonth: quota.maxSuperlikesPerMonth,
            premiumSuperlikesBonus: quota.premiumSuperlikesBonus || 0,
            remaining:
              (quota.maxSuperlikesPerMonth + (quota.premiumSuperlikesBonus || 0)) -
              quota.currentMonthSuperlikesUsed,
            periodEndDate: quota.periodEndDate,
            periodStartDate: quota.periodStartDate,
          },
        };
      })()
    : undefined;
  const initialPersonalConversations = initialSession
    ? await (async () => {
        const partnerIds = (initialSession.partnerMemberships ?? [])
          .map((m) => m.partnerId)
          .filter(Boolean);
        const conversations = await getUserConversations(initialSession.id, {
          limit: 50,
          offset: 0,
          includeArchived: false,
          partnerIds,
          partnerScope: partnerIds.length > 0 ? 'exclude' : undefined,
        });
        return {
          conversations: conversations.map((conversation) => ({
            ...conversation,
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            myLastReadAt: conversation.myLastReadAt?.toISOString() ?? null,
            otherParticipant: conversation.otherParticipant
              ? {
                  ...conversation.otherParticipant,
                  lastReadAt: conversation.otherParticipant.lastReadAt?.toISOString() ?? null,
                  lastSeenAt: conversation.otherParticipant.lastSeenAt?.toISOString() ?? null,
                }
              : null,
          })),
          totalUnread: conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
          hasMore: conversations.length === 50,
        };
      })()
    : undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inter Font - Preconnect for performance */}
        <link key="preconnect-google-fonts" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="preconnect-gstatic" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          key="google-fonts-inter"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link key="favicon-svg" rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link key="favicon-png" rel="icon" type="image/png" href="/favicon.png" />
        <link key="favicon-ico" rel="shortcut icon" href="/favicon.ico" />
        {/* PWA - Apple Touch Icon */}
        <link key="apple-touch-icon" rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta key="apple-webapp-capable" name="apple-mobile-web-app-capable" content="yes" />
        <meta key="mobile-webapp-capable" name="mobile-web-app-capable" content="yes" />
        <script key="favicon-script" dangerouslySetInnerHTML={{
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
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider initialSession={initialSession}>
            <QueryProvider
              initialFavoritesStatus={initialFavoritesStatus}
              initialPersonalConversations={initialPersonalConversations}
              initialUserId={initialSession?.id}
            >
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

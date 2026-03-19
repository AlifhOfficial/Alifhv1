import { getFavoritesWithListings, getSuperlikeQuotaForUser, getUserConversations } from '@alifh/database'

interface SessionUser {
  id: string
  partnerMemberships?: Array<{
    partnerId?: string | null
  }>
}

export interface AuthenticatedShellData {
  initialFavoritesStatus?: {
    favorites: string[]
    superlikes: string[]
    quota: {
      currentMonthSuperlikesUsed: number
      maxSuperlikesPerMonth: number
      premiumSuperlikesBonus: number
      remaining: number
      periodEndDate: Date | string | null
      periodStartDate: Date | string | null
    }
  }
  initialNavbarFavoriteListings?: Array<{
    id: string
    make: string | null
    model: string | null
    year: number | null
    price: number | null
    thumbnail: string | null
  }>
  initialNavbarFavoriteIds?: string[]
  initialPersonalConversations?: {
    conversations: Array<Record<string, unknown>>
    totalUnread: number
    hasMore: boolean
  }
  initialUserId?: string
}

export async function getAuthenticatedShellData(user: SessionUser): Promise<AuthenticatedShellData> {
  const initialFavoriteData = await getFavoritesWithListings(user.id, { limit: 3 })
  const quota = await getSuperlikeQuotaForUser(user.id)
  const initialNavbarFavoriteIds = (initialFavoriteData?.favorites ?? []).slice(0, 3)
  const partnerIds = (user.partnerMemberships ?? [])
    .map((membership) => membership.partnerId)
    .filter(Boolean) as string[]
  const conversations = await getUserConversations(user.id, {
    limit: 50,
    offset: 0,
    includeArchived: false,
    partnerIds,
    partnerScope: partnerIds.length > 0 ? 'exclude' : undefined,
  })

  return {
    initialFavoritesStatus: {
      favorites: initialFavoriteData?.favorites ?? [],
      superlikes: initialFavoriteData?.superlikes ?? [],
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
    },
    initialNavbarFavoriteIds,
    initialNavbarFavoriteListings: (initialFavoriteData?.listings ?? [])
      .filter((listing) => initialNavbarFavoriteIds.includes(listing.id))
      .map((listing) => ({
        id: listing.id,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: listing.price,
        thumbnail: listing.thumbnail,
      })),
    initialPersonalConversations: {
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
      totalUnread: conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
      hasMore: conversations.length === 50,
    },
    initialUserId: user.id,
  }
}

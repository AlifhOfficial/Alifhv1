# Contexts Directory

React Context providers for global state management across the application.

## Structure

```
contexts/
├── index.ts                  # Centralized exports
├── favorites-context.tsx     # Favorites and superlike state
└── README.md                 # This file
```

## Available Contexts

### favorites-context.tsx
**Purpose:** Manages favorite and superlike status for listings with quota tracking.

**Provider:** `FavoritesProvider`
**Hook:** `useFavoritesContext()`

**State:**
- `statuses: Record<string, FavoriteStatus>` - Favorite/superlike status by listing ID
- `quota: SuperlikeQuota | null` - User's superlike quota information

**Actions:**
- `setStatuses(statuses)` - Batch update all statuses
- `updateStatus(listingId, status)` - Update single listing status
- `clearStatuses()` - Clear all cached statuses (useful on auth change)
- `setQuota(quota)` - Update superlike quota

**Usage:**
```tsx
import { useFavoritesContext } from '@/contexts';

function MyComponent() {
  const { statuses, updateStatus, quota } = useFavoritesContext();
  
  const isFavorite = statuses['listing-id']?.isFavorite ?? false;
  const remaining = quota?.remaining ?? 0;
  
  return <div>...</div>;
}
```

**Types:**
```typescript
interface FavoriteStatus {
  isFavorite: boolean;
  isSuperliked: boolean;
}

interface SuperlikeQuota {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  totalSuperlikesUsed: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
  remaining: number;
}
```

## Setup

The `FavoritesProvider` is mounted in the root layout (`app/layout.tsx`):

```tsx
import { FavoritesProvider } from '@/contexts';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}
```

## Best Practices

1. **Use hooks, not consumers**: Always use the provided hooks (`useFavoritesContext`)
2. **Memoize callbacks**: Callbacks are memoized with `useCallback` for performance
3. **Clear on logout**: Call `clearStatuses()` when user logs out to prevent data leaks
4. **Batch updates**: Use `setStatuses()` for bulk updates instead of multiple `updateStatus()` calls
5. **Optimistic updates**: Update context immediately, sync with server asynchronously

## Adding New Contexts

When adding a new context:

1. Create the context file (e.g., `new-context.tsx`)
2. Add production JSDoc header
3. Export provider and hook functions
4. Use `useCallback` for action functions
5. Export types that consumers need
6. Update `contexts/index.ts` with exports
7. Document in this README
8. Mount provider in appropriate layout

## Performance Notes

- Contexts re-render all consumers when state changes
- Keep context state minimal and focused
- Consider splitting into multiple contexts if unrelated state causes unnecessary re-renders
- Use `useCallback` for all action functions to prevent reference changes

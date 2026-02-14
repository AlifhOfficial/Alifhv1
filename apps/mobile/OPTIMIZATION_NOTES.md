# Mobile Component Optimization Notes

## Goal
Remove ALL hardcoded pixel values from mobile components and replace with theme tokens from `@/constants/theme.ts` for proper responsive scaling across devices.

## Theme Token Reference
```typescript
// From constants/theme.ts - use these instead of hardcoded values:

Spacing: xs(4), sm(8), md(12), lg(16), xl(20), 2xl(24), 3xl(32), 4xl(40), 5xl(48)
Sizes.iconXs(14), iconSm(18), iconMd(22), iconLg(24), iconXl(28)
Sizes.avatarSm(32), avatarMd(40), avatarLg(48)
Sizes.actionButtonSm(36), actionButtonMd(40), actionButtonLg(48)
Sizes.bubble(36)
Sizes.badgePaddingH, badgePaddingV
Sizes.cardThumbnailWidth(160), cardThumbnailHeight(140)
Radius: none(0), sm(4), md(8), lg(12), xl(16), 2xl(20), 3xl(24), full(9999)
Layout.screenPadding(16), hitSlop(10), hitSlopSmall(8), hitTarget(44)
Typography.* - use spread syntax, never hardcode font sizes
```

## Completed Optimizations

### Card Components (`components/cards/`)
- [x] `car-card-m.tsx` - Already optimized (reference pattern)
- [x] `car-card-list.tsx` - Already optimized (reference pattern)
- [x] `car-card-detailed-m.tsx` - Removed ICON_SIZE_SM=18, skeleton uses tokens

### Listing Components (`components/listings/`)
- [x] `seller-card.tsx` - AVATAR_SIZE→Sizes.avatarLg, ICON_SIZE→Sizes.iconXs
- [x] `quick-stats.tsx` - ICON_SIZE_SM→Sizes.iconXs
- [x] `listing-timestamp.tsx` - ICON_SIZE→Sizes.iconSm, skeleton uses tokens
- [x] `listing-specs.tsx` - ICON_SIZE_SM→Sizes.iconSm, gaps use tokens
- [x] `listing-highlights.tsx` - ICON_SIZE_SM→Sizes.iconXs
- [x] `listing-header.tsx` - ICON_SIZE_SM→Sizes.iconXs, badge padding tokens
- [x] `listing-features.tsx` - BADGE_H_PADDING/GAP use Spacing tokens
- [x] `listing-description.tsx` - Hidden text uses Typography.bodyMedium, hitSlop uses Layout
- [x] `image-lightbox.tsx` - All padding/sizes use tokens, Layout.hitSlop
- [x] `image-grid-modal.tsx` - GRID_GAP/PADDING use Spacing, button uses Sizes
- [x] `image-gallery.tsx` - THUMBNAIL_SIZE derived from Sizes, ICON_SIZE→Sizes.iconXs
- [x] `emi-calculator.tsx` - Calculator icon uses Sizes.iconMd, skeleton uses tokens
- [x] `floating-listing-actions.tsx` - Icon sizes→Sizes.iconMd, padding→Spacing.md

### Deleted (unused in mobile app)
- `contact-section.tsx` - Only used in web
- `location-section.tsx` - Only used in web
- `breadcrumb-header.tsx` - Not used anywhere

### Seller Contact Components (`components/seller-contact/`)
- [x] `seller-hero.tsx` - AVATAR_SIZE/LOGO_SIZE derived from Sizes+Spacing, icons use Sizes.iconXs
- [x] `seller-actions.tsx` - ICON_SIZE→Sizes.iconSm, button height→Sizes.actionButtonLg, hitSlop→Layout
- [x] `seller-stats-grid.tsx` - ICON_SIZE→Sizes.iconXs, gap→Spacing.xs
- [x] `seller-tags.tsx` - paddingHorizontal→Sizes.badgePaddingH
- [x] `seller-listings.tsx` - ChevronRight→Sizes.iconXs
- [x] `financing-calculator.tsx` - Settings2→Sizes.iconXs, hitSlop→Layout.hitSlopSmall, label width derived
- [x] `seller-location.tsx` - ICON_SIZE→Sizes.iconMd, ICON_SIZE_SM→Sizes.iconXs, pill gap→Spacing.sm
- [x] `seller-contact-skeleton.tsx` - All dimensions use Sizes/Spacing tokens and percentages

### User Inventory Management (`components/user-inventory-management/`)
- [x] `inventory-screen.tsx` - IMAGE_WIDTH/HEIGHT derived from Sizes.cardThumbnail*, FAB_SIZE/EMPTY_ICON_SIZE constants, all icons use Sizes.icon*, hitSlop→Layout.hitSlop, skeleton uses percentages, StyleSheet values use Spacing/Sizes/Radius

### Create Listing Flow (`components/user-inventory-management/create/`)
- [x] `create-listing-screen.tsx` - ChevronLeft/X→Sizes.iconLg/iconMd, headerBtn width derived from Sizes+Spacing, progress gap→Spacing.xs, height→Spacing derived, primaryBtn height→Sizes derived
- [x] `step-vehicle-id.tsx` - All icon sizes→Sizes.icon* tokens, hitSlop→Layout.hitSlopSmall, textInput height→Sizes.actionButtonLg, typography→Typography.bodyMedium, picker height→Sizes derived
- [x] `step-details.tsx` - ChevronUp/Down→Sizes.iconSm, textInput→Sizes.actionButtonLg+Typography.bodyMedium, chip gap→Spacing.xs, colorSwatch→Sizes.iconXs
- [x] `step-media.tsx` - IMAGE_SIZE calc uses Layout.screenPadding, ImagePlus→Sizes.iconLg, X→Sizes.iconXs/Spacing.md, Plus→Sizes.iconMd, hitSlop→Layout.hitSlopSmall, all StyleSheet values use Spacing/Sizes/Radius/Typography tokens, toggle track/thumb use Spacing tokens

### Bookings (`components/bookings/`)
- [x] `bookings-screen.tsx` - IMAGE_WIDTH/HEIGHT→Sizes.cardThumbnail*, EMPTY_ICON_SIZE constant, Calendar/Clock→Sizes.iconXs, error icon→Sizes.avatarLg, empty icon→Sizes.iconXl, pillInner/metaRow/countdown→Spacing tokens, badge→Sizes.badgePadding*, skeleton uses percentages
- [x] `booking-details-sheet.tsx` - All icon sizes→Sizes.icon*, hitSlop→Layout.hitSlop, closeButton→Sizes.avatarSm, heroImage→Spacing derived, statusBadge/countdownBadge→Spacing/Sizes tokens, partnerLogo→Sizes.iconXl, button padding→Spacing.md
- [x] `cancel-booking-sheet.tsx` - Icons→Sizes.icon*, closeButton→Sizes.avatarSm, thumbnail→Spacing derived, reasonList/radioOuter/radioInner→Spacing derived, textInput minHeight→Spacing derived, button padding→Spacing.md

## Acceptable Hardcoded Values
These are NOT visual sizes and should stay hardcoded:
- `zIndex: 10` - Stacking order
- `duration: 200` - Animation timing (ms)
- Business logic constants (DOWN_PAYMENT_PERCENT, LOAN_TENURE, etc.)
- `transition={200}` - Image transition timing
- `scrollEventThrottle={16}` - Scroll performance
- `strokeWidth={1.75}` - Icon stroke (design choice, not scaling)
- Percentages like `0.65`, `0.35`, `0.75` - Proportional layouts
- `100%` width/height - Relative sizing

## Patterns to Follow
1. Import tokens: `import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme'`
2. Replace hitSlop objects: `hitSlop={{ top: 10... }}` → `hitSlop={Layout.hitSlop}`
3. Replace icon sizes: `size={22}` → `size={Sizes.iconMd}`
4. Replace padding: `padding: 16` → `padding: Spacing.lg`
5. Skeleton widths: Use percentages `"40%"` instead of fixed pixels
6. Skeleton heights: Use `Spacing.*` tokens

## Still To Do
Check these folders when continuing:
- [ ] `components/ui/` - UI primitives
- [ ] `components/home/` - Home screen components
- [ ] `components/browse/` - Browse/search components
- [ ] `components/profile/` - Profile components
- [ ] `components/settings/` - Settings components
- [ ] `components/sheets/` - Bottom sheets
- [ ] `app/` - Screen components

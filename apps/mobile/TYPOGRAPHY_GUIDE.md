# 📝 Mobile Typography System

Mobile-optimized typography with Inter font that complements the web app design.

## Typography Variants

| Variant | Size | Weight | Letter Spacing | Line Height | Usage |
|---------|------|--------|----------------|-------------|-------|
| `heading` | 28px | 600 (semibold) | -0.6px | 34px | Page titles, main headings |
| `section` | 20px | 700 (bold) | -0.5px | 26px | Section headers, card titles |
| `stat` | 32px | 700 (bold) | -0.8px | 38px | Statistics, large numbers |
| `bodySemibold` | 16px | 600 (semibold) | -0.4px | 24px | Strong emphasis text |
| `bodyMedium` | 16px | 500 (medium) | -0.4px | 24px | Medium emphasis text |
| `body` (default) | 16px | 500 (medium) | -0.4px | 24px | Default body text |
| `label` | 15px | 600 (semibold) | -0.4px | 20px | Form labels, field names (muted 70%) |
| `caption` | 14px | 400 (regular) | -0.4px | 20px | Helper text, descriptions |
| `captionMuted` | 13px | 400 (regular) | -0.4px | 18px | Muted helper text (70% opacity) |
| `link` | 16px | 500 (medium) | -0.4px | 24px | Links (underlined) |

## Mobile vs Web Sizing

| Purpose | Web (Desktop) | Mobile (Native) | Increase |
|---------|--------------|-----------------|----------|
| Page Heading | 20px | 28px | +40% |
| Section Header | 15px | 20px | +33% |
| Statistics | 20px | 32px | +60% |
| Body Text | 14px | 16px | +14% |
| Labels | 14px | 15px | +7% |
| Captions | 12px | 14px | +16% |
| Smallest Text | 12px | 13px | +8% |

## Usage Examples

### Page Structure
```tsx
import { Text } from '@/components/ui/text';

// Page header
<Text variant="heading">Settings</Text>
<Text variant="captionMuted">Manage your preferences</Text>

// Section
<Text variant="section">Personal Information</Text>

// Form field
<Text variant="label">Email Address</Text>
<Text variant="body">john@example.com</Text>
<Text variant="captionMuted">We'll never share your email</Text>
```

### Statistics Display
```tsx
// Stats card
<View>
  <Text variant="stat">127</Text>
  <Text variant="label">Total Listings</Text>
</View>
```

### Content Hierarchy
```tsx
<View style={{ gap: 12 }}>
  <Text variant="section">About</Text>
  <Text variant="body">
    This is the main content text using Inter font. 
    Clean, modern, and highly readable.
  </Text>
  <Text variant="captionMuted">
    Last updated 2 hours ago
  </Text>
</View>
```

### With Custom Colors
```tsx
// Using muted prop
<Text variant="body" muted>
  This text will use muted color
</Text>

// Using custom colors
<Text 
  variant="body" 
  lightColor="#FF0000" 
  darkColor="#FF6B6B"
>
  Custom colored text
</Text>
```

## Design Principles

1. **Mobile-First Sizing**
   - Base body text: 16px (vs 14px web) for comfortable reading
   - Headings: 28-32px (vs 20px web) for clear hierarchy
   - Minimum text: 13px (vs 12px web) for accessibility
   - All sizes optimized for touch interfaces

2. **Tight Letter Spacing** (-0.4 to -0.8px)
   - Maintains web's `tracking-tight` aesthetic
   - Adjusted proportionally for larger mobile sizes
   - Creates modern, polished appearance

3. **Optimal Line Heights**
   - 1.5x ratio for body text (24px line height / 16px size)
   - Tighter for headings (1.2x) for compactness
   - Ensures comfortable reading on smaller screens

4. **Consistent Sizing Scale**
   - 32px - Large stats & metrics
   - 28px - Page headings
   - 20px - Section headers
   - 16px - Body text (primary reading size)
   - 15px - Labels
   - 14px - Captions
   - 13px - Smallest text

5. **Weight Hierarchy**
   - 700 (bold) - Section headers, stats
   - 600 (semibold) - Headings, labels, emphasis
   - 500 (medium) - Body text, links
   - 400 (regular) - Captions

6. **Color Usage**
   - Default: `text` (foreground)
   - Muted: `textMuted` at 70% opacity for labels/captions
   - Custom: Pass `lightColor`/`darkColor` props

## Font Stack

- **Primary**: Inter (Variable font)
  - Supports all weights (100-900)
  - Optimized for screens
  - Excellent readability

## Comparison: Web vs Mobile

| Web (Tailwind) | Mobile (React Native) | Why Larger? |
|----------------|----------------------|-------------|
| `text-xl font-semibold tracking-tight` (20px) | `variant="heading"` (28px) | Mobile needs larger touch targets & readability |
| `text-[15px] font-bold tracking-tight` | `variant="section"` (20px) | Clearer visual hierarchy on small screens |
| `text-sm font-semibold` (14px) | `variant="bodyMedium"` (16px) | Comfortable reading distance on mobile |
| `text-sm text-muted` (14px) | `variant="label"` (15px) | Better legibility for form fields |
| `text-xs text-muted` (12px) | `variant="caption"` (14px) | Meets accessibility minimum (13px+) |
| `text-xl font-bold` (20px) | `variant="stat"` (32px) | Stats need to be prominent on mobile |

### Why Mobile Typography is Larger

1. **Viewing Distance**: Phones held 12-18" away vs monitors at 20-24"
2. **Screen Size**: 5-7" diagonal vs 13-27" desktop screens
3. **Touch Targets**: Text needs sufficient tap area (44pt minimum)
4. **Accessibility**: Mobile users of all ages need comfortable reading
5. **Glancability**: Information must be quickly scannable

## Migration Guide

If you have existing code using old variants:

```tsx
// OLD → NEW
variant="title" → variant="heading"
variant="subtitle" → variant="section"
variant="caption" → variant="captionMuted" (if muted color needed)
variant="caption" → variant="caption" (if normal color)
```

## Best Practices

1. **Use semantic variants**: Choose based on meaning, not appearance
2. **Maintain hierarchy**: heading → section → body → caption
3. **Respect minimum sizes**: Never go below 13px for readability
4. **Test on device**: Typography looks different on actual phones vs simulator
5. **Consider tap targets**: Text links should be easily tappable (minimum 44pt height)
6. **Mind line height**: Inter has good defaults, but mobile needs 1.5x for body text
7. **Test both themes**: Verify text is readable in light and dark modes
8. **Use muted sparingly**: 70% opacity is subtle - ensure sufficient contrast

## Accessibility Guidelines

- **Minimum text size**: 13px (captionMuted)
- **Body text size**: 16px for comfortable reading
- **Line height**: Minimum 1.5x for body text
- **Color contrast**: Maintain WCAG AA standards (4.5:1 for normal text)
- **Touch targets**: Text buttons minimum 44pt tall
- **Responsive**: Sizes work on small (iPhone SE) to large (iPad) screens

---

**All text components automatically use Inter font with refined typography.**

# 🎨 Inter Font & Lucide Icons Setup

This document explains how to use Inter font and Lucide icons in your mobile app.

## ✅ What's Installed

### 📝 Inter Font
- **Variable Font**: InterVariable.ttf (supports all weights: 100-900)
- **Italic Variant**: InterVariable-Italic.ttf
- **Location**: `assets/fonts/`
- **Auto-loaded**: Fonts are loaded on app startup via `useFonts` hook

### 🎯 Lucide Icons
- **Package**: `lucide-react-native@^0.553.0`
- **Icons Available**: 1000+ beautiful, consistent icons
- **Documentation**: https://lucide.dev/icons/

---

## 📖 Usage Guide

### Using Inter Font

Inter font is **automatically applied** to all text components. No additional configuration needed!

```tsx
import { Text } from '@/components/ui/text';

// All variants use Inter font automatically
<Text variant="heading">Heading with Inter</Text>
<Text variant="title">Title with Inter</Text>
<Text variant="subtitle">Subtitle with Inter</Text>
<Text variant="body">Body text with Inter</Text>
<Text variant="caption">Caption with Inter</Text>
```

#### Custom Font Usage
If you need to use Inter in custom components:

```tsx
import { FONT_FAMILY } from '@/theme/globals';
import { Text as RNText } from 'react-native';

<RNText style={{ fontFamily: FONT_FAMILY }}>
  Custom text with Inter
</RNText>
```

---

### Using Lucide Icons

#### Method 1: Using Pre-exported Icons (Recommended)

```tsx
import { Icon } from '@/components/ui/icon';
import { Heart, Star, User, Settings } from '@/components/ui/icons';

// Basic usage
<Icon name={Heart} />

// With custom size and color
<Icon name={Star} size={32} color="#FFD700" />

// With custom stroke width
<Icon name={User} size={24} strokeWidth={2.5} />
```

#### Method 2: Direct Import from Lucide

```tsx
import { Icon } from '@/components/ui/icon';
import { Sparkles } from 'lucide-react-native';

<Icon name={Sparkles} size={24} />
```

#### Theme-Aware Icons

Icons automatically adapt to light/dark mode:

```tsx
// Uses theme color (changes with dark/light mode)
<Icon name={Heart} />

// Override theme colors
<Icon 
  name={Heart} 
  lightColor="#FF0000" 
  darkColor="#FF6B6B" 
/>
```

---

## 🎨 Icon Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | Component | required | The Lucide icon component |
| `size` | number | 24 | Icon size in pixels |
| `color` | string | theme | Icon color (hex, rgb, or theme) |
| `strokeWidth` | number | 1.8 | Icon stroke width |
| `lightColor` | string | - | Color for light mode |
| `darkColor` | string | - | Color for dark mode |

---

## 🚀 Common Patterns

### Button with Icon

```tsx
import { Button } from '@/components/ui/button';
import { Settings, Send } from '@/components/ui/icons';

<Button iconLeft={Settings}>
  Settings
</Button>

<Button iconRight={Send}>
  Send Message
</Button>
```

### Input with Icon

```tsx
import { Input } from '@/components/ui/input';
import { Search, Mail } from '@/components/ui/icons';

<Input 
  placeholder="Search..." 
  icon={Search}
/>

<Input 
  placeholder="Email" 
  icon={Mail}
  keyboardType="email-address"
/>
```

### Icon List

```tsx
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Home, User, Settings, Bell } from '@/components/ui/icons';

<View style={{ flexDirection: 'row', gap: 16 }}>
  <Icon name={Home} />
  <Icon name={User} />
  <Icon name={Settings} />
  <Icon name={Bell} />
</View>
```

---

## 📦 Available Icon Categories

**Navigation & UI**
`ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight`, `Menu`, `X`, `Plus`, `Minus`, `Search`, `Settings`, `Home`

**User & Social**
`User`, `Users`, `Heart`, `MessageCircle`, `Share2`, `Bell`, `Star`, `ThumbsUp`

**Media & Content**
`Camera`, `Image`, `Video`, `Music`, `Play`, `Pause`, `Volume2`

**Files & Documents**
`File`, `FileText`, `Folder`, `Download`, `Upload`, `Trash2`, `Edit`, `Save`

**Commerce**
`ShoppingCart`, `ShoppingBag`, `CreditCard`, `DollarSign`, `Package`

**Status**
`Check`, `CheckCircle`, `XCircle`, `AlertCircle`, `AlertTriangle`, `Info`, `Loader`

**Communication**
`Mail`, `Send`, `Phone`, `MessageSquare`, `Inbox`

**Time & Location**
`Calendar`, `Clock`, `MapPin`, `Map`, `Navigation`, `Globe`

**System**
`Wifi`, `Battery`, `Lock`, `Eye`, `EyeOff`, `Filter`, `Zap`

**Weather**
`Sun`, `Moon`, `Cloud`, `CloudRain`

**More**
`Bookmark`, `Flag`, `Tag`, `Award`, `TrendingUp`, `Link`, `BarChart`

👉 **Find all icons**: https://lucide.dev/icons/

---

## 🔧 Configuration Files

### Font Loading
- **Hook**: `hooks/useFonts.ts`
- **Layout**: `app/_layout.tsx`
- **Globals**: `theme/globals.ts` (exports `FONT_FAMILY`)

### Icon Exports
- **Wrapper**: `components/ui/icon.tsx`
- **Exports**: `components/ui/icons.ts`

---

## 💡 Tips

1. **Icon Size Guidelines**:
   - Small: 16-20px (for inline text)
   - Medium: 24px (default, most common)
   - Large: 32-48px (for prominent actions)
   - Extra Large: 64px+ (for hero sections)

2. **Stroke Width**:
   - Thin: 1-1.5 (delicate, minimal)
   - Regular: 1.8 (default, balanced)
   - Bold: 2-3 (emphasis, headings)

3. **Performance**:
   - Icons are SVG-based and very lightweight
   - Tree-shaking removes unused icons in production
   - Inter is a variable font (single file for all weights)

4. **Accessibility**:
   - Always provide accessible labels for icon-only buttons
   - Use sufficient color contrast
   - Don't rely solely on color to convey meaning

---

## 🐛 Troubleshooting

### Fonts not loading?
1. Check that fonts are in `assets/fonts/`
2. Restart the development server: `npx expo start --clear`
3. Verify `useFonts()` is called in `_layout.tsx`

### Icons not showing?
1. Verify `lucide-react-native` is installed
2. Check import path: `@/components/ui/icons`
3. Ensure `react-native-svg` is installed (it's a peer dependency)

### Build errors?
Clear cache and rebuild:
```bash
npx expo start --clear
```

---

## 📝 Examples

See `FONT_AND_ICONS_EXAMPLES.tsx` for complete working examples.

---

Made with ❤️ using Inter Font & Lucide Icons

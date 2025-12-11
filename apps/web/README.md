# Alifh Web Application

## Design System Setup ✅

The web application has been configured with the Alifh Design Philosophy. All components follow the "Less is More" Apple-inspired minimalism approach.

## What's Configured

### Core Setup
- ✅ **Tailwind CSS** - Configured with semantic color tokens
- ✅ **PostCSS & Autoprefixer** - For CSS processing
- ✅ **TypeScript paths** - `@/*` aliases configured
- ✅ **Dark/Light mode** - Using next-themes with system detection
- ✅ **Inter font** - Default font family configured

### Design Tokens
All semantic tokens are configured in `globals.css`:
- Background colors (light/dark mode support)
- Text colors with hierarchy
- Border colors with opacity variants
- Primary, secondary, destructive colors
- Muted colors for subtle UI elements

### Components Created

#### Base Components
1. **Button** (`components/ui/button.tsx`)
   - Height: 40px (h-10)
   - Text: text-sm font-medium
   - Variants: default, destructive, outline, secondary, ghost, link
   - Smooth transitions with `transition-colors`

2. **Dialog** (`components/ui/dialog.tsx`)
   - Max width: 448px (max-w-md)
   - Border radius: rounded-2xl
   - Padding: p-6
   - Smooth animations

3. **ThemeProvider** (`components/providers/theme-provider.tsx`)
   - System theme detection
   - Dark/light mode switching
   - Hydration protection

### Utilities
- **cn()** function in `lib/utils.ts` for class merging
- Custom animations in `globals.css` (sparkle animation)

## Directory Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── globals.css          # Design system CSS
│   │   ├── layout.tsx           # Root layout with ThemeProvider
│   │   └── page.tsx             # Demo page with examples
│   ├── components/
│   │   ├── providers/
│   │   │   └── theme-provider.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── index.ts         # Component exports
│   └── lib/
│       └── utils.ts             # Utility functions
├── tailwind.config.ts           # Tailwind configuration
├── postcss.config.mjs           # PostCSS configuration
├── components.json              # shadcn/ui config
└── DESIGN_SYSTEM.md            # Complete design guidelines
```

## Running the App

```bash
# Development mode
bun dev

# Build for production
bun build

# Start production server
bun start
```

## Design Philosophy Quick Reference

### Typography
- **Titles**: `text-xl font-medium`
- **Body**: `text-sm`
- **Labels**: `text-xs text-muted-foreground`

### Colors (Always use semantic tokens)
- **Backgrounds**: `bg-background`, `bg-card`, `bg-muted/20`
- **Text**: `text-foreground`, `text-muted-foreground`
- **Borders**: `border-border/40`, `border-border/20`

### Spacing
- **Modal sections**: `space-y-6`
- **Subsections**: `space-y-4`
- **Tight spacing**: `space-y-2`

### Icons
- **Size**: `w-4 h-4` (16px)
- **Position**: Top left only (except logos)
- **Color**: `text-muted-foreground`

### Animations
- **Allowed**: Opacity transitions, scale, spin, sparkle
- **Not allowed**: Ping, slide, shake, color transitions

## Next Steps

1. **Add more UI components** as needed:
   - Input fields
   - Cards
   - Labels
   - Select dropdowns
   - Toast notifications

2. **Create feature components** in `components/features/`
   - Authentication forms
   - Vehicle listing cards
   - Search components

3. **Build layouts** in `components/layouts/`
   - Header/Navigation
   - Footer
   - Dashboard layouts

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md) - Complete implementation guide
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Radix UI Docs](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com) - Additional component patterns
- [Lucide Icons](https://lucide.dev) - Icon library

## Design System Demo

Visit the homepage (`/`) to see interactive examples of:
- Email sent modal with countdown timer
- Loading modal with spinner
- Success modal with centered logo and sparkles

All examples follow the Alifh Design Philosophy exactly.

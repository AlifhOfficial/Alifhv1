# Alifh Web - Design System Implementation

## Overview
This document outlines the implementation of the Alifh Design Philosophy in the web application.

## Typography Scale

```tsx
// Titles
<h1 className="text-xl font-medium">Title</h1>

// Body Text
<p className="text-sm">Body content</p>

// Labels/Hints
<span className="text-xs text-muted-foreground">Label</span>
```

## Color Usage

### Semantic Tokens (Always Use These)
```tsx
// Backgrounds
bg-background    // Main page background
bg-card          // Card/modal backgrounds
bg-muted/20      // Subtle info boxes

// Text
text-foreground           // Primary text
text-muted-foreground     // Secondary text
text-destructive          // Error messages
text-primary              // Links/CTAs

// Borders
border-border/40          // Standard borders
border-border/20          // Subtle borders
```

### ❌ Never Use Hardcoded Colors
```tsx
// DON'T DO THIS:
className="bg-blue-50 text-green-600 border-red-500"

// DO THIS INSTEAD:
className="bg-muted/20 text-primary border-border/40"
```

## Component Patterns

### Modal Structure
```tsx
<Dialog>
  <DialogContent>
    {/* Icon - Top Left, 4x4 */}
    <Icon className="w-4 h-4 text-muted-foreground" />
    
    <DialogHeader className="space-y-2">
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Description text here
      </DialogDescription>
    </DialogHeader>

    {/* Info Box */}
    <div className="p-3 bg-muted/20 border border-border/20 rounded-lg">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Information or instructions
      </p>
    </div>

    {/* Actions */}
    <div className="space-y-3">
      <Button className="w-full">Primary Action</Button>
      <Button variant="secondary" className="w-full">
        Secondary Action
      </Button>
    </div>

    {/* Footer */}
    <div className="pt-2 border-t border-border/20">
      <p className="text-xs text-center text-muted-foreground">
        Footer text or link
      </p>
    </div>
  </DialogContent>
</Dialog>
```

### Button Patterns
```tsx
// Primary Button
<Button>Continue</Button>

// Secondary Button
<Button variant="secondary">Cancel</Button>

// Destructive Button
<Button variant="destructive">Delete</Button>

// Link Button
<Button variant="link">Learn more</Button>

// Disabled Button (automatic styling)
<Button disabled>Processing...</Button>
```

### Info Box Pattern
```tsx
<div className="p-3 bg-muted/20 border border-border/20 rounded-lg space-y-2">
  <p className="text-xs text-muted-foreground leading-relaxed">
    • First point
  </p>
  <p className="text-xs text-muted-foreground leading-relaxed">
    • Second point
  </p>
</div>
```

## Spacing System

### Section Spacing
```tsx
// Main sections
<div className="space-y-6">...</div>

// Subsections
<div className="space-y-4">...</div>

// Tight spacing
<div className="space-y-2">...</div>
```

### Padding
```tsx
// Modals (handled by Dialog)
p-6

// Info boxes
p-3

// Buttons (handled by Button)
px-4
```

## Animation Guidelines

### Allowed Animations
```tsx
// Opacity transitions
className="transition-opacity duration-500"

// Button hover
className="transition-colors" // Built into Button component

// Loading spinner
<Loader2 className="w-4 h-4 animate-spin" />

// Success sparkle
className="animate-sparkle" // Custom animation in globals.css
```

### Loading States
```tsx
// Text with dots
<span>Loading<span className="animate-pulse">...</span></span>

// Spinner
<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
```

## Icon Usage

### Size and Position
```tsx
// Standard icons (always 4x4)
<Icon className="w-4 h-4 text-muted-foreground" />

// Logo (exception - can be larger and centered)
<Image 
  src="/logo.svg" 
  className="w-20 h-20 dark:invert" 
  alt="Alifh"
/>
```

### ❌ Anti-Patterns
```tsx
// DON'T: Icon backgrounds
<div className="w-12 h-12 bg-blue-50 rounded-full">
  <Icon />
</div>

// DON'T: Icons in buttons
<Button>
  <Icon className="mr-2" />
  Continue
</Button>

// DON'T: Centered icons (except logo)
<div className="flex justify-center">
  <Icon />
</div>
```

## Dark Mode Support

All components automatically support dark mode through:
1. Semantic color tokens
2. `suppressHydrationWarning` on `<html>` tag
3. ThemeProvider with system detection

```tsx
// No special handling needed - just use semantic tokens
<div className="bg-card text-foreground">
  Content adapts automatically
</div>
```

## Rate Limiting UI Pattern

```tsx
const [countdown, setCountdown] = useState(60);
const [canResend, setCanResend] = useState(false);

useEffect(() => {
  if (countdown > 0) {
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  } else {
    setCanResend(true);
  }
}, [countdown]);

return (
  <Button 
    disabled={!canResend}
    onClick={() => {
      setCountdown(60);
      setCanResend(false);
      // Resend logic
    }}
  >
    {canResend ? "Resend email" : `Resend in ${countdown}s`}
  </Button>
);
```

## Checklist for New Components

- [ ] Icon is 4x4 and positioned top-left (or logo centered for success)
- [ ] Title uses `text-xl font-medium`
- [ ] Body text uses `text-sm`
- [ ] All colors use semantic tokens
- [ ] Borders use `border` (not `border-2`) with opacity
- [ ] Buttons are `h-10` with `text-sm`
- [ ] No icons inside buttons
- [ ] Spacing uses `space-y-4` or `space-y-6`
- [ ] Animations are subtle (opacity/scale only)
- [ ] Rate limiting on user actions
- [ ] Info boxes use `bg-muted/20` with `border-border/20`
- [ ] Tested in both light and dark modes

## Common Mistakes to Avoid

1. **Using hardcoded colors**: Always use semantic tokens
2. **Heavy animations**: Keep it minimal (opacity/scale only)
3. **Large fonts**: Stick to `text-xl` max for modal titles
4. **Icons in buttons**: Keep buttons text-only
5. **Missing rate limiting**: Always add countdown timers
6. **Forgetting dark mode**: Test both themes
7. **Inconsistent spacing**: Use `space-y-*` utilities
8. **Border-2 everywhere**: Use `border` (1px) with opacity
9. **Centered icons**: Keep icons top-left (except logo)
10. **Complex layouts**: Keep it simple and minimal

## Resources

- Tailwind CSS: https://tailwindcss.com
- Radix UI: https://www.radix-ui.com
- shadcn/ui: https://ui.shadcn.com
- Lucide Icons: https://lucide.dev
- next-themes: https://github.com/pacocoursey/next-themes

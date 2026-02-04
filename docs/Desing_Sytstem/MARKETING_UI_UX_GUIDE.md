# Revvup Marketing & SEO UI/UX Guide

> A comprehensive guide for building marketing and SEO materials that align with the Revvup design system.

## Design Philosophy

**"Less is More"** - Minimalist aesthetic with clean typography and purposeful use of space.

---

## Color System

### Text Hierarchy
```
Primary Text:     text-foreground
Secondary Text:   text-muted-foreground/70
Tertiary Text:    text-muted-foreground/50
Labels:           text-xs text-muted-foreground/70
```

### Semantic Colors
```
Success:    text-green-500 (icon/text only)
Warning:    text-yellow-500 (icon/text only)
Error:      text-red-500 / bg-red-500/10 (errors can use colored bg)
Info:       text-blue-500 (icon/text only)

IMPORTANT: Do NOT use colored backgrounds like bg-green-500/10.
Use bg-muted/15 with border-border/40 for cards, then add color via text/icons.
```

### Backgrounds
```
Primary:      bg-background
Card:         bg-card
Muted:        bg-muted/15 (preferred for subtle cards)
Translucent:  bg-card/50
Overlay:      bg-background/80

NOTE: Prefer bg-muted/15 with border-border/40 for content cards.
Add color hints via text colors and icons only, not background colors.
```

### Borders
```
Standard:     border-border/40
Subtle:       border-border/20
Divider:      border-border/10
```

---

## Typography Scale

### Headings
```tsx
H1: text-2xl md:text-3xl font-semibold tracking-tight
H2: text-xl font-semibold tracking-tight
H3: text-lg font-semibold
```

### Body Text
```tsx
Body:       text-sm text-foreground
Small:      text-xs text-muted-foreground/70
Label:      text-xs text-muted-foreground/70 uppercase tracking-wider
```

### Examples
- **Section Headers**: `text-xl font-semibold text-foreground`
- **Descriptions**: `text-sm text-muted-foreground/70`
- **Feature Labels**: `text-xs text-muted-foreground/70 uppercase tracking-wider`

---

## Spacing System

### Consistent Gaps
```
Extra Tight:  gap-2    (8px)
Tight:        gap-3    (12px)
Default:      gap-4    (16px)
Comfortable:  gap-6    (24px)
Spacious:     gap-8    (32px)
```

### Vertical Spacing
```
Sections:     space-y-16
Subsections:  space-y-8
Groups:       space-y-6
Items:        space-y-3
Tight:        space-y-2
```

### Padding Patterns
```
Cards:        p-8 md:p-10
Small Cards:  p-6
Buttons:      px-6 py-3
Labels:       px-3 py-1
```

---

## Component Patterns

### Card Component
```tsx
<div className="bg-card rounded-2xl border border-border/40 p-8 md:p-10">
  {/* Content */}
</div>
```

**Variations:**
- **Translucent**: `bg-card/50 backdrop-blur-sm`
- **Hoverable**: `hover:border-border/60 transition-all`

### Button Styles

#### Primary Button
```tsx
<button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 border border-border/40 rounded-full font-medium hover:bg-secondary/30 transition-all">
  Secondary Action
</button>
```

#### Text Button
```tsx
<button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  Text Action
</button>
```

### Badge Component
```tsx
<span className="px-3 py-1 bg-muted text-xs font-medium rounded-full">
  Badge Text
</span>
```

### Icon + Text Pattern
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4 text-muted-foreground" />
  <span className="text-sm text-muted-foreground">Label</span>
</div>
```

---

## Layout Patterns

### Container Widths
```
Hero:         max-w-6xl
Content:      max-w-4xl
Narrow:       max-w-2xl
Forms:        max-w-md
```

### Responsive Padding
```tsx
className="px-4 sm:px-6 lg:px-8"
```

### Grid Layouts
```tsx
// 2-column on tablet, 3-column on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

## Visual Effects

### Backdrop Blur
```
Light:    backdrop-blur-sm
Medium:   backdrop-blur-md
Heavy:    backdrop-blur-lg
```

### Shadows
```
Subtle:   shadow-sm
Default:  shadow-md
Heavy:    shadow-2xl
```

### Transitions
```
Standard:     transition-all duration-200
Smooth:       transition-colors duration-200
Interactive:  hover:scale-105 transition-transform
```

---

## Interactive States

### Hover Effects
```tsx
// Subtle background change
hover:bg-secondary/30

// Border highlight
hover:border-border/60

// Text color change
hover:text-foreground

// Scale animation
hover:scale-105 transition-transform
```

### Loading States
```tsx
<Loader2 className="w-5 h-5 animate-spin text-primary" />
```

### Disabled States
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## Marketing-Specific Components

### Feature Card
```tsx
<div className="bg-card rounded-2xl border border-border/40 p-8 space-y-4">
  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <h3 className="text-lg font-semibold">Feature Title</h3>
  <p className="text-sm text-muted-foreground/70">
    Feature description explaining the benefit.
  </p>
</div>
```

### Stat Display
```tsx
<div className="space-y-2">
  <p className="text-3xl font-bold text-foreground">2,547</p>
  <p className="text-xs text-muted-foreground/70">Total Listings</p>
</div>
```

### CTA Section
```tsx
<div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 p-10 text-center space-y-6">
  <h2 className="text-2xl font-semibold">Ready to get started?</h2>
  <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
    Join thousands of users already using Revvup.
  </p>
  <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all">
    Get Started
  </button>
</div>
```

### Testimonial Card
```tsx
<div className="bg-card rounded-2xl border border-border/40 p-8 space-y-6">
  <p className="text-sm text-foreground">
    "Testimonial quote goes here..."
  </p>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-muted" />
    <div>
      <p className="text-sm font-medium">Customer Name</p>
      <p className="text-xs text-muted-foreground/70">Role / Company</p>
    </div>
  </div>
</div>
```

---

## Icon Usage

### Size Guidelines
```
Small:    w-4 h-4    (16px)
Default:  w-5 h-5    (20px)
Medium:   w-6 h-6    (24px)
Large:    w-8 h-8    (32px)
XL:       w-12 h-12  (48px)
```

### Color Guidelines
```
Primary:    text-primary
Secondary:  text-muted-foreground
Semantic:   text-green-500, text-red-500, text-yellow-500
```

### Icon Library
Use **Lucide React** icons consistently across all materials.

---

## Accessibility

### Focus States
```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
```

### Touch Targets
- Minimum: 44px × 44px
- Buttons: `py-3` ensures adequate height
- Interactive icons: Use padding to increase hit area

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Use `text-foreground` and `text-muted-foreground` for guaranteed readability

---

## Animation Guidelines

### Micro-interactions
```tsx
// Button press
active:scale-95 transition-transform

// Heart favorite
animate-in zoom-in-95 duration-200

// Fade in
animate-in fade-in duration-200

// Slide in from bottom
animate-in slide-in-from-bottom-4 duration-300
```

### Loading States
```tsx
<div className="flex items-center justify-center">
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
</div>
```

---

## Modal/Overlay Patterns

### Full-Screen Overlay
```tsx
<div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
  <div className="bg-card rounded-2xl border border-border/40 shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
    {/* Modal Content */}
  </div>
</div>
```

---

## Responsive Design

### Breakpoints
```
sm:  640px  (Mobile landscape, tablet)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
```

### Mobile-First Patterns
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-6">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Adjust padding responsively
<div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
```

---

## Content Guidelines

### Messaging Tone
- **Clear & Concise**: Avoid jargon
- **Confident**: Use active voice
- **Friendly**: Professional but approachable
- **Action-Oriented**: Clear CTAs

### Formatting
- **Short paragraphs**: 2-3 lines max
- **Scannable**: Use headings and bullet points
- **Whitespace**: Don't be afraid of empty space
- **Emphasis**: Use font-weight, not color alone

---

## SEO Considerations

### Semantic HTML
```tsx
<article>
  <header>
    <h1>Main Heading</h1>
  </header>
  <section>
    <h2>Section Heading</h2>
    <p>Content...</p>
  </section>
</article>
```

### Image Optimization
- Use `priority={true}` for above-the-fold images
- Always include descriptive `alt` text
- Use appropriate image formats (AVIF, WebP)

### Link Patterns
```tsx
// Internal navigation
<Link href="/path" className="text-primary hover:underline">
  Link Text
</Link>

// External links
<a 
  href="https://external.com" 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-primary hover:underline"
>
  External Link
</a>
```

---

## Quick Reference: Marketing Page Structure

```tsx
// Hero Section
<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8">
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
    Hero Headline
  </h1>
  <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
    Supporting description
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full">
      Primary CTA
    </button>
    <button className="px-8 py-3 border border-border/40 rounded-full">
      Secondary CTA
    </button>
  </div>
</section>

// Features Section
<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
  <div className="text-center space-y-4">
    <h2 className="text-2xl md:text-3xl font-semibold">Features</h2>
    <p className="text-sm text-muted-foreground/70">Supporting text</p>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Feature cards */}
  </div>
</section>

// CTA Section
<section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 p-10 text-center space-y-6">
    <h2 className="text-2xl font-semibold">Call to Action</h2>
    <p className="text-sm text-muted-foreground/70">Supporting message</p>
    <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full">
      Get Started
    </button>
  </div>
</section>
```

---

## Common Mistakes to Avoid

❌ **Don't:**
- Mix different border radius styles (stick to rounded-2xl for cards, rounded-full for buttons)
- Use arbitrary opacity values (use defined values: /70, /50, /40, /20, /10)
- Over-animate (keep transitions subtle and purposeful)
- Use more than 2-3 colors in a single component
- Create overly complex layouts

✅ **Do:**
- Maintain consistent spacing throughout
- Use the semantic color system
- Prioritize readability over decoration
- Test on mobile devices
- Use loading states for async actions

---

## Tools & Resources

### Design Tokens
All color, spacing, and typography values come from the Tailwind config.

### Icon Library
**Lucide React** - https://lucide.dev

### Component Library
**shadcn/ui** - Pre-built accessible components

---

## Version History

- **v1.0** - Initial guide (Jan 2026)

---

*This guide should be referenced for all marketing pages, landing pages, blog posts, and SEO-focused content to maintain brand consistency.*

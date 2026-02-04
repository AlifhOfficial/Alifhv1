# Revvup Design System

**Last Updated:** December 22, 2025

## Core Principle
**"Minimal, Clean, Consistent"** - Profile-view inspired minimalism with subtle accents

---

## 🎨 Visual Design Rules

### Typography
- **Page Titles:** `text-2xl font-semibold tracking-tight`
- **Section Headers:** `text-lg font-medium tracking-tight`
- **Body Text:** `text-sm` (14px) - regular weight
- **Labels/Hints:** `text-xs` (12px) - text-muted-foreground
- **Font Family:** Inter (system default)
- **Never use bold** - use font-medium or font-semibold only

### Colors & Semantic Usage
- **Blue (blue-500):** Primary actions, total counts, key CTAs
- **Green (green-500):** Active status, success states, verified badges
- **Yellow (yellow-500):** Pending status, warnings, ratings
- **Red (red-500):** Errors, bans, destructive actions
- **Foreground:** Default text and counts when neutral
- **Muted Foreground:** Secondary text, icon colors, labels

**Color Application Rules:**
- Use semantic colors sparingly for meaning
- Default to foreground/muted-foreground for neutrality
- Never use gradients
- Badge backgrounds: `{color}-500/10` with `text-{color}-500`
- Status dots: `w-1.5 h-1.5 rounded-full bg-current`

### Spacing
- **Page Container:** `max-w-4xl mx-auto px-6 py-16` (or max-w-6xl for wider content)
- **Section Spacing:** `space-y-16` between major sections
- **Subsection Spacing:** `space-y-8` within sections
- **Form Field Spacing:** `space-y-10` between input groups
- **Card Grid Gaps:** `gap-4` for cards, `gap-6` for info grids

### Borders & Corners
- **Card Corners:** `rounded-xl` (12px) - always use this, never rounded-lg
- **Button Corners:** `rounded-full` for primary actions
- **Badge Corners:** `rounded-md` (6px)
- **Border Width:** `border` (1px) - never border-2
- **Border Opacity:** `border-border/40` (section headers), `border-border` (cards/dividers)

---

## 🧩 Component Patterns

### Input Fields (Border-Bottom Style)
```tsx
<input
  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
/>
```
- No backgrounds, no rounded corners
- Border only on bottom
- Focus state changes border to foreground color
- Labels above with icon: `<User className="w-3.5 h-3.5 text-muted-foreground" />`

### Section Headers
```tsx
<div className="border-b border-border/40 pb-2">
  <h3 className="text-lg font-medium tracking-tight">Section Title</h3>
</div>
```
- Always border-bottom to separate sections
- Tight tracking for cleaner look
- Optional subtitle: `<p className="text-sm text-muted-foreground mt-1">`

### Cards (Information Containers)
```tsx
<div className="rounded-xl border border-border p-8 space-y-6">
  {/* Card content */}
</div>
```
- Always rounded-xl, never rounded-lg
- Standard padding: p-6 or p-8
- Hover state for interactive cards: `hover:bg-secondary/10`

### Primary Buttons
```tsx
<button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
  Action Text
</button>
```
- Rounded-full for pill shape
- Blue-500 background
- No icons inside buttons - text only
- Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`

### Secondary Buttons
```tsx
<button className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors">
  Cancel
</button>
```
- Same shape as primary but with border
- Hover shows subtle background

### Stats Grids (Border-Y Style)
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
  <div className="p-8 text-center">
    <Icon className="w-5 h-5 text-blue-500 mx-auto mb-3" />
    <p className="text-xs text-muted-foreground mb-1">Label</p>
    <p className="text-xl font-semibold text-blue-500">123</p>
  </div>
</div>
```
- Border-y creates top and bottom borders
- Divide-x creates vertical separators
- Icons centered above text
- Colored numbers for emphasis
- Clickable filters: `cursor-pointer hover:bg-secondary/10 transition-colors`

### Status Badges (Minimal)
```tsx
{/* Active/Success */}
<span className="px-3 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
  Active
</span>

{/* Pending/Warning */}
<span className="px-3 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium">
  Pending
</span>

{/* With Status Dot */}
<span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-500/10 text-sm text-green-500">
  <div className="w-1.5 h-1.5 rounded-full bg-current" />
  Active
</span>
```
- Rounded-md, not rounded-full
- 10% opacity background of accent color
- Text matches accent color
- Optional status dot indicator

### Modals (Detail Views)
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
  
  <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-xl shadow-xl m-4">
    {/* Sticky Header */}
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
      <h2 className="text-lg font-medium">Modal Title</h2>
      <button onClick={onClose} className="p-2 hover:bg-secondary/50 rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-6 space-y-12">
      {/* Sections */}
    </div>
  </div>
</div>
```
- Backdrop blur for depth
- Sticky header for long content
- Space-y-12 between major sections

---

## 🎯 Layout Patterns

### Dashboard Page Structure
```tsx
<div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
  {/* Section 1 */}
  <section className="space-y-8">
    <div className="border-b border-border/40 pb-2">
      <h3 className="text-lg font-medium tracking-tight">Section Title</h3>
    </div>
    {/* Section content */}
  </section>
  
  {/* Section 2 */}
  <section className="space-y-8">
    {/* ... */}
  </section>
</div>
```

### Information Grid (Contact Info, Profile Fields)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Mail className="w-3.5 h-3.5" />
      <span>Email</span>
    </div>
    <p className="text-sm font-medium">user@example.com</p>
  </div>
</div>
```

### Card Lists (Partners, Users, Requests)
```tsx
<div className="space-y-4">
  {items.map(item => (
    <div key={item.id} className="rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Quick Access Links
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Link href="/path" className="group rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
    <h4 className="font-medium mb-1">Link Title</h4>
    <p className="text-sm text-muted-foreground">Description</p>
  </Link>
</div>
```

---

## ✨ Animation Guidelines

### Allowed Animations
- **Hover states:** `hover:bg-secondary/10` or `hover:border-blue-500/40`
- **Button transitions:** `transition-colors`
- **Chevron slides:** `group-hover:translate-x-1 transition-transform`
- **Loading spinners:** `animate-spin` on small icons
- **Skeleton loading:** `animate-pulse` on placeholder blocks

### Forbidden Animations
- ❌ No gradients or gradient animations
- ❌ No slide-in/slide-out page transitions
- ❌ No bounce/shake/wiggle effects
- ❌ No color transitions
- ❌ No complex keyframes

---

## 🚫 Anti-Patterns to Avoid

### Never Do These
1. **Using rounded-lg for cards** - Always use rounded-xl
2. **Icons in buttons** - Keep buttons text-only
3. **Heavy backgrounds** - Use 10% opacity (e.g., bg-blue-500/10)
4. **Gradient backgrounds** - Stick to solid colors
5. **Border-2 or thick borders** - Always use border (1px)
6. **Centered icons in cards** - Icons go top-left or as labels
7. **Multiple competing colors** - Use blue as primary, others sparingly
8. **Large avatars or icons** - Keep icons small (4x4 or 5x5)
9. **Inconsistent button shapes** - Primary = rounded-full, always
10. **Heavy shadows** - Use border-border instead for depth

---

## 📋 Component Checklist

Before implementing any component:
- [ ] Section headers use border-b border-border/40
- [ ] Cards use rounded-xl (never rounded-lg)
- [ ] Primary buttons are rounded-full with blue-500
- [ ] Inputs use border-bottom style with focus states
- [ ] Colors are semantic (blue primary, green success, yellow warning, red error)
- [ ] Badges use rounded-md with 10% opacity backgrounds
- [ ] Stats grids use border-y and divide-x patterns
- [ ] No gradients anywhere
- [ ] Spacing uses space-y-8 or space-y-16
- [ ] Icons are small (w-4 h-4 or w-5 h-5)
- [ ] Text-only buttons (no icons inside)
- [ ] Hover states use hover:bg-secondary/10

---

## 🎨 Color Reference

### Primary Accent - Blue
- Actions: `bg-blue-500 hover:bg-blue-600`
- Badges: `bg-blue-500/10 text-blue-500`
- Icons: `text-blue-500`
- Links: `text-blue-500 hover:text-blue-600`

### Success/Active - Green
- Status: `text-green-500`
- Badges: `bg-green-500/10 text-green-500`
- Icons: `text-green-500`

### Warning/Pending - Yellow
- Status: `text-yellow-500`
- Badges: `bg-yellow-500/10 text-yellow-500`
- Icons: `text-yellow-500`

### Error/Destructive - Red
- Status: `text-red-500`
- Badges: `bg-red-500/10 text-red-500`
- Icons: `text-red-500`

### Neutral
- Default text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Backgrounds: `bg-background`, `bg-card`, `bg-secondary/10`
- Borders: `border-border` or `border-border/40`

---

## 🔑 Key Takeaways

**Visual Identity:**
- Clean, minimal, professional
- Border-bottom section headers everywhere
- Rounded-xl cards consistently
- Rounded-full primary buttons
- Subtle color accents for meaning

**Information Hierarchy:**
1. Page title (text-2xl font-semibold)
2. Section headers (border-b, text-lg)
3. Content cards (rounded-xl, proper spacing)
4. Actions (blue rounded-full buttons)

**When in doubt:**
- **Remove, don't add** - keep it minimal
- **Use borders, not shadows** - for depth
- **Choose semantic colors** - blue/green/yellow/red
- **Follow the border-bottom pattern** - for section headers
- **Always rounded-xl for cards** - consistency matters

---

## 📱 Responsive Design

- **Mobile-first approach:** Start with single column, expand to grid on md+
- **Container widths:** max-w-2xl (forms), max-w-4xl (standard), max-w-6xl (wide content)
- **Grid breakpoints:** `grid-cols-1 md:grid-cols-2` or `md:grid-cols-4`
- **Padding:** Consistent px-6 on mobile, same on desktop (no need to increase)
- **No breakpoint-specific designs** - same patterns across all sizes

---

## 🎪 Practical Examples

### Form Section
```tsx
<section className="space-y-8">
  <div className="border-b border-border/40 pb-2">
    <h3 className="text-lg font-medium tracking-tight">Work Identity</h3>
    <p className="text-sm text-muted-foreground mt-1">Information for client interactions</p>
  </div>

  <form className="space-y-10">
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <User className="w-3.5 h-3.5 text-muted-foreground" />
        Display Name
      </label>
      <input
        type="text"
        className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
      />
      <p className="text-xs text-muted-foreground">Helper text here</p>
    </div>
  </form>
</section>
```

### Stats Overview
```tsx
<section className="space-y-8">
  <div className="border-b border-border/40 pb-2">
    <h3 className="text-lg font-medium tracking-tight">Overview</h3>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
    <button className="p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors">
      <Users className="w-5 h-5 text-blue-500 mx-auto mb-3" />
      <p className="text-xs text-muted-foreground mb-1">Total</p>
      <p className="text-xl font-semibold text-blue-500">1,234</p>
    </button>
  </div>
</section>
```

### Card List
```tsx
<div className="space-y-4">
  {items.map(item => (
    <div key={item.id} className="rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium mb-1">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-medium">
          Active
        </span>
      </div>
      
      <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors">
        Manage
      </button>
    </div>
  ))}
</div>
```

---

**Remember:** Consistency is key. Follow these patterns religiously to maintain a cohesive, professional design throughout the application.

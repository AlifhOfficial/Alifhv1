# Alifh UI/UX Design Patterns

## Core Philosophy
**"Keep it neat, don't overdo it"**

Clean, minimal design that prioritizes clarity and usability over decorative elements.

---

## Typography Scale
Based on `globals.css`:

```
h1: text-4xl to text-6xl, font-semibold
h2: text-lg to text-xl, font-medium  
h3: text-base, font-medium
p:  text-sm
small: text-xs with opacity-70
```

**Usage:**
- Use semantic HTML tags (`<h1>`, `<h2>`, `<p>`, `<small>`)
- Let global CSS handle the styling automatically
- Maintain hierarchy: h1 → h2 → h3 → p → small

---

## Color System

### Functional Colors
- **Yellow**: Pending states, warnings, "in progress"
- **Green**: Success, approval, completion
- **Red**: Errors, rejection, destructive actions
- **Muted**: Neutral information, disabled states

### Usage Rules
```tsx
// ✅ GOOD - Specific functional color
<Clock className="text-yellow-500" />        // Pending
<CheckCircle2 className="text-green-500" />  // Success
<button className="text-red-500">Cancel</button>  // Danger

// ❌ BAD - Avoid gradients and heavy colors
<div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
<div className="border-green-500/40 shadow-green-500/20" />
```

---

## Layout Patterns

### Status Cards
Centered, minimal design for application states:

```tsx
<div className="bg-card rounded-2xl border border-border/40 p-10">
  {/* Icon */}
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
    <Icon className="w-5 h-5 text-[functional-color]" />
  </div>
  
  {/* Content */}
  <div className="space-y-3">
    <h2 className="text-xl">Title</h2>
    <p className="text-sm text-muted-foreground/70">Description</p>
  </div>
  
  {/* Details */}
  <div className="space-y-6">
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground/70">Label</p>
      <p className="text-sm text-foreground">Value</p>
    </div>
  </div>
</div>
```

### Buttons

**Primary Action:**
```tsx
<button className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
  Action
</button>
```

**Secondary Action:**
```tsx
<button className="px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50">
  Action
</button>
```

**Destructive Action:**
```tsx
<button className="px-6 py-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
  Delete
</button>
```

**Text-only (Subtle):**
```tsx
<button className="text-xs text-muted-foreground/70 hover:text-foreground">
  Cancel
</button>
```

---

## Component Patterns

### Status Badges
Simple, neutral badges - avoid colored backgrounds:

```tsx
// ✅ GOOD
<span className="px-3 py-1 text-xs text-muted-foreground rounded-full bg-muted border border-border/40">
  {status}
</span>

// ❌ BAD - Avoid colored badges
<span className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
  pending
</span>
```

### Form Feedback
Use modals for important feedback, not toasts:

```tsx
// ✅ GOOD - Modal with states
<Modal>
  {loading && <Spinner />}
  {success && <CheckCircle2 className="text-green-500" />}
  {error && <AlertCircle className="text-red-500" />}
</Modal>

// ❌ BAD - Toast notifications for critical actions
toast({ title: 'Success' })
```

### File Upload Display
Minimal card design:

```tsx
// ✅ GOOD
<div className="border border-border/40 rounded-lg p-4 bg-muted/30">
  <FileIcon className="w-4 h-4 text-muted-foreground" />
  <p className="text-sm">filename.pdf</p>
</div>

// ❌ BAD - Colored gradients
<div className="bg-gradient-to-br from-green-500/10 border-green-500/40">
  <CheckCircle2 className="w-8 h-8 text-green-500" />
</div>
```

---

## Avoid These Patterns

### ❌ Colored Gradients
```tsx
// BAD
className="bg-gradient-to-br from-blue-500/10 to-primary/10"
className="bg-gradient-to-r from-green-500 to-emerald-600"
```

### ❌ Colored Borders & Shadows
```tsx
// BAD
className="border-yellow-500/40 shadow-lg shadow-yellow-500/20"
className="border-red-500/30"
```

### ❌ Large Decorative Icons
```tsx
// BAD
<div className="w-16 h-16 bg-gradient-to-br from-blue-500">
  <Icon className="w-8 h-8 text-white" />
</div>
```

### ❌ Busy Status Cards
```tsx
// BAD
<div className="flex items-start justify-between gap-6">
  <div className="flex gap-4">
    <BigIcon />
    <Content />
  </div>
  <ColoredBadge />
</div>
```

---

## Use These Instead

### ✅ Muted Backgrounds
```tsx
className="bg-muted"
className="bg-card"
className="bg-secondary/30"
```

### ✅ Simple Borders
```tsx
className="border border-border/40"
className="rounded-2xl"
```

### ✅ Subtle Transitions
```tsx
className="hover:bg-secondary/50 transition-colors"
className="hover:text-foreground transition-colors"
```

### ✅ Centered, Clean Layouts
```tsx
<div className="flex flex-col items-center text-center space-y-6">
  <Icon />
  <Content />
</div>
```

---

## Spacing

Use consistent spacing scale:
- `space-y-2`: Tight grouping (label + value)
- `space-y-3`: Related items
- `space-y-6`: Sections within a card
- `space-y-8`: Major sections
- `mb-8`, `mb-10`: Card padding/margins

---

## Examples

### Perfect Status Card
```tsx
<div className="bg-card rounded-2xl border border-border/40 p-10">
  <div className="flex flex-col items-center text-center space-y-6 mb-10">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Clock className="w-5 h-5 text-yellow-500" />
    </div>
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Under Review</h2>
      <p className="text-sm text-muted-foreground/70 max-w-md">
        Your application is being reviewed
      </p>
    </div>
  </div>
  
  <div className="space-y-6">
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground/70">Company Name</p>
      <p className="text-sm text-foreground">Acme Corp</p>
    </div>
  </div>
</div>
```

### Perfect Button Group
```tsx
<div className="flex gap-3">
  <button className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
    Approve
  </button>
  <button className="px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50">
    Reject
  </button>
</div>
```

---

## Remember

1. **Minimal over decorative** - Less is more
2. **Functional color only** - Yellow (pending), Green (success), Red (danger)
3. **Consistent spacing** - Use the spacing scale
4. **Centered layouts** - For status/feedback components
5. **Muted backgrounds** - No colored gradients
6. **Simple transitions** - Subtle hover states
7. **Clean typography** - Use semantic HTML tags

**When in doubt, remove styling rather than add it.**

# Alifh Design Philosophy

**Last Updated:** December 7, 2025

## Core Principle
**"Less is More"** - Apple-inspired minimalism with premium feel

---

## 🎨 Visual Design Rules

### Typography
- **Titles:** `text-xl` (20px) - font-medium
- **Body Text:** `text-sm` (14px) - regular weight
- **Hints/Labels:** `text-xs` (12px) - text-muted-foreground
- **Font Family:** Inter (already configured)
- **No bold titles** - use font-medium only

### Colors
- **Primary Actions:** `bg-primary` / `text-primary`
- **Backgrounds:** `bg-card` (main), `bg-muted/20` (subtle info boxes)
- **Borders:** `border border-border/40` (subtle), `border-border/20` (ultra subtle)
- **Text Hierarchy:**
  - Primary: `text-foreground`
  - Secondary: `text-muted-foreground`
  - Destructive: `text-destructive`
- **Never use:** Hardcoded colors (blue-50, green-600, etc.)
- **Always use:** Semantic tokens for dark/light mode support

### Spacing
- **Modal Content:** `space-y-6` (main sections), `space-y-4` (subsections)
- **Padding:** `p-6` on modals (set by Dialog component)
- **Margins:** Minimal - rely on space-y-* utilities
- **Section Spacing:** `pt-2` for subtle divisions

### Borders & Corners
- **Border Width:** `border` (1px) - never `border-2` unless critical
- **Border Opacity:** `border-border/40` (normal), `border-border/20` (subtle)
- **Corner Radius:** `rounded-lg` (8px) - consistent everywhere
- **Modal Corners:** `rounded-2xl` (16px) - set by Dialog component

---

## 🧩 Component Layout Rules

### Icons
- **Size:** `w-4 h-4` (16px) - small and minimal
- **Position:** **Top left only** - never centered
- **Exception:** Logos can be centered (success states only)
- **Color:** `text-muted-foreground` or semantic colors
- **No icon backgrounds** - no rounded containers

### Modal Structure
```
┌─────────────────────────┐
│ 🔹 Icon (top-left 4x4)  │
│                         │
│ Title (text-xl)         │
│ Description (text-sm)   │
│                         │
│ ┌─────────────────┐     │
│ │ Info Box        │     │
│ └─────────────────┘     │
│                         │
│ [Primary Button]        │
│ [Secondary Button]      │
│                         │
│ ─────────────────       │
│ Footer text/link        │
└─────────────────────────┘
```

### Buttons
- **Height:** `h-10` (40px) - consistent
- **Padding:** `px-4`
- **Text:** `text-sm font-medium`
- **Corners:** `rounded-lg`
- **Primary:** `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary:** `bg-muted text-foreground hover:bg-muted/80`
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`
- **Transitions:** `transition-colors` (not transition-all)
- **No icons in buttons** - text only for clean look

### Info Boxes
- **Background:** `bg-muted/20` (very subtle)
- **Border:** `border border-border/20`
- **Padding:** `p-3`
- **Corners:** `rounded-lg`
- **Text:** `text-xs text-muted-foreground leading-relaxed`

---

## ✨ Animation Guidelines

### What's Allowed
- **Smooth opacity transitions:** `transition-opacity duration-500`
- **Simple scale/grow:** Logo growing from small to normal
- **Subtle pulse:** 2-second cycles for decorative elements
- **Loading spinners:** Small (4x4) with `animate-spin`
- **Bouncing text dots:** For "Loading..." text only

### What's NOT Allowed
- ❌ Ping effects
- ❌ Multiple bouncing dots (unless in text)
- ❌ Flying particles
- ❌ Slide-in animations
- ❌ Complex keyframe animations
- ❌ Shake or wobble effects
- ❌ Color transitions

### Animation Durations
- **Fast:** 200ms - 300ms (interactions)
- **Normal:** 500ms (modal content)
- **Slow:** 2s (decorative pulse)

---

## 🎯 Component-Specific Rules

### Email Sent Modal
- Small mail icon top left (4x4)
- Title: "Check your inbox"
- Show email inline in sentence
- One info box with instructions
- **Resend button with 60s countdown timer** to prevent abuse
- Shows "Resend in 59s..." → "Resend email"
- Simple "Back to sign in" link at bottom

### Loading Modal
- Small spinner top left (4x4, animate-spin)
- Title: "Verifying email" with animated dots (...)
- Description: "Please wait a moment"
- No progress bars or extra indicators

### Success Modal (Exception - Logo Centered)
- **Logo in center** (grows from 32px to 80px)
- **No background** behind logo
- **2 sparkle emojis (✨)** on sides with subtle pulse
- Title: "You're all set"
- Description: "Your email has been verified"
- Footer: "Redirecting..." (text-xs)
- Auto-redirects after 3 seconds

### Error Modal
- Small error icon top left (4x4, text-destructive)
- Title: "Verification failed"
- Clear error message
- Info box with bullet points (• prefix)
- Two buttons: "Try again" (primary) and "Resend email" (secondary)
- Support email link at bottom

---

## 🚫 Anti-Patterns to Avoid

### Never Do These
1. **Large centered icons** (except logo in success)
2. **Icon backgrounds** (bg-blue-50, rounded-full containers)
3. **Multiple borders** (border-2 everywhere)
4. **Heavy animations** (flying, bouncing, sliding)
5. **Hardcoded colors** (blue-600, green-50, red-500)
6. **Large fonts** (text-2xl, text-3xl in modals)
7. **Icons in buttons** (keep buttons text-only)
8. **Complex spacing** (stick to space-y-4 and space-y-6)
9. **Instant resend buttons** (always use countdown timers)
10. **Emoji overuse** (max 2 decorative elements)

---

## 🎪 User Feedback Loop

### States to Show
1. **Loading** - Spinner + animated dots in title
2. **Success** - Logo grows + sparkles + auto-redirect
3. **Error** - Clear message + actionable buttons
4. **Waiting** - Countdown timer for rate limiting

### Timing Guidelines
- **Success modal:** 3 seconds before redirect
- **Resend cooldown:** 60 seconds between attempts
- **Loading states:** Show immediately, no artificial delays
- **Error states:** Persist until user dismisses or retries

---

## 📱 Responsive Behavior
- **Modal width:** `max-w-md` (448px) - consistent
- **Mobile:** Same design, rely on Dialog's responsive handling
- **No breakpoint changes** - one design for all screens

---

## 🎨 Theme Support
- **All colors must use semantic tokens** from tailwind.config
- **Never hardcode RGB or hex values**
- **Test in both light and dark modes**
- **Logo:** Use `dark:invert` for proper dark mode rendering

---

## ✅ Checklist for New Modals

Before implementing any modal:
- [ ] Icon is 4x4 and top left (or logo centered for success)
- [ ] Title is text-xl font-medium
- [ ] Body text is text-sm
- [ ] All borders are `border` (not border-2) with opacity
- [ ] Buttons are h-10 with text-sm
- [ ] No icons in buttons
- [ ] Spacing uses space-y-4 or space-y-6
- [ ] Colors use semantic tokens (bg-card, text-foreground, etc.)
- [ ] Animations are subtle (opacity/scale only)
- [ ] Rate limiting on actions (countdown timers)
- [ ] Info boxes use bg-muted/20 with border-border/20
- [ ] Tested in both light and dark modes

---

## 🔑 Key Takeaway

**"Simple, neat, minimal, premium UI/UX friendly"**

Think Apple's design language:
- Clean white space
- Subtle depth (not heavy shadows)
- Clear hierarchy (size + color + weight)
- Purposeful animations (not decorative)
- Respect user's time (fast, clear, actionable)

When in doubt: **Remove, don't add.**

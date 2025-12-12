# Alifh Design System - Complete Component Library

## Overview
Complete design system built following Alifh Design Philosophy - **Less is More**. Apple-inspired minimalism with semantic tokens, consistent spacing, and clean interactions.

## 🎨 Design Principles
- **Semantic Colors Only**: Never hardcode colors - use design tokens
- **Clean Typography**: text-xl (titles), text-sm (body), text-xs (labels)
- **Minimal Icons**: 4x4 (16px) Lucide icons
- **Subtle Borders**: border-border/40 (standard), border-border/20 (subtle)
- **Focus States**: ring-primary/20 with no offset
- **Smooth Animations**: Subtle transitions only

## 📦 Component Inventory

### Base Components (9)
1. **Button** - Primary action component with 6 variants, 4 sizes, loading state
2. **Input** - Text input with proper focus states
3. **Label** - Form labels with consistent styling
4. **Textarea** - Multi-line text input
5. **Card** - Container with 5 sub-components
6. **Badge** - Status indicators with 4 variants
7. **Avatar** - Profile images with 5 sizes
8. **Dialog** - Modal dialogs with dark backdrop
9. **ThemeToggle** - Light/dark mode switcher

### Form Components (6)
10. **Select** - Dropdown selection with search
11. **Checkbox** - Multi-select options
12. **RadioGroup** - Single selection from options
13. **Switch** - Toggle on/off states
14. **Slider** - Range input for numeric values
15. **Progress** - Progress bar indicator

### Layout Components (3)
16. **Separator** - Horizontal/vertical dividers
17. **Tabs** - Content organization with tab switching
18. **Accordion** - Collapsible content sections

### Feedback Components (4)
19. **Alert** - Notification boxes (default, success, destructive)
20. **Skeleton** - Loading state placeholders
21. **Toast** - Temporary notifications
22. **Toaster** - Toast container (auto-included in layout)

## 🚀 Usage Examples

### Select Dropdown
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select make" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="toyota">Toyota</SelectItem>
    <SelectItem value="honda">Honda</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox
```tsx
import { Checkbox } from "@/components/ui";

<div className="flex items-center space-x-2">
  <Checkbox id="features" />
  <label htmlFor="features" className="text-sm cursor-pointer">
    Leather Seats
  </label>
</div>
```

### Radio Group
```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui";
import { Label } from "@/components/ui";

<RadioGroup defaultValue="excellent">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="excellent" id="excellent" />
    <Label htmlFor="excellent">Excellent</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="good" id="good" />
    <Label htmlFor="good">Good</Label>
  </div>
</RadioGroup>
```

### Switch
```tsx
import { Switch } from "@/components/ui";

<div className="flex items-center justify-between">
  <Label>Featured Listing</Label>
  <Switch />
</div>
```

### Slider
```tsx
import { Slider } from "@/components/ui";

const [value, setValue] = useState([50]);

<Slider
  value={value}
  onValueChange={setValue}
  max={200}
  step={5}
/>
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="specs">Specifications</TabsTrigger>
  </TabsList>
  <TabsContent value="details">
    Vehicle details content
  </TabsContent>
  <TabsContent value="specs">
    Technical specs content
  </TabsContent>
</Tabs>
```

### Accordion
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>What payment methods?</AccordionTrigger>
    <AccordionContent>
      We accept all major credit cards...
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Alert
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui";
import { Info } from "lucide-react";

<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>

<Alert variant="success">
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### Skeleton
```tsx
import { Skeleton } from "@/components/ui";

<div className="space-y-3">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Progress
```tsx
import { Progress } from "@/components/ui";

const [progress, setProgress] = useState(33);

<Progress value={progress} />
```

### Toast
```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success toast
toast({
  title: "Listing Published",
  description: "Your vehicle is now live on the marketplace.",
});

// Error toast
toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong.",
});
```

### Separator
```tsx
import { Separator } from "@/components/ui";

<Separator />  // Horizontal
<Separator orientation="vertical" />  // Vertical
```

## 🎯 Vehicle Marketplace Use Cases

### Vehicle Listing Filters
```tsx
// Year range
<Slider value={yearRange} onValueChange={setYearRange} min={2000} max={2024} />

// Make selection
<Select>
  <SelectTrigger><SelectValue placeholder="Make" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="toyota">Toyota</SelectItem>
    <SelectItem value="honda">Honda</SelectItem>
  </SelectContent>
</Select>

// Features
<Checkbox id="leather" /> Leather Seats
<Checkbox id="sunroof" /> Sunroof
```

### Vehicle Condition
```tsx
<RadioGroup defaultValue="excellent">
  <RadioGroupItem value="excellent" /> Excellent
  <RadioGroupItem value="good" /> Good
  <RadioGroupItem value="fair" /> Fair
</RadioGroup>
```

### Featured Toggle
```tsx
<Switch checked={featured} onCheckedChange={setFeatured} />
```

### Upload Progress
```tsx
<Progress value={uploadProgress} />
```

### Vehicle Details Tabs
```tsx
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="specs">Specs</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  <TabsContent value="details">...</TabsContent>
  <TabsContent value="specs">...</TabsContent>
  <TabsContent value="history">...</TabsContent>
</Tabs>
```

### FAQ Accordion
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="payment">
    <AccordionTrigger>Payment Methods</AccordionTrigger>
    <AccordionContent>We accept...</AccordionContent>
  </AccordionItem>
  <AccordionItem value="warranty">
    <AccordionTrigger>Warranty</AccordionTrigger>
    <AccordionContent>All vehicles...</AccordionContent>
  </AccordionItem>
</Accordion>
```

## 🎨 Color Palette (Semantic Tokens)

```css
--background: 0 0% 100%;          /* Main background */
--foreground: 222.2 84% 4.9%;     /* Main text */
--card: 0 0% 100%;                /* Card background */
--primary: 222.2 47.4% 11.2%;     /* Primary actions */
--muted: 210 40% 96.1%;           /* Muted backgrounds */
--border: 214.3 31.8% 91.4%;      /* Border colors */
--destructive: 0 84.2% 60.2%;     /* Error states */
```

## 📏 Typography Scale

- **Page Title**: `text-4xl` (36px) - Main headings
- **Section Title**: `text-2xl` (24px) - Section headers
- **Card Title**: `text-xl` (20px) - Card headers
- **Body Text**: `text-sm` (14px) - Regular content
- **Labels**: `text-xs` (12px) - Form labels, metadata

## 🔧 Spacing System

- **Sections**: `space-y-6` (24px) - Between major sections
- **Cards**: `space-y-4` (16px) - Card internal spacing
- **Form Fields**: `space-y-2` (8px) - Label to input
- **Tight**: `gap-2` (8px) - Icon to text

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Tablet */
md: 768px   /* Small laptop */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## 🎭 Animation Guidelines

- **Duration**: 150-200ms for micro-interactions
- **Easing**: ease-out for natural feel
- **Properties**: opacity, scale, transform only
- **Accordion**: 0.2s ease-out expand/collapse

## 📦 Dependencies

```json
{
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-progress": "^1.1.8",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-slider": "^1.3.6",
  "@radix-ui/react-slot": "^1.2.4",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13",
  "@radix-ui/react-toast": "^1.2.15",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.344.0",
  "next-themes": "^0.2.1",
  "tailwind-merge": "^2.6.0"
}
```

## 🎨 View Showcase

Visit `/showcase` to see all components in action with vehicle marketplace examples.

## ✅ Component Checklist

- [x] Button (6 variants, 4 sizes, loading)
- [x] Input (focus states, transitions)
- [x] Label (semantic styling)
- [x] Textarea (auto-resize disabled)
- [x] Card (5 sub-components)
- [x] Badge (4 variants, hover)
- [x] Avatar (5 sizes, fallback)
- [x] Dialog (dark backdrop, rounded)
- [x] ThemeToggle (light/dark/system)
- [x] Select (dropdown with icons)
- [x] Checkbox (primary when checked)
- [x] RadioGroup (clean circles)
- [x] Switch (smooth toggle)
- [x] Slider (range input)
- [x] Separator (h/v dividers)
- [x] Tabs (content switching)
- [x] Accordion (collapsible sections)
- [x] Alert (3 variants with icons)
- [x] Skeleton (loading states)
- [x] Progress (animated bar)
- [x] Toast (notifications)
- [x] Toaster (container)

## 🚀 Ready for Production

All 22 components are production-ready and follow Alifh Design Philosophy consistently across the entire system.

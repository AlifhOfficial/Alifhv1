/**
 * UI Components Index
 * 
 * Central export for all UI components following Alifh Design Philosophy
 */

// Base Components
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

export { Input } from "./input";
export type { InputProps } from "./input";

export { Label } from "./label";

export { Textarea } from "./textarea";
export type { TextareaProps } from "./textarea";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";

export { Avatar } from "./avatar";
export type { AvatarProps } from "./avatar";

export { ThemeToggle } from "./theme-toggle";

// Form Components
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";

export { Checkbox } from "./checkbox";

export { RadioGroup, RadioGroupItem } from "./radio-group";

export { Switch } from "./switch";

export { Slider } from "./slider";

// Layout Components
export { Separator } from "./separator";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

// Feedback Components
export { Alert, AlertTitle, AlertDescription } from "./alert";

export { Skeleton } from "./skeleton";

export { Progress } from "./progress";

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProvider,
  ToastViewport,
} from "./toast";
export type { ToastProps, ToastActionElement } from "./toast";

export { Toaster } from "./toaster";

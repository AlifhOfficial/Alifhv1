/**
 * Partner Showroom Constants
 */

import {
  Play,
  FileText,
  Camera,
  Users,
  Award,
  MessageSquareQuote,
  Sparkles,
  Globe,
  Settings,
} from 'lucide-react';
import type { SectionId } from './types';

// ============================================================================
// Section Navigation
// ============================================================================

export const SECTIONS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'hero', label: 'Hero', icon: Play },
  { id: 'story', label: 'Brand Story', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Camera },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'social', label: 'Social & Press', icon: Globe },
  { id: 'seo', label: 'SEO & Settings', icon: Settings },
];

// ============================================================================
// Ambient Styles
// ============================================================================

export const AMBIENT_STYLES = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'minimal', label: 'Minimal' },
] as const;

// ============================================================================
// Service Icons
// ============================================================================

export const SERVICE_ICONS = [
  'car', 'key', 'shield', 'clock', 'truck', 'wrench', 'star', 'award',
  'gift', 'phone', 'mail', 'home', 'globe', 'credit-card', 'check',
] as const;

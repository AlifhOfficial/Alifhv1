/**
 * Tailwind CSS Class Utilities - Production
 * 
 * Helper for merging and deduplicating Tailwind CSS classes.
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution.
 * 
 * @module utils/cn
 * @see {@link https://github.com/dcastil/tailwind-merge} tailwind-merge
 */

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Extended twMerge that knows our Apple HIG font-size tokens.
 * Without this, custom text-{size} classes (text-subhead, text-footnote…)
 * are unknown to tailwind-merge and can conflict with text-{color} classes,
 * silently dropping the color utility when the size token appears last.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display5', 'text-display4', 'text-display3',
        'text-display2', 'text-display1', 'text-display',
        'text-large-title', 'text-title1', 'text-title2', 'text-title3',
        'text-headline', 'text-callout', 'text-subhead',
        'text-footnote', 'text-caption1', 'text-caption2',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

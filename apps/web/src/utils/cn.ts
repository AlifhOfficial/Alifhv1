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
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution
 * Handles conditional classes and removes conflicting utilities
 * 
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 * @example
 * cn("px-2 py-1", condition && "px-4") // "py-1 px-4"
 * cn("text-red-500", { "text-blue-500": isBlue }) // "text-blue-500" if isBlue
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

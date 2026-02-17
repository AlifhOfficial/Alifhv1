/**
 * Theme Image Component
 * 
 * Displays different images for light and dark themes.
 * Works with next-themes class-based theme switching.
 * Supports both 'dark' and 'charcoal' themes via Tailwind's dark: variant.
 */

import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type ThemeImageProps = Omit<ImageProps, 'src'> & {
  /** Image source for light theme */
  srcLight: string;
  /** Image source for dark themes (dark & charcoal) */
  srcDark: string;
  /** Optional additional class for light image */
  lightClassName?: string;
  /** Optional additional class for dark image */
  darkClassName?: string;
};

/**
 * Theme-aware image component that shows different images
 * based on the current theme (light vs dark/charcoal).
 * 
 * Uses CSS visibility so only the correct image is loaded
 * when using loading="lazy" (default).
 * 
 * @example
 * ```tsx
 * <ThemeImage
 *   srcLight="/logo-black.svg"
 *   srcDark="/logo-white.svg"
 *   alt="Logo"
 *   width={100}
 *   height={30}
 * />
 * ```
 */
export function ThemeImage({
  srcLight,
  srcDark,
  alt,
  className,
  lightClassName,
  darkClassName,
  ...props
}: ThemeImageProps) {
  return (
    <>
      <Image
        src={srcLight}
        alt={alt}
        className={cn(className, 'dark:hidden', lightClassName)}
        {...props}
      />
      <Image
        src={srcDark}
        alt={alt}
        className={cn(className, 'hidden dark:block', darkClassName)}
        {...props}
      />
    </>
  );
}

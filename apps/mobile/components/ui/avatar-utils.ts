/**
 * Shared avatar helpers for consistent fallback rendering across mobile.
 */

export function getAvatarInitials(name?: string | null, fallback = 'U'): string {
  if (!name) return fallback;

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

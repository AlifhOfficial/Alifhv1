/**
 * AuthGate — Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Unified unauthenticated state. Follows the same visual pattern as EmptyState
 * but always includes a built-in "Sign In" action that opens the auth flow.
 *
 * USAGE:
 *   import { AuthGate } from '@/components/ui';
 *   import { Heart } from 'lucide-react-native';
 *
 *   <AuthGate
 *     icon={Heart}
 *     title="Sign in to save."
 *     subtitle="Keep track of your favorite cars on Revvup."
 *   />
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { memo, useCallback } from 'react';
import { LogIn } from 'lucide-react-native';

import { useAuth } from '@/context/auth-context';
import { EmptyState, type EmptyStateIconComponent } from './empty-state';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface AuthGateProps {
  /** Lucide icon component representing this screen's feature */
  icon: EmptyStateIconComponent;
  /** Bold title — include period e.g. "Sign in to save." */
  title: string;
  /** Muted supporting subtitle */
  subtitle: string;
}

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export const AuthGate = memo(function AuthGate({
  icon,
  title,
  subtitle,
}: AuthGateProps) {
  const { openAuthFlow } = useAuth();

  const handleSignIn = useCallback(() => {
    openAuthFlow();
  }, [openAuthFlow]);

  return (
    <EmptyState
      icon={icon}
      title={title}
      subtitle={subtitle}
      action={{ label: 'Sign In', onPress: handleSignIn, icon: LogIn }}
    />
  );
});

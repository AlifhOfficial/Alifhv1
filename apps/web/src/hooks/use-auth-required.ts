/**
 * useAuthRequired Hook
 * 
 * Hook for checking auth and showing modal when needed.
 * Use this to protect actions that require authentication.
 */

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";

interface UseAuthRequiredOptions {
  /** Feature name for the modal, e.g. "create listings" */
  feature?: string;
  /** Custom title for the modal */
  title?: string;
  /** Custom description for the modal */
  description?: string;
  /** Redirect path after sign in */
  redirectTo?: string;
}

export function useAuthRequired(options: UseAuthRequiredOptions = {}) {
  const { session, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const isAuthenticated = !!session && !isLoading;

  /**
   * Check if user is authenticated and show modal if not.
   * Returns true if authenticated, false if not (modal shown).
   */
  const requireAuth = useCallback((): boolean => {
    if (isAuthenticated) {
      return true;
    }
    setShowModal(true);
    return false;
  }, [isAuthenticated]);

  /**
   * Wrap an action to require authentication.
   * If not authenticated, shows modal instead of executing action.
   */
  const withAuth = useCallback(<T extends (...args: any[]) => any>(action: T) => {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      if (requireAuth()) {
        return action(...args);
      }
      return undefined;
    };
  }, [requireAuth]);

  const closeModal = useCallback(() => setShowModal(false), []);

  return {
    isAuthenticated,
    isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal,
    requireAuth,
    withAuth,
    modalProps: {
      open: showModal,
      onClose: closeModal,
      feature: options.feature,
      title: options.title,
      description: options.description,
      redirectTo: options.redirectTo,
    },
  };
}

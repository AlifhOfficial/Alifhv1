/**
 * Create Listing Screen — Route
 * Route: /create-listing
 *
 * Renders the multi-step create listing wizard.
 * Requires authentication — triggers auth flow if not signed in.
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';
import { CreateListingScreen } from '@/components/user-inventory-management/create';

export default function CreateListingRoute() {
  const { isAuthenticated, openAuthFlow } = useAuth();
  const { hideChrome, showChrome } = useTabBar();

  // Hide tab bar for immersive form experience
  useEffect(() => {
    hideChrome();
    return () => {
      showChrome();
    };
  }, [hideChrome, showChrome]);

  // Gate behind auth
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthFlow();
    }
  }, [isAuthenticated, openAuthFlow]);

  return <CreateListingScreen />;
}

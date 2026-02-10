/**
 * Inventory Screen — Route
 * Route: /inventory
 *
 * Renders the My Inventory view with listing management.
 * Requires authentication — triggers auth flow if not signed in.
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';
import { InventoryScreen } from '@/components/user-inventory-management/inventory-screen';

export default function InventoryRoute() {
  const { isAuthenticated, openAuthFlow } = useAuth();
  const { hideChrome, showChrome } = useTabBar();

  // Hide tab bar for immersive experience
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

  return <InventoryScreen />;
}

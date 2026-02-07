/**
 * Tab Bar Context
 * Manages global tab bar and header visibility
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabBarContextValue {
  isTabBarVisible: boolean;
  isHeaderVisible: boolean;
  hideTabBar: () => void;
  showTabBar: () => void;
  hideHeader: () => void;
  showHeader: () => void;
  hideChrome: () => void;
  showChrome: () => void;
}

const TabBarContext = createContext<TabBarContextValue | undefined>(undefined);

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const hideTabBar = useCallback(() => {
    setIsTabBarVisible(false);
  }, []);

  const showTabBar = useCallback(() => {
    setIsTabBarVisible(true);
  }, []);

  const hideHeader = useCallback(() => {
    setIsHeaderVisible(false);
  }, []);

  const showHeader = useCallback(() => {
    setIsHeaderVisible(true);
  }, []);

  // Hide both tab bar and header
  const hideChrome = useCallback(() => {
    setIsTabBarVisible(false);
    setIsHeaderVisible(false);
  }, []);

  // Show both tab bar and header
  const showChrome = useCallback(() => {
    setIsTabBarVisible(true);
    setIsHeaderVisible(true);
  }, []);

  return (
    <TabBarContext.Provider value={{ 
      isTabBarVisible, 
      isHeaderVisible,
      hideTabBar, 
      showTabBar,
      hideHeader,
      showHeader,
      hideChrome,
      showChrome,
    }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within TabBarProvider');
  }
  return context;
}

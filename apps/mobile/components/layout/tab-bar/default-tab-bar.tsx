/**
 * DefaultTabBar - Default tab bar for most screens
 * Shows: back bubble + tabs pill
 */

import React from 'react';

import { TabBarContainer, BackBubble, TabsPill } from './index';

interface DefaultTabBarProps {
  showBack?: boolean;
}

export function DefaultTabBar({ showBack = true }: DefaultTabBarProps) {
  return (
    <TabBarContainer>
      <BackBubble visible={showBack} />
      <TabsPill />
    </TabBarContainer>
  );
}

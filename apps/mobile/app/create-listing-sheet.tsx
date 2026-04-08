import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  CreateListingSheetContent,
  toSheetContentProps,
  getCreateListingFlowSession,
  deleteCreateListingFlowSession,
} from '@/components/sheets/create-listing/create-listing-flow';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function CreateListingSheetScreen() {
  const params = useLocalSearchParams<{ flowId?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const flowId = typeof params.flowId === 'string' ? params.flowId : '';
  const session = flowId ? getCreateListingFlowSession(flowId) : undefined;

  useEffect(() => {
    if (!flowId || !session) {
      requestAnimationFrame(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/inventory');
        }
      });
    }
  }, [flowId, session]);

  if (!flowId || !session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sheet }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const handleClose = () => {
    session.onClose();
    deleteCreateListingFlowSession(flowId);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inventory');
    }
  };

  return <CreateListingSheetContent {...toSheetContentProps(session)} onClose={handleClose} />;
}

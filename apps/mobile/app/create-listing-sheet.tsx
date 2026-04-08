import React, { useCallback, useEffect, useRef } from 'react';
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
  const didCloseRef = useRef(false);

  const closeFlow = useCallback(
    (navigateBack: boolean) => {
      if (didCloseRef.current) return;
      didCloseRef.current = true;

      session?.onClose();
      if (flowId) {
        deleteCreateListingFlowSession(flowId);
      }

      if (!navigateBack) return;

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/inventory');
      }
    },
    [flowId, session],
  );

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

  useEffect(() => {
    return () => {
      // Native swipe-down dismiss can unmount this screen without calling our explicit close handler.
      // Keep parent visibility in sync so the flow can always be reopened.
      closeFlow(false);
    };
  }, [closeFlow]);

  if (!flowId || !session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sheet }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const handleClose = () => {
    closeFlow(true);
  };

  return <CreateListingSheetContent {...toSheetContentProps(session)} onClose={handleClose} />;
}

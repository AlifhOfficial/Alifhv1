import React, { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/components/ui';

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
  const { showAlert } = useAlert();

  const flowId = typeof params.flowId === 'string' ? params.flowId : '';
  const session = flowId ? getCreateListingFlowSession(flowId) : undefined;
  const didCloseRef = useRef(false);
  const isConfirmOpenRef = useRef(false);

  const cleanupFlow = useCallback(() => {
    if (didCloseRef.current) return false;
    didCloseRef.current = true;

    session?.onClose();
    if (flowId) {
      deleteCreateListingFlowSession(flowId);
    }
    return true;
  }, [flowId, session]);

  const closeFlow = useCallback(
    (navigateBack: boolean) => {
      const didCleanup = cleanupFlow();
      if (!didCleanup) return;

      if (!navigateBack) return;

      if (router.canGoBack()) {
        router.back();
      }
    },
    [cleanupFlow],
  );

  const requestClose = useCallback(() => {
    if (didCloseRef.current || isConfirmOpenRef.current) return;
    isConfirmOpenRef.current = true;

    showAlert('Cancel listing?', 'Are you sure you want to cancel? You will lose all progress.', [
      {
        text: 'Keep Editing',
        style: 'cancel',
        onPress: () => {
          isConfirmOpenRef.current = false;
        },
      },
      {
        text: 'Cancel Listing',
        style: 'destructive',
        onPress: () => {
          isConfirmOpenRef.current = false;
          const didCleanup = cleanupFlow();
          if (!didCleanup) return;

          if (router.canGoBack()) {
            router.back();
          }
        },
      },
    ]);
  }, [cleanupFlow, showAlert]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!session || didCloseRef.current) {
        return false;
      }

      requestClose();
      return true;
    });

    return () => subscription.remove();
  }, [requestClose, session]);

  useEffect(() => {
    if (!flowId || !session) {
      requestAnimationFrame(() => {
        if (router.canGoBack()) {
          router.back();
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

  const handleForceClose = () => {
    closeFlow(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.sheet }}>
      <CreateListingSheetContent
        {...toSheetContentProps(session)}
        onClose={requestClose}
        onForceClose={handleForceClose}
      />
    </View>
  );
}

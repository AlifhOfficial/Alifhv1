import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const flowId = typeof params.flowId === 'string' ? params.flowId : '';
  const session = flowId ? getCreateListingFlowSession(flowId) : undefined;
  const didCloseRef = useRef(false);
  const [preventRemove, setPreventRemove] = useState(true);

  const closeFlow = useCallback(
    (navigateBack: boolean) => {
      if (didCloseRef.current) return;
      didCloseRef.current = true;
      setPreventRemove(false);

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

  usePreventRemove(preventRemove && !!session, (event) => {
    if (didCloseRef.current) return;

    showAlert('Exit Listing?', 'Are you sure? You will lose all progress.', [
      { text: 'Keep Editing', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: () => {
          if (didCloseRef.current) return;
          didCloseRef.current = true;
          setPreventRemove(false);

          session?.onClose();
          if (flowId) {
            deleteCreateListingFlowSession(flowId);
          }

          navigation.dispatch(event.data.action);
        },
      },
    ]);
  });

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

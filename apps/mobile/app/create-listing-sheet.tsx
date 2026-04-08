import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';

import { HapticPressable, Text } from '@/components/ui';

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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const flowId = typeof params.flowId === 'string' ? params.flowId : '';
  const session = flowId ? getCreateListingFlowSession(flowId) : undefined;
  const didCloseRef = useRef(false);
  const [preventRemove, setPreventRemove] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pendingNavActionRef = useRef<any>(null);

  const cleanupFlow = useCallback(() => {
    if (didCloseRef.current) return false;
    didCloseRef.current = true;
    setPreventRemove(false);

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
      } else {
        router.replace('/inventory');
      }
    },
    [cleanupFlow],
  );

  const requestClose = useCallback(() => {
    if (showCancelConfirm) return;
    pendingNavActionRef.current = null;
    setShowCancelConfirm(true);
  }, [showCancelConfirm]);

  const confirmClose = useCallback(() => {
    setShowCancelConfirm(false);
    const didCleanup = cleanupFlow();
    if (!didCleanup) return;

    if (pendingNavActionRef.current) {
      navigation.dispatch(pendingNavActionRef.current);
      pendingNavActionRef.current = null;
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inventory');
    }
  }, [cleanupFlow, navigation]);

  const cancelClose = useCallback(() => {
    pendingNavActionRef.current = null;
    setShowCancelConfirm(false);
  }, []);

  usePreventRemove(preventRemove && !!session, (event) => {
    if (didCloseRef.current) return;
    pendingNavActionRef.current = event.data.action;
    setShowCancelConfirm(true);
  });

  useEffect(() => {
    if (!flowId || !session) {
      setPreventRemove(false);
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

      <Modal
        transparent
        visible={showCancelConfirm}
        animationType="fade"
        onRequestClose={cancelClose}
      >
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={cancelClose} />
        <View style={[styles.modalCard, { backgroundColor: colors.surfaceSecondary }]}>
          <Text variant="subheadEmphasized" style={{ color: colors.label }}>
            Cancel listing?
          </Text>
          <Text variant="footnote" tone="secondary">
            Are you sure you want to cancel? You will lose all progress.
          </Text>
          <View style={styles.modalActions}>
            <HapticPressable
              onPress={cancelClose}
              style={[styles.modalButton, { backgroundColor: colors.surface }]}
            >
              <Text variant="subhead" style={{ color: colors.label }}>
                Keep Editing
              </Text>
            </HapticPressable>
            <HapticPressable
              onPress={confirmClose}
              style={[styles.modalButton, { backgroundColor: colors.error }]}
            >
              <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>
                Cancel Listing
              </Text>
            </HapticPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 32,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

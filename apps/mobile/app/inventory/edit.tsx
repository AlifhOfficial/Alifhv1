import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useAlert } from '@/components/ui';
import { CreateListingSheetContent } from '@/components/sheets/create-listing/create-listing-flow';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getListingForEdit } from '@/lib/sell-car-user-api';
import { buildCreateListingInitialData } from '@/components/user-inventory-management/utilities/listing-helpers';
import type { CreateListingData } from '@/components/sheets/create-listing/types';

function getLatestStringParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[value.length - 1] ?? '';
  }

  return typeof value === 'string' ? value : '';
}

export default function InventoryEditSheetScreen() {
  const params = useLocalSearchParams<{ listingId?: string; isPublishedEdit?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { showAlert } = useAlert();

  const listingId = getLatestStringParam(params.listingId);
  const isPublishedEdit = getLatestStringParam(params.isPublishedEdit) !== 'false';

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CreateListingData>>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const didCloseRef = useRef(false);
  const isConfirmOpenRef = useRef(false);

  const closeFlow = useCallback((navigateBack: boolean) => {
    if (didCloseRef.current) return;
    didCloseRef.current = true;

    if (!navigateBack) return;
    if (router.canGoBack()) {
      router.back();
    }
  }, []);

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
          closeFlow(true);
        },
      },
    ]);
  }, [closeFlow, showAlert]);

  useEffect(() => {
    didCloseRef.current = false;
    isConfirmOpenRef.current = false;

    if (!listingId) {
      setLoading(false);
      setLoadingError('Missing listing ID');
      requestAnimationFrame(() => {
        if (router.canGoBack()) {
          router.back();
        }
      });
      return;
    }

    let active = true;
    setLoading(true);
    setLoadingError(null);

    void (async () => {
      try {
        const listing = await getListingForEdit(listingId);
        if (!active) return;

        setInitialData(buildCreateListingInitialData(listing));
      } catch {
        if (!active) return;

        setLoadingError('Failed to load listing for edit');
        showAlert('Unable to edit listing', 'Please try again in a moment.');
        requestAnimationFrame(() => {
          if (router.canGoBack()) {
            router.back();
          }
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [listingId, showAlert]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (didCloseRef.current) {
        return false;
      }

      requestClose();
      return true;
    });

    return () => subscription.remove();
  }, [requestClose]);

  useEffect(
    () => () => {
      closeFlow(false);
    },
    [closeFlow],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sheet }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!listingId || loadingError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sheet }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.sheet }}>
      <CreateListingSheetContent
        onClose={requestClose}
        onForceClose={() => closeFlow(true)}
        initialData={initialData}
        listingId={listingId}
        isPublishedEdit={isPublishedEdit}
      />
    </View>
  );
}

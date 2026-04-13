/**
 * VinStepContent — Enter and verify VIN
 *
 * Content-only component for the unified flow.
 * VIN is required to prevent abuse. Users can control visibility.
 *
 * @module components/sheets/create-listing/steps/vin-step
 */

import { Text } from "@/components/ui";
import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import * as Haptics from "expo-haptics";
import { CheckCircle2, AlertCircle } from "lucide-react-native";

import {
  AppFontFamilies,
  Colors,
  Spacing,
  Radius,
  Sizes,
  SheetTypography,
  fontScale,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { checkVin } from "@/lib/sell-car-user-api";
import { validateVin } from "../types";
import { SheetToggle } from "../sheet-toggle";

import type { StepContentProps } from "../types";
import { StepContainer } from "../step-container";

// ─────────────────────────────────────────────────────────────────────────────

type VinStatus = "idle" | "checking" | "verified" | "taken" | "invalid";

// ─────────────────────────────────────────────────────────────────────────────

export function VinStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const localVin = data.vin || "";
  const [status, setStatus] = useState<VinStatus>(
    data.vinVerified ? "verified" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastChecked = useRef<string>("");

  const verifyVin = useCallback(
    async (vin: string) => {
      if (vin.length !== 17 || vin === lastChecked.current) return;
      lastChecked.current = vin;

      const error = validateVin(vin);
      if (error) {
        setStatus("invalid");
        setErrorMsg(error);
        onUpdate({ vinVerified: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setStatus("checking");
      setErrorMsg(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const result = await checkVin(vin);

        if (!result.isUnique) {
          setStatus("taken");
          setErrorMsg("A listing with this VIN already exists");
          onUpdate({ vinVerified: false });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }

        setStatus("verified");
        onUpdate({ vin, vinVerified: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-fill decoded data if available
        if (result.nhtsa?.make) onUpdate({ make: result.nhtsa.make });
        if (result.nhtsa?.model) onUpdate({ model: result.nhtsa.model });
        if (result.nhtsa?.year) onUpdate({ year: result.nhtsa.year });
        if (result.nhtsa?.trim) onUpdate({ trim: result.nhtsa.trim });
      } catch {
        setStatus("invalid");
        setErrorMsg("Failed to verify VIN. Please try again.");
        onUpdate({ vinVerified: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [onUpdate],
  );

  const handleVinChange = useCallback(
    (text: string) => {
      const cleaned = text
        .toUpperCase()
        .replace(/[^A-HJ-NPR-Z0-9]/g, "")
        .slice(0, 17);

      onUpdate({ vin: cleaned, vinVerified: false });

      if (status !== "idle" && status !== "checking") {
        setStatus("idle");
        setErrorMsg(null);
      }

      if (cleaned.length === 17) {
        verifyVin(cleaned);
      }
    },
    [status, onUpdate, verifyVin],
  );

  return (
    <StepContainer>
      <View style={styles.sectionHeader}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">
          Vehicle VIN
        </Text>
      </View>

      {/* VIN Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.vinInput,
            {
              backgroundColor: colors.surfaceSecondary,
              color: colors.label,
            },
          ]}
          placeholder="Enter 17-character VIN"
          placeholderTextColor={colors.labelQuaternary}
          value={localVin}
          onChangeText={handleVinChange}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={17}
          keyboardType="ascii-capable"
          returnKeyType="done"
          spellCheck={false}
          textContentType="none"
        />

        {/* Status indicator */}
        <View style={styles.statusIcon}>
          {status === "checking" ? (
            <ActivityIndicator size="small" color={colors.label} />
          ) : status === "verified" ? (
            <CheckCircle2
              size={Sizes.iconSm}
              color={colors.success}
              strokeWidth={2}
            />
          ) : status === "taken" || status === "invalid" ? (
            <AlertCircle
              size={Sizes.iconSm}
              color={colors.error}
              strokeWidth={2}
            />
          ) : null}
        </View>
      </View>

      {/* Character count */}
      <View style={styles.countRow}>
        <Text variant={SheetTypography.supporting} tone="muted">
          {localVin.length}/17
        </Text>
        {status === "verified" && (
          <Text
            variant={SheetTypography.supporting}
            style={{ color: colors.success }}
          >
            Verified
          </Text>
        )}
      </View>

      {/* Error message */}
      {errorMsg && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorMuted }]}>
          <AlertCircle
            size={Sizes.iconSm}
            color={colors.error}
            strokeWidth={2}
          />
          <Text
            variant={SheetTypography.rowLabel}
            style={{ color: colors.error, flex: 1 }}
          >
            {errorMsg}
          </Text>
        </View>
      )}

      {/* VIN Visibility Toggle */}
      <View
        style={[styles.visibilitySection, { borderTopColor: colors.border }]}
      >
        <View style={styles.visibilityContent}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">
            Show VIN publicly
          </Text>
        </View>
        <SheetToggle
          enabled={data.vinVisibility === "public"}
          onToggle={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onUpdate({
              vinVisibility:
                data.vinVisibility === "public" ? "private" : "public",
            });
          }}
          colors={colors}
        />
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text variant={SheetTypography.supporting} tone="muted">
          Find your VIN on the driver&apos;s door jamb, dashboard, or vehicle
          registration. This setting is permanent for this listing.
        </Text>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    position: "relative",
  },
  vinInput: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing["5xl"],
    fontFamily: AppFontFamilies.medium,
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    letterSpacing: 1.2,
    fontVariant: ["tabular-nums"],
  },
  statusIcon: {
    position: "absolute",
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  visibilitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.lg,
    marginTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  visibilityContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  infoBox: {
    marginTop: Spacing.sm,
  },
});

export default VinStepContent;

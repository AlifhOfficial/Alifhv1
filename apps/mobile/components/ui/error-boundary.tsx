/**
 * Error Boundary - Catches React errors and displays fallback UI
 * Gracefully handles crashes with a user-friendly error screen
 */

import { Text } from './text';
import React, { Component, type ReactNode } from 'react';
import { View, StyleSheet as RNStyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Stroke, scale } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          onReload={this.handleReload}
        />
      );
    }
    return this.props.children;
  }
}

// ── Error Fallback UI ────────────────────────────────────────────────────────
// Uses Colors.dark directly — renders outside ThemeProvider context.

const ICON_SIZE = scale(52);
const ICON_CONTAINER = scale(108);

interface ErrorFallbackProps {
  onReload: () => void;
}

function ErrorFallback({ onReload }: ErrorFallbackProps) {
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        {/* Icon bubble */}
        <View style={[styles.iconContainer, { backgroundColor: colors.fill3, borderColor: colors.border }]}>
          <AlertTriangle size={ICON_SIZE} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Text variant="headline" style={[styles.title, { color: colors.label }]}> 
            Something went wrong.
          </Text>
          <Text variant="subhead" style={[styles.subtitle, { color: colors.labelSecondary }]}>
            The app ran into an unexpected issue. Try reloading.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View
            style={[styles.button, { backgroundColor: colors.primary }]}
            onTouchEnd={onReload}
          >
            <RefreshCw size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={Stroke.icon} />
            <Text variant="subhead" style={{ color: colors.primaryForeground }}>Reload</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = RNStyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['4xl'],
    gap: Spacing['3xl'],
  },
  iconContainer: {
    width: ICON_CONTAINER,
    height: ICON_CONTAINER,
    borderRadius: Radius.full,
    borderWidth: RNStyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Spacing['5xl'] + Spacing.xs,
    paddingHorizontal: Spacing['3xl'],
    borderRadius: Radius.full,
  },
});

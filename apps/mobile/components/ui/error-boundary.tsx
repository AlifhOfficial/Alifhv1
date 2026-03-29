/**
 * Error Boundary - Catches React errors and displays fallback UI
 * Gracefully handles crashes with a user-friendly error screen
 */

import { Text } from './text';
import React, { Component, type ReactNode } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Log to error tracking service here (e.g., Sentry, Bugsnag)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    // Reset the error state to attempt recovery
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error}
          onReload={this.handleReload}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback UI Component
interface ErrorFallbackProps {
  error: Error | null;
  onReload: () => void;
  onReset: () => void;
}

function ErrorFallback({ error, onReload, onReset }: ErrorFallbackProps) {
  const colors = Colors.dark; // Use dark theme for error screen (always visible)
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <AlertTriangle size={Sizes.avatarMd} color={colors.error} strokeWidth={1.5} />
        </View>

        {/* Title */}
        <Text variant="title2Emphasized" style={[styles.title, { color: colors.label }]}>
          Something went wrong
        </Text>

        {/* Description */}
        <Text variant="body" tone="secondary" style={styles.description}>
          The app ran into an unexpected issue. We're sorry for the inconvenience.
        </Text>

        {/* Primary Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onReload}
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <RefreshCw size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={2} />
            <Text variant="body" style={{ color: colors.primaryForeground }}>Reload App</Text>
          </Pressable>

          <Pressable
            onPress={onReset}
            style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          >
            <Home size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
            <Text variant="body" style={{ color: colors.label }}>Try Again</Text>
          </Pressable>
        </View>

        {/* Error Details (collapsible) */}
        {error && (
          <View style={styles.detailsSection}>
            <Pressable 
              onPress={() => setShowDetails(!showDetails)}
              style={styles.detailsToggle}
            >
              <Bug size={Sizes.iconXs} color={colors.labelQuaternary} />
              <Text variant="subhead" tone="muted">
                {showDetails ? 'Hide' : 'Show'} error details
              </Text>
            </Pressable>

            {showDetails && (
              <View style={[styles.errorBox, { backgroundColor: colors.surface }]}>
                <Text variant="subhead" style={{ color: colors.error, fontFamily: 'monospace' }} tone="secondary">
                  {error.name}: {error.message}
                </Text>
                {error.stack && (
                  <Text variant="subhead" tone="muted" style={styles.stackTrace}>
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  iconContainer: {
    width: Sizes.avatarLg + Sizes.avatarMd,
    height: Sizes.avatarLg + Sizes.avatarMd,
    borderRadius: (Sizes.avatarLg + Sizes.avatarMd) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    maxWidth: Spacing["5xl"],
    marginBottom: Spacing.xl,
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
    borderRadius: Radius.lg,
  },
  primaryButton: {
    // backgroundColor set inline
  },
  secondaryButton: {
    borderWidth: 1,
  },
  detailsSection: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  stackTrace: {
    marginTop: Spacing.sm,
    fontFamily: 'monospace',
    fontSize: Spacing.sm,
    lineHeight: Spacing.lg,
  },
});

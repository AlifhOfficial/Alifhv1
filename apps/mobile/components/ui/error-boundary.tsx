/**
 * Error Boundary - Catches React errors and displays fallback UI
 * Gracefully handles crashes with a user-friendly error screen
 */

import React, { Component, type ReactNode } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui/text';

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
          <AlertTriangle size={40} color={colors.error} strokeWidth={1.5} />
        </View>

        {/* Title */}
        <Heading size="large" style={[styles.title, { color: colors.text }]}>
          Something went wrong
        </Heading>

        {/* Description */}
        <Body size="medium" tone="secondary" style={styles.description}>
          The app ran into an unexpected issue. We're sorry for the inconvenience.
        </Body>

        {/* Primary Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onReload}
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <RefreshCw size={18} color="#fff" strokeWidth={2} />
            <ButtonText size="medium" style={{ color: '#fff' }}>Reload App</ButtonText>
          </Pressable>

          <Pressable
            onPress={onReset}
            style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          >
            <Home size={18} color={colors.text} strokeWidth={2} />
            <ButtonText size="medium" style={{ color: colors.text }}>Try Again</ButtonText>
          </Pressable>
        </View>

        {/* Error Details (collapsible) */}
        {error && (
          <View style={styles.detailsSection}>
            <Pressable 
              onPress={() => setShowDetails(!showDetails)}
              style={styles.detailsToggle}
            >
              <Bug size={14} color={colors.textMuted} />
              <Supporting size="small" tone="muted">
                {showDetails ? 'Hide' : 'Show'} error details
              </Supporting>
            </Pressable>

            {showDetails && (
              <View style={[styles.errorBox, { backgroundColor: colors.surface }]}>
                <Supporting size="mini" style={{ color: colors.error, fontFamily: 'monospace' }}>
                  {error.name}: {error.message}
                </Supporting>
                {error.stack && (
                  <Supporting size="mini" tone="muted" style={styles.stackTrace}>
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </Supporting>
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
    width: 88,
    height: 88,
    borderRadius: 44,
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
    maxWidth: 280,
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
    height: 52,
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
    fontSize: 10,
    lineHeight: 14,
  },
});

import React from "react";

import { StyleSheet, View, type ViewStyle } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { colors, spacing, borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Button } from "./Button";
import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Secondary action label */
  secondaryActionLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Enable enter animations */
  animated?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  animated = true,
  style,
}: EmptyStateProps) {
  const { isDark, colors: themeColors } = useAppTheme();

  const iconContainerBg = isDark ? colors.surface.darkElevated : colors.gray[100];
  const iconColor = isDark ? colors.gray[500] : colors.gray[400];

  const content = (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}>
        <Ionicons name={icon} size={48} color={iconColor} />
      </View>
      <Text variant="h4" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.description}>
        {description}
      </Text>
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Button title={actionLabel} onPress={onAction} variant="primary" size="md" />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              size="md"
            />
          )}
        </View>
      )}
    </View>
  );

  if (animated) {
    return <Animated.View entering={FadeInUp.duration(400).springify()}>{content}</Animated.View>;
  }

  return content;
}

// ============================================================================
// PRESET STATES
// ============================================================================

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="You're Offline"
      description="Please check your internet connection and try again."
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something Went Wrong"
      description={message || "An unexpected error occurred. Please try again."}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}

export function NoDataState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      icon="file-tray-outline"
      title={title || "No Data Yet"}
      description={description || "Start creating to see your content here."}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

export function SearchEmptyState({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      description={
        query
          ? `We couldn't find anything matching "${query}".`
          : "Try adjusting your search or filters."
      }
      actionLabel={onClear ? "Clear Search" : undefined}
      onAction={onClear}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["3xl"],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    marginBottom: spacing["2xl"],
    maxWidth: 300,
  },
  actions: {
    gap: spacing.md,
    alignItems: "center",
  },
});

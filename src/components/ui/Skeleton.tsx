import React, { useEffect, useRef } from "react";

import { View, StyleSheet, Animated, Easing, type ViewStyle } from "react-native";

import { colors, spacing, borderRadius as br } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// ============================================================================
// TYPES
// ============================================================================

interface SkeletonProps {
  /** Width of skeleton */
  width?: number | `${number}%`;
  /** Height of skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Custom style */
  style?: ViewStyle;
}

interface SkeletonCircleProps {
  /** Size of the circle */
  size?: number;
  /** Custom style */
  style?: ViewStyle;
}

interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Width of the last line (percentage) */
  lastLineWidth?: number;
  /** Line height */
  lineHeight?: number;
  /** Gap between lines */
  gap?: number;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// BASE SKELETON COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = br.sm,
  style,
}: SkeletonProps) {
  const { isDark } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Colors based on theme
  const baseColor = isDark ? colors.skeleton.dark : colors.skeleton.light;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

// ============================================================================
// SKELETON CIRCLE
// ============================================================================

export function SkeletonCircle({ size = 48, style }: SkeletonCircleProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

// ============================================================================
// SKELETON TEXT
// ============================================================================

export function SkeletonText({
  lines = 3,
  lastLineWidth = 60,
  lineHeight = 16,
  gap = spacing.sm,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? `${lastLineWidth}%` : "100%"}
          height={lineHeight}
          borderRadius={br.xs}
          style={index > 0 ? { marginTop: gap } : undefined}
        />
      ))}
    </View>
  );
}

// ============================================================================
// SKELETON CARD
// ============================================================================

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
        },
        style,
      ]}
    >
      <SkeletonCircle size={48} />
      <View style={styles.cardContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

// ============================================================================
// SKELETON GENERATION CARD
// ============================================================================

export function SkeletonGenerationCard({ style }: { style?: ViewStyle }) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.generationCard,
        {
          backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
        },
        style,
      ]}
    >
      <Skeleton width="100%" height={200} borderRadius={br.md} />
      <View style={styles.generationContent}>
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={12} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

// ============================================================================
// SKELETON METRIC CARD
// ============================================================================

export function SkeletonMetricCard({ style }: { style?: ViewStyle }) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: isDark ? colors.surface.dark : colors.surface.light,
        },
        style,
      ]}
    >
      <Skeleton width="50%" height={12} />
      <Skeleton width="30%" height={24} style={{ marginTop: spacing.sm }} />
      <Skeleton width="40%" height={10} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

// ============================================================================
// SKELETON LIST
// ============================================================================

export function SkeletonList({ count = 3, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: spacing.md }} />
      ))}
    </View>
  );
}

// ============================================================================
// SKELETON AVATAR GROUP
// ============================================================================

export function SkeletonAvatarGroup({
  count = 3,
  size = 32,
  overlap = 8,
  style,
}: {
  count?: number;
  size?: number;
  overlap?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.avatarGroup, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCircle
          key={index}
          size={size}
          style={index > 0 ? { marginLeft: -overlap } : undefined}
        />
      ))}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  textContainer: {
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: br.lg,
    gap: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  generationCard: {
    borderRadius: br.lg,
    overflow: "hidden",
  },
  generationContent: {
    padding: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: br.lg,
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
});

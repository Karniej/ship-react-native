import React, { useEffect, useRef } from "react";

import { StyleSheet, View, Animated, Easing, type ViewStyle } from "react-native";

import { colors, spacing, componentSizes } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Color override */
  color?: string;
  /** Container style */
  style?: ViewStyle;
}

interface LoadingOverlayProps {
  /** Show the overlay */
  visible: boolean;
  /** Loading message */
  message?: string;
  /** Overlay style */
  style?: ViewStyle;
}

interface DotsLoaderProps {
  /** Size of dots */
  size?: SpinnerSize;
  /** Color override */
  color?: string;
  /** Container style */
  style?: ViewStyle;
}

interface PulseLoaderProps {
  /** Size of the pulse */
  size?: SpinnerSize;
  /** Color override */
  color?: string;
  /** Container style */
  style?: ViewStyle;
}

interface ProgressBarProps {
  /** Progress value (0-100) */
  progress: number;
  /** Height of the bar */
  height?: number;
  /** Color of the progress */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Container style */
  style?: ViewStyle;
}

// ============================================================================
// SPINNER COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function Spinner({ size = "md", color, style }: SpinnerProps) {
  const { colors: themeColors } = useAppTheme();
  const rotation = useRef(new Animated.Value(0)).current;

  const spinnerColor = color || themeColors.primary;
  const spinnerSize = getSpinnerSize(size);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.spinnerContainer, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: spinnerSize / 8,
            borderColor: `${spinnerColor}30`,
            borderTopColor: spinnerColor,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
}

// ============================================================================
// DOTS LOADER COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function DotsLoader({ size = "md", color, style }: DotsLoaderProps) {
  const { colors: themeColors } = useAppTheme();
  const dotColor = color || themeColors.primary;
  const dotSize = getDotSize(size);

  // Animation values for each dot
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (
      value: Animated.Value,
      delay: number
    ): Animated.CompositeAnimation => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createDotAnimation(dot1, 0);
    const anim2 = createDotAnimation(dot2, 150);
    const anim3 = createDotAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const createDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  const dotStyles = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: dotColor,
    marginHorizontal: dotSize / 4,
  };

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View style={[dotStyles, createDotStyle(dot1)]} />
      <Animated.View style={[dotStyles, createDotStyle(dot2)]} />
      <Animated.View style={[dotStyles, createDotStyle(dot3)]} />
    </View>
  );
}

// ============================================================================
// PULSE LOADER COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function PulseLoader({ size = "md", color, style }: PulseLoaderProps) {
  const { colors: themeColors } = useAppTheme();
  const pulseColor = color || themeColors.primary;
  const pulseSize = getSpinnerSize(size);

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    scaleAnimation.start();
    opacityAnimation.start();

    return () => {
      scaleAnimation.stop();
      opacityAnimation.stop();
    };
  }, [scale, opacity]);

  return (
    <View style={[styles.pulseContainer, style]}>
      <Animated.View
        style={[
          {
            width: pulseSize,
            height: pulseSize,
            borderRadius: pulseSize / 2,
            backgroundColor: pulseColor,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    </View>
  );
}

// ============================================================================
// PROGRESS BAR COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function ProgressBar({
  progress,
  height = 4,
  color,
  backgroundColor,
  showPercentage = false,
  style,
}: ProgressBarProps) {
  const { isDark, colors: themeColors } = useAppTheme();

  const progressColor = color || themeColors.primary;
  const bgColor = backgroundColor || (isDark ? colors.gray[700] : colors.gray[200]);

  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width animations can't use native driver
    }).start();
  }, [progress, animatedProgress]);

  const animatedWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={style}>
      <View
        style={[
          styles.progressBarContainer,
          {
            height,
            backgroundColor: bgColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: progressColor,
              borderRadius: height / 2,
              width: animatedWidth,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text variant="caption" style={styles.progressText}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// LOADING OVERLAY COMPONENT (Fabric-compatible using RN Animated)
// ============================================================================

export function LoadingOverlay({ visible, message, style }: LoadingOverlayProps) {
  const { isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
          opacity,
        },
        style,
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={styles.overlayContent}>
        <Spinner size="lg" />
        {message && (
          <Text variant="body" style={styles.overlayMessage}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ============================================================================
// SIZE HELPERS
// ============================================================================

function getSpinnerSize(size: SpinnerSize): number {
  const sizes: Record<SpinnerSize, number> = {
    xs: componentSizes.icon.sm,
    sm: componentSizes.icon.md,
    md: componentSizes.icon.lg,
    lg: componentSizes.icon.xl,
    xl: componentSizes.icon["2xl"],
  };
  return sizes[size];
}

function getDotSize(size: SpinnerSize): number {
  const sizes: Record<SpinnerSize, number> = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
  };
  return sizes[size];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  spinnerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    borderStyle: "solid",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pulseContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  progressText: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayContent: {
    alignItems: "center",
    gap: spacing.lg,
  },
  overlayMessage: {
    marginTop: spacing.md,
  },
});

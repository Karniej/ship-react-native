import React, { useCallback } from "react";

import { StyleSheet, Pressable, View, type ViewStyle, type PressableProps } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  interpolate,
  type AnimatedStyle,
} from "react-native-reanimated";

import { colors, spacing, borderRadius, shadows, animation } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// ============================================================================
// TYPES
// ============================================================================

type CardVariant = "elevated" | "filled" | "outlined";
type CardPadding = "none" | "sm" | "md" | "lg";
type CardRadius = "none" | "sm" | "md" | "lg" | "xl";
type EnterAnimation = "fade" | "fadeUp" | "fadeDown" | "none";

interface CardProps extends Omit<PressableProps, "style"> {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Border radius size */
  radius?: CardRadius;
  /** Make card pressable with animation */
  pressable?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Enter animation type */
  enterAnimation?: EnterAnimation;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Animation duration in ms */
  animationDuration?: number;
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// COMPONENT
// ============================================================================

export function Card({
  children,
  variant = "elevated",
  padding = "md",
  radius = "lg",
  pressable = false,
  style,
  enterAnimation = "none",
  animationDelay = 0,
  animationDuration = 300,
  onPressIn,
  onPressOut,
  ...props
}: CardProps) {
  const { isDark } = useAppTheme();

  // Animation values for press state
  const pressed = useSharedValue(0);

  // Get styles based on props
  const variantStyles = getVariantStyles(variant, isDark);
  const paddingValue = getPaddingValue(padding);
  const radiusValue = getRadiusValue(radius);

  // Handle press animations
  const handlePressIn = useCallback(
    (e: any) => {
      if (pressable) {
        pressed.value = withSpring(1, animation.spring.quick);
      }
      onPressIn?.(e);
    },
    [pressable, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      if (pressable) {
        pressed.value = withSpring(0, animation.spring.default);
      }
      onPressOut?.(e);
    },
    [pressable, onPressOut]
  );

  // Animated press style
  const animatedPressStyle = useAnimatedStyle(() => {
    if (!pressable) return {};

    return {
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
    };
  });

  // Get enter animation
  const getEnteringAnimation = () => {
    switch (enterAnimation) {
      case "fade":
        return FadeIn.duration(animationDuration).delay(animationDelay);
      case "fadeUp":
        return FadeInUp.duration(animationDuration).delay(animationDelay);
      case "fadeDown":
        return FadeInDown.duration(animationDuration).delay(animationDelay);
      default:
        return undefined;
    }
  };

  const containerStyle: ViewStyle = {
    ...variantStyles,
    padding: paddingValue,
    borderRadius: radiusValue,
  };

  // Render pressable or static card
  if (pressable) {
    return (
      <AnimatedPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        entering={getEnteringAnimation()}
        style={[styles.base, containerStyle, animatedPressStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  // Static card with optional enter animation
  if (enterAnimation !== "none") {
    return (
      <Animated.View entering={getEnteringAnimation()} style={[styles.base, containerStyle, style]}>
        {children}
      </Animated.View>
    );
  }

  return <View style={[styles.base, containerStyle, style]}>{children}</View>;
}

// ============================================================================
// CARD HEADER
// ============================================================================

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

// ============================================================================
// CARD CONTENT
// ============================================================================

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

// ============================================================================
// CARD FOOTER
// ============================================================================

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyles(variant: CardVariant, isDark: boolean): ViewStyle {
  const baseBackground = isDark ? colors.surface.dark : colors.surface.light;
  const elevatedBackground = isDark ? colors.surface.darkElevated : colors.surface.lightElevated;
  const borderColor = isDark ? colors.border.dark : colors.border.light;

  const variants: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: elevatedBackground,
      ...shadows.md,
    },
    filled: {
      backgroundColor: baseBackground,
    },
    outlined: {
      backgroundColor: baseBackground,
      borderWidth: 1,
      borderColor,
    },
  };

  return variants[variant];
}

// ============================================================================
// PADDING VALUES
// ============================================================================

function getPaddingValue(padding: CardPadding): number {
  const paddingMap: Record<CardPadding, number> = {
    none: 0,
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing["2xl"],
  };

  return paddingMap[padding];
}

// ============================================================================
// RADIUS VALUES
// ============================================================================

function getRadiusValue(radius: CardRadius): number {
  const radiusMap: Record<CardRadius, number> = {
    none: borderRadius.none,
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
  };

  return radiusMap[radius];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  header: {
    marginBottom: spacing.md,
  },
  content: {
    // Content inherits card padding
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});

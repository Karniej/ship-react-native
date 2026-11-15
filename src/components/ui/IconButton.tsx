import React, { useCallback } from "react";

import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  type ViewStyle,
  type PressableProps,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";

import { colors, borderRadius, componentSizes, animation } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// ============================================================================
// TYPES
// ============================================================================

type IconButtonVariant = "solid" | "subtle" | "ghost" | "outline";
type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type IconButtonColor = "primary" | "secondary" | "success" | "error" | "warning" | "default";
type IconButtonShape = "circle" | "square";

interface IconButtonProps extends Omit<PressableProps, "style"> {
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Size of the button */
  size?: IconButtonSize;
  /** Color scheme */
  color?: IconButtonColor;
  /** Button shape */
  shape?: IconButtonShape;
  /** Show loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// ANIMATED COMPONENT
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// COMPONENT
// ============================================================================

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  color = "default",
  shape = "circle",
  loading = false,
  disabled = false,
  style,
  onPressIn,
  onPressOut,
  ...props
}: IconButtonProps) {
  const { isDark } = useAppTheme();

  // Animation values
  const pressed = useSharedValue(0);

  // Get styles
  const sizeStyles = getSizeStyles(size);
  const colorStyles = getColorStyles(color, variant, isDark);

  // Handle press animations
  const handlePressIn = useCallback(
    (e: any) => {
      pressed.value = withSpring(1, animation.spring.quick);
      onPressIn?.(e);
    },
    [onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      pressed.value = withSpring(0, animation.spring.default);
      onPressOut?.(e);
    },
    [onPressOut]
  );

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.9]) }],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.8]),
    };
  });

  const isDisabled = disabled || loading;
  const buttonRadius = shape === "circle" ? sizeStyles.size / 2 : borderRadius.md;

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius: buttonRadius,
          backgroundColor: colorStyles.backgroundColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: colorStyles.borderColor,
        },
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colorStyles.iconColor} />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={isDisabled ? colors.gray[400] : colorStyles.iconColor}
        />
      )}
    </AnimatedPressable>
  );
}

// ============================================================================
// SIZE STYLES
// ============================================================================

function getSizeStyles(size: IconButtonSize) {
  const sizes = {
    xs: {
      size: 28,
      iconSize: componentSizes.icon.xs,
    },
    sm: {
      size: 32,
      iconSize: componentSizes.icon.sm,
    },
    md: {
      size: 40,
      iconSize: componentSizes.icon.md,
    },
    lg: {
      size: 48,
      iconSize: componentSizes.icon.lg,
    },
    xl: {
      size: 56,
      iconSize: componentSizes.icon.xl,
    },
  };

  return sizes[size];
}

// ============================================================================
// COLOR STYLES
// ============================================================================

function getColorStyles(color: IconButtonColor, variant: IconButtonVariant, isDark: boolean) {
  const colorMap: Record<IconButtonColor, { main: string; light: string; dark: string }> = {
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
    },
    success: {
      main: colors.success,
      light: colors.successLight,
      dark: colors.successDark,
    },
    error: {
      main: colors.error,
      light: colors.errorLight,
      dark: colors.errorDark,
    },
    warning: {
      main: colors.warning,
      light: colors.warningLight,
      dark: colors.warningDark,
    },
    default: {
      main: isDark ? colors.text.primary.dark : colors.text.primary.light,
      light: isDark ? colors.gray[700] : colors.gray[200],
      dark: isDark ? colors.gray[300] : colors.gray[700],
    },
  };

  const colorSet = colorMap[color];

  switch (variant) {
    case "solid":
      return {
        backgroundColor: colorSet.main,
        iconColor: colors.white,
        borderColor: colors.transparent,
      };
    case "subtle":
      return {
        backgroundColor: isDark ? `${colorSet.main}20` : colorSet.light,
        iconColor: color === "default" ? colorSet.main : colorSet.main,
        borderColor: colors.transparent,
      };
    case "outline":
      return {
        backgroundColor: colors.transparent,
        iconColor: colorSet.main,
        borderColor: colorSet.main,
      };
    case "ghost":
    default:
      return {
        backgroundColor: colors.transparent,
        iconColor: colorSet.main,
        borderColor: colors.transparent,
      };
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

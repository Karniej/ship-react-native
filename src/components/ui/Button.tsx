import React, { useCallback } from "react";

import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";

import {
  colors,
  spacing,
  typography,
  borderRadius,
  componentSizes,
  animation,
} from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<PressableProps, "style"> {
  /** Button text content */
  title: string;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable button interactions */
  disabled?: boolean;
  /** Icon name from Ionicons to show on the left */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Icon name from Ionicons to show on the right */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Custom style for the text */
  textStyle?: TextStyle;
}

// ============================================================================
// ANIMATED PRESSABLE
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// COMPONENT
// ============================================================================

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { isDark } = useAppTheme();

  // Animation values
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  // Get variant styles
  const variantStyles = getVariantStyles(variant, isDark);
  const sizeStyles = getSizeStyles(size);

  // Handle press animations
  const handlePressIn = useCallback(
    (e: any) => {
      pressed.value = withSpring(1, animation.spring.quick);
      scale.value = withSpring(0.97, animation.spring.quick);
      onPressIn?.(e);
    },
    [onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      pressed.value = withSpring(0, animation.spring.default);
      scale.value = withSpring(1, animation.spring.default);
      onPressOut?.(e);
    },
    [onPressOut]
  );

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [variantStyles.backgroundColor, variantStyles.backgroundColorPressed]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
    };
  });

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        sizeStyles.container,
        {
          borderColor: variantStyles.borderColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedContainerStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} style={styles.loader} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeStyles.iconSize}
              color={isDisabled ? colors.gray[400] : variantStyles.textColor}
              style={styles.leftIcon}
            />
          )}
          <Animated.Text
            style={[
              styles.text,
              sizeStyles.text,
              {
                color: isDisabled ? colors.gray[400] : variantStyles.textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Animated.Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeStyles.iconSize}
              color={isDisabled ? colors.gray[400] : variantStyles.textColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyles(variant: ButtonVariant, isDark: boolean) {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      backgroundColorPressed: colors.primaryDark,
      textColor: colors.white,
      borderColor: colors.transparent,
    },
    secondary: {
      backgroundColor: colors.secondary,
      backgroundColorPressed: colors.secondaryDark,
      textColor: colors.white,
      borderColor: colors.transparent,
    },
    outline: {
      backgroundColor: colors.transparent,
      backgroundColorPressed: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      textColor: colors.primary,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: colors.transparent,
      backgroundColorPressed: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      textColor: isDark ? colors.text.primary.dark : colors.text.primary.light,
      borderColor: colors.transparent,
    },
    danger: {
      backgroundColor: colors.error,
      backgroundColorPressed: colors.errorDark,
      textColor: colors.white,
      borderColor: colors.transparent,
    },
  };

  return variants[variant];
}

// ============================================================================
// SIZE STYLES
// ============================================================================

function getSizeStyles(size: ButtonSize) {
  const sizes = {
    xs: {
      container: {
        height: componentSizes.button.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semiBold,
      } as TextStyle,
      iconSize: componentSizes.icon.xs,
    },
    sm: {
      container: {
        height: componentSizes.button.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semiBold,
      } as TextStyle,
      iconSize: componentSizes.icon.sm,
    },
    md: {
      container: {
        height: componentSizes.button.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semiBold,
      } as TextStyle,
      iconSize: componentSizes.icon.md,
    },
    lg: {
      container: {
        height: componentSizes.button.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semiBold,
      } as TextStyle,
      iconSize: componentSizes.icon.lg,
    },
    xl: {
      container: {
        height: componentSizes.button.xl,
        paddingHorizontal: spacing["2xl"],
        borderRadius: borderRadius.xl,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semiBold,
      } as TextStyle,
      iconSize: componentSizes.icon.lg,
    },
  };

  return sizes[size];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: "center",
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  loader: {
    marginHorizontal: spacing.xs,
  },
});

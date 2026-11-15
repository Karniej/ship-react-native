import React, { useState, useCallback, forwardRef } from "react";

import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  interpolate,
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

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

type InputSize = "sm" | "md" | "lg";
type InputVariant = "outlined" | "filled" | "underlined";

interface InputProps extends Omit<TextInputProps, "style"> {
  /** Label text above input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Left icon */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Right icon */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  /** Callback when right icon is pressed */
  onRightIconPress?: () => void;
  /** Input size */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Disabled state */
  disabled?: boolean;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Input style */
  style?: TextStyle;
}

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

const AnimatedView = Animated.View;
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// ============================================================================
// COMPONENT
// ============================================================================

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      size = "md",
      variant = "outlined",
      disabled = false,
      containerStyle,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { isDark } = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Animation values
    const focus = useSharedValue(0);
    const labelPosition = useSharedValue(props.value ? 1 : 0);

    // Get styles
    const sizeStyles = getSizeStyles(size);
    const variantStyles = getVariantStyles(variant, isDark, !!error);

    // Handle focus
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focus.value = withSpring(1, animation.spring.quick);
        labelPosition.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
      },
      [onFocus]
    );

    // Handle blur
    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focus.value = withSpring(0, animation.spring.default);
        if (!props.value) {
          labelPosition.value = withTiming(0, { duration: 200 });
        }
        onBlur?.(e);
      },
      [onBlur, props.value]
    );

    // Animated border style
    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = error
        ? colors.error
        : interpolateColor(focus.value, [0, 1], [variantStyles.borderColor, colors.primary]);

      const borderWidth =
        variant === "outlined"
          ? interpolate(focus.value, [0, 1], [1, 2])
          : variant === "underlined"
            ? interpolate(focus.value, [0, 1], [1, 2])
            : 0;

      return {
        borderColor,
        borderWidth,
      };
    });

    // Animated floating label style
    const animatedLabelStyle = useAnimatedStyle(() => {
      if (variant !== "filled") return {};

      return {
        transform: [
          {
            translateY: interpolate(labelPosition.value, [0, 1], [0, -spacing.lg]),
          },
          {
            scale: interpolate(labelPosition.value, [0, 1], [1, 0.85]),
          },
        ],
        opacity: interpolate(labelPosition.value, [0, 1], [0.6, 1]),
      };
    });

    // Colors
    const textColor = isDark ? colors.text.primary.dark : colors.text.primary.light;
    const placeholderColor = isDark ? colors.text.tertiary.dark : colors.text.tertiary.light;
    const iconColor = isFocused
      ? colors.primary
      : isDark
        ? colors.text.secondary.dark
        : colors.text.secondary.light;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && variant !== "filled" && (
          <Text
            variant="label"
            color={error ? "error" : isFocused ? "brand" : "secondary"}
            style={styles.label}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <AnimatedView
          style={[
            styles.inputContainer,
            sizeStyles.container,
            variantStyles.container,
            animatedContainerStyle,
            disabled && styles.disabled,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={sizeStyles.iconSize}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}

          {/* Floating Label (for filled variant) */}
          {label && variant === "filled" && (
            <Animated.Text
              style={[
                styles.floatingLabel,
                { color: isFocused ? colors.primary : placeholderColor },
                animatedLabelStyle,
              ]}
            >
              {label}
            </Animated.Text>
          )}

          {/* Text Input */}
          <AnimatedTextInput
            ref={ref}
            placeholder={variant === "filled" ? undefined : placeholder}
            placeholderTextColor={placeholderColor}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              sizeStyles.text,
              { color: textColor },
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              style,
            ]}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.rightIcon}
            >
              <Ionicons name={rightIcon} size={sizeStyles.iconSize} color={iconColor} />
            </Pressable>
          )}
        </AnimatedView>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <Text variant="caption" color={error ? "error" : "secondary"} style={styles.helperText}>
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

// ============================================================================
// SIZE STYLES
// ============================================================================

function getSizeStyles(size: InputSize) {
  const sizes = {
    sm: {
      container: {
        height: componentSizes.input.sm,
        paddingHorizontal: spacing.md,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.sm,
      } as TextStyle,
      iconSize: componentSizes.icon.sm,
    },
    md: {
      container: {
        height: componentSizes.input.md,
        paddingHorizontal: spacing.lg,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.md,
      } as TextStyle,
      iconSize: componentSizes.icon.md,
    },
    lg: {
      container: {
        height: componentSizes.input.lg,
        paddingHorizontal: spacing.xl,
      } as ViewStyle,
      text: {
        fontSize: typography.fontSize.lg,
      } as TextStyle,
      iconSize: componentSizes.icon.lg,
    },
  };

  return sizes[size];
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyles(variant: InputVariant, isDark: boolean, hasError: boolean) {
  const borderColor = hasError ? colors.error : isDark ? colors.border.dark : colors.border.light;

  const backgroundColor = isDark ? colors.surface.dark : colors.surface.light;

  const filledBackground = isDark
    ? colors.background.darkSecondary
    : colors.background.lightSecondary;

  const variants = {
    outlined: {
      container: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.transparent,
      } as ViewStyle,
      borderColor,
    },
    filled: {
      container: {
        borderRadius: borderRadius.lg,
        backgroundColor: filledBackground,
        borderBottomWidth: 2,
        borderWidth: 0,
      } as ViewStyle,
      borderColor,
    },
    underlined: {
      container: {
        borderRadius: 0,
        backgroundColor: colors.transparent,
        borderWidth: 0,
        borderBottomWidth: 1,
      } as ViewStyle,
      borderColor,
    },
  };

  return variants[variant];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: "100%",
  },
  inputWithLeftIcon: {
    marginLeft: spacing.xs,
  },
  inputWithRightIcon: {
    marginRight: spacing.xs,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  floatingLabel: {
    position: "absolute",
    left: spacing.lg,
    fontSize: typography.fontSize.md,
  },
  helperText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

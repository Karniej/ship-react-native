import React from "react";

import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

import Animated, { FadeIn, FadeOut, type AnimatedProps } from "react-native-reanimated";

import { typography, colors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

// ============================================================================
// TYPES
// ============================================================================

type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "bodyLarge"
  | "body"
  | "bodySmall"
  | "label"
  | "labelSmall"
  | "caption"
  | "captionSmall"
  | "button"
  | "buttonSmall";

type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "inverse"
  | "brand"
  | "success"
  | "error"
  | "warning"
  | "info";

type TextWeight = "regular" | "medium" | "semiBold" | "bold" | "extraBold";

type TextAlign = "auto" | "left" | "right" | "center" | "justify";

interface TextProps extends Omit<RNTextProps, "style"> {
  /** Text content */
  children: React.ReactNode;
  /** Typography variant */
  variant?: TextVariant;
  /** Text color variant */
  color?: TextColor;
  /** Override font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Make text italic */
  italic?: boolean;
  /** Add underline */
  underline?: boolean;
  /** Add strikethrough */
  strikethrough?: boolean;
  /** Uppercase text */
  uppercase?: boolean;
  /** Custom style */
  style?: TextStyle;
  /** Enable fade animation */
  animated?: boolean;
  /** Animation enter duration */
  enterDuration?: number;
  /** Animation exit duration */
  exitDuration?: number;
}

interface AnimatedTextProps extends AnimatedProps<RNTextProps> {
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Text({
  children,
  variant = "body",
  color = "primary",
  weight,
  align,
  italic = false,
  underline = false,
  strikethrough = false,
  uppercase = false,
  style,
  animated = false,
  enterDuration = 300,
  exitDuration = 200,
  ...props
}: TextProps) {
  const { isDark } = useAppTheme();

  // Get variant styles
  const variantStyle = getVariantStyle(variant);
  const colorStyle = getColorStyle(color, isDark);

  // Build text decorations
  const decorations: string[] = [];
  if (underline) decorations.push("underline");
  if (strikethrough) decorations.push("line-through");

  // Combined style
  const combinedStyle: TextStyle = {
    ...variantStyle,
    color: colorStyle,
    ...(weight && { fontWeight: typography.fontWeight[weight] }),
    ...(align && { textAlign: align }),
    ...(italic && { fontStyle: "italic" }),
    ...(decorations.length > 0 && {
      textDecorationLine: decorations.join(" ") as TextStyle["textDecorationLine"],
    }),
    ...(uppercase && { textTransform: "uppercase" }),
  };

  // Render animated or static text
  if (animated) {
    return (
      <Animated.Text
        entering={FadeIn.duration(enterDuration)}
        exiting={FadeOut.duration(exitDuration)}
        style={[combinedStyle, style]}
        {...(props as AnimatedTextProps)}
      >
        {children}
      </Animated.Text>
    );
  }

  return (
    <RNText style={[combinedStyle, style]} {...props}>
      {children}
    </RNText>
  );
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

function getVariantStyle(variant: TextVariant): TextStyle {
  const variantConfig = typography.variants[variant];
  return {
    fontSize: variantConfig.fontSize,
    fontWeight: variantConfig.fontWeight,
    lineHeight: variantConfig.fontSize * variantConfig.lineHeight,
  };
}

// ============================================================================
// COLOR STYLES
// ============================================================================

function getColorStyle(color: TextColor, isDark: boolean): string {
  const colorMap: Record<TextColor, string> = {
    primary: isDark ? colors.text.primary.dark : colors.text.primary.light,
    secondary: isDark ? colors.text.secondary.dark : colors.text.secondary.light,
    tertiary: isDark ? colors.text.tertiary.dark : colors.text.tertiary.light,
    disabled: isDark ? colors.text.disabled.dark : colors.text.disabled.light,
    inverse: isDark ? colors.text.inverse.dark : colors.text.inverse.light,
    brand: colors.primary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
  };

  return colorMap[color];
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

/** Display text - largest heading */
export function DisplayText(props: Omit<TextProps, "variant">) {
  return <Text variant="display" {...props} />;
}

/** H1 heading */
export function H1(props: Omit<TextProps, "variant">) {
  return <Text variant="h1" {...props} />;
}

/** H2 heading */
export function H2(props: Omit<TextProps, "variant">) {
  return <Text variant="h2" {...props} />;
}

/** H3 heading */
export function H3(props: Omit<TextProps, "variant">) {
  return <Text variant="h3" {...props} />;
}

/** H4 heading */
export function H4(props: Omit<TextProps, "variant">) {
  return <Text variant="h4" {...props} />;
}

/** H5 heading */
export function H5(props: Omit<TextProps, "variant">) {
  return <Text variant="h5" {...props} />;
}

/** H6 heading */
export function H6(props: Omit<TextProps, "variant">) {
  return <Text variant="h6" {...props} />;
}

/** Body text - large */
export function BodyLarge(props: Omit<TextProps, "variant">) {
  return <Text variant="bodyLarge" {...props} />;
}

/** Body text - default */
export function Body(props: Omit<TextProps, "variant">) {
  return <Text variant="body" {...props} />;
}

/** Body text - small */
export function BodySmall(props: Omit<TextProps, "variant">) {
  return <Text variant="bodySmall" {...props} />;
}

/** Label text */
export function Label(props: Omit<TextProps, "variant">) {
  return <Text variant="label" {...props} />;
}

/** Caption text */
export function Caption(props: Omit<TextProps, "variant">) {
  return <Text variant="caption" color="secondary" {...props} />;
}

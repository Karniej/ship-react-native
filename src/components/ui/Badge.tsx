import React from "react";

import { StyleSheet, View, type ViewStyle } from "react-native";

import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";

import { colors, spacing, borderRadius, componentSizes } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

type BadgeVariant = "solid" | "subtle" | "outline";
type BadgeColor = "primary" | "secondary" | "success" | "error" | "warning" | "info" | "gray";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  /** Badge content (text or number) */
  children?: React.ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Color scheme */
  color?: BadgeColor;
  /** Size */
  size?: BadgeSize;
  /** Show as dot only (no content) */
  dot?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Enable animations */
  animated?: boolean;
}

interface BadgeWrapperProps {
  /** Content to wrap */
  children: React.ReactNode;
  /** Badge count or content */
  count?: number | string;
  /** Maximum count to display */
  maxCount?: number;
  /** Show as dot only */
  dot?: boolean;
  /** Show badge when count is 0 */
  showZero?: boolean;
  /** Badge color */
  color?: BadgeColor;
  /** Badge position */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Offset from corner */
  offset?: { x?: number; y?: number };
  /** Custom style for wrapper */
  style?: ViewStyle;
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export function Badge({
  children,
  variant = "solid",
  color = "primary",
  size = "md",
  dot = false,
  style,
  animated = false,
}: BadgeProps) {
  const { isDark } = useAppTheme();

  const colorStyles = getColorStyles(color, variant, isDark);
  const sizeStyles = getSizeStyles(size, dot);

  const content = (
    <View style={[styles.badge, sizeStyles, colorStyles, dot && styles.dot, style]}>
      {!dot && children && (
        <Text
          variant="captionSmall"
          style={{
            ...styles.text,
            color: colorStyles.color,
            fontSize: getFontSize(size),
          }}
        >
          {children}
        </Text>
      )}
    </View>
  );

  if (animated) {
    return (
      <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(150)}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

// ============================================================================
// BADGE WRAPPER (for notification badges on icons, avatars, etc.)
// ============================================================================

export function BadgeWrapper({
  children,
  count,
  maxCount = 99,
  dot = false,
  showZero = false,
  color = "error",
  position = "top-right",
  offset = {},
  style,
}: BadgeWrapperProps) {
  const shouldShow = dot || (count !== undefined && (showZero || Number(count) > 0));

  const displayCount = typeof count === "number" && count > maxCount ? `${maxCount}+` : count;

  const positionStyle = getPositionStyle(position, offset);

  return (
    <View style={[styles.wrapper, style]}>
      {children}
      {shouldShow && (
        <Animated.View
          entering={ZoomIn.springify()}
          exiting={ZoomOut.duration(150)}
          style={[styles.badgePosition, positionStyle]}
        >
          <Badge color={color} dot={dot} size="sm">
            {!dot && displayCount}
          </Badge>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================================================
// COLOR STYLES
// ============================================================================

function getColorStyles(
  color: BadgeColor,
  variant: BadgeVariant,
  isDark: boolean
): ViewStyle & { color: string } {
  const colorMap: Record<BadgeColor, { main: string; light: string; dark: string }> = {
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
    info: {
      main: colors.info,
      light: colors.infoLight,
      dark: colors.infoDark,
    },
    gray: {
      main: colors.gray[500],
      light: colors.gray[200],
      dark: colors.gray[700],
    },
  };

  const colorSet = colorMap[color];

  switch (variant) {
    case "solid":
      return {
        backgroundColor: colorSet.main,
        color: colors.white,
      };
    case "subtle":
      return {
        backgroundColor: isDark ? `${colorSet.main}30` : colorSet.light,
        color: isDark ? colorSet.light : colorSet.dark,
      };
    case "outline":
      return {
        backgroundColor: colors.transparent,
        borderWidth: 1,
        borderColor: colorSet.main,
        color: colorSet.main,
      };
    default:
      return {
        backgroundColor: colorSet.main,
        color: colors.white,
      };
  }
}

// ============================================================================
// SIZE STYLES
// ============================================================================

function getSizeStyles(size: BadgeSize, dot: boolean): ViewStyle {
  if (dot) {
    const dotSizes: Record<BadgeSize, number> = {
      sm: 6,
      md: 8,
      lg: 10,
    };
    const dotSize = dotSizes[size];
    return {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      minWidth: dotSize,
    };
  }

  const sizes: Record<BadgeSize, ViewStyle> = {
    sm: {
      height: componentSizes.badge.sm,
      minWidth: componentSizes.badge.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.full,
    },
    md: {
      height: componentSizes.badge.md,
      minWidth: componentSizes.badge.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
    },
    lg: {
      height: componentSizes.badge.lg,
      minWidth: componentSizes.badge.lg,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
    },
  };

  return sizes[size];
}

function getFontSize(size: BadgeSize): number {
  const sizes: Record<BadgeSize, number> = {
    sm: 10,
    md: 11,
    lg: 12,
  };
  return sizes[size];
}

// ============================================================================
// POSITION STYLES
// ============================================================================

function getPositionStyle(
  position: BadgeWrapperProps["position"],
  offset: { x?: number; y?: number }
): ViewStyle {
  const { x = 0, y = 0 } = offset;

  switch (position) {
    case "top-right":
      return { top: y, right: x };
    case "top-left":
      return { top: y, left: x };
    case "bottom-right":
      return { bottom: y, right: x };
    case "bottom-left":
      return { bottom: y, left: x };
    default:
      return { top: y, right: x };
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  badge: {
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    padding: 0,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  wrapper: {
    position: "relative",
  },
  badgePosition: {
    position: "absolute",
    zIndex: 1,
  },
});

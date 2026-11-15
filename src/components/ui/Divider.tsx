import React from "react";

import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

type DividerOrientation = "horizontal" | "vertical";
type DividerVariant = "solid" | "dashed" | "dotted";

interface DividerProps {
  /** Divider orientation */
  orientation?: DividerOrientation;
  /** Line variant */
  variant?: DividerVariant;
  /** Thickness of the line */
  thickness?: number;
  /** Color override */
  color?: string;
  /** Text label in the middle */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "center" | "right";
  /** Spacing around divider */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Divider({
  orientation = "horizontal",
  variant = "solid",
  thickness = 1,
  color,
  label,
  labelPosition = "center",
  spacing: spacingProp = "md",
  style,
}: DividerProps) {
  const { isDark } = useAppTheme();

  const lineColor = color || (isDark ? colors.border.dark : colors.border.light);
  const spacingValue = getSpacingValue(spacingProp);

  // Vertical divider
  if (orientation === "vertical") {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: thickness,
            backgroundColor: variant === "solid" ? lineColor : undefined,
            borderLeftWidth: variant !== "solid" ? thickness : 0,
            borderLeftColor: lineColor,
            borderStyle: variant,
            marginHorizontal: spacingValue,
          },
          style,
        ]}
      />
    );
  }

  // Horizontal divider with label
  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: spacingValue }, style]}>
        {labelPosition !== "left" && (
          <View
            style={[
              styles.line,
              {
                height: thickness,
                backgroundColor: variant === "solid" ? lineColor : undefined,
                borderTopWidth: variant !== "solid" ? thickness : 0,
                borderTopColor: lineColor,
                borderStyle: variant,
                flex: labelPosition === "center" ? 1 : 0,
                width: labelPosition === "right" ? "100%" : undefined,
              },
            ]}
          />
        )}
        <Text variant="caption" color="tertiary" style={styles.label}>
          {label}
        </Text>
        {labelPosition !== "right" && (
          <View
            style={[
              styles.line,
              {
                height: thickness,
                backgroundColor: variant === "solid" ? lineColor : undefined,
                borderTopWidth: variant !== "solid" ? thickness : 0,
                borderTopColor: lineColor,
                borderStyle: variant,
                flex: labelPosition === "center" ? 1 : 0,
                width: labelPosition === "left" ? "100%" : undefined,
              },
            ]}
          />
        )}
      </View>
    );
  }

  // Simple horizontal divider
  return (
    <View
      style={[
        styles.horizontal,
        {
          height: thickness,
          backgroundColor: variant === "solid" ? lineColor : undefined,
          borderTopWidth: variant !== "solid" ? thickness : 0,
          borderTopColor: lineColor,
          borderStyle: variant,
          marginVertical: spacingValue,
        },
        style,
      ]}
    />
  );
}

// ============================================================================
// SPACING HELPER
// ============================================================================

function getSpacingValue(spacingKey: DividerProps["spacing"]): number {
  const spacingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };
  return spacingMap[spacingKey || "md"];
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  line: {
    flex: 1,
  },
  label: {
    paddingHorizontal: spacing.md,
  },
});

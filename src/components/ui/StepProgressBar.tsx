import React, { useEffect } from "react";

import { StyleSheet, View, type ViewStyle } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolateColor,
  Easing,
} from "react-native-reanimated";

import { colors, spacing, borderRadius, animation } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

import { Text } from "./Text";

// ============================================================================
// TYPES
// ============================================================================

interface Step {
  /** Step label */
  label: string;
  /** Whether step is completed */
  completed: boolean;
  /** Optional description */
  description?: string;
}

interface StepProgressBarProps {
  /** Array of steps */
  steps: Step[];
  /** Current active step index */
  activeStep?: number;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Show step labels */
  showLabels?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// ANIMATED STEP CIRCLE
// ============================================================================

function AnimatedStepCircle({
  stepNumber,
  completed,
  active,
  isDark,
}: {
  stepNumber: number;
  completed: boolean;
  active: boolean;
  isDark: boolean;
}) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (completed) {
      progress.value = withTiming(1, {
        duration: animation.duration.normal,
        easing: Easing.out(Easing.ease),
      });
    } else {
      progress.value = withTiming(0, {
        duration: animation.duration.normal,
      });
    }

    if (active) {
      scale.value = withSpring(1.1, animation.spring.bouncy);
    } else {
      scale.value = withSpring(1, animation.spring.default);
    }
  }, [completed, active]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [isDark ? colors.gray[700] : colors.gray[200], colors.primary]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
      borderWidth: active && !completed ? 2 : 0,
      borderColor: colors.primary,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [isDark ? colors.gray[400] : colors.gray[500], colors.white]
    );

    return { color };
  });

  return (
    <Animated.View style={[styles.stepCircle, animatedCircleStyle]}>
      {completed ? (
        <Animated.Text style={[styles.checkmark, animatedTextStyle]}>✓</Animated.Text>
      ) : (
        <Animated.Text style={[styles.stepNumber, animatedTextStyle]}>{stepNumber}</Animated.Text>
      )}
    </Animated.View>
  );
}

// ============================================================================
// ANIMATED CONNECTOR
// ============================================================================

function AnimatedConnector({
  completed,
  isDark,
  orientation,
  delay = 0,
}: {
  completed: boolean;
  isDark: boolean;
  orientation: "horizontal" | "vertical";
  delay?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (completed) {
      progress.value = withDelay(
        delay,
        withTiming(1, {
          duration: animation.duration.slow,
          easing: Easing.out(Easing.ease),
        })
      );
    } else {
      progress.value = withTiming(0, {
        duration: animation.duration.normal,
      });
    }
  }, [completed, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [isDark ? colors.gray[700] : colors.gray[200], colors.primary]
    );

    if (orientation === "vertical") {
      return {
        backgroundColor,
        height: `${progress.value * 100}%`,
      };
    }

    return {
      backgroundColor,
      width: `${progress.value * 100}%`,
    };
  });

  if (orientation === "vertical") {
    return (
      <View style={styles.connectorVerticalContainer}>
        <View
          style={[
            styles.connectorVertical,
            { backgroundColor: isDark ? colors.gray[700] : colors.gray[200] },
          ]}
        />
        <Animated.View style={[styles.connectorVerticalFill, animatedStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.connectorHorizontalContainer}>
      <View
        style={[
          styles.connectorHorizontal,
          { backgroundColor: isDark ? colors.gray[700] : colors.gray[200] },
        ]}
      />
      <Animated.View style={[styles.connectorHorizontalFill, animatedStyle]} />
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StepProgressBar({
  steps,
  activeStep,
  orientation = "horizontal",
  showLabels = true,
  style,
}: StepProgressBarProps) {
  const { isDark } = useAppTheme();

  const currentActiveStep = activeStep ?? steps.findIndex((s) => !s.completed);

  return (
    <View style={[styles.container, orientation === "vertical" && styles.containerVertical, style]}>
      <View style={[styles.stepsRow, orientation === "vertical" && styles.stepsColumn]}>
        {steps.map((step, index) => {
          const isActive = index === currentActiveStep;
          const isCompleted = step.completed || index < currentActiveStep;

          return (
            <React.Fragment key={step.label}>
              <View
                style={[styles.stepItem, orientation === "vertical" && styles.stepItemVertical]}
              >
                <AnimatedStepCircle
                  stepNumber={index + 1}
                  completed={isCompleted}
                  active={isActive}
                  isDark={isDark}
                />
                {showLabels && (
                  <View
                    style={[
                      styles.labelContainer,
                      orientation === "vertical" && styles.labelContainerVertical,
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      color={isCompleted ? "brand" : isActive ? "primary" : "tertiary"}
                      style={styles.stepLabel}
                    >
                      {step.label}
                    </Text>
                    {step.description && orientation === "vertical" && (
                      <Text variant="caption" color="secondary">
                        {step.description}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              {index < steps.length - 1 && (
                <AnimatedConnector
                  completed={isCompleted}
                  isDark={isDark}
                  orientation={orientation}
                  delay={100}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  containerVertical: {
    width: "auto",
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stepsColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stepItem: {
    alignItems: "center",
    flex: 0,
  },
  stepItemVertical: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "700",
  },
  labelContainer: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  labelContainerVertical: {
    marginLeft: spacing.md,
    marginTop: 0,
    alignItems: "flex-start",
    flex: 1,
  },
  stepLabel: {
    textAlign: "center",
  },
  connectorHorizontalContainer: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.sm,
    marginTop: 15,
    position: "relative",
  },
  connectorHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 2,
  },
  connectorHorizontalFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 2,
  },
  connectorVerticalContainer: {
    width: 2,
    height: 32,
    marginLeft: 15,
    marginVertical: spacing.xs,
    position: "relative",
  },
  connectorVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
  },
  connectorVerticalFill: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 2,
  },
});

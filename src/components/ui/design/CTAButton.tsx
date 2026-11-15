import React from "react";

import { Pressable, ActivityIndicator, StyleSheet, ViewStyle, StyleProp, Text } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Animated from "react-native-reanimated";

import { shadows, borderRadius as br } from "../../../constants/theme";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { usePressAnimation } from "../../../hooks/usePressAnimation";

interface CTAButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
}

export function CTAButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: CTAButtonProps) {
  const { colors } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.98);

  const isDisabled = disabled || loading;

  if (variant === "secondary") {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={[
            styles.button,
            styles.secondary,
            {
              borderColor: colors.primary,
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.text, { color: colors.primary }]}>{title}</Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, shadows.ctaGlow, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, styles.primary]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.text, styles.primaryText]}>{title}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: br.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    // gradient handles bg
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  text: {
    fontSize: 17,
    fontWeight: "700",
  },
  primaryText: {
    color: "#FFFFFF",
  },
});

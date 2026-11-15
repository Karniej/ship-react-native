import React from "react";

import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";

import Animated from "react-native-reanimated";

import { borderRadius as br } from "../../../constants/theme";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { usePressAnimation } from "../../../hooks/usePressAnimation";

interface PressableCardProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PressableCard({ children, onPress, style }: PressableCardProps) {
  const { colors } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.96);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, { backgroundColor: colors.surfaceElevated }, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: br.xl,
    overflow: "hidden",
  },
});

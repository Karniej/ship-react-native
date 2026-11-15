import React from "react";

import { View, StyleSheet } from "react-native";

import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

import { animation } from "../../../constants/theme";
import { useAppTheme } from "../../../hooks/useAppTheme";

interface PageDotsProps {
  count: number;
  activeIndex: number;
}

function Dot({ isActive, accentColor }: { isActive: boolean; accentColor: string }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, animation.springs.smooth),
    backgroundColor: isActive ? accentColor : "rgba(255,255,255,0.25)",
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function PageDots({ count, activeIndex }: PageDotsProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} isActive={i === activeIndex} accentColor={colors.primary} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

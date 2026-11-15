import { useEffect } from "react";

import { View, Text, StyleSheet } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeInDown,
  SlideInUp,
  interpolate,
} from "react-native-reanimated";

interface GenerationResultProps {
  title: string;
  children: React.ReactNode;
  /** Custom icon name */
  icon?: keyof typeof Feather.glyphMap;
  /** Custom accent color */
  color?: string;
}

export function GenerationResult({
  title,
  children,
  icon = "check-circle",
  color = "#34C759",
}: GenerationResultProps) {
  const theme = useTheme();

  // Animation for the success checkmark
  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-45);

  useEffect(() => {
    // Bouncy scale animation
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    // Rotate animation
    checkRotate.value = withSpring(0, { damping: 10, stiffness: 150 });
  }, []);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }, { rotate: `${checkRotate.value}deg` }],
    opacity: interpolate(checkScale.value, [0, 0.5, 1], [0, 1, 1]),
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Header with animated checkmark */}
      <Animated.View entering={SlideInUp.delay(100).springify()} style={styles.header}>
        <Animated.View style={checkAnimatedStyle}>
          <Feather name={icon} size={22} color={color} />
        </Animated.View>
        <Text style={[styles.title, { color }]}>{title}</Text>
      </Animated.View>

      {/* Content with slide-in animation */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={[
          styles.content,
          {
            borderColor: theme.dark ? "#333" : "#E5E5EA",
            backgroundColor: theme.dark ? "#1a1a2e" : "#fff",
          },
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

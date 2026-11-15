import { useEffect } from "react";

import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  type PressableStateCallbackType,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInLeft,
  runOnJS,
} from "react-native-reanimated";

import { haptics } from "@/utils/haptics";

interface ErrorCardProps {
  message: string;
  onDismiss?: () => void;
  /** Custom icon name */
  icon?: keyof typeof Feather.glyphMap;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ErrorCard({ message, onDismiss, icon = "alert-circle" }: ErrorCardProps) {
  const theme = useTheme();

  // Shake animation on mount
  const shakeX = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    // Trigger haptic feedback
    haptics.warning();

    // Shake animation
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // Icon pop animation
    iconScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleDismiss = () => {
    if (onDismiss) {
      haptics.light();
      onDismiss();
    }
  };

  return (
    <Animated.View
      entering={SlideInLeft.springify().damping(15)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        containerAnimatedStyle,
        {
          backgroundColor: theme.dark ? "#3d1f1f" : "#FFEBEE",
          borderColor: theme.dark ? "#5c2a2a" : "#FFCDD2",
        },
      ]}
    >
      <Animated.View style={iconAnimatedStyle}>
        <Feather name={icon} size={20} color="#D32F2F" />
      </Animated.View>
      <Text style={[styles.text, { color: theme.dark ? "#ff8a80" : "#C62828" }]}>{message}</Text>
      {onDismiss && (
        <AnimatedPressable
          onPress={handleDismiss}
          style={({ pressed }: PressableStateCallbackType) => [
            styles.dismissButton,
            pressed && styles.dismissButtonPressed,
          ]}
        >
          <Feather name="x" size={18} color={theme.dark ? "#ff8a80" : "#D32F2F"} />
        </AnimatedPressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 8,
  },
  dismissButtonPressed: {
    opacity: 0.6,
    backgroundColor: "rgba(211, 47, 47, 0.1)",
  },
});

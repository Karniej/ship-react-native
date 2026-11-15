// @ts-nocheck
import React, { useEffect, useRef } from "react";

import { View, StyleSheet, useWindowDimensions } from "react-native";

import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { BRAND } from "@/constants/brand";

interface SuccessCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  message?: string;
}

// Particle component for confetti effect
interface ParticleProps {
  delay: number;
  startX: number;
  color: string;
}

function Particle({ delay, startX, color }: ParticleProps) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomEndX = startX + (Math.random() - 0.5) * 200;
    const randomRotation = Math.random() * 720 - 360;

    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 100 }));
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.6, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      delay,
      withTiming(randomEndX, {
        duration: 2000,
        easing: Easing.out(Easing.quad),
      })
    );
    rotate.value = withDelay(delay, withTiming(randomRotation, { duration: 2000 }));

    // Fade out at the end
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
}

export function SuccessCelebration({ visible, onComplete }: SuccessCelebrationProps) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Container fade in
      containerOpacity.value = withTiming(1, { duration: 200 });

      // Ring animation
      ringScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );
      ringOpacity.value = withTiming(1, { duration: 300 });

      // Check animation
      checkOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
      checkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 150 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        )
      );

      // Fade out after animation
      const timeout = setTimeout(() => {
        containerOpacity.value = withTiming(0, { duration: 300 });
        if (onComplete) {
          setTimeout(onComplete, 300);
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  if (!visible) return null;

  // Generate particles
  const particles = [];
  const colors = [
    BRAND.colors.primary,
    BRAND.colors.secondary,
    "#FFD700",
    "#34C759",
    "#FF6B6B",
    "#4ECDC4",
  ];

  for (let i = 0; i < 30; i++) {
    particles.push(
      <Particle
        key={i}
        delay={i * 50}
        startX={SCREEN_WIDTH / 2 - 5}
        color={colors[i % colors.length]}
      />
    );
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Particles */}
      <View style={styles.particleContainer}>{particles}</View>

      {/* Success icon */}
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <Feather name="check" size={48} color="#fff" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// Simpler inline success indicator for generation results
interface SuccessCheckProps {
  visible: boolean;
  size?: number;
}

export function SuccessCheck({ visible, size = 24 }: SuccessCheckProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.successCheck,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
      ]}
    >
      <Feather name="check" size={size * 0.6} color="#fff" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  particleContainer: {
    ...StyleSheet.absoluteFill,
  },
  particle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: BRAND.colors.primary,
    opacity: 0.3,
  },
  checkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND.colors.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BRAND.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successCheck: {
    backgroundColor: BRAND.colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
});

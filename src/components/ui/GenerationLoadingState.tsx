import React, { useEffect, useRef } from "react";

import { View, Text, StyleSheet, Animated, Easing } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

interface GenerationLoadingStateProps {
  title: string;
  subtitle?: string;
  /** Custom icon name */
  icon?: keyof typeof Feather.glyphMap;
  /** Custom accent color */
  color?: string;
}

export function GenerationLoadingState({
  title,
  subtitle,
  icon = "loader",
  color = "#007AFF",
}: GenerationLoadingStateProps) {
  const theme = useTheme();

  // Animation values
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleSlide = useRef(new Animated.Value(20)).current;

  // Animation refs for cleanup
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Title slide up
    Animated.timing(titleSlide, {
      toValue: 0,
      duration: 300,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Subtitle slide up
    Animated.timing(subtitleSlide, {
      toValue: 0,
      duration: 300,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Rotation animation for icon
    const rotationAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation for ring
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Dots animation
    const createDotAnimation = (
      value: Animated.Value,
      delay: number
    ): Animated.CompositeAnimation => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const dot1Anim = createDotAnimation(dot1, 0);
    const dot2Anim = createDotAnimation(dot2, 200);
    const dot3Anim = createDotAnimation(dot3, 400);

    // Store all animations for cleanup
    animationsRef.current = [rotationAnim, pulseAnim, dot1Anim, dot2Anim, dot3Anim];

    // Start all animations
    rotationAnim.start();
    pulseAnim.start();
    dot1Anim.start();
    dot2Anim.start();
    dot3Anim.start();

    return () => {
      // Stop all animations on unmount
      animationsRef.current.forEach((anim) => anim.stop());
    };
  }, [rotation, pulse, dot1, dot2, dot3, fadeIn, titleSlide, subtitleSlide]);

  // Interpolations
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const createDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
      },
    ],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      {/* Animated loader */}
      <View style={styles.loaderContainer}>
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: color,
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
        {/* Icon */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Feather name={icon} size={32} color={color} />
        </Animated.View>
      </View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            color: theme.dark ? "#fff" : "#1a1a2e",
            transform: [{ translateY: titleSlide }],
            opacity: fadeIn,
          },
        ]}
      >
        {title}
      </Animated.Text>

      {/* Subtitle with animated dots */}
      {subtitle && (
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              transform: [{ translateY: subtitleSlide }],
              opacity: fadeIn,
            },
          ]}
        >
          <Text style={[styles.subtitle, { color: theme.dark ? "#999" : "#666" }]}>{subtitle}</Text>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: color }, createDotStyle(dot1)]} />
            <Animated.View style={[styles.dot, { backgroundColor: color }, createDotStyle(dot2)]} />
            <Animated.View style={[styles.dot, { backgroundColor: color }, createDotStyle(dot3)]} />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  loaderContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

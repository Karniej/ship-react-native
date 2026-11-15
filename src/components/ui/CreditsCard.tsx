import React, { useEffect, useRef } from "react";

import { View, Text, StyleSheet, Animated, Easing } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

interface CreditsCardProps {
  credits: number | null;
  isLoading?: boolean;
  label?: string;
  /** Custom icon name */
  icon?: keyof typeof Feather.glyphMap;
  /** Custom icon color */
  iconColor?: string;
}

export function CreditsCard({
  credits,
  isLoading = false,
  label,
  icon = "zap",
  iconColor = "#FFD700",
}: CreditsCardProps) {
  const theme = useTheme();

  // Coin flip animation
  const coinRotate = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(0.8)).current;

  // Shimmer animation for loading
  const shimmer = useRef(new Animated.Value(0)).current;

  // Track if loading animation is running
  const shimmerAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Shimmer effect for loading
      shimmerAnimationRef.current = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      );
      shimmerAnimationRef.current.start();
    } else {
      // Stop shimmer animation
      if (shimmerAnimationRef.current) {
        shimmerAnimationRef.current.stop();
        shimmerAnimationRef.current = null;
      }
      shimmer.setValue(0);

      // Coin entrance animation
      Animated.spring(coinScale, {
        toValue: 1,
        damping: 8,
        stiffness: 200,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(coinRotate, {
          toValue: 15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(coinRotate, {
          toValue: -15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(coinRotate, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (shimmerAnimationRef.current) {
        shimmerAnimationRef.current.stop();
      }
    };
  }, [isLoading, shimmer, coinScale, coinRotate]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  if (isLoading) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.dark ? "#2a2a3e" : "#F9F9F9",
            borderColor: theme.dark ? "#333" : "#E5E5EA",
          },
        ]}
      >
        {/* Skeleton icon */}
        <Animated.View
          style={[
            styles.skeletonIcon,
            {
              backgroundColor: theme.dark ? "#3d3d5c" : "#E5E5EA",
              opacity: shimmerOpacity,
            },
          ]}
        />
        {/* Skeleton text */}
        <Animated.View
          style={[
            styles.skeletonText,
            {
              backgroundColor: theme.dark ? "#3d3d5c" : "#E5E5EA",
              opacity: shimmerOpacity,
            },
          ]}
        />
      </Animated.View>
    );
  }

  const coinRotateDeg = coinRotate.interpolate({
    inputRange: [-15, 0, 15],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.dark ? "#2a2a3e" : "#F9F9F9",
          borderColor: theme.dark ? "#333" : "#E5E5EA",
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: coinScale }, { rotate: coinRotateDeg }],
        }}
      >
        <Feather name={icon} size={22} color={iconColor} />
      </Animated.View>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {label || `${credits ?? 0} credits remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  skeletonIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  skeletonText: {
    width: 150,
    height: 18,
    borderRadius: 6,
  },
});

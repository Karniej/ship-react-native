import React, { useEffect, useState } from "react";

import { View, StyleSheet, useWindowDimensions } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { BRAND } from "@/constants/brand";

interface ConfettiPieceProps {
  index: number;
  color: string;
  startDelay: number;
}

function ConfettiPiece({ index, color, startDelay }: ConfettiPieceProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() - 0.5) * 200;
  const size = Math.random() * 8 + 6;
  const duration = Math.random() * 2000 + 2000;

  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    opacity.value = withDelay(startDelay, withTiming(1, { duration: 100 }));

    // Fall animation
    translateY.value = withDelay(
      startDelay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration,
        easing: Easing.in(Easing.quad),
      })
    );

    // Drift sideways
    translateX.value = withDelay(
      startDelay,
      withTiming(endX, {
        duration,
        easing: Easing.inOut(Easing.sin),
      })
    );

    // Spin
    rotate.value = withDelay(startDelay, withTiming(Math.random() * 1440 - 720, { duration }));

    // Fade out near the end
    opacity.value = withDelay(
      startDelay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  // Random shape
  const isRound = index % 3 === 0;
  const isSquare = index % 3 === 1;

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: size,
          height: isRound ? size : size * 1.5,
          borderRadius: isRound ? size / 2 : isSquare ? 2 : 0,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({ active, count = 50, duration = 3000, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);

  const colors = [
    BRAND.colors.primary,
    BRAND.colors.secondary,
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#9B59B6",
    "#3498DB",
    "#E74C3C",
    "#2ECC71",
    "#F39C12",
  ];

  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: count }, (_, i) => i));

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      setPieces([]);
    }
  }, [active, count, duration, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((index) => (
        <ConfettiPiece
          key={index}
          index={index}
          color={colors[index % colors.length]}
          startDelay={index * 30}
        />
      ))}
    </View>
  );
}

// Premium celebration confetti with gold emphasis
interface PremiumConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export function PremiumConfetti({ active, onComplete }: PremiumConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);

  const colors = [
    "#FFD700", // Gold
    "#FFC107", // Amber
    "#FFB300", // Orange-gold
    "#FFCA28", // Light gold
    "#FF8F00", // Deep amber
    BRAND.colors.primary,
    "#fff",
  ];

  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: 80 }, (_, i) => i));

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timeout);
    } else {
      setPieces([]);
    }
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((index) => (
        <ConfettiPiece
          key={index}
          index={index}
          color={colors[index % colors.length]}
          startDelay={index * 20}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    pointerEvents: "none",
  },
  confetti: {
    position: "absolute",
    top: 0,
  },
});

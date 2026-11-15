import React from "react";

import { View, ViewStyle, StyleSheet, StyleProp } from "react-native";

import { borderRadius as br } from "../../../constants/theme";
import { useAppTheme } from "../../../hooks/useAppTheme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export function GlassCard({ children, style, padding = 16 }: GlassCardProps) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.70)",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: br.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});

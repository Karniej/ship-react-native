import { Text, StyleSheet } from "react-native";

import { useTheme } from "expo-router/react-navigation";
import Animated, { FadeInLeft, FadeIn } from "react-native-reanimated";

interface SectionLabelProps {
  children: string;
  /** Animation delay in ms for staggered animations */
  delay?: number;
  /** Animate on mount */
  animated?: boolean;
}

export function SectionLabel({ children, delay = 0, animated = true }: SectionLabelProps) {
  const theme = useTheme();

  if (!animated) {
    return <Text style={[styles.label, { color: theme.colors.text }]}>{children}</Text>;
  }

  return (
    <Animated.Text
      entering={FadeInLeft.delay(delay).duration(300).springify()}
      style={[styles.label, { color: theme.colors.text }]}
    >
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});

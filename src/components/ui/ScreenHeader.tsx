import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";

import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { haptics } from "@/utils/haptics";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  /** Animate on mount */
  animated?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScreenHeader({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightAction,
  animated = true,
}: ScreenHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  // Back button press animation
  const backButtonScale = useSharedValue(1);

  const handleBack = () => {
    haptics.light();
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleBackPressIn = () => {
    backButtonScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handleBackPressOut = () => {
    backButtonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const content = (
    <>
      {showBackButton && (
        <AnimatedPressable
          onPress={handleBack}
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          style={[styles.backButton, backButtonAnimatedStyle]}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </AnimatedPressable>
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.dark ? "#999" : "#666" }]}>{subtitle}</Text>
        )}
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        {showBackButton && (
          <Animated.View entering={SlideInLeft.delay(100).springify()}>
            <AnimatedPressable
              onPress={handleBack}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              style={[styles.backButton, backButtonAnimatedStyle]}
            >
              <Feather name="arrow-left" size={24} color={theme.colors.text} />
            </AnimatedPressable>
          </Animated.View>
        )}
        <Animated.View entering={FadeInLeft.delay(150).duration(300)} style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.dark ? "#999" : "#666" }]}>
              {subtitle}
            </Text>
          )}
        </Animated.View>
        {rightAction && (
          <Animated.View entering={FadeInRight.delay(200).springify()} style={styles.rightAction}>
            {rightAction}
          </Animated.View>
        )}
      </Animated.View>
    );
  }

  return <View style={styles.header}>{content}</View>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightAction: {
    flexShrink: 0,
  },
});

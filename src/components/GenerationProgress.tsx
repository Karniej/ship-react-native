import { useEffect, useRef } from "react";

import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";

import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useAIStore } from "@store/useAIStore";
import { useTheme } from "expo-router/react-navigation";

const PROVIDER_LABELS: Record<string, string> = {
  openai: "Image",
  replicate: "Image",
  elevenlabs: "Audio",
  video: "Video",
  transcription: "Transcription",
  vision: "Analysis",
};

const PROVIDER_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  openai: "image",
  replicate: "image",
  elevenlabs: "mic",
  video: "video",
  transcription: "file-text",
  vision: "eye",
};

export function GenerationProgressBar() {
  const router = useRouter();
  const theme = useTheme();
  const { currentGeneration, isGenerating } = useAIStore();

  // Animation for progress indicator
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isGenerating) {
      // Indeterminate progress animation
      const progressAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
      progressAnimation.start();

      // Pulse animation for icon
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        progressAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isGenerating, progressAnim, pulseAnim]);

  if (!currentGeneration && !isGenerating) return null;

  const provider = currentGeneration?.provider || "openai";
  const label = PROVIDER_LABELS[provider] || "Content";
  const iconName = PROVIDER_ICONS[provider] || "zap";

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.dark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.85)" },
      ]}
      onPress={() => router.push("/generations" as any)}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Feather name={iconName} size={20} color="#007AFF" />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.text}>Generating {label}...</Text>
          {currentGeneration?.prompt && (
            <Text style={styles.promptText} numberOfLines={1}>
              {currentGeneration.prompt}
            </Text>
          )}
        </View>

        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { width: progressWidth }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,122,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  promptText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progress: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 1.5,
  },
});

export default GenerationProgressBar;

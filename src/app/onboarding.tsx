/** @format */

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { usePostHog } from "posthog-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ONBOARDING_SLIDES, ONBOARDING_CONFIG, isLastSlide } from "../constants/onboarding";
import { useAppTheme } from "../hooks/useAppTheme";
import { useI18n } from "../hooks/useI18n";
import { PostHogAnalytics } from "../services/PostHogService";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { haptics } from "../utils/haptics";

// ---------------------------------------------------------------------------
// Slide 1 — Cycling words (driven by locale)
// ---------------------------------------------------------------------------

const CYCLE_INTERVAL = 2000;

function Slide1Content({
  tc,
  t,
}: {
  tc: ReturnType<typeof useAppTheme>["colors"];
  t: (key: string) => string;
}) {
  const [wordIndex, setWordIndex] = useState(0);

  const cyclingWords = useMemo(() => {
    const raw = t("onboarding.cyclingWords");
    return raw
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
  }, [t]);

  useEffect(() => {
    if (cyclingWords.length === 0) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  return (
    <View style={styles.slideInner}>
      <Text style={[styles.heroText, { color: tc.primary }]}>{t("onboarding.slide1.title")}</Text>
      <View style={styles.cyclingContainer}>
        {cyclingWords.length > 0 && (
          <Animated.Text
            key={wordIndex}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(400)}
            style={[styles.cyclingWord, { color: tc.textSecondary }]}
          >
            {cyclingWords[wordIndex]}
          </Animated.Text>
        )}
      </View>
      <Text style={[styles.subtitleText, { color: tc.textSecondary }]}>
        {t("onboarding.slide1.description")}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Slide 2 — Big number + staggered feature names
// ---------------------------------------------------------------------------

function Slide2Content({
  tc,
  t,
}: {
  tc: ReturnType<typeof useAppTheme>["colors"];
  t: (key: string) => string;
}) {
  const numberScale = useSharedValue(0.5);

  // Extract feature names from the slide 2 description (comma-separated list after the first sentence, or use a fallback)
  const featureNames = useMemo(() => {
    const desc = t("onboarding.slide2.description");
    // Try to split on commas for a feature list; fall back to showing the whole description
    const parts = desc
      .split(",")
      .map((s) => s.trim().replace(/\.$/, ""))
      .filter(Boolean);
    return parts.length > 1 ? parts : [desc];
  }, [t]);

  useEffect(() => {
    numberScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });
  }, []);

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  return (
    <View style={styles.slideInner}>
      <Animated.Text style={[styles.bigNumber, { color: tc.primary }, numberStyle]}>
        {featureNames.length > 1 ? String(featureNames.length) : ""}
      </Animated.Text>
      <Text style={[styles.writingStylesLabel, { color: tc.text }]}>
        {t("onboarding.slide2.title")}
      </Text>
      <View style={styles.modesRow}>
        {featureNames.map((name, index) => (
          <Animated.Text
            key={name}
            entering={FadeIn.delay(index * 200).duration(400)}
            style={[styles.modeName, { color: tc.primary }]}
          >
            {name}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Slide 3 — "Your words, polished." with shimmer
// ---------------------------------------------------------------------------

function Slide3Content({
  tc,
  t,
}: {
  tc: ReturnType<typeof useAppTheme>["colors"];
  t: (key: string) => string;
}) {
  const shimmerOpacity = useSharedValue(0.6);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const polishedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  // Split the title into two lines at the last comma or use as-is
  const title = t("onboarding.slide3.title");
  const commaIndex = title.lastIndexOf(",");
  const line1 = commaIndex > -1 ? title.slice(0, commaIndex + 1) : title;
  const line2 = commaIndex > -1 ? title.slice(commaIndex + 1).trim() : "";

  return (
    <View style={styles.slideInner}>
      <Text style={[styles.finalHeadline, { color: tc.text }]}>{line1}</Text>
      {line2 ? (
        <Animated.Text style={[styles.finalHeadlineAccent, { color: tc.primary }, polishedStyle]}>
          {line2}
        </Animated.Text>
      ) : null}
      <Text style={[styles.subtitleText, { color: tc.textSecondary, marginTop: 24 }]}>
        {t("onboarding.slide3.description")}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function OnboardingScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { colors: tc, spacing: sp } = useAppTheme();
  const { t } = useI18n();
  const { completeOnboarding } = useOnboardingStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];

  // Content fade for slide transitions
  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    PostHogAnalytics.trackOnboardingStarted(posthog);
  }, [posthog]);

  const animateIn = useCallback(() => {
    contentOpacity.value = 0;
    contentTranslateY.value = 30;
    contentOpacity.value = withTiming(1, { duration: 350 });
    contentTranslateY.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.back(1.2)),
    });
  }, []);

  const transitionTo = useCallback(
    (nextIndex: number) => {
      contentOpacity.value = withTiming(0, { duration: 150 });
      contentTranslateY.value = withTiming(-20, { duration: 150 }, (finished) => {
        if (finished) {
          runOnJS(setCurrentSlideIndex)(nextIndex);
          runOnJS(animateIn)();
        }
      });
    },
    [animateIn]
  );

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleNext = () => {
    haptics.medium();
    PostHogAnalytics.trackOnboardingStepCompleted(posthog, currentSlideIndex + 1, currentSlide.id);

    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      transitionTo(currentSlideIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    haptics.light();
    if (currentSlideIndex > 0) {
      transitionTo(currentSlideIndex - 1);
    }
  };

  const handleComplete = async () => {
    haptics.success();
    PostHogAnalytics.trackOnboardingCompleted(posthog, {});
    completeOnboarding();
    router.replace("/(app)/premium");
  };

  // Map slide IDs to components — customize per slide
  const renderSlideContent = () => {
    const slideIndex = currentSlideIndex;
    // Use index-based mapping so it works regardless of slide IDs
    switch (slideIndex) {
      case 0:
        return <Slide1Content tc={tc} t={t} />;
      case 1:
        return <Slide2Content tc={tc} t={t} />;
      case 2:
        return <Slide3Content tc={tc} t={t} />;
      default:
        return null;
    }
  };

  const renderProgressDots = () => {
    if (!ONBOARDING_CONFIG.showProgressDots) return null;

    return (
      <View style={[styles.dotsContainer, { gap: sp.sm, paddingVertical: sp.md }]}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentSlideIndex ? tc.primary : tc.borderSubtle,
                width: index === currentSlideIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Slide content */}
        <Animated.View style={[styles.content, contentAnimStyle]}>
          {renderSlideContent()}
        </Animated.View>

        {/* Progress dots */}
        {renderProgressDots()}

        {/* Footer buttons */}
        <View
          style={[
            styles.footer,
            {
              paddingHorizontal: sp.xl,
              paddingBottom: sp.xl,
              gap: sp.md,
            },
          ]}
        >
          {currentSlideIndex > 0 && (
            <TouchableOpacity
              style={[
                styles.prevButton,
                {
                  borderRadius: 14,
                  backgroundColor: tc.surfaceElevated,
                  borderColor: tc.border,
                  borderWidth: 1,
                },
              ]}
              onPress={handlePrevious}
            >
              <Feather name="arrow-left" size={22} color={tc.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, { borderRadius: 14, backgroundColor: tc.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide(currentSlideIndex)
                ? t(ONBOARDING_CONFIG.finalButtonKey)
                : t(ONBOARDING_CONFIG.nextButtonKey)}
            </Text>
            <Feather name="arrow-right" size={20} color={tc.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  // Slide inner
  slideInner: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  // Slide 1
  heroText: {
    fontSize: 44,
    fontFamily: "Inter_900Black",
    textAlign: "center",
  },
  cyclingContainer: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  cyclingWord: {
    fontSize: 36,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    position: "absolute",
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },

  // Slide 2
  bigNumber: {
    fontSize: 120,
    fontFamily: "Inter_900Black",
    textAlign: "center",
    lineHeight: 130,
  },
  writingStylesLabel: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  modeName: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },

  // Slide 3
  finalHeadline: {
    fontSize: 40,
    fontFamily: "Inter_900Black",
    textAlign: "center",
  },
  finalHeadlineAccent: {
    fontSize: 40,
    fontFamily: "Inter_900Black",
    textAlign: "center",
  },

  // Dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prevButton: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  nextButton: {
    flex: 1,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});

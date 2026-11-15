/** @format */

import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { usePostHog } from "posthog-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { onboardingSlides } from "../constants/onboardingData";
import { PostHogAnalytics } from "../services/PostHogService";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useOnboardingStore } from "../store/useOnboardingStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Generic slide component that can render different types of slides
const OnboardingSlide: React.FC<{
  slide: any;
  value?: any;
  onInputChange: (key: string, value: any) => void;
}> = ({ slide, value, onInputChange }) => {
  return (
    <View style={styles.slideContent}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        {slide.subtitle && <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>}
      </View>

      <View style={styles.slideBody}>
        {slide.component ? (
          <slide.component slide={slide} value={value} onInputChange={onInputChange} />
        ) : (
          <Text style={styles.slideDescription}>{slide.description}</Text>
        )}
      </View>
    </View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const {
    currentSlideIndex,
    userData,
    updateUserData,
    completeOnboarding,
    nextSlide,
    previousSlide,
    setCurrentSlide,
  } = useOnboardingStore();

  const { updateUser } = useAuthStore();
  const { requestPermission } = useNotificationStore();
  const [canProceed, setCanProceed] = useState(true);
  const posthog = usePostHog();

  const progressAnimation = useSharedValue(0);

  // Initialize analytics session on mount
  useEffect(() => {
    PostHogAnalytics.trackOnboardingStarted(posthog);
  }, [posthog]);

  useEffect(() => {
    progressAnimation.value = withTiming(currentSlideIndex / (onboardingSlides.length - 1));
  }, [currentSlideIndex, progressAnimation]);

  // Handle automatic actions for specific slides
  useEffect(() => {
    const currentSlide = onboardingSlides[currentSlideIndex];
    if (!currentSlide) return;

    // Auto-request notifications on permission slide
    if (currentSlide.type === "permission" && currentSlide.id.includes("notification")) {
      handleNotificationRequest();
    }
  }, [currentSlideIndex]);

  // Validate current slide and update canProceed
  useEffect(() => {
    const currentSlide = onboardingSlides[currentSlideIndex];
    if (!currentSlide) {
      setCanProceed(true);
      return;
    }

    if (currentSlide.validation) {
      const isValid = currentSlide.validation(userData);
      setCanProceed(isValid || currentSlide.optional === true);
    } else {
      setCanProceed(true);
    }
  }, [currentSlideIndex, userData]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
  }));

  const handleNext = () => {
    const currentSlide = onboardingSlides[currentSlideIndex];
    if (currentSlide) {
      PostHogAnalytics.trackOnboardingStepCompleted(
        posthog,
        currentSlideIndex + 1,
        currentSlide.id
      );
    }

    if (currentSlideIndex < onboardingSlides.length - 1) {
      nextSlide();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      previousSlide();
    }
  };

  const handleComplete = async () => {
    try {
      // Process onboarding data and create/update user
      const processedUserData = await processOnboardingData(userData);

      // Update user store with onboarding data
      if (processedUserData) {
        updateUser(processedUserData);
      }

      // Initialize notifications if user opted in
      if (userData.notificationPreference === "enabled") {
        await requestPermission();
      }

      PostHogAnalytics.trackOnboardingCompleted(posthog);
      completeOnboarding();
      onComplete();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const handleNotificationRequest = async () => {
    try {
      const permissionGranted = await requestPermission();
      updateUserData("notificationPreference", permissionGranted ? "enabled" : "disabled");
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      updateUserData("notificationPreference", "disabled");
    }
  };

  const handleInputChange = (key: string, value: any) => {
    updateUserData(key, value);

    // Track step completion when user provides an answer
    const currentSlide = onboardingSlides[currentSlideIndex];
    if (currentSlide) {
      PostHogAnalytics.trackOnboardingStepCompleted(
        posthog,
        currentSlideIndex + 1,
        currentSlide.id
      );
    }
  };

  const currentSlide = onboardingSlides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === onboardingSlides.length - 1;
  const isFirstSlide = currentSlideIndex === 0;

  // Safety check: if currentSlideIndex is out of bounds, reset to last slide
  useEffect(() => {
    if (!currentSlide && currentSlideIndex >= onboardingSlides.length) {
      setCurrentSlide(onboardingSlides.length - 1);
    }
  }, [currentSlideIndex, currentSlide]);

  // If currentSlide is undefined, don't render anything yet
  if (!currentSlide) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </View>

        {/* Slide Content */}
        <View style={styles.slideContainer}>
          <OnboardingSlide
            slide={currentSlide}
            value={userData[currentSlide.id]}
            onInputChange={handleInputChange}
          />
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {!isFirstSlide && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrevious}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              isFirstSlide && styles.nextButtonFullWidth,
              !canProceed && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={!canProceed}
          >
            <LinearGradient
              colors={canProceed ? ["#4facfe", "#00f2fe"] : ["#666", "#888"]}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>{isLastSlide ? "Get Started" : "Continue"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Helper function to process onboarding data into user data
async function processOnboardingData(userData: any): Promise<any> {
  // Process and validate onboarding data
  // This is where you'd transform the onboarding data into user data
  return {
    name: userData.name || "User",
    email: userData.email || "",
    preferences: {
      theme: userData.theme || "auto",
      notifications: userData.notificationPreference === "enabled",
      language: userData.language || "en",
    },
    onboardingData: userData,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  keyboardContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4facfe",
    borderRadius: 2,
  },
  slideContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  slideHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
  },
  slideBody: {
    flex: 1,
    justifyContent: "center",
  },
  slideDescription: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 15,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#444",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

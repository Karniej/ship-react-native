import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";

import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { storeReviewService } from "@/services/storeReview.service";
import { useAIStore } from "@/store/useAIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { usePremiumStore } from "@/store/usePremiumStore";

// Only render in development
if (!__DEV__) {
  module.exports = { DebugMenu: () => null };
}

interface DebugSection {
  title: string;
  data: Record<string, string | number | boolean | null | undefined>;
}

export function DebugMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reviewStats, setReviewStats] = useState<Record<string, any>>({});

  // Store states
  const authState = useAuthStore();
  const aiState = useAIStore();
  const premiumState = usePremiumStore();
  const onboardingState = useOnboardingStore();

  useEffect(() => {
    if (isExpanded) {
      loadReviewStats();
    }
  }, [isExpanded]);

  const loadReviewStats = async () => {
    const stats = await storeReviewService.getStats();
    setReviewStats(stats);
  };

  if (!__DEV__) {
    return null;
  }

  const sections: DebugSection[] = [
    {
      title: "App Info",
      data: {
        Version: Constants.expoConfig?.version ?? "Unknown",
        "SDK Version": Constants.expoConfig?.sdkVersion ?? "Unknown",
        Build: Constants.expoConfig?.extra?.eas?.projectId ?? "Local",
        Platform: Platform.OS,
        "OS Version": Platform.Version,
        "Dev Mode": __DEV__ ? "Yes" : "No",
      },
    },
    {
      title: "Auth State",
      data: {
        "Is Authenticated": authState.isAuthenticated,
        "User ID": authState.user?.id ?? "None",
        Email: authState.user?.email ?? "None",
        "Is Anonymous": authState.user?.isAnonymous ?? false,
        "Is Loading": authState.isLoading,
      },
    },
    {
      title: "AI State",
      data: {
        Credits: aiState.credits,
        "Is Generating": aiState.isGenerating,
        "Generations Count": aiState.generations?.length ?? 0,
        "Current Error": aiState.error ?? "None",
      },
    },
    {
      title: "Premium State",
      data: {
        "Is Subscribed": premiumState.isSubscribed,
        "Is Loading": premiumState.isLoading,
        "Has Seen Premium": onboardingState.hasSeenPremiumScreen,
      },
    },
    {
      title: "Onboarding State",
      data: {
        "Is Completed": onboardingState.isOnboardingCompleted,
        "Current Slide": onboardingState.currentSlideIndex,
        "Has Seen Auth": onboardingState.hasSeenAuthScreen,
      },
    },
    {
      title: "Store Review",
      data: {
        "App Opens": reviewStats.appOpens ?? 0,
        Generations: reviewStats.generationCount ?? 0,
        "Prompt Count": reviewStats.promptCount ?? 0,
        "Days Since First Open": reviewStats.daysSinceFirstOpen ?? 0,
        "Has Rated": reviewStats.hasRated ?? false,
        "Is Available": reviewStats.isAvailable ?? false,
      },
    },
  ];

  const handleClearStorage = () => {
    Alert.alert(
      "Clear All Storage",
      "This will clear all app data including auth, settings, and cache. The app will restart.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Cleared", "All storage cleared. Please restart the app.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear storage");
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    onboardingState.resetOnboarding();
    Alert.alert("Reset", "Onboarding has been reset");
  };

  const handleRefreshCredits = () => {
    aiState.loadCredits();
    Alert.alert("Credits", "Credits refreshed from server");
  };

  const handleCheckPremium = () => {
    premiumState.checkSubscriptionStatus();
    Alert.alert("Premium", "Checking subscription status...");
  };

  const handleTriggerReview = async () => {
    const prompted = await storeReviewService.maybePromptReview("manual");
    if (!prompted) {
      Alert.alert("Review", "Conditions not met for review prompt");
    }
  };

  const handleResetReviewStats = async () => {
    await storeReviewService.reset();
    await loadReviewStats();
    Alert.alert("Reset", "Review stats have been reset");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.toggleButtonText}>{isExpanded ? "▼ Debug Menu" : "▶ Debug Menu"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {Object.entries(section.data).map(([key, value]) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key}</Text>
                  <Text style={styles.value}>
                    {value === null || value === undefined
                      ? "null"
                      : typeof value === "boolean"
                        ? value
                          ? "true"
                          : "false"
                        : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity style={styles.actionButton} onPress={handleRefreshCredits}>
              <Text style={styles.actionButtonText}>Refresh Credits</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleCheckPremium}>
              <Text style={styles.actionButtonText}>Check Premium Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleResetOnboarding}>
              <Text style={styles.actionButtonText}>Reset Onboarding</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleTriggerReview}>
              <Text style={styles.actionButtonText}>Trigger Review Prompt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleResetReviewStats}>
              <Text style={styles.actionButtonText}>Reset Review Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearStorage}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Clear All Storage
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 400,
    zIndex: 9999,
  },
  toggleButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  toggleButtonText: {
    color: "#00FF00",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#00BFFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    color: "#888",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 11,
  },
  value: {
    color: "#FFF",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 11,
    maxWidth: "50%",
    textAlign: "right",
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  actionButtonText: {
    color: "#00FF00",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  dangerButtonText: {
    color: "#FF3B30",
  },
  bottomPadding: {
    height: 20,
  },
});

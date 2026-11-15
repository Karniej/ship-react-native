/** @format */

import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { useAppTheme } from "@/hooks/useAppTheme";

import { useOnboardingStore } from "../store/useOnboardingStore";

export default function ResetOnboardingScreen() {
  const router = useRouter();
  const { colors: tc } = useAppTheme();
  const { resetOnboarding } = useOnboardingStore();

  const handleReset = () => {
    resetOnboarding();
    router.replace("/");
  };

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Text style={[styles.title, { color: tc.text }]}>Reset Onboarding</Text>
      <Text style={[styles.subtitle, { color: tc.textTertiary }]}>
        This will clear your onboarding state
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: tc.primary }]}
        onPress={handleReset}
      >
        <Text style={styles.buttonText}>Reset Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: tc.surfaceElevated }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: tc.text }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

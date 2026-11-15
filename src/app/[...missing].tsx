import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors: tc } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <Text style={[styles.errorCode, { color: tc.text }]}>404</Text>
      <Text style={[styles.title, { color: tc.text }]}>Page Not Found</Text>
      <Text style={[styles.subtitle, { color: tc.textTertiary }]}>
        The page you're looking for doesn't exist.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: tc.primary }]}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "bold",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

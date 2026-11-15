import React from "react";

import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors: tc } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: tc.text }]}>Privacy Policy</Text>
            <Text style={[styles.date, { color: tc.textTertiary }]}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.sections}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Information We Collect</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              We collect information you provide directly to us, such as when you create an account,
              use our services, or contact us for support.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>
              How We Use Your Information
            </Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              We use the information we collect to provide, maintain, and improve our services,
              process transactions, and communicate with you.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Information Sharing</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              We do not sell, trade, or otherwise transfer your personal information to third
              parties without your consent, except as described in this policy.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Data Security</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Contact Us</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              If you have any questions about this Privacy Policy, please contact us at
              privacy@yourapp.com
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: tc.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
  },
  sections: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  backButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

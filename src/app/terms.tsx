import React from "react";

import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors: tc } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tc.background }]}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: tc.text }]}>Terms of Service</Text>
            <Text style={[styles.date, { color: tc.textTertiary }]}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.sections}>
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Acceptance of Terms</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              By accessing and using this application, you accept and agree to be bound by the terms
              and provision of this agreement.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Use License</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              Permission is granted to temporarily use this application for personal, non-commercial
              transitory viewing only.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Disclaimer</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              The information on this application is provided on an 'as is' basis. To the fullest
              extent permitted by law, this Company excludes all representations, warranties,
              conditions and terms relating to our application.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Limitations</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              In no event shall this Company or its suppliers be liable for any damages arising out
              of the use or inability to use the materials on this application.
            </Text>

            <Text style={[styles.sectionTitle, { color: tc.text }]}>Contact Information</Text>
            <Text style={[styles.sectionText, { color: tc.textTertiary }]}>
              If you have any questions about these Terms of Service, please contact us at
              terms@yourapp.com
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

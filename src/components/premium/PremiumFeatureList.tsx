import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { APP_CONFIG } from "@constants/config";
import { Feather } from "@expo/vector-icons";

export function PremiumFeatureList() {
  return (
    <View style={styles.container}>
      {APP_CONFIG.PREMIUM_FEATURES.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Feather name="check" size={20} color="#007AFF" />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#333",
  },
});

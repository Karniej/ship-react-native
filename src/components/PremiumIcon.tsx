/** @format */

import React from "react";

import { TouchableOpacity, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";

import { useAuthStore } from "../store/useAuthStore";

export const PremiumIcon = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const isPremium = user?.isPremium || false;

  const handlePress = () => {
    if (!isPremium) {
      router.push("/premium");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Feather name="star" size={24} color={isPremium ? "#FFD700" : theme.colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
  },
});

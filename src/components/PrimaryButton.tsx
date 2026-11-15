/** @format */

import React from "react";

import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";

import { colors } from "../constants/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
  variant?: "primary" | "secondary" | "outline";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary",
}) => {
  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.primary,
    },
  };

  const textStyles = {
    primary: { color: colors.white },
    secondary: { color: colors.white },
    outline: { color: colors.primary },
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyles[variant], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.buttonText, textStyles[variant]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});

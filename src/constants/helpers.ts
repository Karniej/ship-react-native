/** @format */

import { Alert, Linking } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Helpers
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Error storing data:", error);
  }
};

export const getData = async (key: string): Promise<any> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing data:", error);
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing data:", error);
  }
};

// Validation Helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Date Helpers
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString();
};

export const getDaysAgo = (date: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// UI Helpers
export const showAlert = (title: string, message: string): void => {
  Alert.alert(title, message);
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel", onPress: onCancel },
    { text: "Confirm", onPress: onConfirm },
  ]);
};

export const openURL = async (url: string): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error("Don't know how to open URI: " + url);
    }
  } catch (error) {
    console.error("Error opening URL:", error);
  }
};

// Number Helpers
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// String Helpers
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Platform Helpers
export const isIOS = (): boolean => {
  return require("react-native").Platform.OS === "ios";
};

export const isAndroid = (): boolean => {
  return require("react-native").Platform.OS === "android";
};

// Deep Linking
export const parseDeepLink = (url: string): Record<string, string> => {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

import { Platform } from "react-native";

import * as Haptics from "expo-haptics";

export const haptics = {
  /**
   * Light impact - for small UI interactions like toggles, selections
   */
  light: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact - for button presses, navigation
   */
  medium: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact - for significant actions like completing generation
   */
  heavy: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success notification - for successful actions
   */
  success: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification - for warnings
   */
  warning: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification - for errors
   */
  error: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection change - for picker/selection changes
   */
  selection: () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  },
};

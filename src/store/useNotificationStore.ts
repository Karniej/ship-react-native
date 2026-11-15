/** @format */

import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Lazy import to avoid crash in Expo Go (SDK 53+)
let Notifications: typeof import("expo-notifications") | null = null;

const isExpoGo = Constants.appOwnership === "expo";

// Only import expo-notifications if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch {
    console.warn("expo-notifications not available");
  }
}

interface NotificationPreferences {
  enabled: boolean;
  dailyReminders: boolean;
  achievements: boolean;
  weeklySummary: boolean;
  motivational: boolean;
  quietHours: boolean;
  sound: boolean;
  vibration: boolean;
}

interface NotificationStore {
  preferences: NotificationPreferences;
  isEnabled: boolean;

  // Actions
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;
  requestPermission: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<string>;
  scheduleNotification: (notification: any) => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;

  // Legacy methods for backward compatibility
  setPushNotifications: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setReminderNotifications: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      preferences: {
        enabled: false,
        dailyReminders: true,
        achievements: true,
        weeklySummary: true,
        motivational: true,
        quietHours: true,
        sound: true,
        vibration: true,
      },

      get isEnabled() {
        return get().preferences.enabled;
      },

      updatePreference: (key: keyof NotificationPreferences, value: boolean) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }));
      },

      requestPermission: async () => {
        if (!Notifications) {
          console.warn("Notifications not available in Expo Go");
          return false;
        }
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          const granted = status === "granted";

          if (granted) {
            set((state) => ({
              preferences: {
                ...state.preferences,
                enabled: true,
              },
            }));
          }

          return granted;
        } catch (error) {
          console.error("Failed to request notification permission:", error);
          return false;
        }
      },

      checkPermissionStatus: async () => {
        if (!Notifications) {
          return "unavailable";
        }
        try {
          const { status } = await Notifications.getPermissionsAsync();
          return status;
        } catch (error) {
          console.error("Failed to check notification permission:", error);
          return "undetermined";
        }
      },

      scheduleNotification: async (notification: any) => {
        if (!Notifications) {
          console.warn("Notifications not available in Expo Go");
          return;
        }
        try {
          await Notifications.scheduleNotificationAsync(notification);
        } catch (error) {
          console.error("Failed to schedule notification:", error);
        }
      },

      cancelNotification: async (id: string) => {
        if (!Notifications) return;
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch (error) {
          console.error("Failed to cancel notification:", error);
        }
      },

      cancelAllNotifications: async () => {
        if (!Notifications) return;
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
          console.error("Failed to cancel all notifications:", error);
        }
      },

      // Legacy methods for backward compatibility
      setPushNotifications: (enabled: boolean) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            enabled,
          },
        }));
      },

      setEmailNotifications: (enabled: boolean) => {
        // Legacy method - no longer used
      },

      setReminderNotifications: (enabled: boolean) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            dailyReminders: enabled,
          },
        }));
      },

      setSoundEnabled: (enabled: boolean) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            sound: enabled,
          },
        }));
      },

      setVibrationEnabled: (enabled: boolean) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            vibration: enabled,
          },
        }));
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

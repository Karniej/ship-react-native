/** @format */

export const APP_CONFIG = {
  VERSION: "1.0.0",
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com",
  ENVIRONMENT: process.env.NODE_ENV || "development",
  FEATURES: {
    PREMIUM_ENABLED: true,
    ANALYTICS_ENABLED: true,
    PUSH_NOTIFICATIONS: true,
    APPLE_WATCH_INTEGRATION: true,
    HEALTH_INTEGRATION: true,
  },
};

export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PREMIUM_STATUS: "premium_status",
  SETTINGS: "app_settings",
  NOTIFICATION_PREFERENCES: "notification_preferences",
  SESSION_DATA: "session_data",
};

export const NOTIFICATION_TYPES = {
  REMINDER: "reminder",
  ACHIEVEMENT: "achievement",
  DAILY_MOTIVATION: "daily_motivation",
  WEEKLY_SUMMARY: "weekly_summary",
};

export const PREMIUM_PRODUCT_IDS = {
  WEEKLY: "weekly_premium",
  MONTHLY: "monthly_premium",
  YEARLY: "yearly_premium",
};

export const ANALYTICS_EVENTS = {
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PREMIUM_VIEWED: "premium_viewed",
  PREMIUM_PURCHASED: "premium_purchased",
  FEATURE_USED: "feature_used",
  SETTINGS_CHANGED: "settings_changed",
};

export const DEFAULT_SETTINGS = {
  theme: "auto",
  notifications: true,
  analytics: true,
  haptics: true,
  sound: true,
};

export const ONBOARDING_STEPS = {
  WELCOME: "welcome",
  PERMISSIONS: "permissions",
  PREFERENCES: "preferences",
  COMPLETION: "completion",
};

export const SCREEN_NAMES = {
  ONBOARDING: "onboarding",
  PREMIUM: "premium",
  HOME: "home",
  PROFILE: "profile",
  SETTINGS: "settings",
  ANALYTICS: "analytics",
};

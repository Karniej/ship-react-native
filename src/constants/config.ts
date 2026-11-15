export const APP_CONFIG = {
  APP_NAME: "ShipReactNative",
  VERSION: "1.0.0",
  BUILD_NUMBER: "1",
  SUPPORT_EMAIL: "support@example.com",
  PRIVACY_POLICY_URL: "https://example.com/privacy",
  TERMS_URL: "https://example.com/terms",
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
  SUPPORTED_LOCALES: ["en", "es", "fr", "de", "it"],
  DEFAULT_LOCALE: "en",
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 64,
  MAX_USERNAME_LENGTH: 30,
  MAX_BIO_LENGTH: 160,
  PAGINATION_LIMIT: 20,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HARD_PAYWALL: true,

  // RevenueCat Configuration
  PREMIUM_ENTITLEMENT_ID: "premium",
  SUBSCRIPTION_TYPES: {
    WEEKLY: "WEEKLY",
    MONTHLY: "MONTHLY",
    YEARLY: "ANNUAL",
  },
  PRODUCT_IDS: {
    WEEKLY: "BUNDLE.ios.weekly",
    YEARLY: "BUNDLE.ios.yearly",
  },
  PREMIUM_FEATURES: [
    "Unlimited access to all features",
    "Ad-free experience",
    "Priority support",
    "Early access to new features",
  ],
};

/**
 * ============================================================================
 * ENVIRONMENT & CONFIGURATION VALIDATION
 * ============================================================================
 *
 * Validates required environment variables and configuration at app startup.
 * This helps catch configuration issues early in development.
 *
 * Usage:
 * Import and call in app/_layout.tsx:
 *
 * import { validateEnv, validateConfig } from '@/utils/validateEnv';
 * validateEnv();
 * validateConfig();
 */

import { API_MODE } from "../constants/api";
import { BRAND } from "../constants/brand";
import { APP_CONFIG } from "../constants/config";

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  condition?: () => boolean;
}

/**
 * Placeholder values that should be replaced before production
 */
const PLACEHOLDER_PATTERNS = [
  "example.com",
  "your-project",
  "your_",
  "YOUR_",
  "your-",
  "placeholder",
  "changeme",
  "todo",
  "fixme",
  "your-deployment",
];

/**
 * Define all environment variables your app uses
 */
const ENV_VARIABLES: EnvVariable[] = [
  // Convex (Required when using Convex mode)
  {
    name: "EXPO_PUBLIC_CONVEX_URL",
    required: true,
    description: "Convex deployment URL",
    condition: () => API_MODE === "convex",
  },

  // Analytics (Optional but recommended)
  {
    name: "EXPO_PUBLIC_POSTHOG_API_KEY",
    required: false,
    description: "PostHog API key for analytics",
  },
  {
    name: "EXPO_PUBLIC_POSTHOG_HOST",
    required: false,
    description: "PostHog host URL",
  },

  // Error Tracking (Optional but recommended)
  {
    name: "EXPO_PUBLIC_SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking",
  },

  // Monetization (Optional)
  {
    name: "EXPO_PUBLIC_REVENUECAT_IOS_KEY",
    required: false,
    description: "RevenueCat iOS API key for subscriptions",
  },
  {
    name: "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY",
    required: false,
    description: "RevenueCat Android API key for subscriptions",
  },
];

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

interface ConfigValidationResult {
  isValid: boolean;
  placeholders: string[];
  warnings: string[];
}

/**
 * Check if a value contains placeholder text
 */
function containsPlaceholder(value: string): boolean {
  const lowerValue = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => lowerValue.includes(pattern.toLowerCase()));
}

/**
 * Validate environment variables
 * @returns Validation result with missing required and optional vars
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  ENV_VARIABLES.forEach((envVar) => {
    // Skip if condition is defined and returns false
    if (envVar.condition && !envVar.condition()) {
      return;
    }

    const value = process.env[envVar.name];

    if (!value || value.trim() === "" || containsPlaceholder(value)) {
      if (envVar.required) {
        missing.push(`${envVar.name} - ${envVar.description}`);
      } else {
        warnings.push(`${envVar.name} - ${envVar.description}`);
      }
    }
  });

  const isValid = missing.length === 0;

  // Log results in development
  if (__DEV__) {
    if (missing.length > 0) {
      console.error(
        "\n❌ Missing required environment variables:\n" +
          missing.map((m) => `   - ${m}`).join("\n") +
          "\n\nPlease check your .env file.\n"
      );
    }

    if (warnings.length > 0) {
      console.warn(
        "\n⚠️  Missing optional environment variables:\n" +
          warnings.map((w) => `   - ${w}`).join("\n") +
          "\n\nSome features may not work without these.\n"
      );
    }

    if (isValid && warnings.length === 0) {
      console.log("✅ All environment variables configured");
    }
  }

  return { isValid, missing, warnings };
}

/**
 * Validate configuration files for placeholder values
 * This helps catch values that should be customized before shipping
 * @returns Validation result with placeholder warnings
 */
export function validateConfig(): ConfigValidationResult {
  const placeholders: string[] = [];
  const warnings: string[] = [];

  // Check BRAND configuration
  const brandChecks = [
    { value: BRAND.links.website, name: "BRAND.links.website" },
    { value: BRAND.links.support, name: "BRAND.links.support" },
    { value: BRAND.links.privacy, name: "BRAND.links.privacy" },
    { value: BRAND.links.terms, name: "BRAND.links.terms" },
    { value: BRAND.links.twitter, name: "BRAND.links.twitter" },
  ];

  // Check APP_CONFIG
  const configChecks = [
    { value: APP_CONFIG.SUPPORT_EMAIL, name: "APP_CONFIG.SUPPORT_EMAIL" },
    {
      value: APP_CONFIG.PRIVACY_POLICY_URL,
      name: "APP_CONFIG.PRIVACY_POLICY_URL",
    },
    { value: APP_CONFIG.TERMS_URL, name: "APP_CONFIG.TERMS_URL" },
  ];

  [...brandChecks, ...configChecks].forEach(({ value, name }) => {
    if (containsPlaceholder(value)) {
      placeholders.push(`${name}: "${value}"`);
    }
  });

  const isValid = placeholders.length === 0;

  // Log results in development
  if (__DEV__ && placeholders.length > 0) {
    console.warn(
      "\n⚠️  PLACEHOLDER VALUES DETECTED\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "The following configuration values contain placeholders\n" +
        "that should be updated before shipping to production:\n\n" +
        placeholders.map((p) => `   📝 ${p}`).join("\n") +
        "\n\n" +
        "Update these in:\n" +
        "   • constants/brand.ts\n" +
        "   • constants/config.ts\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    );
  }

  return { isValid, placeholders, warnings };
}

/**
 * Run all validations at once
 * Call this in app/_layout.tsx on startup
 */
export function validateAll(): {
  env: ValidationResult;
  config: ConfigValidationResult;
} {
  const env = validateEnv();
  const config = validateConfig();

  if (__DEV__) {
    if (env.isValid && config.isValid) {
      console.log("✅ All validations passed");
    }
  }

  return { env, config };
}

/**
 * Get a typed environment variable with a default fallback
 */
export function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] || defaultValue;
}

/**
 * Check if an environment variable is set
 */
export function hasEnv(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value.trim() !== "" && !containsPlaceholder(value);
}

/**
 * Get Convex configuration
 */
export function getConvexConfig() {
  return {
    url: getEnv("EXPO_PUBLIC_CONVEX_URL"),
  };
}

/**
 * Check if analytics is configured
 */
export function isAnalyticsConfigured(): boolean {
  return hasEnv("EXPO_PUBLIC_POSTHOG_API_KEY");
}

/**
 * Check if error tracking is configured
 */
export function isSentryConfigured(): boolean {
  return hasEnv("EXPO_PUBLIC_SENTRY_DSN");
}

/**
 * Check if monetization is configured
 */
export function isRevenueCatConfigured(): boolean {
  return hasEnv("EXPO_PUBLIC_REVENUECAT_IOS_KEY") || hasEnv("EXPO_PUBLIC_REVENUECAT_ANDROID_KEY");
}

/**
 * Get all configured services
 */
export function getConfiguredServices(): string[] {
  const services: string[] = [];

  if (hasEnv("EXPO_PUBLIC_CONVEX_URL")) services.push("Convex");
  if (hasEnv("EXPO_PUBLIC_POSTHOG_API_KEY")) services.push("PostHog");
  if (hasEnv("EXPO_PUBLIC_SENTRY_DSN")) services.push("Sentry");
  if (isRevenueCatConfigured()) services.push("RevenueCat");

  return services;
}

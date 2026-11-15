/* eslint-disable no-console */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  SHIP_MODULES,
  buildProjectPlan,
  createEnvChecklist,
  createProjectSummary,
  validateShipConfig,
  type ShipConfig,
  type ShipModuleId,
} from "@ship-rn/system";

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();

const CONSTANT_FILES = [
  "src/constants/api.ts",
  "src/constants/features.ts",
  "src/constants/brand.ts",
  "src/constants/config.ts",
] as const;

const ARTIFACT_FILES = ["PROJECT_SUMMARY.md", "REQUIRED_ENV.md", ".ship-rn-applied.json"] as const;

type ApplyOptions = {
  dryRun: boolean;
  force: boolean;
};

type FileWrite = {
  path: string;
  content: string;
};

type FileBackup = {
  existed: boolean;
  content?: string;
};

function repoPath(relativePath: string): string {
  return path.join(ROOT_DIR, relativePath);
}

function parseArgs(argv: string[]): ApplyOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
  };
}

async function getGitStatus(): Promise<string> {
  const { stdout } = await execFileAsync("git", ["status", "--porcelain"], {
    cwd: ROOT_DIR,
    maxBuffer: 1024 * 1024,
  });

  return stdout.trim();
}

async function assertCleanGitTree(force: boolean): Promise<void> {
  if (force) return;

  const status = await getGitStatus();
  if (!status) return;

  throw new Error(
    [
      "Refusing to apply config because the git tree is dirty.",
      "Commit or stash your changes, or rerun with --force.",
      "",
      status,
    ].join("\n")
  );
}

async function loadShipConfig(): Promise<ShipConfig> {
  const configPath = repoPath("ship.config.ts");
  const configUrl = pathToFileURL(configPath).href;
  const configModule = (await import(configUrl)) as {
    default?: ShipConfig;
    shipConfig?: ShipConfig;
  };
  const config = configModule.default ?? configModule.shipConfig;

  if (!config) {
    throw new Error("ship.config.ts must export a default ShipConfig.");
  }

  return config;
}

function getModuleSet(config: ShipConfig): Set<ShipModuleId> {
  return new Set(config.modules);
}

function generateApiConstants(config: ShipConfig): string {
  return `// constants/api.ts

export type ApiMode = "convex" | "expo-api-routes";

/**
 * API backend mode - set by setup script
 * - "convex": Full backend with auth, rate limiting, credits, real-time (default)
 * - "expo-api-routes": Simple proxy, premium features gated by RevenueCat
 */
export const API_MODE = ${JSON.stringify(config.backend)} as ApiMode;

/**
 * Base URL for Expo API routes
 * Set this to your deployed server URL in production
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

/**
 * Convex deployment URL
 */
export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "";

/**
 * Check if we're using Convex backend
 */
export const isConvexMode = () => API_MODE === "convex";

/**
 * Get the full API URL for an endpoint (Expo API Routes mode only)
 * @param endpoint - The endpoint name (e.g., "chat", "vision", "transcribe")
 * @returns The full URL to call
 */
export function getApiUrl(endpoint: string): string {
  return \`\${API_BASE_URL}/api/\${endpoint}\`;
}

/**
 * Get auth headers for API calls (Expo API Routes mode only)
 * @returns Headers object to spread into fetch options
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // In Expo API Routes mode, no auth headers needed (uses RevenueCat for premium)
  return {};
}

/**
 * Helper to make API calls with proper URL and auth (Expo API Routes mode only)
 * For Convex mode, use the Convex client directly via useAction/useMutation hooks
 * @param endpoint - The endpoint name
 * @param options - Fetch options (method, body, etc.)
 * @returns Fetch response
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (API_MODE === "convex") {
    throw new Error(
      "apiCall should not be used in Convex mode. Use Convex hooks (useAction, useMutation) instead."
    );
  }

  const url = getApiUrl(endpoint);
  const authHeaders = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });
}
`;
}

function featureConfig(enabled: boolean | string, beta = false, betaComment = ""): string {
  const enabledValue = typeof enabled === "boolean" ? String(enabled) : enabled;
  const betaSuffix = betaComment ? ` ${betaComment}` : "";

  return `{
    enabled: ${enabledValue},
    premiumOnly: false,
    beta: ${beta},${betaSuffix}
    comingSoon: false,
  }`;
}

const TEMPLATE_AI_FEATURES = {
  "image-generation": {
    imageGeneration: true,
    videoGeneration: false,
    textToSpeech: false,
    transcription: false,
    imageIdentification: true,
    aiChat: false,
  },
  "video-generation": {
    imageGeneration: false,
    videoGeneration: true,
    textToSpeech: false,
    transcription: false,
    imageIdentification: false,
    aiChat: false,
  },
  "image-video": {
    imageGeneration: true,
    videoGeneration: true,
    textToSpeech: false,
    transcription: false,
    imageIdentification: true,
    aiChat: false,
  },
  "audio-generation": {
    imageGeneration: false,
    videoGeneration: false,
    textToSpeech: true,
    transcription: false,
    imageIdentification: false,
    aiChat: false,
  },
  "audio-transcription": {
    imageGeneration: false,
    videoGeneration: false,
    textToSpeech: false,
    transcription: true,
    imageIdentification: false,
    aiChat: false,
  },
  "audio-full": {
    imageGeneration: false,
    videoGeneration: false,
    textToSpeech: true,
    transcription: true,
    imageIdentification: false,
    aiChat: false,
  },
  "full-suite": {
    imageGeneration: true,
    videoGeneration: true,
    textToSpeech: true,
    transcription: true,
    imageIdentification: true,
    aiChat: true,
  },
} satisfies Record<
  Exclude<ShipConfig["template"], "custom">,
  Record<
    | "imageGeneration"
    | "videoGeneration"
    | "textToSpeech"
    | "transcription"
    | "imageIdentification"
    | "aiChat",
    boolean
  >
>;

function generateFeaturesConstants(config: ShipConfig): string {
  const modules = getModuleSet(config);
  const flags = {
    imageGeneration: modules.has("image-generation"),
    videoGeneration: modules.has("video-generation"),
    textToSpeech: modules.has("text-to-speech"),
    transcription: modules.has("transcription"),
    imageIdentification: modules.has("image-identification"),
    aiChat: modules.has("ai-chat"),
    dalleProvider: modules.has("image-generation"),
    replicateProvider: modules.has("image-generation") || modules.has("video-generation"),
    imageToImage: modules.has("image-generation"),
    videoStartEndFrames: modules.has("video-generation"),
    gallery: modules.has("gallery"),
    analytics: modules.has("analytics"),
    onboarding: config.flows.onboarding,
    pushNotifications: modules.has("notifications"),
    auth: modules.has("auth") && config.auth !== "anonymous",
    premiumSubscription: config.monetization === "revenuecat",
    creditSystem: modules.has("credits"),
  };
  const selectedAiFlags = {
    imageGeneration: flags.imageGeneration,
    videoGeneration: flags.videoGeneration,
    textToSpeech: flags.textToSpeech,
    transcription: flags.transcription,
    imageIdentification: flags.imageIdentification,
    aiChat: flags.aiChat,
  };
  const templateFeatures =
    config.template === "custom" ? null : TEMPLATE_AI_FEATURES[config.template];
  const canUseTemplateExpressions =
    !!templateFeatures &&
    Object.entries(selectedAiFlags).every(([key, value]) => {
      return templateFeatures[key as keyof typeof selectedAiFlags] === value;
    });
  const generatedTemplate = canUseTemplateExpressions ? config.template : "custom";
  const customTemplateFeatures = canUseTemplateExpressions
    ? ""
    : `
const CUSTOM_TEMPLATE_FEATURES = {
  imageGeneration: ${flags.imageGeneration},
  videoGeneration: ${flags.videoGeneration},
  textToSpeech: ${flags.textToSpeech},
  transcription: ${flags.transcription},
  imageIdentification: ${flags.imageIdentification},
  aiChat: ${flags.aiChat},
} satisfies Record<
  | "imageGeneration"
  | "videoGeneration"
  | "textToSpeech"
  | "transcription"
  | "imageIdentification"
  | "aiChat",
  boolean
>;
`;
  const customTemplateReturn = canUseTemplateExpressions
    ? "true"
    : "CUSTOM_TEMPLATE_FEATURES[feature]";
  const aiFeatureExpression = (feature: keyof typeof selectedAiFlags): string => {
    return `isEnabledByTemplate("${feature}")`;
  };
  const galleryExpression = canUseTemplateExpressions
    ? 'isEnabledByTemplate("imageGeneration") || isEnabledByTemplate("videoGeneration")'
    : String(flags.gallery);

  return `/**
 * ============================================================================
 * FEATURE FLAGS CONFIGURATION
 * ============================================================================
 *
 * Toggle AI features on/off for your app. This makes it easy to:
 * - Launch with a subset of features
 * - A/B test new features
 * - Disable features that aren't ready
 * - Create different app variants
 *
 * APP TEMPLATES - Quick Setup:
 * ============================
 * Change CURRENT_TEMPLATE below to quickly configure your app:
 *
 * - 'image-generation'    - Image Gen Apps (AI Art, Avatar Generators)
 * - 'video-generation'    - Video Gen Apps (AI Videos, Animations)
 * - 'image-video'         - Visual Content Apps (Image + Video)
 * - 'audio-generation'    - TTS Apps (Voiceovers, Audiobooks)
 * - 'audio-transcription' - Transcription Apps (Meeting Notes, Accessibility)
 * - 'audio-full'          - Full Audio Apps (TTS + Transcription)
 * - 'full-suite'          - All Features Enabled (default)
 * - 'custom'              - Manual Configuration
 *
 * Usage:
 * import { FEATURES, isFeatureEnabled } from '@/constants/features';
 *
 * if (isFeatureEnabled('imageGeneration')) {
 *   // Show image generation UI
 * }
 */

// ============================================================================
// APP TEMPLATES
// ============================================================================

export type AppTemplate =
  | "image-generation"
  | "video-generation"
  | "image-video"
  | "audio-generation"
  | "audio-transcription"
  | "audio-full"
  | "full-suite"
  | "custom";

/**
 * CURRENT APP TEMPLATE
 * ====================
 * Change this to quickly configure which features are enabled.
 * Set to 'custom' to manually configure each feature below.
 */
export const CURRENT_TEMPLATE: AppTemplate = ${JSON.stringify(generatedTemplate)};

/** Pre-configured templates for common app types */
export const APP_TEMPLATES: Record<
  Exclude<AppTemplate, "custom">,
  {
    name: string;
    description: string;
    features: {
      imageGeneration: boolean;
      videoGeneration: boolean;
      textToSpeech: boolean;
      transcription: boolean;
      imageIdentification: boolean;
      aiChat: boolean;
    };
  }
> = {
  "image-generation": {
    name: "Image Generation App",
    description: "AI art apps, avatar generators, design tools",
    features: {
      imageGeneration: true,
      videoGeneration: false,
      textToSpeech: false,
      transcription: false,
      imageIdentification: true,
      aiChat: false,
    },
  },
  "video-generation": {
    name: "Video Generation App",
    description: "AI video creation, animation tools",
    features: {
      imageGeneration: false,
      videoGeneration: true,
      textToSpeech: false,
      transcription: false,
      imageIdentification: false,
      aiChat: false,
    },
  },
  "image-video": {
    name: "Visual Content App",
    description: "Full visual content creation (images + videos)",
    features: {
      imageGeneration: true,
      videoGeneration: true,
      textToSpeech: false,
      transcription: false,
      imageIdentification: true,
      aiChat: false,
    },
  },
  "audio-generation": {
    name: "Audio Generation App",
    description: "Voiceover apps, audiobook creators, TTS",
    features: {
      imageGeneration: false,
      videoGeneration: false,
      textToSpeech: true,
      transcription: false,
      imageIdentification: false,
      aiChat: false,
    },
  },
  "audio-transcription": {
    name: "Transcription App",
    description: "Meeting transcribers, note-taking apps",
    features: {
      imageGeneration: false,
      videoGeneration: false,
      textToSpeech: false,
      transcription: true,
      imageIdentification: false,
      aiChat: false,
    },
  },
  "audio-full": {
    name: "Full Audio App",
    description: "Podcast production, voice apps",
    features: {
      imageGeneration: false,
      videoGeneration: false,
      textToSpeech: true,
      transcription: true,
      imageIdentification: false,
      aiChat: false,
    },
  },
  "full-suite": {
    name: "Full Suite App",
    description: "All AI features enabled",
    features: {
      imageGeneration: true,
      videoGeneration: true,
      textToSpeech: true,
      transcription: true,
      imageIdentification: true,
      aiChat: true,
    },
  },
};
${customTemplateFeatures}
/** Helper to check if feature is enabled by template */
function isEnabledByTemplate(
  feature:
    | "imageGeneration"
    | "videoGeneration"
    | "textToSpeech"
    | "transcription"
    | "imageIdentification"
    | "aiChat"
): boolean {
  if (CURRENT_TEMPLATE === "custom") return ${customTemplateReturn};
  return APP_TEMPLATES[CURRENT_TEMPLATE].features[feature];
}

// ============================================================================
// FEATURE CONFIG INTERFACE
// ============================================================================

export interface FeatureConfig {
  /** Feature is available to users */
  enabled: boolean;
  /** Feature requires premium subscription */
  premiumOnly: boolean;
  /** Feature is in beta (show badge) */
  beta: boolean;
  /** Feature is coming soon (show placeholder) */
  comingSoon: boolean;
  /** Minimum app version required */
  minVersion?: string;
}

/** Extended config for social auth feature */
export interface SocialAuthConfig extends FeatureConfig {
  /** Enable Google Sign In */
  googleEnabled: boolean;
  /** Enable Apple Sign In */
  appleEnabled: boolean;
  /** If true, users cannot skip auth (must sign in) */
  required: boolean;
}

export interface Features {
  // AI Generation Features
  imageGeneration: FeatureConfig;
  videoGeneration: FeatureConfig;
  textToSpeech: FeatureConfig;
  transcription: FeatureConfig;
  imageIdentification: FeatureConfig;
  aiChat: FeatureConfig;

  // Image Generation Providers
  dalleProvider: FeatureConfig;
  replicateProvider: FeatureConfig;
  imageToImage: FeatureConfig;

  // Video Generation Options
  videoStartEndFrames: FeatureConfig;

  // App Features
  gallery: FeatureConfig;
  analytics: FeatureConfig;
  onboarding: FeatureConfig;
  pushNotifications: FeatureConfig;
  offlineMode: FeatureConfig;
  darkMode: FeatureConfig;

  // Authentication
  auth: FeatureConfig;
  socialAuth: SocialAuthConfig;

  // Premium Features
  premiumSubscription: FeatureConfig;
  creditSystem: FeatureConfig;
}

/**
 * Default feature configuration
 * Features are automatically enabled/disabled based on CURRENT_TEMPLATE above.
 * Set CURRENT_TEMPLATE to 'custom' to manually configure each feature.
 */
export const FEATURES: Features = {
  // ============================================================================
  // AI GENERATION FEATURES
  // ============================================================================

  imageGeneration: ${featureConfig(aiFeatureExpression("imageGeneration"))},

  videoGeneration: ${featureConfig(aiFeatureExpression("videoGeneration"), true, "// Mark as beta since video gen can be expensive")},

  textToSpeech: ${featureConfig(aiFeatureExpression("textToSpeech"))},

  transcription: ${featureConfig(aiFeatureExpression("transcription"))},

  imageIdentification: ${featureConfig(aiFeatureExpression("imageIdentification"))},

  aiChat: ${featureConfig(aiFeatureExpression("aiChat"))},

  // ============================================================================
  // PROVIDER-SPECIFIC FEATURES
  // ============================================================================

  dalleProvider: ${featureConfig(flags.dalleProvider)},

  replicateProvider: ${featureConfig(flags.replicateProvider)},

  imageToImage: ${featureConfig(flags.imageToImage, true)},

  videoStartEndFrames: ${featureConfig(flags.videoStartEndFrames, true)},

  // ============================================================================
  // APP FEATURES
  // ============================================================================

  gallery: {
    // Gallery is only useful when content-generating features are enabled
    enabled: ${galleryExpression},
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  analytics: ${featureConfig(flags.analytics)},

  onboarding: ${featureConfig(flags.onboarding)},

  pushNotifications: ${featureConfig(flags.pushNotifications)},

  offlineMode: ${featureConfig(true)},

  darkMode: ${featureConfig(true)},

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  auth: ${featureConfig(flags.auth)},

  /**
   * Social Authentication (Google, Apple)
   *
   * Enable/disable social sign-in options.
   * Configure in CLI setup: node scripts/setup.js
   *
   * Options:
   * - enabled: Show auth screen in onboarding flow
   * - googleEnabled: Show "Continue with Google" button
   * - appleEnabled: Show "Continue with Apple" button
   * - required: If true, users cannot skip (must sign in)
   */
  socialAuth: {
    enabled: false,
    googleEnabled: false,
    appleEnabled: false,
    required: ${config.auth === "required"},
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  // ============================================================================
  // MONETIZATION
  // ============================================================================

  premiumSubscription: ${featureConfig(flags.premiumSubscription)},

  creditSystem: ${featureConfig(flags.creditSystem)},
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof Features): boolean {
  return FEATURES[feature]?.enabled ?? false;
}

/**
 * Check if a feature requires premium
 */
export function isFeaturePremium(feature: keyof Features): boolean {
  return FEATURES[feature]?.premiumOnly ?? false;
}

/**
 * Check if a feature is in beta
 */
export function isFeatureBeta(feature: keyof Features): boolean {
  return FEATURES[feature]?.beta ?? false;
}

/**
 * Check if a feature is coming soon
 */
export function isFeatureComingSoon(feature: keyof Features): boolean {
  return FEATURES[feature]?.comingSoon ?? false;
}

/**
 * Get feature config
 */
export function getFeatureConfig(feature: keyof Features): FeatureConfig {
  return FEATURES[feature];
}

/**
 * Check if user can access feature (considering premium status)
 */
export function canAccessFeature(feature: keyof Features, isPremium: boolean): boolean {
  const config = FEATURES[feature];
  if (!config.enabled) return false;
  if (config.comingSoon) return false;
  if (config.premiumOnly && !isPremium) return false;
  return true;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof Features)[] {
  return (Object.keys(FEATURES) as (keyof Features)[]).filter((key) => FEATURES[key].enabled);
}

/**
 * Get all premium features
 */
export function getPremiumFeatures(): (keyof Features)[] {
  return (Object.keys(FEATURES) as (keyof Features)[]).filter((key) => FEATURES[key].premiumOnly);
}

/**
 * Get all beta features
 */
export function getBetaFeatures(): (keyof Features)[] {
  return (Object.keys(FEATURES) as (keyof Features)[]).filter((key) => FEATURES[key].beta);
}
`;
}

function getBrandPalette(config: ShipConfig) {
  const primary = config.branding.primaryColor;
  const secondary = config.branding.secondaryColor;
  const accent = config.branding.accentColor;
  const isDefaultPrimary = primary.toLowerCase() === "#007aff";

  return {
    primary,
    primaryLight: isDefaultPrimary ? "#4DA3FF" : primary,
    primaryDark: isDefaultPrimary ? "#0055CC" : primary,
    secondary,
    accent,
  };
}

function generateBrandConstants(config: ShipConfig): string {
  const palette = getBrandPalette(config);

  return `/**
 * ============================================================================
 * BRAND CONFIGURATION
 * ============================================================================
 *
 * Customize your app's brand identity here.
 * These values are used throughout the app for consistent branding.
 *
 * To customize your app:
 * 1. Update the colors below to match your brand
 * 2. Change the app name and tagline
 * 3. Optionally update gradient presets
 */

export const BRAND = {
  // ============================================================================
  // APP IDENTITY
  // ============================================================================
  // ⚠️  UPDATE THESE VALUES before shipping your app!
  // These should match the values in app.json and config.ts

  /** Your app's name - displayed in headers and about sections */
  name: ${JSON.stringify(config.branding.name)},

  /** Short tagline for your app */
  tagline: ${JSON.stringify(config.branding.tagline)},

  /** App description for about/marketing sections */
  description: ${JSON.stringify(config.branding.description)},

  // ============================================================================
  // PRIMARY COLORS
  // ============================================================================
  // These are the main colors used throughout your app.
  // Update these to match your brand.

  colors: {
    /** Main brand color - used for buttons, links, active states */
    primary: ${JSON.stringify(palette.primary)},

    /** Lighter variant - used for backgrounds, hover states */
    primaryLight: ${JSON.stringify(palette.primaryLight)},

    /** Darker variant - used for pressed states, emphasis */
    primaryDark: ${JSON.stringify(palette.primaryDark)},

    /** Secondary brand color - used for accents, secondary actions */
    secondary: ${JSON.stringify(palette.secondary)},

    /** Accent color - used for highlights, badges, special elements */
    accent: ${JSON.stringify(palette.accent)},

    /** Success color - used for positive feedback */
    success: "#34C759",

    /** Error color - used for errors, destructive actions */
    error: "#FF3B30",

    /** Warning color - used for warnings, cautions */
    warning: ${JSON.stringify(palette.accent)},
  },

  // ============================================================================
  // FONT
  // ============================================================================
  // Font family — change this to customize the app's typography
  // Options: "Inter", "Poppins", "SpaceGrotesk", "DMSans", "Outfit", "Montserrat"
  // Make sure to also install the corresponding @expo-google-fonts package
  font: ${JSON.stringify(config.branding.fontFamily)},

  // ============================================================================
  // GRADIENT PRESETS
  // ============================================================================
  // Pre-defined gradients for buttons, headers, and special elements

  gradients: {
    /** Primary gradient - for main CTAs and headers */
    primary: [${JSON.stringify(palette.primary)}, ${JSON.stringify(palette.primaryDark)}] as [string, string],

    /** Premium gradient - for upgrade buttons and premium features */
    premium: [${JSON.stringify(palette.primary)}, ${JSON.stringify(palette.accent)}] as [string, string],

    /** Success gradient - for completion states */
    success: ["#34C759", "#30D158"] as [string, string],

    /** Onboarding gradient - for onboarding screens */
    onboarding: [${JSON.stringify(palette.primary)}, ${JSON.stringify(palette.primaryLight)}] as [string, string],
  },

  // ============================================================================
  // FEATURE COLORS
  // ============================================================================
  // Colors associated with specific features (used in home screen quick actions)

  featureColors: {
    imageGeneration: "#4CAF50",
    videoGeneration: "#E91E63",
    audioGeneration: "#9C27B0",
    transcription: "#FF5722",
    imageAnalysis: "#2196F3",
    chat: "#00BCD4",
  },

  // ============================================================================
  // SOCIAL / LINKS
  // ============================================================================

  links: {
    website: "https://example.com",
    /** Support email address for help/contact */
    support: ${JSON.stringify(config.app.supportEmail)},
    privacy: ${JSON.stringify(config.app.privacyPolicyUrl)},
    terms: ${JSON.stringify(config.app.termsUrl)},
    twitter: "https://twitter.com/example",
  },
} as const;

// Type exports for TypeScript support
export type BrandColors = typeof BRAND.colors;
export type BrandGradients = typeof BRAND.gradients;
export type FeatureColors = typeof BRAND.featureColors;
`;
}

function formatMultilineStringArray(values: string[]): string {
  if (values.length === 0) return "[]";

  return `[\n${values.map((value) => `    ${JSON.stringify(value)},`).join("\n")}\n  ]`;
}

function formatInlineStringArray(values: string[]): string {
  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

function generateAppConfigConstants(config: ShipConfig): string {
  const premiumFeatures =
    config.monetization === "revenuecat"
      ? [
          "Unlimited access to all features",
          "Ad-free experience",
          "Priority support",
          "Early access to new features",
        ]
      : [];

  return `export const APP_CONFIG = {
  APP_NAME: ${JSON.stringify(config.app.name)},
  VERSION: ${JSON.stringify(config.app.version)},
  BUILD_NUMBER: "1",
  SUPPORT_EMAIL: ${JSON.stringify(config.app.supportEmail)},
  PRIVACY_POLICY_URL: ${JSON.stringify(config.app.privacyPolicyUrl)},
  TERMS_URL: ${JSON.stringify(config.app.termsUrl)},
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
  SUPPORTED_LOCALES: ${formatInlineStringArray(config.app.supportedLocales)},
  DEFAULT_LOCALE: ${JSON.stringify(config.app.defaultLocale)},
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
  HARD_PAYWALL: ${config.flows.hardPaywall},

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
  PREMIUM_FEATURES: ${formatMultilineStringArray(premiumFeatures)},
};
`;
}

function buildConstants(config: ShipConfig): FileWrite[] {
  return [
    { path: "src/constants/api.ts", content: generateApiConstants(config) },
    {
      path: "src/constants/features.ts",
      content: generateFeaturesConstants(config),
    },
    { path: "src/constants/brand.ts", content: generateBrandConstants(config) },
    {
      path: "src/constants/config.ts",
      content: generateAppConfigConstants(config),
    },
  ];
}

function getOptionalRoutes(): string[] {
  return [
    ...new Set(
      Object.values(SHIP_MODULES).flatMap((moduleDefinition) => {
        return moduleDefinition.routes ?? [];
      })
    ),
  ].sort();
}

function routeToFilePath(route: string): string {
  return `src/app${route}.tsx`;
}

function getRequiredRoutes(config: ShipConfig): Set<string> {
  const selectedModules = getModuleSet(config);
  const requiredRoutes = new Set<string>();

  for (const moduleId of selectedModules) {
    for (const route of SHIP_MODULES[moduleId].routes ?? []) {
      requiredRoutes.add(route);
    }
  }

  if (config.auth !== "anonymous") {
    requiredRoutes.add("/login");
  } else {
    requiredRoutes.delete("/login");
  }

  if (config.flows.onboarding) {
    requiredRoutes.add("/onboarding");
  } else {
    requiredRoutes.delete("/onboarding");
  }

  if (config.monetization === "revenuecat") {
    requiredRoutes.add("/(app)/premium");
  } else {
    requiredRoutes.delete("/(app)/premium");
  }

  return requiredRoutes;
}

function getRoutesToDelete(config: ShipConfig): string[] {
  const requiredRoutes = getRequiredRoutes(config);

  return getOptionalRoutes()
    .filter((route) => !requiredRoutes.has(route))
    .map(routeToFilePath)
    .filter((filePath) => existsSync(repoPath(filePath)));
}

function buildArtifacts(config: ShipConfig): FileWrite[] {
  const plan = buildProjectPlan(config);

  return [
    {
      path: "PROJECT_SUMMARY.md",
      content: createProjectSummary(plan),
    },
    {
      path: "REQUIRED_ENV.md",
      content: createEnvChecklist(plan),
    },
    {
      path: ".ship-rn-applied.json",
      content: createApplyMarker(config),
    },
  ];
}

function getConfigHash(config: ShipConfig): string {
  return createHash("sha256").update(JSON.stringify(config)).digest("hex");
}

function createApplyMarker(config: ShipConfig): string {
  return `${JSON.stringify(
    {
      generatedBy: "ship-rn apply",
      configHash: getConfigHash(config),
      appName: config.app.name,
      template: config.template,
      backend: config.backend,
      auth: config.auth,
      monetization: config.monetization,
      modules: config.modules,
    },
    null,
    2
  )}\n`;
}

function printList(label: string, values: readonly string[], emptyText: string): void {
  console.log(label);
  if (values.length === 0) {
    console.log(`  ${emptyText}`);
    return;
  }

  for (const value of values) {
    console.log(`  - ${value}`);
  }
}

function printApplyPlan(config: ShipConfig, routesToDelete: string[]): void {
  console.log("Ship RN apply plan");
  console.log(`  app: ${config.app.name}`);
  console.log(`  template: ${config.template}`);
  console.log(`  backend: ${config.backend}`);
  console.log(`  auth: ${config.auth}`);
  console.log(`  monetization: ${config.monetization}`);
  console.log("");
  printList("Constants to rewrite:", CONSTANT_FILES, "none");
  console.log("");
  printList("Route files to delete:", routesToDelete, "none");
  console.log("");
  printList("Artifacts to write:", ARTIFACT_FILES, "none");
  console.log("");
}

async function backupFiles(paths: string[]): Promise<Map<string, FileBackup>> {
  const backups = new Map<string, FileBackup>();

  for (const filePath of paths) {
    const absolutePath = repoPath(filePath);

    if (existsSync(absolutePath)) {
      backups.set(filePath, {
        existed: true,
        content: await readFile(absolutePath, "utf8"),
      });
    } else {
      backups.set(filePath, { existed: false });
    }
  }

  return backups;
}

async function restoreFiles(backups: Map<string, FileBackup>): Promise<void> {
  for (const [filePath, backup] of backups) {
    const absolutePath = repoPath(filePath);

    if (!backup.existed) {
      await rm(absolutePath, { force: true, recursive: true });
      continue;
    }

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, backup.content ?? "", "utf8");
  }
}

async function writeFiles(files: FileWrite[]): Promise<void> {
  for (const file of files) {
    const absolutePath = repoPath(file.path);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
  }
}

async function deleteFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    await rm(repoPath(filePath), { force: true });
  }
}

async function applyConfig(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const config = await loadShipConfig();
  const validation = validateShipConfig(config);

  if (validation.errors.length > 0) {
    console.error("Config validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  if (validation.warnings.length > 0) {
    console.warn("Config validation warnings:");
    for (const warning of validation.warnings) {
      console.warn(`  - ${warning}`);
    }
    console.warn("");
  }

  await assertCleanGitTree(options.force);

  const constants = buildConstants(config);
  const artifacts = buildArtifacts(config);
  const routesToDelete = getRoutesToDelete(config);
  const writes = [...constants, ...artifacts];

  printApplyPlan(config, routesToDelete);

  if (options.dryRun) {
    console.log("Dry run complete. No files were changed.");
    return;
  }

  const touchedPaths = [...writes.map((file) => file.path), ...routesToDelete];
  const backups = await backupFiles(touchedPaths);

  try {
    await writeFiles(writes);
    await deleteFiles(routesToDelete);
  } catch (error) {
    await restoreFiles(backups);
    throw error;
  }

  console.log("Applied ship.config.ts successfully.");
}

applyConfig().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

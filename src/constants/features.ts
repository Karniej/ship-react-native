/**
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
export const CURRENT_TEMPLATE: AppTemplate = "full-suite";

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
  if (CURRENT_TEMPLATE === "custom") return true;
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

  imageGeneration: {
    enabled: isEnabledByTemplate("imageGeneration"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  videoGeneration: {
    enabled: isEnabledByTemplate("videoGeneration"),
    premiumOnly: false,
    beta: true, // Mark as beta since video gen can be expensive
    comingSoon: false,
  },

  textToSpeech: {
    enabled: isEnabledByTemplate("textToSpeech"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  transcription: {
    enabled: isEnabledByTemplate("transcription"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  imageIdentification: {
    enabled: isEnabledByTemplate("imageIdentification"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  aiChat: {
    enabled: isEnabledByTemplate("aiChat"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  // ============================================================================
  // PROVIDER-SPECIFIC FEATURES
  // ============================================================================

  dalleProvider: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  replicateProvider: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  imageToImage: {
    enabled: true,
    premiumOnly: false,
    beta: true,
    comingSoon: false,
  },

  videoStartEndFrames: {
    enabled: true,
    premiumOnly: false,
    beta: true,
    comingSoon: false,
  },

  // ============================================================================
  // APP FEATURES
  // ============================================================================

  gallery: {
    // Gallery is only useful when content-generating features are enabled
    enabled: isEnabledByTemplate("imageGeneration") || isEnabledByTemplate("videoGeneration"),
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  analytics: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  onboarding: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  pushNotifications: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  offlineMode: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  darkMode: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  auth: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

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
    required: false,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  // ============================================================================
  // MONETIZATION
  // ============================================================================

  premiumSubscription: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },

  creditSystem: {
    enabled: true,
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },
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

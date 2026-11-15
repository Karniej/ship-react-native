/**
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
  name: "ShipReactNative",

  /** Short tagline for your app */
  tagline: "Create with AI",

  /** App description for about/marketing sections */
  description: "Generate images, videos, and audio with the power of AI",

  // ============================================================================
  // PRIMARY COLORS
  // ============================================================================
  // These are the main colors used throughout your app.
  // Update these to match your brand.

  colors: {
    /** Main brand color - used for buttons, links, active states */
    primary: "#007AFF",

    /** Lighter variant - used for backgrounds, hover states */
    primaryLight: "#4DA3FF",

    /** Darker variant - used for pressed states, emphasis */
    primaryDark: "#0055CC",

    /** Secondary brand color - used for accents, secondary actions */
    secondary: "#5856D6",

    /** Accent color - used for highlights, badges, special elements */
    accent: "#FF9500",

    /** Success color - used for positive feedback */
    success: "#34C759",

    /** Error color - used for errors, destructive actions */
    error: "#FF3B30",

    /** Warning color - used for warnings, cautions */
    warning: "#FF9500",
  },

  // ============================================================================
  // FONT
  // ============================================================================
  // Font family — change this to customize the app's typography
  // Options: "Inter", "Poppins", "SpaceGrotesk", "DMSans", "Outfit", "Montserrat"
  // Make sure to also install the corresponding @expo-google-fonts package
  font: "Inter",

  // ============================================================================
  // GRADIENT PRESETS
  // ============================================================================
  // Pre-defined gradients for buttons, headers, and special elements

  gradients: {
    /** Primary gradient - for main CTAs and headers */
    primary: ["#007AFF", "#0055CC"] as [string, string],

    /** Premium gradient - for upgrade buttons and premium features */
    premium: ["#007AFF", "#FF9500"] as [string, string],

    /** Success gradient - for completion states */
    success: ["#34C759", "#30D158"] as [string, string],

    /** Onboarding gradient - for onboarding screens */
    onboarding: ["#007AFF", "#4DA3FF"] as [string, string],
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
    support: "support@example.com",
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
    twitter: "https://twitter.com/example",
  },
} as const;

// Type exports for TypeScript support
export type BrandColors = typeof BRAND.colors;
export type BrandGradients = typeof BRAND.gradients;
export type FeatureColors = typeof BRAND.featureColors;

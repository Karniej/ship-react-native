import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "Premium Studio",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "it"],
  },
  branding: {
    name: "Premium Studio",
    tagline: "Premium AI tools",
    description: "A hard-paywalled full-suite AI creator app without onboarding",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  template: "full-suite",
  backend: "convex",
  auth: "required",
  monetization: "revenuecat",
  flows: {
    onboarding: false,
    hardPaywall: true,
  },
  modules: [
    "auth",
    "subscriptions",
    "credits",
    "gallery",
    "analytics",
    "notifications",
    "image-generation",
    "video-generation",
    "text-to-speech",
    "transcription",
    "image-identification",
    "ai-chat",
  ],
});

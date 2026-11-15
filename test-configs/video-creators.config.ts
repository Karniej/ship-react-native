import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "Creator Clips",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "it"],
  },
  branding: {
    name: "Creator Clips",
    tagline: "Generate videos fast",
    description: "Create AI clips and short-form videos for social channels",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  template: "video-generation",
  backend: "convex",
  auth: "optional",
  monetization: "revenuecat",
  flows: {
    onboarding: true,
    hardPaywall: true,
  },
  modules: [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "gallery",
    "analytics",
    "video-generation",
  ],
});

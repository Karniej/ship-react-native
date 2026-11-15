import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "Image Studio",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "it"],
  },
  branding: {
    name: "Image Studio",
    tagline: "Create AI art",
    description: "Generate images, avatars, and visual concepts with AI",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  template: "image-generation",
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
    "image-generation",
    "image-identification",
  ],
});

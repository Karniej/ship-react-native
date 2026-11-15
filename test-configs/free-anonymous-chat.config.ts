import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "Open Chat",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en"],
  },
  branding: {
    name: "Open Chat",
    tagline: "Ask without signing in",
    description: "A lightweight anonymous AI chat app with no subscription",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  template: "custom",
  backend: "expo-api-routes",
  auth: "anonymous",
  monetization: "none",
  flows: {
    onboarding: true,
    hardPaywall: false,
  },
  modules: ["ai-chat", "onboarding"],
});

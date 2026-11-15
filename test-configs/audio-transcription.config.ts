import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "Transcript Notes",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "it"],
  },
  branding: {
    name: "Transcript Notes",
    tagline: "Capture every word",
    description: "Transcribe meetings, interviews, and voice notes with AI",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  template: "audio-transcription",
  backend: "convex",
  auth: "optional",
  monetization: "revenuecat",
  flows: {
    onboarding: true,
    hardPaywall: true,
  },
  modules: ["auth", "subscriptions", "credits", "onboarding", "analytics", "transcription"],
});

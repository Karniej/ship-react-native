import { createShipConfig } from "@ship-rn/system";

export default createShipConfig({
  app: {
    name: "ShipReactNative",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "it"],
  },
  branding: {
    name: "ShipReactNative",
    tagline: "Create with AI",
    description: "Generate images, videos, and audio with the power of AI",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
});

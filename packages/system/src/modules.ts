export type ApiMode = "convex" | "expo-api-routes";

export type ShipModuleCategory = "core" | "auth" | "monetization" | "ai" | "product" | "growth";

export type ShipModuleId =
  | "auth"
  | "subscriptions"
  | "credits"
  | "onboarding"
  | "gallery"
  | "analytics"
  | "notifications"
  | "image-generation"
  | "video-generation"
  | "text-to-speech"
  | "transcription"
  | "image-identification"
  | "ai-chat";

export interface ShipModuleDefinition {
  id: ShipModuleId;
  name: string;
  category: ShipModuleCategory;
  description: string;
  supportedBackends: ApiMode[];
  requires?: ShipModuleId[];
  recommends?: ShipModuleId[];
  envVars?: string[];
  routes?: string[];
  featureFlags?: string[];
  limitations?: string[];
}

export const SHIP_MODULES: Record<ShipModuleId, ShipModuleDefinition> = {
  auth: {
    id: "auth",
    name: "Authentication",
    category: "auth",
    description: "User auth flows and account state.",
    supportedBackends: ["convex", "expo-api-routes"],
    routes: ["/login"],
    featureFlags: ["socialAuth"],
    limitations: ["Expo API Routes mode currently has less complete auth support than Convex."],
  },
  subscriptions: {
    id: "subscriptions",
    name: "Subscriptions",
    category: "monetization",
    description: "RevenueCat-backed subscription gating and paywall flows.",
    supportedBackends: ["convex", "expo-api-routes"],
    requires: ["auth"],
    envVars: ["EXPO_PUBLIC_REVENUECAT_IOS_KEY", "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY"],
    routes: ["/(app)/premium"],
    featureFlags: ["premiumSubscription"],
  },
  credits: {
    id: "credits",
    name: "Credit System",
    category: "monetization",
    description: "Usage-based credits for paid or limited AI features.",
    supportedBackends: ["convex", "expo-api-routes"],
    requires: ["subscriptions"],
    featureFlags: ["creditSystem"],
    limitations: ["Convex is the recommended backend when you need server-enforced credits."],
  },
  onboarding: {
    id: "onboarding",
    name: "Onboarding",
    category: "product",
    description: "Intro, education, and first-run flow.",
    supportedBackends: ["convex", "expo-api-routes"],
    routes: ["/onboarding"],
    featureFlags: ["onboarding"],
  },
  gallery: {
    id: "gallery",
    name: "Gallery",
    category: "product",
    description: "History and browsing for generated media.",
    supportedBackends: ["convex", "expo-api-routes"],
    routes: ["/(app)/(tabs)/gallery", "/(app)/generations"],
    featureFlags: ["gallery"],
    limitations: ["Persistent generation history is strongest in Convex mode."],
  },
  analytics: {
    id: "analytics",
    name: "Analytics",
    category: "growth",
    description: "PostHog analytics and product visibility.",
    supportedBackends: ["convex", "expo-api-routes"],
    envVars: ["EXPO_PUBLIC_POSTHOG_API_KEY", "EXPO_PUBLIC_POSTHOG_HOST"],
    routes: ["/(app)/analytics"],
    featureFlags: ["analytics"],
  },
  notifications: {
    id: "notifications",
    name: "Notifications",
    category: "growth",
    description: "Push and local notification scaffolding.",
    supportedBackends: ["convex", "expo-api-routes"],
    featureFlags: ["pushNotifications"],
  },
  "image-generation": {
    id: "image-generation",
    name: "Image Generation",
    category: "ai",
    description: "Generate images from prompts and optional references.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["OPENAI_API_KEY", "REPLICATE_API_TOKEN"],
    routes: ["/(app)/generate"],
    featureFlags: ["imageGeneration", "dalleProvider", "replicateProvider", "imageToImage"],
  },
  "video-generation": {
    id: "video-generation",
    name: "Video Generation",
    category: "ai",
    description: "Generate videos from prompts or source media.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["REPLICATE_API_TOKEN"],
    routes: ["/(app)/video-generation"],
    featureFlags: ["videoGeneration", "videoStartEndFrames"],
  },
  "text-to-speech": {
    id: "text-to-speech",
    name: "Text To Speech",
    category: "ai",
    description: "Generate spoken audio from text.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["ELEVENLABS_API_KEY"],
    routes: ["/(app)/speech"],
    featureFlags: ["textToSpeech"],
  },
  transcription: {
    id: "transcription",
    name: "Transcription",
    category: "ai",
    description: "Convert speech to text.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["OPENAI_API_KEY"],
    routes: ["/(app)/transcription"],
    featureFlags: ["transcription"],
  },
  "image-identification": {
    id: "image-identification",
    name: "Image Identification",
    category: "ai",
    description: "Analyze images with vision-capable models.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["OPENAI_API_KEY"],
    routes: ["/(app)/image-identify"],
    featureFlags: ["imageIdentification"],
  },
  "ai-chat": {
    id: "ai-chat",
    name: "AI Chat",
    category: "ai",
    description: "Conversational assistant and chat flows.",
    supportedBackends: ["convex", "expo-api-routes"],
    recommends: ["credits"],
    envVars: ["OPENAI_API_KEY"],
    routes: ["/(app)/chat"],
    featureFlags: ["aiChat"],
  },
};

export const DEFAULT_TEMPLATE_MODULES: Record<string, ShipModuleId[]> = {
  "image-generation": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "gallery",
    "analytics",
    "image-generation",
    "image-identification",
  ],
  "video-generation": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "gallery",
    "analytics",
    "video-generation",
  ],
  "image-video": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "gallery",
    "analytics",
    "image-generation",
    "video-generation",
    "image-identification",
  ],
  "audio-generation": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "analytics",
    "text-to-speech",
  ],
  "audio-transcription": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "analytics",
    "transcription",
  ],
  "audio-full": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
    "analytics",
    "text-to-speech",
    "transcription",
  ],
  "full-suite": [
    "auth",
    "subscriptions",
    "credits",
    "onboarding",
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
  custom: [],
};

export function getShipModule(id: ShipModuleId): ShipModuleDefinition {
  return SHIP_MODULES[id];
}

export function listShipModules(): ShipModuleDefinition[] {
  return Object.values(SHIP_MODULES);
}

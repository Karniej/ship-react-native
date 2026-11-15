import { DEFAULT_TEMPLATE_MODULES, SHIP_MODULES, type ApiMode, type ShipModuleId } from "./modules";

export type AppTemplate =
  | "image-generation"
  | "video-generation"
  | "image-video"
  | "audio-generation"
  | "audio-transcription"
  | "audio-full"
  | "full-suite"
  | "custom";

export type ShipMonetizationMode = "revenuecat" | "none";
export type ShipAuthMode = "required" | "optional" | "anonymous";

export interface ShipBrandingConfig {
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface ShipAppConfig {
  name: string;
  version: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  defaultLocale: string;
  supportedLocales: string[];
}

export interface ShipFlowConfig {
  onboarding: boolean;
  hardPaywall: boolean;
}

export interface ShipConfig {
  app: ShipAppConfig;
  backend: ApiMode;
  template: AppTemplate;
  auth: ShipAuthMode;
  monetization: ShipMonetizationMode;
  branding: ShipBrandingConfig;
  flows: ShipFlowConfig;
  modules: ShipModuleId[];
}

export interface ShipConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type ShipConfigOverrides = Partial<
  Omit<ShipConfig, "app" | "branding" | "flows" | "modules">
> & {
  app?: Partial<ShipAppConfig>;
  branding?: Partial<ShipBrandingConfig>;
  flows?: Partial<ShipFlowConfig>;
  modules?: ShipModuleId[];
};

export const DEFAULT_SHIP_CONFIG: ShipConfig = {
  app: {
    name: "Ship RN App",
    version: "1.0.0",
    supportEmail: "support@example.com",
    privacyPolicyUrl: "https://example.com/privacy",
    termsUrl: "https://example.com/terms",
    defaultLocale: "en",
    supportedLocales: ["en"],
  },
  backend: "convex",
  template: "full-suite",
  auth: "optional",
  monetization: "revenuecat",
  branding: {
    name: "Ship RN App",
    tagline: "Create with AI",
    description: "A production-ready mobile app built with Ship RN.",
    primaryColor: "#007AFF",
    secondaryColor: "#5856D6",
    accentColor: "#FF9500",
    fontFamily: "Inter",
  },
  flows: {
    onboarding: true,
    hardPaywall: true,
  },
  modules: [...DEFAULT_TEMPLATE_MODULES["full-suite"]],
};

export function createShipConfig(overrides: ShipConfigOverrides = {}): ShipConfig {
  const modules = overrides.modules
    ? [...overrides.modules]
    : overrides.template
      ? getTemplateModules(overrides.template)
      : [...DEFAULT_SHIP_CONFIG.modules];
  const monetization = overrides.monetization ?? DEFAULT_SHIP_CONFIG.monetization;
  const flows: ShipFlowConfig = {
    onboarding: modules.includes("onboarding"),
    hardPaywall: monetization === "revenuecat" && modules.includes("subscriptions"),
    ...overrides.flows,
  };

  return {
    ...DEFAULT_SHIP_CONFIG,
    ...overrides,
    app: {
      ...DEFAULT_SHIP_CONFIG.app,
      ...overrides.app,
    },
    branding: {
      ...DEFAULT_SHIP_CONFIG.branding,
      ...overrides.branding,
    },
    flows,
    modules,
  };
}

export function getTemplateModules(template: AppTemplate): ShipModuleId[] {
  return [...DEFAULT_TEMPLATE_MODULES[template]];
}

export function validateShipConfig(config: ShipConfig): ShipConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const selected = new Set(config.modules);

  for (const moduleId of config.modules) {
    const moduleDef = SHIP_MODULES[moduleId];

    if (!moduleDef) {
      errors.push(`Unknown module: ${moduleId}`);
      continue;
    }

    if (!moduleDef.supportedBackends.includes(config.backend)) {
      errors.push(`${moduleId} does not support backend mode '${config.backend}'`);
    }

    for (const dependency of moduleDef.requires ?? []) {
      if (!selected.has(dependency)) {
        errors.push(`${moduleId} requires ${dependency}`);
      }
    }

    for (const recommendation of moduleDef.recommends ?? []) {
      if (!selected.has(recommendation)) {
        warnings.push(`${moduleId}: works best with ${recommendation} (recommended)`);
      }
    }

    if (config.backend === "expo-api-routes") {
      for (const limitation of moduleDef.limitations ?? []) {
        warnings.push(`${moduleId}: ${limitation}`);
      }
    }
  }

  if (config.monetization === "revenuecat" && !selected.has("subscriptions")) {
    errors.push("RevenueCat monetization requires the subscriptions module");
  }

  if (config.auth === "required" && !selected.has("auth")) {
    errors.push("required auth mode needs the auth module");
  }

  if (config.flows.onboarding && !selected.has("onboarding")) {
    errors.push("onboarding flow requires the onboarding module");
  }

  if (config.flows.hardPaywall && config.monetization !== "revenuecat") {
    errors.push("hardPaywall flow requires revenuecat monetization");
  }

  if (config.flows.hardPaywall && !selected.has("subscriptions")) {
    errors.push("hardPaywall flow requires the subscriptions module");
  }

  if (config.backend === "expo-api-routes" && selected.has("auth")) {
    warnings.push(
      "Expo API Routes mode is supported, but auth-heavy products are currently stronger in Convex mode."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getRecommendedBackend(modules: ShipModuleId[]): ApiMode {
  const needsFullBackend = modules.some((moduleId) => {
    return moduleId === "auth" || moduleId === "credits" || moduleId === "gallery";
  });

  return needsFullBackend ? "convex" : "expo-api-routes";
}

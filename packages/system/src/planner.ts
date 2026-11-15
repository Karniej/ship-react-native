import {
  createShipConfig,
  getRecommendedBackend,
  getTemplateModules,
  type AppTemplate,
  type ShipAuthMode,
  type ShipConfig,
  type ShipMonetizationMode,
} from "./config";
import {
  SHIP_MODULES,
  listShipModules,
  type ApiMode,
  type ShipModuleDefinition,
  type ShipModuleId,
} from "./modules";

export interface PromptInferenceResult {
  appName: string;
  template: AppTemplate;
  auth: ShipAuthMode;
  monetization: ShipMonetizationMode;
  modules: ShipModuleId[];
  backend: ShipConfig["backend"];
  reasoning: string[];
  confidence: "low" | "medium" | "high";
  matchedSignals: string[];
}

export interface ShipProjectPlan {
  config: ShipConfig;
  moduleDefinitions: ShipModuleDefinition[];
  requiredEnvVars: string[];
  requiredRoutes: string[];
  backendReason: string;
  configJson: string;
  shipConfigSource: string;
  outputFiles: Array<{
    path: string;
    status: "create" | "update" | "prune";
    reason: string;
  }>;
  assemblySteps: string[];
}

const MODULE_SIGNALS: Array<{
  id: ShipModuleId;
  patterns: RegExp[];
  note: string;
}> = [
  {
    id: "image-generation",
    patterns: [/image/, /photo/, /avatar/, /art/, /picture/],
    note: "Detected image generation intent.",
  },
  {
    id: "video-generation",
    patterns: [/video/, /animation/, /clip/, /reel/],
    note: "Detected video generation intent.",
  },
  {
    id: "text-to-speech",
    patterns: [/text to speech/, /tts/, /voice/, /narration/, /voiceover/],
    note: "Detected text-to-speech intent.",
  },
  {
    id: "transcription",
    patterns: [/transcription/, /transcribe/, /speech to text/, /meeting notes/, /voice notes/],
    note: "Detected transcription intent.",
  },
  {
    id: "image-identification",
    patterns: [/vision/, /identify/, /ocr/, /scan image/, /analyze image/],
    note: "Detected image analysis intent.",
  },
  {
    id: "ai-chat",
    patterns: [/chat/, /assistant/, /copilot/, /conversation/, /agent/],
    note: "Detected chat assistant intent.",
  },
  {
    id: "gallery",
    patterns: [/gallery/, /history/, /saved/, /library/],
    note: "Detected generation history intent.",
  },
  {
    id: "analytics",
    patterns: [/analytics/, /events/, /funnel/, /tracking/, /insights/],
    note: "Detected analytics intent.",
  },
  {
    id: "notifications",
    patterns: [/notification/, /reminder/, /push/],
    note: "Detected notification intent.",
  },
  {
    id: "credits",
    patterns: [/credit/, /usage based/, /metered/],
    note: "Detected credits/usage intent.",
  },
  {
    id: "auth",
    patterns: [/login/, /sign in/, /account/, /user profile/, /member/],
    note: "Detected account/auth intent.",
  },
];

function getOutputFiles(config: ShipConfig, modules: ShipModuleDefinition[]) {
  const files: ShipProjectPlan["outputFiles"] = [
    {
      path: "ship.config.ts",
      status: "create",
      reason: "Primary generated manifest for the assembled project.",
    },
    {
      path: "src/constants/api.ts",
      status: "update",
      reason: "Runtime backend selection should derive from the generated config.",
    },
    {
      path: "src/constants/features.ts",
      status: "update",
      reason: "Feature flags should align with selected modules and template.",
    },
    {
      path: "src/constants/brand.ts",
      status: "update",
      reason: "Branding should reflect the generated app identity.",
    },
  ];

  for (const module of modules) {
    for (const route of module.routes ?? []) {
      files.push({
        path: `src/app${route}.tsx`,
        status: "update",
        reason: `Route retained because the '${module.id}' module is selected.`,
      });
    }
  }

  return files;
}

function getAssemblySteps(config: ShipConfig, modules: ShipModuleDefinition[]): string[] {
  return [
    "Start from the stable Ship React Native boilerplate baseline.",
    `Write ship.config.ts for the '${config.app.name}' project.`,
    `Enable ${modules.length} selected modules and validate dependencies.`,
    `Configure backend mode as '${config.backend}'.`,
    `Set monetization mode to '${config.monetization}'.`,
    "Update branding, onboarding, and paywall defaults from the generated config.",
    "Prepare environment variable checklist for the selected modules.",
    "Prune or hide routes that are not part of the selected module set.",
  ];
}

export function generateShipConfigSource(config: ShipConfig): string {
  return `import type { ShipConfig } from "@ship-rn/system";

export const shipConfig: ShipConfig = ${JSON.stringify(config, null, 2)};

export default shipConfig;
`;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function deriveAppNameFromPrompt(prompt: string): string {
  const quoted = prompt.match(/called\s+([A-Za-z0-9\s]+)/i);
  if (quoted?.[1]) return titleCase(quoted[1].trim().split(/\s+/).slice(0, 4).join(" "));

  const cleaned = prompt
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\b(build|create|make|an|a|app|with|that|for|the)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Ship RN App";

  return titleCase(cleaned.split(" ").slice(0, 4).join(" "));
}

function inferTemplateFromModules(modules: Set<ShipModuleId>): AppTemplate {
  const hasImage = modules.has("image-generation") || modules.has("image-identification");
  const hasVideo = modules.has("video-generation");
  const hasTts = modules.has("text-to-speech");
  const hasTranscription = modules.has("transcription");
  const hasChat = modules.has("ai-chat");

  if ((hasImage || hasChat) && hasVideo && (hasTts || hasTranscription)) return "full-suite";
  if (hasImage && hasVideo) return "image-video";
  if (hasTts && hasTranscription) return "audio-full";
  if (hasImage) return "image-generation";
  if (hasVideo) return "video-generation";
  if (hasTts) return "audio-generation";
  if (hasTranscription) return "audio-transcription";
  if (hasChat) return "custom";

  return "full-suite";
}

function inferAuth(prompt: string, matchedSignals: string[]): ShipAuthMode {
  const text = prompt.toLowerCase();

  if (/no login|without login|guest|anonymous|public/.test(text)) {
    matchedSignals.push("Auth: anonymous/public wording detected.");
    return "anonymous";
  }
  if (
    /required login|must sign in|account required|private members|team app|workspace/.test(text)
  ) {
    matchedSignals.push("Auth: required/private/team wording detected.");
    return "required";
  }
  return "optional";
}

function inferMonetization(prompt: string, matchedSignals: string[]): ShipMonetizationMode {
  const text = prompt.toLowerCase();

  if (/free|no paywall|no subscription|open source|free forever/.test(text)) {
    matchedSignals.push("Monetization: free/no-paywall wording detected.");
    return "none";
  }
  if (/subscription|paywall|premium|credits|weekly|yearly|monthly|paid/.test(text)) {
    matchedSignals.push("Monetization: subscription/premium wording detected.");
    return "revenuecat";
  }
  return "revenuecat";
}

function inferBackend(prompt: string, modules: ShipModuleId[], matchedSignals: string[]): ApiMode {
  const text = prompt.toLowerCase();

  if (/convex|realtime|database|persist|history|credits/.test(text)) {
    matchedSignals.push("Backend: Convex-oriented wording detected.");
    return "convex";
  }
  if (/api routes|lightweight backend|proxy only|simple proxy/.test(text)) {
    matchedSignals.push("Backend: Expo API Routes wording detected.");
    return "expo-api-routes";
  }
  return getRecommendedBackend(modules);
}

function inferModules(
  prompt: string,
  auth: ShipAuthMode,
  monetization: ShipMonetizationMode,
  matchedSignals: string[]
): ShipModuleId[] {
  const text = prompt.toLowerCase();
  const modules = new Set<ShipModuleId>();

  if (!/no onboarding|without onboarding|skip onboarding/.test(text)) {
    modules.add("onboarding");
  }

  for (const signal of MODULE_SIGNALS) {
    if (signal.patterns.some((pattern) => pattern.test(text))) {
      modules.add(signal.id);
      matchedSignals.push(signal.note);
    }
  }

  if (monetization === "revenuecat") {
    modules.add("subscriptions");
  }

  if (auth === "anonymous") {
    modules.delete("auth");
  }

  if (modules.size === 1 && modules.has("onboarding")) {
    for (const moduleId of getTemplateModules("full-suite")) {
      modules.add(moduleId);
    }
  }

  return [...modules];
}

function addDependencies(modules: ShipModuleId[]): ShipModuleId[] {
  const resolved = new Set<ShipModuleId>(modules);
  let changed = true;

  while (changed) {
    changed = false;
    for (const moduleId of [...resolved]) {
      for (const dependency of SHIP_MODULES[moduleId].requires ?? []) {
        if (!resolved.has(dependency)) {
          resolved.add(dependency);
          changed = true;
        }
      }
    }
  }

  return [...resolved];
}

function getConfidence(signalCount: number): PromptInferenceResult["confidence"] {
  if (signalCount >= 5) return "high";
  if (signalCount >= 3) return "medium";
  return "low";
}

export function inferConfigFromPrompt(prompt: string): PromptInferenceResult {
  const matchedSignals: string[] = [];
  const auth = inferAuth(prompt, matchedSignals);
  const signalCountBeforeMonetization = matchedSignals.length;
  const monetization = inferMonetization(prompt, matchedSignals);
  const monetizationDefaulted =
    monetization === "revenuecat" && matchedSignals.length === signalCountBeforeMonetization;
  const initialModules = inferModules(prompt, auth, monetization, matchedSignals);
  const modules = addDependencies(initialModules);
  const template = inferTemplateFromModules(new Set(modules));
  const backend = inferBackend(prompt, modules, matchedSignals);
  const confidence = getConfidence(matchedSignals.length);
  const reasoning: string[] = [
    `Template inferred as '${template}' from the app brief and matched modules.`,
    `Auth mode inferred as '${auth}'.`,
    monetizationDefaulted
      ? "Monetization defaulted to revenuecat (no explicit signal)."
      : `Monetization inferred as '${monetization}'.`,
    `Recommended backend is '${backend}' based on the selected modules and explicit backend signals.`,
    `Inference confidence is '${confidence}'.`,
  ];

  return {
    appName: deriveAppNameFromPrompt(prompt),
    template,
    auth,
    monetization,
    modules,
    backend,
    reasoning,
    confidence,
    matchedSignals,
  };
}

export function buildProjectPlan(config: ShipConfig): ShipProjectPlan {
  const moduleDefinitions = config.modules.map((moduleId) => {
    const moduleDefinition = SHIP_MODULES[moduleId];
    if (!moduleDefinition) {
      throw new Error(`Unknown module in project plan: ${moduleId}`);
    }
    return moduleDefinition;
  });
  const requiredEnvVars = [
    ...new Set(moduleDefinitions.flatMap((moduleDef) => moduleDef.envVars ?? [])),
  ].sort();
  const requiredRoutes = [
    ...new Set(moduleDefinitions.flatMap((moduleDef) => moduleDef.routes ?? [])),
  ].sort();
  const backendReason =
    config.backend === "convex"
      ? "Convex is recommended because the selected modules benefit from stronger auth, credits, persistence, or generation history."
      : "Expo API Routes is sufficient because the selected modules are closer to lightweight server-side AI proxying.";

  return {
    config,
    moduleDefinitions,
    requiredEnvVars,
    requiredRoutes,
    backendReason,
    configJson: JSON.stringify(config, null, 2),
    shipConfigSource: generateShipConfigSource(config),
    outputFiles: getOutputFiles(config, moduleDefinitions),
    assemblySteps: getAssemblySteps(config, moduleDefinitions),
  };
}

export function createPlanFromPrompt(prompt: string): ShipProjectPlan {
  const inferred = inferConfigFromPrompt(prompt);
  return createPlanFromInference(inferred);
}

export function createPlanFromInference(inferred: PromptInferenceResult): ShipProjectPlan {
  const config = createShipConfig({
    app: {
      name: inferred.appName,
      supportEmail: "support@example.com",
      privacyPolicyUrl: "https://example.com/privacy",
      termsUrl: "https://example.com/terms",
    },
    branding: {
      name: inferred.appName,
      description: `${inferred.appName} generated from Ship RN Studio.`,
    },
    template: inferred.template,
    auth: inferred.auth,
    monetization: inferred.monetization,
    backend: inferred.backend,
    modules: inferred.modules,
    flows: {
      onboarding: inferred.modules.includes("onboarding"),
      hardPaywall:
        inferred.monetization === "revenuecat" && inferred.modules.includes("subscriptions"),
    },
  });

  return buildProjectPlan(config);
}

export function getPromptSuggestions(): string[] {
  return [
    "Build an AI avatar app with subscriptions, gallery, and image analysis.",
    "Create a voice note transcription app with optional login and weekly subscriptions.",
    "Make a simple anonymous AI chat app with no subscription.",
    "Build a video generator for creators with credits, onboarding, and premium plans.",
  ];
}

export function getAvailableModuleIds(): ShipModuleId[] {
  return listShipModules().map((moduleDef) => moduleDef.id);
}

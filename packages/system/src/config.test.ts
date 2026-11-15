import { describe, expect, it } from "vitest";

import { createAssembledProjectPackage } from "./assembler";
import {
  createShipConfig,
  getTemplateModules,
  validateShipConfig,
  type ShipConfig,
} from "./config";
import {
  buildProjectPlan,
  createPlanFromPrompt,
  generateShipConfigSource,
  getPromptSuggestions,
  inferConfigFromPrompt,
} from "./planner";
import type { ShipModuleId } from "./modules";

describe("validateShipConfig", () => {
  it("accepts the default full-suite config", () => {
    const result = validateShipConfig(createShipConfig());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports unknown modules", () => {
    const config = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      modules: ["missing-module" as ShipModuleId],
    });

    expect(validateShipConfig(config).errors).toContain("Unknown module: missing-module");
  });

  it("reports modules that do not support the selected backend", () => {
    const config = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      backend: "unsupported" as ShipConfig["backend"],
      modules: ["onboarding"],
    });

    expect(validateShipConfig(config).errors).toContain(
      "onboarding does not support backend mode 'unsupported'"
    );
  });

  it("reports missing hard module dependencies", () => {
    const subscriptionsOnly = createShipConfig({
      auth: "optional",
      modules: ["subscriptions"],
    });
    const creditsOnly = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      modules: ["credits"],
    });

    expect(validateShipConfig(subscriptionsOnly).errors).toContain("subscriptions requires auth");
    expect(validateShipConfig(creditsOnly).errors).toContain("credits requires subscriptions");
    expect(
      validateShipConfig(creditsOnly).errors.filter(
        (error) => error === "credits requires subscriptions"
      )
    ).toHaveLength(1);
  });

  it("derives modules when only a template override is provided", () => {
    const config = createShipConfig({ template: "audio-transcription" });

    expect(config.modules).toEqual(getTemplateModules("audio-transcription"));
  });

  it("warns when recommended modules are missing", () => {
    const config = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      modules: ["ai-chat"],
    });
    const result = validateShipConfig(config);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("ai-chat: works best with credits (recommended)");
  });

  it("requires subscriptions for RevenueCat monetization", () => {
    const config = createShipConfig({
      monetization: "revenuecat",
      modules: ["auth"],
    });

    expect(validateShipConfig(config).errors).toContain(
      "RevenueCat monetization requires the subscriptions module"
    );
  });

  it("requires the auth module for required auth mode", () => {
    const config = createShipConfig({
      auth: "required",
      monetization: "none",
      modules: ["onboarding"],
    });

    expect(validateShipConfig(config).errors).toContain("required auth mode needs the auth module");
  });

  it("reports flow settings that do not have backing modules", () => {
    const config = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      modules: ["ai-chat"],
      flows: {
        onboarding: true,
        hardPaywall: true,
      },
    });
    const result = validateShipConfig(config);

    expect(result.errors).toContain("onboarding flow requires the onboarding module");
    expect(result.errors).toContain("hardPaywall flow requires revenuecat monetization");
    expect(result.errors).toContain("hardPaywall flow requires the subscriptions module");
  });

  it("warns about Expo API Routes limitations", () => {
    const config = createShipConfig({
      backend: "expo-api-routes",
      auth: "required",
      monetization: "revenuecat",
      modules: ["auth", "subscriptions", "credits", "gallery"],
    });
    const result = validateShipConfig(config);

    expect(result.warnings).toContain(
      "auth: Expo API Routes mode currently has less complete auth support than Convex."
    );
    expect(result.warnings).toContain(
      "credits: Convex is the recommended backend when you need server-enforced credits."
    );
    expect(result.warnings).toContain(
      "gallery: Persistent generation history is strongest in Convex mode."
    );
    expect(result.warnings).toContain(
      "Expo API Routes mode is supported, but auth-heavy products are currently stronger in Convex mode."
    );
  });
});

describe("createPlanFromPrompt", () => {
  it("does not auto-add recommended credits for a free anonymous AI chat app", () => {
    const plan = createPlanFromPrompt("Make a simple anonymous AI chat app with no subscription.");

    expect(plan.config.auth).toBe("anonymous");
    expect(plan.config.monetization).toBe("none");
    expect(plan.config.modules).toContain("ai-chat");
    expect(plan.config.modules).not.toContain("credits");
    expect(plan.config.modules).not.toContain("subscriptions");
    expect(validateShipConfig(plan.config).valid).toBe(true);
  });
});

describe("buildProjectPlan", () => {
  it("fails clearly when runtime input contains an unknown module", () => {
    const config = createShipConfig({
      auth: "anonymous",
      monetization: "none",
      modules: ["missing-module" as ShipModuleId],
    });

    expect(() => buildProjectPlan(config)).toThrow(
      "Unknown module in project plan: missing-module"
    );
  });

  it("never emits a slug with a trailing hyphen after truncation", () => {
    const config = createShipConfig({
      app: { name: `${"a".repeat(59)} long-name` },
    });
    const assembled = createAssembledProjectPackage(buildProjectPlan(config));

    expect(assembled.slug.length).toBeLessThanOrEqual(60);
    expect(assembled.slug).not.toMatch(/-$/);
  });
});

describe("generateShipConfigSource", () => {
  it("emits a package import and stable config source", () => {
    const source = generateShipConfigSource(
      createShipConfig({
        app: {
          name: "Snapshot App",
          version: "1.0.0",
          supportEmail: "support@example.com",
          privacyPolicyUrl: "https://example.com/privacy",
          termsUrl: "https://example.com/terms",
          defaultLocale: "en",
          supportedLocales: ["en"],
        },
        auth: "anonymous",
        monetization: "none",
        modules: ["onboarding", "ai-chat"],
      })
    );

    expect(source).toMatchInlineSnapshot(`
      "import type { ShipConfig } from "@ship-rn/system";

      export const shipConfig: ShipConfig = {
        "app": {
          "name": "Snapshot App",
          "version": "1.0.0",
          "supportEmail": "support@example.com",
          "privacyPolicyUrl": "https://example.com/privacy",
          "termsUrl": "https://example.com/terms",
          "defaultLocale": "en",
          "supportedLocales": [
            "en"
          ]
        },
        "backend": "convex",
        "template": "full-suite",
        "auth": "anonymous",
        "monetization": "none",
        "branding": {
          "name": "Ship RN App",
          "tagline": "Create with AI",
          "description": "A production-ready mobile app built with Ship RN.",
          "primaryColor": "#007AFF",
          "secondaryColor": "#5856D6",
          "accentColor": "#FF9500",
          "fontFamily": "Inter"
        },
        "flows": {
          "onboarding": true,
          "hardPaywall": false
        },
        "modules": [
          "onboarding",
          "ai-chat"
        ]
      };

      export default shipConfig;
      "
    `);
  });
});

describe("inferConfigFromPrompt", () => {
  const cases: Array<{
    prompt: string;
    auth: ShipConfig["auth"];
    monetization: ShipConfig["monetization"];
    backend: ShipConfig["backend"];
    modules: ShipModuleId[];
    excludedModules?: ShipModuleId[];
  }> = [
    {
      prompt: getPromptSuggestions()[0],
      auth: "optional",
      monetization: "revenuecat",
      backend: "convex",
      modules: ["image-generation", "gallery", "subscriptions", "auth"],
    },
    {
      prompt: getPromptSuggestions()[1],
      auth: "optional",
      monetization: "revenuecat",
      backend: "convex",
      modules: ["transcription", "subscriptions", "auth"],
    },
    {
      prompt: getPromptSuggestions()[2],
      auth: "anonymous",
      monetization: "none",
      backend: "expo-api-routes",
      modules: ["ai-chat", "onboarding"],
      excludedModules: ["credits", "subscriptions", "auth"],
    },
    {
      prompt: getPromptSuggestions()[3],
      auth: "optional",
      monetization: "revenuecat",
      backend: "convex",
      modules: ["video-generation", "credits", "subscriptions", "auth"],
      excludedModules: ["image-generation"],
    },
    {
      prompt: "Create a lightweight image generator with Expo API routes and no login, no paywall.",
      auth: "anonymous",
      monetization: "none",
      backend: "expo-api-routes",
      modules: ["image-generation", "onboarding"],
      excludedModules: ["subscriptions", "auth"],
    },
    {
      prompt: "Build a premium OCR scanner with accounts and analytics.",
      auth: "optional",
      monetization: "revenuecat",
      backend: "convex",
      modules: ["image-identification", "analytics", "subscriptions", "auth"],
    },
    {
      prompt: "Make a meeting notes transcription app with reminders.",
      auth: "optional",
      monetization: "revenuecat",
      backend: "convex",
      modules: ["transcription", "notifications", "subscriptions", "auth"],
    },
    {
      prompt: "Build a public text to speech toy, free forever.",
      auth: "anonymous",
      monetization: "none",
      backend: "expo-api-routes",
      modules: ["text-to-speech", "onboarding"],
      excludedModules: ["subscriptions", "auth"],
    },
  ];

  it.each(cases)(
    "infers a valid config for %s",
    ({ prompt, auth, monetization, backend, modules, excludedModules = [] }) => {
      const plan = createPlanFromPrompt(prompt);

      expect(plan.config.auth).toBe(auth);
      expect(plan.config.monetization).toBe(monetization);
      expect(plan.config.backend).toBe(backend);
      for (const moduleId of modules) {
        expect(plan.config.modules).toContain(moduleId);
      }
      for (const moduleId of excludedModules) {
        expect(plan.config.modules).not.toContain(moduleId);
      }
      expect(validateShipConfig(plan.config).valid).toBe(true);
    }
  );

  it("reports default revenuecat monetization as reasoning, not a matched signal", () => {
    const inferred = inferConfigFromPrompt(
      "Make a meeting notes transcription app with reminders."
    );

    expect(inferred.monetization).toBe("revenuecat");
    expect(inferred.matchedSignals).not.toContain(
      "Monetization: subscription/premium wording detected."
    );
    expect(inferred.reasoning).toContain(
      "Monetization defaulted to revenuecat (no explicit signal)."
    );
  });

  it("keeps no-onboarding prompts aligned with flow flags", () => {
    const plan = createPlanFromPrompt(
      "Make a simple anonymous AI chat app with no subscription and no onboarding."
    );

    expect(plan.config.modules).not.toContain("onboarding");
    expect(plan.config.flows.onboarding).toBe(false);
    expect(validateShipConfig(plan.config).valid).toBe(true);
  });
});

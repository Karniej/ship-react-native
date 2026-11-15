import type { ShipProjectPlan } from "./planner";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "");
}

export interface AssembledArtifact {
  path: string;
  content: string;
}

export interface AssembledProjectPackage {
  slug: string;
  artifacts: AssembledArtifact[];
}

export function createEnvChecklist(plan: ShipProjectPlan): string {
  if (plan.requiredEnvVars.length === 0) {
    return "# Required Environment Variables\n\nNo additional environment variables are required for this draft.\n";
  }

  return `# Required Environment Variables\n\n${plan.requiredEnvVars
    .map((envVar) => `- ${envVar}`)
    .join("\n")}\n`;
}

export function createAssemblyManifest(plan: ShipProjectPlan): string {
  return JSON.stringify(
    {
      appName: plan.config.app.name,
      backend: plan.config.backend,
      template: plan.config.template,
      modules: plan.config.modules,
      requiredEnvVars: plan.requiredEnvVars,
      requiredRoutes: plan.requiredRoutes,
      outputFiles: plan.outputFiles,
      assemblySteps: plan.assemblySteps,
    },
    null,
    2
  );
}

export function createProjectSummary(plan: ShipProjectPlan): string {
  return `# Generated Project Summary

## App

- Name: ${plan.config.app.name}
- Template: ${plan.config.template}
- Backend: ${plan.config.backend}
- Monetization: ${plan.config.monetization}

## Modules

${plan.moduleDefinitions.map((module) => `- ${module.name} (${module.id})`).join("\n")}

## Backend Reasoning

${plan.backendReason}
`;
}

export function createAssembledProjectPackage(plan: ShipProjectPlan): AssembledProjectPackage {
  const slug = slugify(plan.config.app.name || "ship-rn-app") || "ship-rn-app";

  return {
    slug,
    artifacts: [
      {
        path: "ship.config.ts",
        content: plan.shipConfigSource,
      },
      {
        path: "SHIP-RN-ASSEMBLY.json",
        content: createAssemblyManifest(plan),
      },
      {
        path: "REQUIRED_ENV.md",
        content: createEnvChecklist(plan),
      },
      {
        path: "ASSEMBLY_STEPS.md",
        content: `# Assembly Steps\n\n${plan.assemblySteps
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n")}\n`,
      },
      {
        path: "PROJECT_SUMMARY.md",
        content: createProjectSummary(plan),
      },
    ],
  };
}

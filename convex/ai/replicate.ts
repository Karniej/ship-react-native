import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import Replicate from "replicate";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

// Model identifiers for Replicate
const MODELS = {
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-pro": "black-forest-labs/flux-pro",
  sdxl: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "sdxl-lightning":
    "bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f",
} as const;

export const generate = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    numOutputs: v.optional(v.number()),
    negativePrompt: v.optional(v.string()),
    guidanceScale: v.optional(v.number()),
    numInferenceSteps: v.optional(v.number()),
    image: v.optional(v.string()), // Base64 for img2img
    strength: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const modelKey = (args.model || "flux-schnell") as keyof typeof MODELS;
    const modelId = MODELS[modelKey] || args.model || MODELS["flux-schnell"];
    const creditsRequired = getCreditCost("image", modelKey);

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:generate",
    });

    if (rateLimit.isLimited) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`
      );
    }

    // Check credits against the actual cost that will be charged
    const credits = await ctx.runQuery(internal.credits.getCreditsInternal, { userId });
    if (!credits || credits.creditsRemaining < creditsRequired) {
      throw new Error(`Insufficient credits (requires ${creditsRequired})`);
    }

    // Record rate limit hit
    await ctx.runMutation(internal.rateLimits.recordRequest, {
      userId,
      endpoint: "ai:generate",
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Build input based on model type
    const input: Record<string, unknown> = {
      prompt: args.prompt,
      width: args.width || 1024,
      height: args.height || 1024,
      num_outputs: args.numOutputs || 1,
    };

    if (args.negativePrompt) {
      input.negative_prompt = args.negativePrompt;
    }

    if (args.guidanceScale !== undefined) {
      input.guidance_scale = args.guidanceScale;
    }

    if (args.numInferenceSteps !== undefined) {
      input.num_inference_steps = args.numInferenceSteps;
    }

    // Image-to-image
    if (args.image) {
      input.image = `data:image/png;base64,${args.image}`;
      input.strength = args.strength ?? 0.75;
    }

    const output = (await replicate.run(modelId as `${string}/${string}`, { input })) as string[];

    const urls = Array.isArray(output) ? output : [output];

    if (!urls.length) {
      throw new Error("Image generation failed");
    }

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "replicate",
      model: modelKey,
      prompt: args.prompt,
      outputUrl: urls[0],
      outputData: { urls },
      contentType: "image",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      url: urls[0],
      urls,
      model: modelKey,
      prompt: args.prompt,
    };
  },
});

export const generateWithFlux = action({
  args: {
    prompt: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    numOutputs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Delegate to generate with flux-schnell model
    return ctx.runAction(internal.ai.replicate.generate, {
      ...args,
      model: "flux-schnell",
    });
  },
});

export const generateWithSDXL = action({
  args: {
    prompt: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    numOutputs: v.optional(v.number()),
    negativePrompt: v.optional(v.string()),
    guidanceScale: v.optional(v.number()),
    numInferenceSteps: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Delegate to generate with SDXL model
    return ctx.runAction(internal.ai.replicate.generate, {
      ...args,
      model: "sdxl",
    });
  },
});

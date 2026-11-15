import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import OpenAI from "openai";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

export const analyzeImage = action({
  args: {
    imageBase64: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    prompt: v.optional(v.string()),
    model: v.optional(v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini"))),
    maxTokens: v.optional(v.number()),
    detail: v.optional(v.union(v.literal("auto"), v.literal("low"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate input
    if (!args.imageBase64 && !args.imageUrl) {
      throw new Error("Either imageBase64 or imageUrl is required");
    }

    const model = args.model || "gpt-4o";
    const creditsRequired = getCreditCost("vision", model);

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = args.prompt || "What's in this image?";

    // Build image content
    let imageContent: OpenAI.ChatCompletionContentPartImage;

    if (args.imageBase64) {
      imageContent = {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${args.imageBase64}`,
          detail: args.detail || "auto",
        },
      };
    } else {
      imageContent = {
        type: "image_url",
        image_url: {
          url: args.imageUrl!,
          detail: args.detail || "auto",
        },
      };
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, imageContent],
        },
      ],
      max_tokens: args.maxTokens || 500,
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis returned");
    }

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "vision",
      model,
      prompt,
      inputData: { hasImage: true, detail: args.detail },
      outputData: { analysis },
      contentType: "text",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      analysis,
      model,
    };
  },
});

export const describeImage = action({
  args: {
    imageBase64: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    detail: v.optional(v.union(v.literal("auto"), v.literal("low"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    // Delegate to analyzeImage with a descriptive prompt
    return ctx.runAction(internal.ai.vision.analyzeImage, {
      ...args,
      prompt:
        "Describe this image in detail. Include information about the main subjects, colors, composition, and any text visible in the image.",
    });
  },
});

export const extractText = action({
  args: {
    imageBase64: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Delegate to analyzeImage with OCR prompt
    return ctx.runAction(internal.ai.vision.analyzeImage, {
      ...args,
      prompt:
        "Extract and list all text visible in this image. If there's no text, say 'No text found'.",
      detail: "high",
    });
  },
});

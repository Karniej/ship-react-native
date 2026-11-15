import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import OpenAI from "openai";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

export const generateImage = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.union(v.literal("dall-e-2"), v.literal("dall-e-3"))),
    size: v.optional(
      v.union(
        v.literal("1024x1024"),
        v.literal("1792x1024"),
        v.literal("1024x1792"),
        v.literal("512x512"),
        v.literal("256x256")
      )
    ),
    quality: v.optional(v.union(v.literal("standard"), v.literal("hd"))),
    style: v.optional(v.union(v.literal("vivid"), v.literal("natural"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const model = args.model || "dall-e-3";
    const creditsRequired = getCreditCost("image", model);

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

    const response = await openai.images.generate({
      model,
      prompt: args.prompt,
      size: args.size || "1024x1024",
      quality: args.quality || "standard",
      style: args.style || "vivid",
      n: 1,
    });

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    if (!imageUrl) {
      throw new Error("Image generation failed");
    }

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "openai",
      model,
      prompt: args.prompt,
      outputUrl: imageUrl,
      outputData: { revisedPrompt },
      contentType: "image",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      url: imageUrl,
      model,
      prompt: revisedPrompt || args.prompt,
    };
  },
});

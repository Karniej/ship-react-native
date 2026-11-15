import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import OpenAI, { toFile } from "openai";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

export const transcribe = action({
  args: {
    audioBase64: v.string(),
    language: v.optional(v.string()),
    prompt: v.optional(v.string()),
    responseFormat: v.optional(
      v.union(
        v.literal("json"),
        v.literal("text"),
        v.literal("srt"),
        v.literal("verbose_json"),
        v.literal("vtt")
      )
    ),
    temperature: v.optional(v.number()),
    filename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate input
    if (!args.audioBase64 || args.audioBase64.length === 0) {
      throw new Error("Audio data is required");
    }

    const creditsRequired = getCreditCost("transcription", "whisper-1");

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:transcription",
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
      endpoint: "ai:transcription",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(args.audioBase64, "base64");

    // Create file for OpenAI
    const file = await toFile(audioBuffer, args.filename || "audio.mp3");

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: args.language,
      prompt: args.prompt,
      response_format: args.responseFormat || "json",
      temperature: args.temperature,
    });

    const text = typeof transcription === "string" ? transcription : transcription.text;

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "transcription",
      model: "whisper-1",
      inputData: { language: args.language, format: args.responseFormat },
      outputData: { text },
      contentType: "text",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      text,
      model: "whisper-1",
    };
  },
});

export const translate = action({
  args: {
    audioBase64: v.string(),
    prompt: v.optional(v.string()),
    responseFormat: v.optional(
      v.union(
        v.literal("json"),
        v.literal("text"),
        v.literal("srt"),
        v.literal("verbose_json"),
        v.literal("vtt")
      )
    ),
    temperature: v.optional(v.number()),
    filename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const creditsRequired = getCreditCost("transcription", "whisper-1");

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:transcription",
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
      endpoint: "ai:transcription",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(args.audioBase64, "base64");

    // Create file for OpenAI
    const file = await toFile(audioBuffer, args.filename || "audio.mp3");

    // Translation always outputs English
    const translation = await openai.audio.translations.create({
      file,
      model: "whisper-1",
      prompt: args.prompt,
      response_format: args.responseFormat || "json",
      temperature: args.temperature,
    });

    const text = typeof translation === "string" ? translation : translation.text;

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "transcription",
      model: "whisper-1",
      inputData: { type: "translation", format: args.responseFormat },
      outputData: { text },
      contentType: "text",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      text,
      model: "whisper-1",
    };
  },
});

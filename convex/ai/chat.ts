import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import OpenAI from "openai";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getCreditCost } from "../lib/creditCosts";

export const sendMessage = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    model: v.optional(
      v.union(
        v.literal("gpt-4o"),
        v.literal("gpt-4o-mini"),
        v.literal("gpt-4-turbo"),
        v.literal("gpt-3.5-turbo")
      )
    ),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const model = args.model || "gpt-4o-mini";
    const creditsRequired = getCreditCost("chat", model);

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:chat",
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
      endpoint: "ai:chat",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (args.systemPrompt) {
      messages.push({ role: "system", content: args.systemPrompt });
    }

    for (const msg of args.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: args.temperature ?? 0.7,
      max_tokens: args.maxTokens || 2048,
    });

    const responseMessage = completion.choices[0]?.message?.content;
    if (!responseMessage) {
      throw new Error("No response from AI");
    }

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "openai",
      model,
      prompt: args.messages[args.messages.length - 1]?.content,
      outputData: { response: responseMessage },
      contentType: "text",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      message: responseMessage,
      model,
    };
  },
});

export const chat = action({
  args: {
    prompt: v.string(),
    model: v.optional(
      v.union(
        v.literal("gpt-4o"),
        v.literal("gpt-4o-mini"),
        v.literal("gpt-4-turbo"),
        v.literal("gpt-3.5-turbo")
      )
    ),
    systemPrompt: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate input
    if (!args.prompt || args.prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    if (args.prompt.length > 32000) {
      throw new Error("Prompt is too long (max 32,000 characters)");
    }

    const model = args.model || "gpt-4o-mini";
    const creditsRequired = getCreditCost("chat", model);

    // Check rate limit
    const rateLimit = await ctx.runQuery(internal.rateLimits.checkRateLimit, {
      userId,
      endpoint: "ai:chat",
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
      endpoint: "ai:chat",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (args.systemPrompt) {
      messages.push({ role: "system", content: args.systemPrompt });
    }

    messages.push({ role: "user", content: args.prompt });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: args.temperature ?? 0.7,
      max_tokens: args.maxTokens || 2048,
    });

    const responseMessage = completion.choices[0]?.message?.content;
    if (!responseMessage) {
      throw new Error("No response from AI");
    }

    // Log generation and deduct credits (only after the provider call succeeded)
    await ctx.runMutation(internal.credits.useCreditAndLog, {
      userId,
      provider: "openai",
      model,
      prompt: args.prompt,
      outputData: { response: responseMessage },
      contentType: "text",
      creditsToUse: creditsRequired,
    });

    return {
      success: true,
      message: responseMessage,
      model,
    };
  },
});

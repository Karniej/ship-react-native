import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

/**
 * Get the current user's credits
 */
export const getCurrentCredits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

/**
 * Internal query to get credits by user ID (for use in actions)
 */
export const getCreditsInternal = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Check if user has sufficient credits
 */
export const hasCredits = query({
  args: { amount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!credits) return false;
    return credits.creditsRemaining >= (args.amount ?? 1);
  },
});

/**
 * Use credit and log generation (internal mutation for atomic operation)
 */
export const useCreditAndLog = internalMutation({
  args: {
    userId: v.string(),
    provider: v.union(
      v.literal("openai"),
      v.literal("replicate"),
      v.literal("elevenlabs"),
      v.literal("video"),
      v.literal("transcription"),
      v.literal("vision")
    ),
    model: v.string(),
    prompt: v.optional(v.string()),
    inputData: v.optional(v.any()),
    outputUrl: v.optional(v.string()),
    outputData: v.optional(v.any()),
    contentType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("text")
    ),
    creditsToUse: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const creditsToUse = args.creditsToUse ?? 1;

    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits) {
      throw new Error("User credits not found");
    }

    if (credits.creditsRemaining < creditsToUse) {
      throw new Error("Insufficient credits");
    }

    // Deduct credits
    await ctx.db.patch(credits._id, {
      creditsRemaining: credits.creditsRemaining - creditsToUse,
      creditsUsedTotal: credits.creditsUsedTotal + creditsToUse,
    });

    // Log generation
    const generationId = await ctx.db.insert("generations", {
      userId: args.userId,
      provider: args.provider,
      model: args.model,
      prompt: args.prompt,
      inputData: args.inputData,
      outputUrl: args.outputUrl,
      outputData: args.outputData,
      creditsUsed: creditsToUse,
      contentType: args.contentType,
    });

    return { generationId, creditsRemaining: credits.creditsRemaining - creditsToUse };
  },
});

/**
 * Add credits to a user (for purchases or admin)
 */
export const addCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits) {
      // Create credits record if it doesn't exist
      await ctx.db.insert("userCredits", {
        userId: args.userId,
        creditsRemaining: args.amount,
        creditsUsedTotal: 0,
        lastRefillAt: Date.now(),
      });
    } else {
      await ctx.db.patch(credits._id, {
        creditsRemaining: credits.creditsRemaining + args.amount,
        lastRefillAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Refill free tier credits (called by scheduled job or admin)
 */
export const refillFreeCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const refillAmount = args.amount ?? 10; // Default free tier amount

    const credits = await ctx.db
      .query("userCredits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!credits) {
      throw new Error("User credits not found");
    }

    // Only refill if below threshold
    if (credits.creditsRemaining < refillAmount) {
      await ctx.db.patch(credits._id, {
        creditsRemaining: refillAmount,
        lastRefillAt: Date.now(),
      });
    }

    return { success: true };
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "./_generated/server";

/**
 * List user's generation history
 */
export const listUserGenerations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 50;

    return ctx.db
      .query("generations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * List user's generations filtered by provider
 */
export const listUserGenerationsByProvider = query({
  args: {
    provider: v.union(
      v.literal("openai"),
      v.literal("replicate"),
      v.literal("elevenlabs"),
      v.literal("video"),
      v.literal("transcription"),
      v.literal("vision")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 50;

    return ctx.db
      .query("generations")
      .withIndex("by_userId_provider", (q) => q.eq("userId", userId).eq("provider", args.provider))
      .order("desc")
      .take(limit);
  },
});

/**
 * List user's generations filtered by content type
 */
export const listUserGenerationsByContentType = query({
  args: {
    contentType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("text")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 50;

    // Filter by content type (no dedicated index, so filter after fetch)
    const generations = await ctx.db
      .query("generations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return generations.filter((g) => g.contentType === args.contentType).slice(0, limit);
  },
});

/**
 * Get a single generation by ID
 */
export const getGeneration = query({
  args: { generationId: v.id("generations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const generation = await ctx.db.get(args.generationId);

    // Only return if the generation belongs to the current user
    if (!generation || generation.userId !== userId) {
      return null;
    }

    return generation;
  },
});

/**
 * Get user's generation statistics
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const generations = await ctx.db
      .query("generations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      totalGenerations: generations.length,
      totalCreditsUsed: generations.reduce((sum, g) => sum + g.creditsUsed, 0),
      byProvider: {} as Record<string, number>,
      byContentType: {} as Record<string, number>,
    };

    for (const gen of generations) {
      stats.byProvider[gen.provider] = (stats.byProvider[gen.provider] ?? 0) + 1;
      stats.byContentType[gen.contentType] = (stats.byContentType[gen.contentType] ?? 0) + 1;
    }

    return stats;
  },
});

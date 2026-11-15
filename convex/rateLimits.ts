import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, internalMutation, internalQuery } from "./_generated/server";

// Rate limit configurations
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "ai:generate": { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  "ai:chat": { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  "ai:transcription": { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  "ai:video": { maxRequests: 3, windowMs: 300000 }, // 3 per 5 minutes
  default: { maxRequests: 60, windowMs: 60000 }, // 60 per minute
};

/**
 * Check if user is rate limited (internal query for use in actions)
 */
export const checkRateLimit = internalQuery({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const config = RATE_LIMITS[args.endpoint] ?? RATE_LIMITS.default;
    const windowStart = Date.now() - config.windowMs;

    const recentRequests = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId_endpoint", (q) =>
        q.eq("userId", args.userId).eq("endpoint", args.endpoint)
      )
      .filter((q) => q.gt(q.field("timestamp"), windowStart))
      .collect();

    const isLimited = recentRequests.length >= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - recentRequests.length);
    const resetAt = windowStart + config.windowMs;

    return {
      isLimited,
      remaining,
      resetAt,
      limit: config.maxRequests,
    };
  },
});

/**
 * Record a rate limit hit (internal mutation for use in actions)
 */
export const recordRequest = internalMutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("rateLimits", {
      userId: args.userId,
      endpoint: args.endpoint,
      timestamp: Date.now(),
    });
  },
});

/**
 * Check rate limit for current user (used by client)
 */
export const checkMyRateLimit = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const config = RATE_LIMITS[args.endpoint] ?? RATE_LIMITS.default;
    const windowStart = Date.now() - config.windowMs;

    const recentRequests = await ctx.db
      .query("rateLimits")
      .withIndex("by_userId_endpoint", (q) => q.eq("userId", userId).eq("endpoint", args.endpoint))
      .filter((q) => q.gt(q.field("timestamp"), windowStart))
      .collect();

    return {
      isLimited: recentRequests.length >= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - recentRequests.length),
      limit: config.maxRequests,
    };
  },
});

/**
 * Clean up old rate limit records (scheduled job)
 */
export const cleanupOldRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Remove records older than 1 hour
    const cutoff = Date.now() - 3600000;

    const oldRecords = await ctx.db
      .query("rateLimits")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return { deleted: oldRecords.length };
  },
});

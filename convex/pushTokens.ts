import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query, mutation } from "./_generated/server";

/**
 * Register or update a push notification token
 */
export const registerToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check if token already exists for this device
    const existingToken = await ctx.db
      .query("pushTokens")
      .withIndex("by_userId_deviceId", (q) => q.eq("userId", userId).eq("deviceId", args.deviceId))
      .first();

    if (existingToken) {
      // Update existing token
      await ctx.db.patch(existingToken._id, {
        token: args.token,
        platform: args.platform,
      });
    } else {
      // Insert new token
      await ctx.db.insert("pushTokens", {
        userId,
        token: args.token,
        platform: args.platform,
        deviceId: args.deviceId,
      });
    }

    return { success: true };
  },
});

/**
 * Remove a push notification token
 */
export const removeToken = mutation({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const token = await ctx.db
      .query("pushTokens")
      .withIndex("by_userId_deviceId", (q) => q.eq("userId", userId).eq("deviceId", args.deviceId))
      .first();

    if (token) {
      await ctx.db.delete(token._id);
    }

    return { success: true };
  },
});

/**
 * Get all tokens for a user (internal use for sending notifications)
 */
export const getUserTokens = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("pushTokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get current user's tokens
 */
export const getMyTokens = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("pushTokens")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

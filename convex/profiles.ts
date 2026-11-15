import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query, mutation } from "./_generated/server";

/**
 * Get the current user's profile
 */
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

/**
 * Get a profile by user ID (for admin or public viewing)
 */
export const getProfileByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    settings: v.optional(
      v.object({
        theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
        language: v.optional(v.string()),
        notificationsEnabled: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Build update object, only including defined fields
    const updates: Record<string, unknown> = {};
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.settings !== undefined) {
      // Merge settings instead of replacing
      updates.settings = { ...profile.settings, ...args.settings };
    }

    await ctx.db.patch(profile._id, updates);
    return { success: true };
  },
});

/**
 * Update premium status (called from subscription webhook)
 */
export const updatePremiumStatus = mutation({
  args: {
    userId: v.string(),
    isPremium: v.boolean(),
    premiumExpiresAt: v.optional(v.number()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("expired"),
        v.literal("billing_issue"),
        v.literal("paused")
      )
    ),
    subscriptionProductId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      isPremium: args.isPremium,
      premiumExpiresAt: args.premiumExpiresAt,
      subscriptionStatus: args.subscriptionStatus,
      subscriptionProductId: args.subscriptionProductId,
    });

    return { success: true };
  },
});

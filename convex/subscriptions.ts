import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, internalMutation, query } from "./_generated/server";

/**
 * Handle RevenueCat webhook events (called from HTTP action)
 */
export const handleWebhook = internalMutation({
  args: {
    userId: v.string(),
    eventType: v.string(),
    productId: v.string(),
    store: v.string(),
    environment: v.union(v.literal("SANDBOX"), v.literal("PRODUCTION")),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    /** RevenueCat `expiration_at_ms` — the real subscription expiry */
    expirationAtMs: v.optional(v.number()),
    eventData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Log the subscription event
    await ctx.db.insert("subscriptionEvents", {
      userId: args.userId,
      eventType: args.eventType,
      productId: args.productId,
      store: args.store,
      environment: args.environment,
      price: args.price,
      currency: args.currency,
      transactionId: args.transactionId,
      eventData: args.eventData,
    });

    // Update user's premium status based on event type
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      console.error(`Profile not found for user: ${args.userId}`);
      return { success: false, error: "Profile not found" };
    }

    // Handle different event types
    switch (args.eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "PRODUCT_CHANGE":
      case "UNCANCELLATION":
        await ctx.db.patch(profile._id, {
          isPremium: true,
          subscriptionStatus: "active",
          subscriptionProductId: args.productId,
          // Use RevenueCat's real expiry; fall back to 30 days only when the
          // event carries no expiration (rare for subscription events)
          premiumExpiresAt: args.expirationAtMs ?? Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
        break;

      case "CANCELLATION":
        await ctx.db.patch(profile._id, {
          subscriptionStatus: "cancelled",
          // Keep premium active until expiration; update the expiry if the
          // event carries one (auto-renew was turned off, not access)
          ...(args.expirationAtMs !== undefined ? { premiumExpiresAt: args.expirationAtMs } : {}),
        });
        break;

      case "EXPIRATION":
        await ctx.db.patch(profile._id, {
          isPremium: false,
          subscriptionStatus: "expired",
        });
        break;

      case "BILLING_ISSUE":
        await ctx.db.patch(profile._id, {
          subscriptionStatus: "billing_issue",
        });
        break;

      case "PAUSED":
        await ctx.db.patch(profile._id, {
          subscriptionStatus: "paused",
        });
        break;

      default:
        console.log(`Unhandled event type: ${args.eventType}`);
    }

    return { success: true };
  },
});

/**
 * Get user's subscription history
 */
export const getMySubscriptionHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 20;

    return ctx.db
      .query("subscriptionEvents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Manually update subscription status (for testing/admin)
 */
export const updateSubscriptionStatus = mutation({
  args: {
    isPremium: v.boolean(),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("expired"),
        v.literal("billing_issue"),
        v.literal("paused")
      )
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

    await ctx.db.patch(profile._id, {
      isPremium: args.isPremium,
      subscriptionStatus: args.subscriptionStatus,
      premiumExpiresAt: args.isPremium ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    return { success: true };
  },
});

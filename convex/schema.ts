import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Auth tables from @convex-dev/auth
  ...authTables,

  // User profiles
  profiles: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
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
    settings: v.optional(
      v.object({
        theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
        language: v.optional(v.string()),
        notificationsEnabled: v.optional(v.boolean()),
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // User credits for AI generation
  userCredits: defineTable({
    userId: v.string(),
    creditsRemaining: v.number(),
    creditsUsedTotal: v.number(),
    lastRefillAt: v.number(),
  }).index("by_userId", ["userId"]),

  // AI generation history
  generations: defineTable({
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
    creditsUsed: v.number(),
    contentType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("text")
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_provider", ["userId", "provider"]),

  // Push notification tokens
  pushTokens: defineTable({
    userId: v.string(),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    deviceId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_deviceId", ["userId", "deviceId"])
    .index("by_token", ["token"]),

  // Rate limiting
  rateLimits: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId_endpoint", ["userId", "endpoint"])
    .index("by_timestamp", ["timestamp"]),

  // Subscription events for RevenueCat
  subscriptionEvents: defineTable({
    userId: v.string(),
    eventType: v.string(),
    productId: v.string(),
    store: v.string(),
    environment: v.union(v.literal("SANDBOX"), v.literal("PRODUCTION")),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    transactionId: v.optional(v.string()),
    eventData: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_eventType", ["eventType"]),
});

import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * RevenueCat webhook endpoint
 * Configure this URL in RevenueCat dashboard: https://<deployment>.convex.site/webhooks/revenuecat
 */
http.route({
  path: "/webhooks/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Verify webhook authorization — fail closed. An unset secret must
      // not silently accept unauthenticated requests.
      const authHeader = request.headers.get("Authorization");
      const expectedAuth = process.env.REVENUECAT_WEBHOOK_SECRET;

      if (!expectedAuth) {
        console.error(
          "REVENUECAT_WEBHOOK_SECRET is not set — rejecting RevenueCat webhook. " +
            "Set it in the Convex dashboard (Settings → Environment Variables) and configure " +
            "the same value as the Authorization header (Bearer <secret>) in the RevenueCat " +
            "dashboard webhook settings."
        );
        return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (authHeader !== `Bearer ${expectedAuth}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const event = body.event;

      if (!event) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Extract user ID from app_user_id
      const userId = event.app_user_id;

      if (!userId) {
        return new Response(JSON.stringify({ error: "Missing user ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Process the webhook
      await ctx.runMutation(internal.subscriptions.handleWebhook, {
        userId,
        eventType: event.type,
        productId: event.product_id || "",
        store: event.store || "unknown",
        environment: event.environment === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
        price: event.price,
        currency: event.currency,
        transactionId: event.transaction_id,
        // RevenueCat sends the real subscription expiry (ms since epoch)
        expirationAtMs:
          typeof event.expiration_at_ms === "number" ? event.expiration_at_ms : undefined,
        eventData: event,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("RevenueCat webhook error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

/**
 * Health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;

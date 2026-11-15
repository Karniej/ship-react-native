# Cost Guide

This guide reflects the current backend options in Ship React Native.

## Fixed Infrastructure Costs

### Convex Mode

Typical fixed tools you may pay for:

- Convex
- RevenueCat
- PostHog
- Sentry
- Expo EAS

### Expo API Routes Mode

Typical fixed tools you may pay for:

- EAS Hosting or another server runtime
- RevenueCat
- PostHog
- Sentry
- Expo EAS

## Variable AI Costs

Your main usage-based costs usually come from:

- OpenAI
- Replicate
- ElevenLabs

Those costs scale with generation volume, model choice, and media type.

## Cost Levers In This Boilerplate

- feature flags in `src/constants/features.ts`
- model restrictions in `src/constants/generations.ts`
- premium gating in RevenueCat flows
- backend-side rate limiting in Convex mode
- template-based app shaping so unused features can be disabled early

## Practical Cost Strategy

### Lowest Operational Complexity

Use `Expo API Routes` mode when:

- you only need a small number of server-side AI endpoints
- you do not need a full reactive backend yet

### Strongest Product Foundation

Use `Convex` mode when:

- you need auth
- you need persisted generations or credits
- you need subscription-aware business logic
- you want cleaner long-term product infrastructure

## Recommendation

For serious paid apps, optimize for correctness first, then model cost.

The most expensive failure mode is usually not token cost. It is broken auth, broken purchase state, or missing server-side enforcement. That is why `Convex` is the recommended path for production-oriented apps.

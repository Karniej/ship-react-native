---
name: add-ai-service
description: Use when adding a new AI capability, provider, or model to a Ship React Native app — a new provider (Anthropic, Gemini), a new modality (music, embeddings), or a new model within an existing feature. Trigger on "add Claude/Anthropic", "add a new AI feature", "integrate <provider>", "add <model> support".
---

# Ship React Native — Adding an AI Capability

You are extending a user's app built on the Ship React Native boilerplate. Every AI capability in
this codebase exists **twice** — once per backend mode — plus a fixed set of config entries. Skipping
any layer produces a feature that works in one mode and silently breaks in the other.

Before writing code, read one complete existing capability end-to-end as your template. For a new
provider use the Replicate pair (`convex/ai/replicate.ts` + `src/services/ai/replicate.service.ts`);
for a new modality use image generation (`convex/ai/imageGeneration.ts` + `src/app/api/generate+api.ts`

- `src/services/ai/openai.service.ts`).

Before adding files, update `ship.config.ts` so `modules` includes the capability being added
(for existing registry modules, use the matching module id such as `"ai-chat"` or
`"image-generation"`). If the capability needs a new registry module, add that module to
`@ship-rn/system` first, then run `npm run apply -- --force` so feature flags, route pruning,
`PROJECT_SUMMARY.md`, `REQUIRED_ENV.md`, and `.ship-rn-applied.json` stay aligned with the code.

## The dual-backend rule

`API_MODE` in `src/constants/api.ts` selects the backend:

- **`"convex"`** (default): the client calls a Convex **action** in `convex/ai/` via `useAction`.
  Auth, per-user rate limiting, credits, and generation history all live server-side.
- **`"expo-api-routes"`**: the client calls an Expo API Route (`src/app/api/<name>+api.ts`) through a
  service in `src/services/ai/`. No server-side auth/credits — premium is gated client-side by RevenueCat.

Implement **both** paths unless the user explicitly says their app is locked to one mode. `apiCall()`
in `src/constants/api.ts` throws in Convex mode by design — services are for API-routes mode only.

## Checklist — every file a new capability touches

| #   | Layer          | File                                                         | What to do                                                                                                                                                                                                                                                                                                |
| --- | -------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Convex action  | `convex/ai/<feature>.ts` (new)                               | Follow the exact guardrail ordering below                                                                                                                                                                                                                                                                 |
| 2   | Schema         | `convex/schema.ts`                                           | Add provider literal to the `provider` union on the `generations` table (and `contentType` if it's a new modality)                                                                                                                                                                                        |
| 3   | Credits        | `convex/credits.ts`                                          | Add the same provider literal to `useCreditAndLog` args — the two unions must match or the mutation throws a validation error                                                                                                                                                                             |
| 4   | Rate limits    | `convex/rateLimits.ts`                                       | Add an `"ai:<feature>"` entry to `RATE_LIMITS` (e.g. `{ maxRequests: 10, windowMs: 60000 }`); unlisted endpoints fall back to 60/min                                                                                                                                                                      |
| 5   | API route      | `src/app/api/<feature>+api.ts` (new)                         | Export `POST(request: Request): Promise<Response>`; mirror `generate+api.ts`                                                                                                                                                                                                                              |
| 6   | Client service | `src/services/ai/<feature>.service.ts` (new)                 | Call `apiCall("<feature>", ...)`; catch and return `{ success: false, error }` — services never throw. Re-export from `src/services/ai/index.ts`                                                                                                                                                          |
| 7   | Convex hook    | `src/hooks/useConvexAI.ts`                                   | Add `export function use<Feature>() { assertConvexMode(); return useAction(api.ai.<file>.<fn>); }`                                                                                                                                                                                                        |
| 8   | Store          | `src/store/useAIStore.ts`                                    | Add an action following `generateImage`: `logGeneration(...)` → set `isGenerating` → call service → on success set `currentGeneration`, call `loadGenerations()` and (unless `DEV_MODE.enabled`) `loadCredits()`                                                                                          |
| 9   | Feature flag   | `src/constants/features.ts`                                  | Add key to the `Features` interface, a `FeatureConfig` entry in `FEATURES`, and (if template-controlled) to every `APP_TEMPLATES` entry. Gate UI with `isFeatureEnabled()`                                                                                                                                |
| 10  | Credit cost    | `convex/lib/creditCosts.ts` + `src/constants/generations.ts` | Add per-model costs to `CREDIT_COSTS` in `convex/lib/creditCosts.ts` — the single source of truth, re-exported by `src/constants/generations.ts` so client previews match server charges. Add a `MODELS.<type>` entry (`id`, `name`, `provider`, `description`, `premium`, `enabled`) in `generations.ts` |
| 11  | Prompts        | `src/constants/prompts.ts`                                   | Add a `<FEATURE>_PROMPTS` export with `placeholder` and `examples` — no hardcoded prompt strings in screens                                                                                                                                                                                               |
| 12  | Screen         | `src/app/(app)/<feature>.tsx` (new or existing)              | Wire through `useAIStore` (API-routes) or the `useConvexAI` hook; copy structure from `src/app/(app)/generate.tsx`                                                                                                                                                                                        |
| 13  | i18n           | `src/locales/{en,es,fr,de,it}.ts`                            | Add all 5 locales. The locale files are type-synced — a key present in `en.ts` but missing elsewhere fails `type-check`                                                                                                                                                                                   |
| 14  | Secrets        | Convex dashboard / server env                                | New provider key (e.g. `ANTHROPIC_API_KEY`) goes in the Convex dashboard env vars or the API-routes deployment env — **never** as `EXPO_PUBLIC_*` in `.env`                                                                                                                                               |

## Convex action — the exact guardrail ordering

Every action in `convex/ai/` follows this sequence. Preserve it — the order is the abuse protection:

1. **Auth**: `const userId = await getAuthUserId(ctx); if (!userId) throw new Error("Unauthorized");`
2. **Input validation**: reject empty input; cap length (`chat.ts` rejects prompts over 32,000 chars
   with `"Prompt is too long (max 32,000 characters)"`). Add equivalent caps for your modality.
3. **Resolve model and cost**: `const model = args.model || "<default>"; const creditsRequired =
getCreditCost("<type>", model);` — import `getCreditCost` from `../lib/creditCosts`. Never hardcode
   a credit cost inside an action.
4. **Rate limit check**: `ctx.runQuery(internal.rateLimits.checkRateLimit, { userId, endpoint: "ai:<feature>" })`;
   if `isLimited`, throw `` `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.` ``
5. **Credit check against the actual cost**: `ctx.runQuery(internal.credits.getCreditsInternal, { userId })`;
   throw `` `Insufficient credits (requires ${creditsRequired})` `` when
   `creditsRemaining < creditsRequired`. The amount checked must equal the amount later charged.
6. **Record the request**: `ctx.runMutation(internal.rateLimits.recordRequest, { userId, endpoint })` —
   deliberately **before** the provider call, so failed/erroring calls still count toward the limit.
7. **Provider call**, then throw on empty output (`"No response from AI"` / `"<X> generation failed"`).
8. **Deduct and log — only after success**: `ctx.runMutation(internal.credits.useCreditAndLog, { userId,
provider, model, prompt, outputUrl?, outputData?, contentType, creditsToUse: creditsRequired })`.
   This mutation atomically re-checks balance, deducts, and inserts the `generations` row. Because
   deduction happens _after_ the provider succeeds, **failures never consume credits — no refund logic
   is needed. Do not deduct before the provider call**; that inverts the guarantee. Always pass
   `creditsToUse` — omitting it silently charges 1 regardless of the model's real cost.
9. **Return** `{ success: true, ... }` plus the output and `model`.

## API route + service — the exact error shape

Routes (see `src/app/api/generate+api.ts`) return `Response.json({ success, data?, error? })`:
missing/invalid input → 400; provider key not configured → 503 with
`"API not configured. Set <KEY> in server environment."`; provider non-OK → forward the provider's
status with its error text; unexpected throw → 500. Read keys from `process.env` at module scope.
Services parse `data.success`, normalize the payload, and return a typed
`{ success: boolean; ...; error?: string }` result object.

## What the boilerplate does NOT do (add if the app needs it)

- **No streaming.** Chat uses a single non-streaming `openai.chat.completions.create` call. If the
  user wants streaming chat, that's new work: an HTTP action or streaming API route plus incremental
  store updates — don't pretend the pattern exists.
- **No retry/backoff or provider timeouts.** A hung provider call runs until the platform kills it.
  For long-running providers, copy the async polling pattern from `convex/ai/video.ts`
  (`generateVideo` + `checkVideoStatus`) instead of one long await.
- **API-routes mode has no server-side rate limiting or credit enforcement** — only client-side
  RevenueCat gating. Say so if the user expects parity with Convex mode.
- The `RATE_LIMITS` object in `src/constants/generations.ts` is client-side display config only; the
  enforced limits are the ones in `convex/rateLimits.ts`.

## Verify (definition of done)

- [ ] `npm run validate` passes (lint + type-check + tests) — this catches schema/credits union
      mismatches and missing locale keys
- [ ] Convex mode: `npx convex dev` deploys cleanly; the new action appears in the dashboard
- [ ] Manual test, Convex mode: run the feature from the screen; confirm a `generations` row is
      inserted, `creditsRemaining` drops by exactly `creditsToUse`, and history/credits UI refresh
- [ ] Manual failure test: temporarily unset the provider key and confirm the error surfaces in the
      UI **and credits are unchanged**
- [ ] Rate limit test: exceed `maxRequests` and confirm the "Rate limit exceeded" message with a
      sensible retry time
- [ ] API-routes mode (if supported): flip `API_MODE`, set the key in server env, hit the route
- [ ] Feature flag off → UI hidden; `DEV_MODE.enabled` shows the dev banner and skips credit refresh

## Common failure modes

- **`ArgumentValidationError` from `useCreditAndLog`**: provider literal added to `convex/schema.ts`
  but not `convex/credits.ts` (or vice versa). The unions must be updated in both files.
- **"apiCall should not be used in Convex mode"**: a screen calls the service path while
  `API_MODE === "convex"`. Route through the `useConvexAI.ts` hook instead.
- **Action works in dashboard but hook is undefined**: Convex codegen is stale — `npx convex dev`
  must be running to regenerate `convex/_generated/api`.
- **Type errors in `src/locales/*`**: keys added to `en.ts` only. Add all five locales; that error is
  the sync guard working.
- **New provider key returns 401 in production**: key was put in `.env` as `EXPO_PUBLIC_*` (client
  bundle) instead of the Convex dashboard / server deployment env.
- **Credits deducted but nothing generated**: someone moved `useCreditAndLog` before the provider
  call. Deduction must stay post-success.

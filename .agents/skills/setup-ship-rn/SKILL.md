---
name: setup-ship-rn
description: Use when setting up a freshly cloned Ship React Native project — configuring app identity, branding, feature template, auth, backend mode, payments, and verifying the app runs. Trigger on "set up my app", "configure this boilerplate", "get this running", or any fresh-clone state.
---

# Ship React Native — Agent-Driven Setup

You are setting up a user's new app from the Ship React Native boilerplate. The human-facing
alternative is the interactive wizard (`npm run setup`, 13 steps). As an agent you configure the
project by **editing the config files directly** — `scripts/setup.js` is the authoritative
reference for exactly which file each option touches; consult it whenever this document is not
specific enough.

## Step 0 — Gather requirements first

Ask the user (one message, all questions at once) anything not already provided:

1. **App name** and **bundle identifier** (e.g. `com.yourcompany.appname`)
2. **What the app does** → pick the feature template: `image-generation`, `video-generation`,
   `image-video`, `audio-generation`, `audio-transcription`, `audio-full`, `full-suite`, or `custom`
3. **Brand color** (hex) and optional font preference
4. **Auth mode**: social optional / social required / anonymous-only
5. **Backend mode**: `convex` (default — auth, credits, rate limiting, real-time) or
   `expo-api-routes` (lighter; premium gated by RevenueCat only)
6. **Default language** (en/es/fr/de/it) and default theme (light/dark/system)
7. **Which API keys they already have**: OpenAI, Replicate, ElevenLabs, RevenueCat (iOS+Android),
   PostHog, Sentry. Missing keys are fine — features degrade gracefully; note them as TODOs.

## Step 1 — Environment sanity

```bash
node --version        # must satisfy .nvmrc
npm install           # postinstall applies patch-package — do not skip
cp .env.example .env  # if .env doesn't exist
```

## Step 2 — Apply the config spine if pending

`ship.config.ts` is the source of truth for template, modules, auth, backend, monetization, branding,
and route pruning. Before editing constants directly:

1. If `ship.config.ts` exists but `.ship-rn-applied.json` is missing, tell the user the config has
   not been applied yet and run `npm run apply -- --force`.
2. If both files exist, compare the current config hash to the marker:

   ```bash
   npx tsx -e "import { createHash } from 'node:crypto'; import config from './ship.config'; import marker from './.ship-rn-applied.json'; const hash = createHash('sha256').update(JSON.stringify(config)).digest('hex'); if (hash !== marker.configHash) { console.error('ship.config.ts differs from .ship-rn-applied.json'); process.exit(1); }"
   ```

3. If the hash differs, offer to run `npm run apply -- --force` before continuing. The applier
   rewrites `src/constants/{api,features,brand,config}.ts`, prunes unselected optional routes, and
   updates `PROJECT_SUMMARY.md`, `REQUIRED_ENV.md`, and `.ship-rn-applied.json`.

Use direct edits only for settings not represented in `ShipConfig` yet, such as bundle IDs, native
assets, local store defaults, RevenueCat product IDs, copy, and app-specific screen behavior.

## Step 3 — Apply configuration (file → what to change)

| Setting                            | File                                                       | Change                                                                                           |
| ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| App name, slug, scheme, bundle IDs | `app.json` (+ `name` in `package.json`)                    | `expo.name`, `expo.slug`, `expo.scheme`, `expo.ios.bundleIdentifier`, `expo.android.package`     |
| Brand colors / fonts               | `src/constants/brand.ts`                                   | primary color, gradients; theme derives from this — touch nothing in `theme.ts`                  |
| Feature template                   | `src/constants/features.ts`                                | set `CURRENT_TEMPLATE`; for `custom`, set each feature's `enabled` flag                          |
| Auth mode                          | `src/constants/features.ts`                                | `socialAuth.{enabled, googleEnabled, appleEnabled, required}` — anonymous-only = all three false |
| Backend mode                       | `src/constants/api.ts`                                     | `API_MODE: "convex"` or `"expo-api-routes"`                                                      |
| Default theme                      | `src/store/useGeneralStore.ts`                             | initial `theme` value                                                                            |
| Default language                   | `src/store/useGeneralStore.ts` / `src/constants/config.ts` | initial `language`, `SUPPORTED_LOCALES`                                                          |
| Credit system                      | `src/constants/generations.ts`                             | costs per generation type, free-tier credits                                                     |
| Onboarding slides                  | `src/constants/onboarding.ts` / `onboardingData.ts`        | copy + slide config                                                                              |
| RevenueCat IDs                     | `src/constants/config.ts`                                  | `PREMIUM_ENTITLEMENT_ID`, `PRODUCT_IDS`                                                          |

After each edit run `npm run validate` — the config files are typed, so mistakes surface immediately.

## Step 4 — Secrets (never guess where a key goes)

- **Client-side** (`.env`, `EXPO_PUBLIC_*` only): `EXPO_PUBLIC_CONVEX_URL`,
  `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`,
  `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_SENTRY_DSN`.
- **Server-side — NEVER in `.env` client vars**: `OPENAI_API_KEY`, `REPLICATE_API_TOKEN`,
  `ELEVENLABS_API_KEY`, OAuth client secrets, `REVENUECAT_WEBHOOK_SECRET`.
  - Convex mode → set in the Convex dashboard (`npx convex dashboard` → Settings → Environment Variables).
  - API-routes mode → set in the server deployment environment; also set `EXPO_PUBLIC_API_URL`.

## Step 5 — Backend bring-up

**Convex mode** (default):

```bash
npx convex dev   # creates/links deployment, prints URL → put in .env as EXPO_PUBLIC_CONVEX_URL
```

Then remind the user to add server AI keys in the Convex dashboard (Step 4).

**API-routes mode**: confirm `API_MODE` is `"expo-api-routes"`, `EXPO_PUBLIC_API_URL` points at the
deployed routes, and AI keys are in the server env. See `docs/plans/` and `docs/API_ROUTES_AND_PROMPTS.md`.

## Step 6 — Verify (definition of done)

Run every check; report pass/fail per line, with the fix for any failure:

- [ ] `npm run doctor` exits 0 (it checks env vars, placeholders, backend mode, app identity — fix everything it flags)
- [ ] `npm run validate` passes (lint + typecheck + tests)
- [ ] Convex mode: `npx convex dev` runs without errors and the URL matches `.env`
- [ ] `npm start` boots; app loads on simulator (`i` / `a`)
- [ ] Onboarding flow appears on first launch; app name and brand color are the user's
- [ ] Only the selected template's AI features are visible in the UI
- [ ] List every skipped/missing API key as a TODO with where it goes (client `.env` vs server env)

## Common failure modes

- **Blank screen / infinite splash (Convex mode)**: `EXPO_PUBLIC_CONVEX_URL` missing or stale — env
  changes require restarting `npm start`.
- **AI calls fail with auth errors**: server key placed in `.env` instead of Convex dashboard/server env.
- **Type errors after editing locales**: a key added to `en.ts` is missing from `es/fr/de/it` — that's
  the sync guard working; add the translations.
- **Native build issues after changing bundle ID**: run `npm run prebuild:clean`, don't hand-edit `ios/`/`android/`.

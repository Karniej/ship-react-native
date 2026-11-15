---
name: prepare-store-submission
description: Use when preparing a Ship React Native app for App Store / Play Store submission — EAS builds, store metadata, screenshots, ASO, and review compliance. Trigger on "submit to the App Store", "release my app", "prepare for review", "why was I rejected", or any pre-launch state.
---

# Ship React Native — Store Submission

You are preparing a user's app for App Store and Play Store review. This boilerplate ships
AI-generation apps with subscriptions — the two things Apple reviewers scrutinize hardest.
The deep references live in `docs/`; this skill tells you what to check, in what order, and
what gets template apps rejected. Full checklists: `docs/APP_STORE_CHECKLIST.md`.

## Step 0 — Pre-flight (block submission until every line passes)

Verify each item in the codebase; report pass/fail with the fix:

- [ ] **Bundle IDs are not placeholders.** `app.json` → `expo.ios.bundleIdentifier` and
      `expo.android.package` must NOT be `com.company.boilerplate`. Also check `expo.name`,
      `expo.slug`, `expo.scheme`, and that `expo.extra.eas.projectId` / `expo.updates.url` are
      not `your-project-id`.
- [ ] **Version bumped.** Run `npm run release` (`scripts/release.js` bumps `version` in
      `package.json` + `app.json`, increments `ios.buildNumber` and `android.versionCode`,
      and creates a git tag). Never hand-edit build numbers out of sync across files.
- [ ] **Checks pass.** `npm run doctor` (project config health — must exit 0), `npx expo-doctor`
      (Expo dependency health), then `npm run validate` (lint + typecheck + tests).
- [ ] **Assets are the user's, not the boilerplate's.** `npm run generate:assets` regenerates
      icon/splash/favicon from `assets/source/` (see `docs/ICON_AND_SPLASH_GENERATION.md`;
      `docs/LOCAL_BUILD_GUIDE.md` has a sips fallback if `sharp` is missing). iOS icon must be
      1024×1024 with no alpha.
- [ ] **Privacy policy + terms URLs are live.** `src/constants/config.ts` →
      `PRIVACY_POLICY_URL`, `TERMS_URL`, `SUPPORT_EMAIL` must not be `example.com`. The app has
      in-app routes at `src/app/privacy.tsx` and `src/app/terms.tsx` — their content must match
      the hosted pages. Open both URLs and confirm they return 200 with real content.
- [ ] **Feature flags match reality.** `src/constants/features.ts` → `CURRENT_TEMPLATE`
      defaults to `full-suite`. If the app only does image generation, set the matching
      template — every enabled feature is a screen reviewers will open, and a broken or
      irrelevant one is a 2.1 rejection.
- [ ] **Permission strings match enabled features.** `app.json` `infoPlist` declares camera,
      microphone, and photo-library usage. Remove any string (and Android permission) for a
      capability the shipped template doesn't use — unused permissions are a 5.1.1 rejection.

## Step 1 — Build & submit (EAS)

Full guide: `docs/EAS_DEPLOYMENT.md`. The profiles in `eas.json`:

| Profile       | Use           | Notes                                         |
| ------------- | ------------- | --------------------------------------------- |
| `development` | dev client    | iOS simulator build                           |
| `preview`     | internal QA   | Android builds an APK; iOS ad-hoc             |
| `production`  | store release | `autoIncrement: true` — remote version source |

```bash
eas login
eas build --profile production --platform ios
eas build --profile production --platform android   # produces an AAB
eas submit -p ios        # requires submit.production.ios filled in eas.json
eas submit -p android    # requires ./google-services-key.json (gitignored)
```

Before submitting, fill `eas.json` → `submit.production.ios` (`appleId`, `ascAppId`,
`appleTeamId` — currently `YOUR_APPLE_ID` placeholders) and create the Play service-account
key per `docs/EAS_DEPLOYMENT.md`. Android submits to the `internal` track by default —
correct for a first release; promote in Play Console. Server AI keys (OpenAI, Replicate,
ElevenLabs) must be EAS secrets or Convex dashboard env vars, never `EXPO_PUBLIC_*`.

## Step 2 — Metadata & ASO

Fill in the templates — do not improvise structure:

- `docs/ASO_TEMPLATE.md` — keyword strategy, description template with the **required
  subscription disclosure paragraph**, screenshot caption formula, metadata don'ts.
- `docs/APP_STORE_LISTING_TEMPLATE.md` — field-by-field App Store Connect listing for
  hard-paywalled subscription apps.
- `docs/app-store-screenshots-and-localization.md` — Figma screenshot frames for the starter
  apps + localization workflow.

Hard rules (iOS): title 30 chars, subtitle 30 chars, keyword field 100 chars, comma-separated
single words, no spaces after commas. Apple combines title + subtitle + keywords — **never
repeat a word across the three fields**. Do not mention ChatGPT/OpenAI/GPT/Claude/Gemini
anywhere in metadata (China App Store rejection), no "free" in the title of a hard-paywall
app, no pricing baked into screenshots.

Screenshots: 6.7" 1290×2796, 6.5" 1284×2778, 5.5" 1242×2208. Caption formula: large
ACTION VERB + outcome ("SNAP A FISH. KNOW INSTANTLY."). Screenshots must show the actual
app — mocked-up features that don't exist are a 2.3 metadata rejection.

## Step 3 — The rejection playbook (AI + subscription apps)

For each guideline: what the reviewer does, and what to verify in this codebase first.

**2.1 — App completeness / crashes.** Reviewers run a fresh install on real hardware with a
new account. Verify: cold start with an empty `.env`-equivalent production config doesn't
hang on splash (a missing `EXPO_PUBLIC_CONVEX_URL` in the production build = infinite splash
= instant rejection); every screen reachable from the tab bar works; test the exact
production build via `eas build --profile preview` on a physical device before submitting.
If any feature needs a login, supply a working demo account in App Review notes.

**3.1.2 — Subscriptions.** Reviewers open the paywall and hunt for: price + duration
displayed before purchase, a working **Restore Purchases** button, and links to terms +
privacy on the paywall itself. The boilerplate's paywall is `src/app/(app)/premium.tsx`
(restore is wired via `restorePurchases`) — verify the user hasn't removed the restore
button or the terms/privacy links while re-theming. The App Store description must contain
the auto-renewal disclosure paragraph from `docs/ASO_TEMPLATE.md`, verbatim in structure.
RevenueCat products must be in "Ready to Submit" state and attached to the app version.

**4.3 — Spam / template similarity. The #1 risk for boilerplate users.** Apple rejects apps
that look like re-skins of other apps on the store — and other users of this boilerplate are
submitting too. Concrete differentiation, all four, before submitting:

1. Custom branding: user's own `src/constants/brand.ts` colors, fonts, and a unique icon —
   never the boilerplate defaults.
2. Rewritten onboarding: `src/constants/onboarding.ts` / `onboardingData.ts` copy must be
   specific to this app's use case, not generic "AI generation" language.
3. Distinct feature set: pick a narrow `CURRENT_TEMPLATE` and a specific niche rather than
   shipping `full-suite` with generic copy — a focused app reads as original.
4. Unique screenshots and metadata: never reuse example captions or the Fishify/Mori sample
   listings from the docs verbatim.

**5.1.1 / 5.1.2 — Privacy.** This app sends user images/audio to OpenAI, Replicate, and
ElevenLabs, and runs Sentry + PostHog. The App Privacy labels in App Store Connect must
declare: photos/audio (app functionality), identifiers + usage data (analytics), crash data.
The hosted privacy policy must name third-party AI processors and state that user content is
transmitted to them. Mismatch between labels, policy, and observed traffic is a rejection.
Only request permissions the shipped template uses (see Step 0).

**1.2 — UGC / shareable AI output.** The app includes `expo-sharing`. If users can share or
publish AI-generated content, Apple requires moderation affordances: a way to report
objectionable content and, where there's any social surface, block users. **The boilerplate
does not ship a report/block UI** — if sharing beyond the user's own device is enabled, add
a report mechanism (even a mailto to `SUPPORT_EMAIL`) and state the moderation policy in the
review notes. Generation prompts already pass through server-side routes — keep provider
safety settings on.

**2.5.2 — No hidden or dormant features.** Disabled feature-flag code is fine, but anything
that flips features remotely post-review is not. Do not add remote overrides of
`CURRENT_TEMPLATE`; EAS Updates must not enable features that weren't in the reviewed build.

## Step 4 — Play Store differences

- **Data safety form** is mandatory and checked against actual traffic: declare images/audio
  collected and shared with third parties (AI providers), analytics identifiers (PostHog),
  crash logs (Sentry). Lying here gets the app removed later, not just rejected.
- **Content rating questionnaire**: the app produces AI-generated content — answer the
  user-generated/AI content questions honestly; expect a Teen-capable rating path.
- **New personal developer accounts must run a closed test** (12+ testers for 14 days) before
  production access is granted. Plan for this: submit to the `internal`/closed track first —
  the default `track: "internal"` in `eas.json` already does the right thing.
- Feature graphic (1024×500) is required; screenshots min 2 per form factor.

## Definition of done

- [ ] Step 0 pre-flight: every line passes
- [ ] Production builds for both platforms finish green on EAS
- [ ] Paywall shows price, duration, restore, terms + privacy links on a physical device
- [ ] Listing filled from `docs/APP_STORE_LISTING_TEMPLATE.md` + `docs/ASO_TEMPLATE.md`,
      including the subscription disclosure paragraph
- [ ] App Privacy labels (iOS) and Data safety form (Android) match the shipped SDK set
- [ ] Demo account + moderation note added to App Review notes if auth/sharing is enabled
- [ ] All four 4.3 differentiation items verified — this is the one that kills template apps

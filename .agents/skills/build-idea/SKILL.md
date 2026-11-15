---
name: build-idea
description: Use when building a complete app from a 100 App Ideas spec file — an ASO-validated idea spec with concept, keywords, competitors, pricing, and MVP features. Trigger on "build idea #N", "build this spec", or when the user provides a spec file with rank/primary_keyword frontmatter.
---

# Ship React Native — Build an App from an Idea Spec

You are turning an ASO-validated idea spec (from the 100 App Ideas product,
`specs/<rank>-<slug>.md`) into a running app on this boilerplate. The spec contains
validated market data — treat its keyword, pricing, and feature decisions as
requirements, not suggestions. The user's taste overrides the spec; the spec
overrides your defaults.

## Step 0 — Read the spec, gate on status

Parse the frontmatter. Act on `status`:

- `STRONG` / `MODERATE` — proceed.
- `UNVALIDATED` — warn that market demand and keyword data have not been audited. Proceed only after
  the human explicitly accepts that risk.
- `WEAK` — warn the user: weak search signal, only worth building with a distribution
  plan beyond ASO. Proceed only on explicit confirmation.
- `DEAD` / `SHIPPED` — stop and tell the user why (no search volume / already built).
  Suggest they pick another spec from `INDEX.md`.

## Step 1 — Emit `ship.config.ts` and apply it

Create the config spine before editing real screens:

1. Start from the spec's concept and run prompt inference with `@ship-rn/system`, for example:

   ```bash
   npx tsx -e "import { inferConfigFromPrompt, createShipConfig, validateShipConfig } from '@ship-rn/system'; const inferred = inferConfigFromPrompt(process.argv.slice(1).join(' ')); const config = createShipConfig({ app: { name: inferred.appName, supportEmail: 'support@example.com', privacyPolicyUrl: 'https://example.com/privacy', termsUrl: 'https://example.com/terms' }, branding: { name: inferred.appName }, template: inferred.template, auth: inferred.auth, monetization: inferred.monetization, backend: inferred.backend, modules: inferred.modules, flows: { onboarding: true, hardPaywall: inferred.monetization === 'revenuecat' } }); console.log(JSON.stringify({ inferred, validation: validateShipConfig(config), config }, null, 2));" "<spec concept>"
   ```

2. Adjust the inferred config with judgment from the spec: app name, branding, auth, monetization,
   backend, onboarding/hard-paywall flow, and the exact `modules` array.
3. Write `ship.config.ts` with `createShipConfig(...)` or a typed `ShipConfig` default export.
4. Run `npm run apply -- --force`. This rewrites constants, prunes unselected optional routes, and
   writes `.ship-rn-applied.json`, `PROJECT_SUMMARY.md`, and `REQUIRED_ENV.md`.
5. Fix validation errors before continuing. Warnings can continue only if they are intentional
   (for example, free anonymous AI chat without credits).

Only after this phase should you customize the real screens and stores.

## Step 2 — Configure the project (delegate to setup-ship-rn)

Run the `setup-ship-rn` skill using the spec to answer its questions:

- **App name**: derive from the spec name; verify the primary keyword fits the App Store
  title (≤30 chars total).
- **Template**: use frontmatter `suggested_features`. Empty list → `custom` with ALL AI
  features disabled (the app still gets auth, payments, onboarding, analytics, i18n).
  Non-empty → `custom` with exactly those flags enabled in `src/constants/features.ts`.
  Sanity-check the suggestion against the concept yourself — it comes from keyword
  heuristics, not a human.
- **Auth mode**: default to anonymous-only for utility apps (calculator/tracker/timer
  categories) — forced sign-in on a utility app hurts conversion and invites review
  friction. Social auth only if the concept needs persistence across devices.
- **Pricing**: from the spec's pricing table. Configure products in
  `src/constants/config.ts` (`PRODUCT_IDS`) and note the RevenueCat dashboard work
  (create weekly/monthly/annual products at the spec's price points, with the spec's
  trial). Hard paywall vs freemium: follow the spec's Monetization section.

## Step 3 — Plan the MVP screens

Before planning, require `design/<slug>/claude-design.md` and an inspectable exported artifact or
handoff under `design/<slug>/claude-design/`. If either is absent, stop and run `design-screens`; a
markdown-only pack is not an approved design. Read every design file and inspect the prototype
artifact. The approved Claude Design prototype and implementation contract are requirements:
routes, screen names, flows, states, component choices, accessibility, and dark-mode behavior must
match them. Surface any conflict with the spec for human resolution rather than silently choosing
one.

Map each "MVP features" bullet to screens before writing code. Constraints:

- Reuse the existing tab structure (`src/app/(app)/(tabs)/`) — rename/replace tabs rather
  than inventing a new navigation paradigm. Utility apps usually want 2–3 tabs, not 4.
- Every screen uses existing components from `src/components/ui/` and theme tokens via
  `useAppTheme()`. New components go in the matching category directory.
- Premium gating per the spec's monetization: free tier features vs premium features,
  gated with `usePremiumStatus` / `requirePremium` (see the `add-paywall` skill for the
  gating pattern and review guardrails).
- The spec's "implementation notes" were written for native iOS (SwiftUI/SwiftData) —
  translate: SwiftData → Zustand store with persistence (pattern: `useGeneralStore.ts`),
  bundled content → typed constants in `src/constants/`, "no backend needed" → skip
  Convex tables for app data, keep it local.

Present the screen plan (one line per screen: route, purpose, free/premium) to the user
before implementing.

## Step 4 — Implement

- Follow AGENTS.md conventions (screens, stores, components, i18n — all 5 locales for
  every user-facing string).
- Rewrite ALL onboarding copy (`src/constants/onboarding.ts` / `onboardingData.ts`) to be
  specific to this app — generic AI-boilerplate copy is a Guideline 4.3 rejection risk
  (see `prepare-store-submission`).
- Update `src/constants/brand.ts` with app-appropriate colors (ask the user or derive
  from the app's subject matter).
- Remove permission strings from `app.json` for capabilities this app doesn't use.
- `npm run validate` after every change; `npm run doctor` once configuration settles.

## Step 5 — ASO metadata (the spec's real value)

Draft the store listing from the spec's keyword data:

- **Title** (≤30 chars): app name + primary keyword. The primary keyword MUST appear.
- **Subtitle** (≤30 chars): highest-value target keywords not used in the title.
- **iOS keyword field** (≤100 chars): remaining target keywords, comma-separated, no
  spaces after commas, zero words repeated from title/subtitle.
- **Description**: lead with the concept, include the subscription disclosure paragraph
  from `docs/ASO_TEMPLATE.md` if using subscriptions.
- Check the spec's Competition table — mirror what top competitors' listings do well,
  differentiate from what they do badly (low ratings = read their reviews for complaints
  to solve in copy).

## Definition of done

- [ ] `npm run doctor` exits 0 and `npm run validate` passes
- [ ] App boots; every MVP feature from the spec works on simulator
- [ ] Only spec-relevant features visible (feature flags correct)
- [ ] Paywall reflects the spec's pricing; products mapped in config
- [ ] Onboarding copy is app-specific; branding is not boilerplate default
- [ ] ASO metadata drafted with primary keyword in the title
- [ ] Remaining human work listed: RevenueCat dashboard products, real device test,
      screenshots, then run `prepare-store-submission`

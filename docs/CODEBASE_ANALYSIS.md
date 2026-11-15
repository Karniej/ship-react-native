# ShipReactNative Codebase Analysis

This is a technical extraction map, not marketing copy. It records the state
reviewed for Phase 1 so later work can separate reusable product knowledge from
application-specific code without rediscovering the repository.

## Audited state

- Product: `Karniej/Ship-ReactNative`, branch
  `feature/shiprn-system-phase1`, base `ef8ed25`, handed off at `88e6d5f`.
- Config helper audit base: `Karniej/ship-rn`, `main` at
  `5d127c3f15cfd556ad4ffa7e0ee53cc02f08642a`.
- Current vendored helper source:
  `fix/system-review-findings` at
  `abaec6b475c07e86afbae3077d2047dc6f65d23b` (upstream PR #1).
- The product tree contained 375 tracked files at audit time. Its main code
  inventory included 30 route files, 59 components, 19 services, 15 hooks, 12
  constants modules, 9 Zustand store files, 9 utilities, 6 locale files, and 17
  Convex files.
- Runtime versions come from `package.json`: Expo 57, React Native 0.86, React
  19.2, Expo Router 57, Convex 1.31, RevenueCat 9.15, and Zustand 5.

## System boundary

The product contains two cooperating layers:

1. The vendored `@ship-rn/system` workspace package is the configuration
   brain. It owns the typed
   `ShipConfig`, a 13-module registry, prompt inference, dependency and
   compatibility validation, plan creation, generated config source, and
   browser-safe preview data. It is pure TypeScript with no runtime
   dependencies.
2. This repository is the production application and mutation target.
   `ship.config.ts` describes the selected product shape, while
   `scripts/apply-config.ts` applies that shape to the real Expo app.

The helper does not generate a substitute app. The older Studio approach was
explicitly rejected in the helper design because it replaced production
screens with placeholders. The landing configurator and this repository must
consume the same helper rules so a browser preview and an applied app do not
drift.

### Configuration spine

`prompt or selections → @ship-rn/system → ship.config.ts → apply-config.ts → app`

- The helper validates requested modules and their dependencies, infers a
  template, and produces a deterministic plan.
- The applier rewrites only the API, feature, brand, and config constants;
  removes optional route files when required; and writes
  `.ship-rn-applied.json`, `PROJECT_SUMMARY.md`, and `REQUIRED_ENV.md`.
- The applier has a dirty-tree guard, `--force`, `--dry-run`, and backup/rollback
  behavior. Phase 1 verified its dry run against the exact helper commit above.
- Feature gates in the root and tabs layouts keep optional routes out of the
  active navigation without scattering product decisions across screens.
- Six sample configs are exercised by `.github/workflows/apply-matrix.yml`.

The user install contract is now self-contained:
`@ship-rn/system` resolves from `file:packages/system` inside this repository.
Root validation builds the workspace package and runs its 26 Vitest tests before
the product's 41 Jest tests. `npm run apply` also builds the helper first. The
separate `Karniej/ship-rn` repository remains the upstream development home;
`packages/system/UPSTREAM.md` pins the source commit and sync rules for the
user-facing copy.

## Application architecture

- Expo Router routes live in `src/app/`; reusable UI lives in
  `src/components/`; domain access is concentrated in `src/services/`; client
  state lives in `src/store/`.
- The app supports two server paths. Convex is the more complete path, with
  auth, schema, credits, analytics, and AI actions. Expo API routes plus
  `src/services/ai/` provide the lighter server alternative. AI changes must
  keep both paths aligned.
- RevenueCat owns entitlements and paywalls. PostHog and Sentry provide product
  analytics and error reporting. Feature flags are centralized in
  `src/constants/features.ts`.
- Theme work belongs in the existing token and `useAppTheme()` system. The
  design skill converts an approved spec into screen, flow, style, state, and
  dark-mode requirements before implementation.
- Five locale files (`en`, `es`, `fr`, `de`, `it`) are an implementation
  contract: user-facing additions need synchronized keys.
- Native folders are generated prebuild output. Product identity and native
  configuration should enter through `app.json`, the config spine, or Expo
  plugins rather than manual native edits.

## Agent workflow and knowledge extraction

The System is deliberately an orchestrator plus specialist skills:

`Idea → Spec → Design → Setup → Build → Verify → Device-proof → Store-prep`

- `ship-system` owns sequencing, stage records, and human decisions. It does
  not duplicate specialist instructions.
- `create-spec` turns arbitrary input into the 100AppIdeas-compatible format.
  Without a keyword audit it writes `UNVALIDATED` and never invents scores.
- `design-screens` uses Anthropic's official Claude Design MCP, syncs repository tokens and
  components, and requires an interactive prototype plus inspectable repository handoff. Missing or
  unauthenticated Claude Design blocks the Design stage; there is no markdown-only fallback.
- `setup-ship-rn` and the config spine establish the reusable foundation before
  app-specific work.
- `build-idea` implements only an accepted spec and design pack.
- `validate-skills`, the app validation suite, and a production build provide
  separate checks for instructions, source code, and release shape.
- `verify-on-device` adds a Maestro simulator tier and an optional Callstack `agent-device`
  physical-device tier. Its report keeps simulator evidence distinct from real-device video,
  screenshots, logs, and replay artifacts.
- `prepare-store-submission` prepares artifacts but does not submit them.

The three human gates are part of the product behavior, not caveats: accept an
idea and its assumptions, approve the design, and approve any production build
or store submission. This is supervised automation.

## Documentation map

- Cold start: `AGENTS.md`, `.agents/manifest.json`, `START_HERE.md`, and
  `CLAUDE.md`. Claude Design setup and handoff rules live in `docs/CLAUDE_DESIGN.md`.
- Configuration: `ship.config.ts`, `docs/ARCHITECTURE.md`,
  `docs/SETUP_GUIDE.md`, `docs/CUSTOMIZATION.md`, and `docs/SCRIPTS.md`.
- UI implementation: `docs/DESIGN_SYSTEM.md`, `docs/COMPONENTS.md`, and
  `docs/FEATURES.md`.
- Backend and safety: `docs/CONVEX_SETUP.md`,
  `docs/API_ROUTES_AND_PROMPTS.md`, `docs/SECURITY.md`, and
  `docs/SECURITY_CHECKLIST.md`.
- Verification and operations: `docs/TESTING.md`, `docs/DEBUGGING.md`,
  `docs/PERFORMANCE.md`, and `docs/COST_GUIDE.md`.
- Release: `docs/EAS_DEPLOYMENT.md`, `docs/APP_STORE_CHECKLIST.md`,
  `docs/APP_STORE_LISTING_TEMPLATE.md`, `docs/ASO_TEMPLATE.md`, and the
  screenshot/localization guide.

## Verified gaps and extraction risks

1. **Version drift.** `README.md` and parts of `docs/FEATURES.md` and
   `DOCUMENTATION.md` still describe Expo 55 / React Native 0.83, while
   `package.json` is Expo 57 / React Native 0.86. Generated facts should come
   from package metadata rather than duplicated prose.
2. **Historical backend language.** `docs/ARCHITECTURE.md` identifies Convex
   and Expo API Routes as the current choices, but older material in `docs.md`
   and portions of debugging, scripts, performance, and planning documents
   still mention Supabase or Edge Functions. Extract current rules only after
   checking them against source.
3. **Two setup systems.** `npm run setup` is an older interactive mutation
   path; `ship.config.ts` plus `npm run apply` is the deterministic product
   spine. Main onboarding still emphasizes the wizard, so these paths need one
   documented ownership rule before user delivery.
4. **Uneven completeness.** `docs/FEATURES.md` marks Expo API parity, E2E
   coverage, notifications, permissions, and store-review flows as scaffolded
   or incomplete. A skill must not present a scaffold as a finished capability.
5. **Narrow app tests.** The product has four committed Jest test files for a
   much larger route/component/service surface. The six-config apply matrix is
   valuable, and the helper has 26 passing tests, but neither replaces app
   behavior tests or a real device/store proof run.
6. **Vendored-package synchronization.** User delivery no longer needs a
   sibling checkout, but changes made in `Karniej/ship-rn` do not flow here
   automatically. Every sync must update `packages/system/UPSTREAM.md` and
   pass both helper and product validation from a clean product-only clone.
7. **License boundary.** The product is open source under the MIT `LICENSE`.
   Vendored third-party material keeps its own licence; record it in
   `THIRD_PARTY_NOTICES.md` when adding any.
8. **Theme-token debt.** CodeRabbit's full base-to-head review found hard-coded
   UI palettes in the pre-existing July gallery modals and web native-control
   shims. They should be moved to `useAppTheme()` and a shared content-type
   palette in a focused UI cleanup, not mixed into the System packaging branch.
9. **Upstream synchronization state.** The PR #2 helper corrections were made
   source-first in `Karniej/ship-rn` at `abaec6b`, then re-vendored here.
   Upstream PR #1 must land on `main`; after merge, update the branch label in
   `packages/system/UPSTREAM.md` without changing the pinned source commit.

## Recommended extraction order

1. Treat the config types, registry, validators, and planner as the stable
   machine-readable product model.
2. Extract verified implementation recipes from the specialist skills and the
   source paths they cite; do not extract claims from stale overview prose.
3. Keep the vendored config/applier contract pinned to an audited upstream
   commit and make CI prove a product-only clean clone.
4. Add contract tests for each app module and the two backend paths, then record
   one full supervised idea-to-store-prep run as product proof.
5. Generate user-facing manifests and version facts from source-controlled
   schemas so the landing page, docs, and agent instructions stay aligned.

## Validation baseline

At the audited SHAs, the helper completed 22 Vitest tests and ESM, CJS, and
type-declaration builds. Phase 1 product validation completed lint with zero
errors in the product tree, TypeScript, all 41 Jest tests, the default config
dry run, and an all-platform Expo production export. Root ESLint intentionally
excludes `packages/system`; the helper is independently protected by its
browser-safety test, 26-test Vitest suite, and ESM/CJS/declaration build. The
vendoring follow-up added those checks to root validation. The export reported
missing optional Sentry organization/project configuration. Existing lint
warnings and a React test `act(...)` console warning remain baseline noise;
they were not introduced or hidden by this work.

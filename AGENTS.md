# AGENTS.md — ShipReactNative System

## What this repository is

ShipReactNative System is a supervised agent workflow for turning an app idea into a verified,
store-ready Expo + React Native project. The production foundation uses Expo SDK 57, React Native
0.86, TypeScript, Expo Router, Zustand, Convex or Expo API Routes, RevenueCat, PostHog, Sentry, and
five locales.

Read `.agents/manifest.json` for the machine-readable product and skill index.

## System pipeline

`Idea → Validate → Spec → Design → Setup → Build → Verify → Device-proof → Store-prep`

Start with the `ship-system` skill. It coordinates the stages; the specialist skills own the work.
This is a supervised pipeline, not an autonomous loop.

### Human gates

1. **Idea validation:** a person reviews fresh evidence and approves a STRONG or MODERATE idea; WEAK requires an explicit risk override.
2. **Design review:** stop after the Claude Design prototype and handoff. Do not build until a person approves it.
3. **Store submission:** prepare the release, then stop. Never submit to a store without approval.

## Files the System creates

- Validation evidence: `validation/<slug>/evidence.json` and `report.md`
- Idea specs: `specs/<slug>.md`
- Claude Design prototypes and implementation packs: `design/<slug>/`
- Run paper trail: `system-runs/<slug>/run.md` and `run-state.json`
- Device evidence: `system-runs/<slug>/device-proof/`
- Deterministic app configuration: `ship.config.ts`
- Applied-config record: `.ship-rn-applied.json`, `PROJECT_SUMMARY.md`, `REQUIRED_ENV.md`

## Skills

| Skill                         | Job                                                                    | Trigger                                                     |
| ----------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `ship-system`                 | Run the supervised end-to-end pipeline                                 | “run ShipReactNative System”, “build an app from this idea” |
| `validate-idea`               | Validate an idea with fresh, attributable market evidence              | “validate this app idea”, “research this idea”              |
| `create-spec`                 | Turn an approved validation report into an app spec                    | “create a spec”, “turn this idea into a spec”               |
| `design-screens`              | Create and hand off the reviewed Claude Design prototype               | “design the screens”, “create a design pack”                |
| `setup-ship-rn`               | Configure a fresh clone and apply `ship.config.ts`                     | “set up my app”, “configure this boilerplate”               |
| `build-idea`                  | Build an app from an approved idea spec and design pack                | “build this spec”, “build idea #N”                          |
| `add-ai-service`              | Add an AI provider across both backend modes                           | “add an AI service”, “integrate OpenAI”                     |
| `add-paywall`                 | Add or change RevenueCat paywalls and premium gates                    | “add a paywall”, “change subscriptions”                     |
| `verify-on-device`            | Run Maestro E2E and optionally capture honest physical-device evidence | “verify on device”, “record the app on a phone”             |
| `prepare-store-submission`    | Check and prepare App Store and Play Store release assets              | “prepare for review”, “release my app”                      |
| `validate-skills`             | Validate skill metadata, System files, and pipeline agreement          | “validate skills”, `/validate-skills`                       |
| `react-native-best-practices` | Diagnose React Native performance and architecture issues              | React Native performance work                               |
| `upgrading-react-native`      | Upgrade React Native or Expo safely                                    | React Native or Expo upgrade work                           |
| `github`                      | Work with GitHub branches and pull requests                            | GitHub workflow tasks                                       |

## Start from an idea

1. Read `.agents/skills/ship-system/SKILL.md`.
2. Give it a raw idea or an existing `specs/*.md` path; stale or missing validation is refreshed.
3. Authenticate Claude Design, then keep its handoff, the spec, and run log as the paper trail.
4. Stop at every human gate.

If you only need one stage, invoke that specialist skill directly.

## Core commands

| Command                                         | Purpose                                                    |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `npm install`                                   | Install dependencies and repository hooks                  |
| `npm run apply -- --force`                      | Apply `ship.config.ts` deterministically                   |
| `npm run doctor`                                | Check app identity, environment, backend, and placeholders |
| `npm run device:help`                           | Read the pinned agent-device operating contract            |
| `npm run validate`                              | Run lint, TypeScript, and the full Jest suite              |
| `npx tsc --noEmit`                              | Run the explicit TypeScript acceptance check               |
| `npm start` / `npm run ios` / `npm run android` | Run the app                                                |

## Architecture and rules

- Application code lives in `src/`; routes live in `src/app/`.
- `ship.config.ts` is the configuration source of truth. Apply it before app-specific coding.
- AI features have two server paths: `convex/ai/` and `src/app/api/` + `src/services/ai/`. Keep them aligned.
- Use feature flags in `src/constants/features.ts`; do not delete optional feature code.
- Use theme tokens through `useAppTheme()`; do not add NativeWind or hard-coded UI colors.
- Put server secrets in Convex or the server deployment environment, never in `EXPO_PUBLIC_*`.
- Keep `src/locales/en.ts`, `es.ts`, `fr.ts`, `de.ts`, and `it.ts` in sync.
- Treat `ios/` and `android/` as generated prebuild output; change `app.json` instead.
- Do not restructure `convex/auth.ts`, `src/services/purchases.service.ts`, or `patches/` without approval.
- Never invent market numbers. Use `unvalidated` when a source cannot verify a value.

## Docs index

| Need                    | Read                                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
| System workflow         | `.agents/manifest.json`, `docs/RECOVERY_CONTRACT.md`                            |
| Idea validation         | `docs/IDEA_VALIDATION.md`, `opportunity-data/100appideas/SOURCE.md`             |
| Codebase extraction     | `docs/CODEBASE_ANALYSIS.md`                                                     |
| Setup and configuration | `START_HERE.md`, `docs/SETUP_GUIDE.md`, `docs/CUSTOMIZATION.md`                 |
| Architecture and design | `docs/CLAUDE_DESIGN.md`, `docs/DESIGN_SYSTEM.md`, `docs/COMPONENTS.md`          |
| Testing and debugging   | `docs/TESTING.md`, `docs/DEBUGGING.md`                                          |
| Device proof            | `docs/DEVICE_PROOF.md`                                                          |
| Release and stores      | `docs/EAS_DEPLOYMENT.md`, `docs/APP_STORE_CHECKLIST.md`, `docs/ASO_TEMPLATE.md` |

Commits use lowercase conventional subjects. See `CLAUDE.md` for the exact format.

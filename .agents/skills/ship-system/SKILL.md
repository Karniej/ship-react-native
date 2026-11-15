---
name: ship-system
description: Use when running ShipReactNative System from a raw app idea or an existing idea spec through design, setup, implementation, verification, device proof, and store preparation. Trigger on "run ShipReactNative System", "build an app from this idea", "take this idea to the App Store", or "run the full app pipeline".
---

# ShipReactNative System — Supervised App Pipeline

Coordinate the existing specialist skills in this exact order:

`Idea → Validate → Spec → Design → Setup → Build → Verify → Device-proof → Store-prep`

This is a supervised pipeline, not an autonomous loop. Do not duplicate specialist instructions,
skip a human gate, submit to a store, or hide a failed stage.

## Step 0 — Open the run paper trail

Accept either a raw idea or a `specs/*.md` path. Resolve the slug without overwriting existing work.
Create `system-runs/<slug>/run.md` and `system-runs/<slug>/run-state.json`. Follow
`docs/RECOVERY_CONTRACT.md`; record:

- input text or spec path
- current stage, attempt, checkpoint hashes, and one of the statuses defined by the recovery contract
- start time, output paths, commands run, check results, human decisions, and remaining TODOs

Update both records after every stage and before every external mutation. Never place secrets in
either record. On resume, verify the last passed checkpoint input and output hashes and continue from
the first invalid or incomplete stage; never blindly restart the run.

## Stage 1 — Idea

- Raw idea: record the idea and continue to Validate.
- Existing spec: read it completely. Bypass Validate only when it links a complete, fresh validation
  report whose evidence passes `docs/IDEA_VALIDATION.md`; otherwise refresh validation.
- Historical 100AppIdeas scores are seed evidence, not permission to bypass live validation.

## Stage 2 — Validate

Run `validate-idea`. Record `validation/<slug>/evidence.json`, `report.md`, scoring version,
sources, fetch times, score, and verdict. Branch on the result:

- `STRONG` or `MODERATE`: present the evidence and stop for human approval before Spec.
- `WEAK`: return to Idea refinement unless a human explicitly overrides with the accepted risk.
- `DEAD`: stop; a human may revise the idea, but may not silently relabel the evidence.
- `UNVALIDATED`: stop for missing, stale, conflicting, or unavailable evidence.

## Stage 3 — Spec

Run `create-spec` from the approved validation report; record the new or updated
`specs/<slug>.md` path. An existing approved spec may be retained when its linked validation remains
fresh and its assumptions have not changed.

## Stage 4 — Design

Run `design-screens` with the approved spec. Record the Claude Design project identifier,
`design/<slug>/claude-design.md`, the repository export/handoff path, and the complete design pack.
If Claude Design is unavailable or unauthenticated, mark the stage blocked and stop; there is no
markdown-only fallback.

**STOP: human design review.** Mark the stage `blocked` until a person reviews the interactive
prototype and its implementation contract, then approves it or requests changes. Do not configure
or build the app before approval. Record the decision verbatim.

## Stage 5 — Setup

Run `setup-ship-rn` using the approved spec and design pack. Generate or update `ship.config.ts`
through `@ship-rn/system`, then run:

```bash
npm run apply -- --force
```

Record `ship.config.ts`, `.ship-rn-applied.json`, `PROJECT_SUMMARY.md`, and `REQUIRED_ENV.md`. Stop on
config validation errors. Record missing credentials as TODOs with their correct destination.

## Stage 6 — Build

Run `build-idea`. Treat every file in `design/<slug>/` as an implementation requirement. Record the
implemented routes, components, stores, feature flags, translations, and any approved design change.

## Stage 7 — Verify

Run the full checks and record each exit result:

```bash
npm run doctor
npm run validate
npx tsc --noEmit
npx expo export --platform all
```

Fix failures before continuing. Do not report a skipped check as passing. If an external credential,
simulator, or service blocks a check, record the blocker and stop.

### Build and install handoff

Before Device-proof, resolve the installed app identifier from the applied Expo configuration and
build, install, and launch the app on the declared target. Use the platform command appropriate to
the selected simulator, emulator, or discovered physical device (for example `npm run ios -- --device`
or `npm run android -- --device`). If the run uses an Expo/dev-client URL instead, launch that URL
on the selected target. Record the build, installation, and launch commands and exit results in
`run.md`, with sensitive arguments redacted. Stop if any handoff step fails.

## Stage 8 — Device-proof

Run `verify-on-device` with `platform`, a plain-English journey, a declared target of `local-sim`
or `local-device`, and the resolved installed app identifier or Expo/dev-client URL. First author
and pass the Maestro YAML flow on a local emulator/simulator. For a `local-device` run, repeat the
journey through the pinned `agent-device` CLI on the explicitly discovered physical device and
preserve its MP4, screenshots, logs, and `.ad` replay evidence under
`system-runs/<slug>/device-proof/`.

Record the observed target class and link `device-proof/report.md` from the run log. Simulator
evidence must never be called real-device evidence, and Maestro Cloud must never support that claim.
If a required physical device or iOS signing prerequisite is unavailable, preserve the simulator
tier, mark the stage blocked, and stop.

## Stage 9 — Store-prep

Run `prepare-store-submission` in preparation mode: complete its pre-flight analysis, metadata, ASO,
privacy, asset, paywall, and review-readiness work. Do not run `npm run release`, create tags, start
EAS production builds, or execute `eas submit` without separate approval.

**STOP before any actual store submission.** Present the full readiness report and remaining human
work. Submission requires a new explicit human decision.

## Definition of done

- [ ] Run log and state contain every attempt, checkpoint hash, output, failure, and human decision
- [ ] Fresh validation evidence, score, verdict, and explicit idea approval are recorded
- [ ] Resume starts at the first invalid or incomplete checkpoint; no unresolved failed attempt is hidden
- [ ] Claude Design project, synced design system, and repository export/handoff are recorded
- [ ] Spec, design pack, applied config, and implemented app agree
- [ ] Doctor, validate, TypeScript, and production export checks pass or blockers are named
- [ ] Device-proof report names the actual target class, links back to run.md, and records non-empty artifact sizes and SHA-256 hashes
- [ ] Run log links the Device-proof report and records the build, install, and launch handoff
- [ ] Real-device claims include a physical target, passing `.ad` replay, non-empty MP4, screenshots, and logs, with every artifact hashed
- [ ] Store-readiness report exists
- [ ] No release tag, production build, or store submission occurred without approval

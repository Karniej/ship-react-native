---
name: validate-idea
description: Use before creating a spec to validate a raw mobile app idea against fresh, source-backed market, keyword, competition, policy, and build evidence. Trigger on "validate this app idea", "is this app worth building", "research this idea", or when ShipReactNative System receives an unvalidated idea.
---

# ShipReactNative System — Validate an Idea

Turn a raw idea into an evidence-backed decision before Spec. Never turn a stale snapshot, a plausible
story, or missing provider data into a numeric grade.

## Inputs

- raw idea and target user
- target market, defaulting to `US App Store / iPhone` only when the user does not specify one
- run slug
- optional existing 100AppIdeas seed spec

Read `docs/IDEA_VALIDATION.md` and `opportunity-data/100appideas/SOURCE.md`. The vendored 100AppIdeas
snapshot is a hypothesis seed and scoring reference. Its May 2026 metrics are stale and cannot grade
a new run without fresh research.

## Step 1 — Open evidence files

Create:

- `validation/<slug>/evidence.json` matching `OpportunityEvidence` from `@ship-rn/system/opportunity`
- `validation/<slug>/report.md`
- a Validate checkpoint in `system-runs/<slug>/run-state.json`

Do not overwrite approved evidence. Start a new attempt and preserve the prior files when rerunning.

## Step 2 — Research the market

Collect current evidence for the declared market:

1. Candidate keyword clusters from the idea, user language, category language, and the seed dataset.
2. Keyword volume or popularity, chance, difficulty, result/app count, and explicit search-intent
   score. Use a connected keyword provider when available.
3. Direct App Store and Play Store competitors, current review counts, ratings, positioning,
   monetization, and repeated review pain points.
4. Trend/demand evidence, distribution options beyond ASO, policy/IP risk, platform feasibility,
   build time, and maintenance burden.

Every metric must reference a source entry with provider, stable URL or provider reference, market,
and fetched-at timestamp. Keep raw provider terms distinct; map them into the normalized evidence
schema only when their meaning is known.

## Step 3 — Handle unavailable or conflicting evidence

- Missing required metrics: record `null`, mark Validate `blocked` or `degraded`, and return
  `UNVALIDATED`. Never estimate a provider number.
- Provider rate limit, outage, network error, or timeout: use `retryable-failed` only within the
  retry budget in `docs/RECOVERY_CONTRACT.md`.
- Invalid idea, policy stop, or unsupported platform capability: use `terminal-failed`.
- Conflicting sources: keep both, explain the conflict, lower confidence, and request a human
  decision when the verdict changes.
- Evidence older than 30 days: stale; refresh it before grading.

## Step 4 — Score and decide

Run the normalized evidence through `scoreOpportunity`. The versioned 100AppIdeas v1 rules require:

- at least one keyword with volume greater than 20 and difficulty below 45
- exact or adjacent app intent, not a broad head term or brand/IP query
- saturation, keyword-cluster depth, competition, build friction, and policy risk in the score
- only `STRONG`, `MODERATE`, `WEAK`, `DEAD`, or `UNVALIDATED` as the verdict

Decision branches:

- `STRONG` or `MODERATE`: recommend proceeding to Spec after human approval.
- `WEAK`: return to Idea refinement unless the user approves a non-ASO distribution thesis.
- `DEAD`: reject the idea as-is; preserve the evidence and propose a narrower wedge.
- `UNVALIDATED`: stop. Missing or stale evidence is not a weak score and not permission to build.
- Human override: record the decision and rationale; never rewrite the evidence or computed verdict.

## Step 5 — Write the report and checkpoint

`report.md` must contain the idea, market, scoring version, fetched-at dates, source links, normalized
metrics, competitor table, score components, verdict, confidence, risks, contradictions, and next
branch. Link `evidence.json` and the report from both `run.md` and `run-state.json`.

A passed Validate checkpoint requires fresh source-backed evidence, the evidence and report hashes,
and the computed verdict. Do not run `create-spec` until the human accepts the verdict or explicitly
records an override.

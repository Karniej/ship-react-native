# Idea validation

ShipReactNative System has two supported entry paths:

```text
Raw idea ──→ Validate ──→ proceed / refine / reject / human override ──→ Spec
Existing validated spec ──────────────────────────────────────────────→ Spec
```

An existing spec may bypass fresh validation only when it links a complete validation report whose
sources remain within the freshness window. The vendored 100AppIdeas snapshot is a seed, not a
permanent bypass.

## Evidence contract

`validation/<slug>/evidence.json` uses `OpportunityEvidence` from
`@ship-rn/system/opportunity`. It contains:

- declared market and research timestamp
- keyword volume, chance, difficulty, results/app count, and intent score
- competitors with current review counts and ratings
- build-time and policy-risk classifications
- source records with provider, reference, market, and fetched-at timestamp

Every numeric metric must cite a known source. Missing values remain `null`. Evidence older than 30
days is stale by default. Provider terms must be mapped explicitly; do not pretend that popularity,
volume, chance, and difficulty are interchangeable when a provider defines them differently.

## Versioned scoring

`100appideas-v1` preserves the useful 100AppIdeas rules:

- volume greater than 20 and difficulty below 45 for a qualifying keyword
- keyword strength plus intent and cluster depth
- direct-competition adjustment
- small build-friction bonus
- review/high policy-risk penalty
- `STRONG` at 50+, `MODERATE` at 36–49, `WEAK` at 21–35, and `DEAD` when no
  keyword qualifies or score is 20 or below

Incomplete or stale evidence always returns `UNVALIDATED` with errors. It never receives a synthetic
score.

## Human decision gate

- `STRONG` / `MODERATE`: approve proceeding to Spec.
- `WEAK`: refine the wedge or explicitly approve a non-ASO distribution thesis.
- `DEAD`: reject as-is and return to Idea.
- `UNVALIDATED`: stop and obtain evidence.
- Override: preserve the computed result and separately record the owner’s rationale.

The report must expose uncertainty, contradictions, provider failures, platform constraints, policy
risk, expected maintenance, and the next branch. Validation is a decision aid, not a revenue promise.

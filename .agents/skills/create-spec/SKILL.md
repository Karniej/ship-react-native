---
name: create-spec
description: Use when turning an approved idea-validation report into a ShipReactNative idea spec before design or implementation. Trigger after ShipReactNative System validates an idea or on "create a spec".
---

# ShipReactNative System — Create an Idea Spec

Turn an approved validation report into an honest, machine-readable spec at `specs/<slug>.md`.
When invoked alone without a valid report, it may structure an idea only as `UNVALIDATED`.

## Step 0 — Understand the idea

Use details the user already supplied. Ask one concise question only when the target user or core
job is too ambiguous to choose useful MVP features.

Choose a lowercase hyphenated slug. Do not overwrite an existing spec without approval.

## Step 1 — Separate facts from assumptions

Reason from the idea to propose:

- a plain-language concept and target user
- category and plausible build-time class (`weekend`, `week`, or `complex`)
- an entry pricing tier and MVP features
- competitors or alternatives only when they are known or found through real research

Never invent search volume, difficulty, scores, rankings, review counts, or competitor facts.
Historical 100AppIdeas data in `opportunity-data/100appideas/` is only a seed. Numeric fields may
come only from a fresh `validation/<slug>/report.md` and its source-backed evidence file.

## Step 2 — Write the spec

Create `specs/<slug>.md` with this exact frontmatter shape:

```yaml
---
rank: unvalidated
name: "App Name"
slug: app-name
status: UNVALIDATED
category: Utilities
build_time: weekend
pricing_tier: entry
primary_keyword: "unvalidated"
keyword_popularity: unvalidated
keyword_difficulty: unvalidated
total_score: unvalidated
top_competitor_reviews: unvalidated
validation_report: unvalidated
validation_fetched_at: unvalidated
scoring_version: unvalidated
suggested_features:
  - feature-name
---
```

Use only `STRONG`, `MODERATE`, `WEAK`, `DEAD`, or `UNVALIDATED` for `status`. Copy a graded status and numeric market fields only from a complete, fresh validation report.
Without one, use `UNVALIDATED` and `unvalidated` for every validation field.

Write these body sections in order:

1. `## Concept` — user, problem, and outcome
2. `## Validation data` — cite the report and evidence sources, or list every unvalidated field
3. `## Target keywords (ASO)` — hypotheses clearly labelled unvalidated
4. `## Competition table` — source-backed entries only; otherwise an explicit research TODO
5. `## MVP features` — numbered features with a short acceptance statement for each

Every MVP feature must be concrete enough for `design-screens` to map it to one primary screen.

## Step 3 — Check the file

Before finishing:

- parse the YAML mentally for valid indentation and quoting
- confirm `slug` matches the filename
- confirm every graded field exactly matches the linked validation report; otherwise all are
  unvalidated
- confirm no number or competitor claim lacks a named source
- report whether the validation link is fresh, stale, or absent

Report the spec path and the human idea-choice gate. Do not run Design until the user chooses this
idea or explicitly asks ShipReactNative System to continue.

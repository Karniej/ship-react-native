---
rank: 10
name: "Game Sheet"
slug: game-sheet
status: MODERATE
category: Sports
build_time: week
pricing_tier: entry
primary_keyword: "gamesheet"
keyword_popularity: 28
keyword_difficulty: 13
total_score: 48
top_competitor_reviews: 11
suggested_features: []
---

# Game Sheet

> Decent signal — build it lean, validate fast.

## Concept

Universal digital score sheet for any sport or game. Pre-built templates for hockey, soccer, basketball, plus custom scoring. Track stats per player, period scores, penalties. Export game reports as PDF.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'gamesheet' is pop 28 / diff 13, with 185 App Store apps, 1 qualifying tracked keyword, and adjacent app-intent (85/100). Captured direct competitors are small at 11 reviews. It survives, but no longer ranks as an obvious top build.

- Primary keyword: **"gamesheet"** — popularity 28, difficulty 13
- Apps competing on the keyword: 185
- Total opportunity score: 48

## Target keywords (ASO)

- gamesheet
- score sheet
- game scorer
- sports scorecard
- hockey score
- soccer score

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                      | Reviews | Rating |
| ------------------------ | ------- | ------ |
| GameSheet Teams          | 6       | 3.7    |
| GameSheet Soccer Scoring | 1       | -      |
| RAMP GameSheets          | 11      | 4.4    |
| Game Sheet               | 1       | 5.0    |

## MVP features

- Pre-built templates for hockey, soccer, basketball
- Custom scoring templates
- Per-player stat tracking
- Period scores and penalties
- PDF game report export
- Universal game scoring

## Monetization

Freemium — 3 free templates, premium for all sports + custom + export. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; SwiftData; PDF export; Template engine

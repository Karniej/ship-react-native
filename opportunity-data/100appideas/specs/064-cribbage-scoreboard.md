---
rank: 64
name: "Cribbage Scoreboard"
slug: cribbage-scoreboard
status: DEAD
category: Games
build_time: week
pricing_tier: premium
primary_keyword: "cribbage"
keyword_popularity: 22
keyword_difficulty: 38
total_score: 19
top_competitor_reviews: 1576
suggested_features: [imageIdentification]
---

# Cribbage Scoreboard

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Native cribbage pegboard for in-person play — beautiful wooden-board UI, two/three/four-player support, automatic scoring (pairs/15s/runs/flushes auto-detected), match history, win streaks. Apple Watch companion for remote pegging.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'peg' is pop 22 / diff 38, with 178 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Competition is real at 1,576 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"cribbage"** — popularity 22, difficulty 38
- Apps competing on the keyword: 178
- Total opportunity score: 19

## Target keywords (ASO)

- cribbage
- cribbage scoreboard
- pegboard
- score
- peg
- crib
- card
- pair
- run
- muggins

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                        | Reviews | Rating |
| -------------------------- | ------- | ------ |
| Cribbage Pro               | 59,648  | 4.7    |
| Cribbage Classic           | 30,511  | 4.6    |
| Ultimate Cribbage: Classic | 30,478  | -      |
| Cribbage Pegboard          | 1,576   | 4.6    |
| Cribbage Premium           | 8,103   | -      |

## MVP features

- Wooden-board pegboard UI
- 2/3/4-player support
- Auto-detected scoring (pairs/15s/runs/flushes)
- Match history + win streaks
- Apple Watch companion
- Optional pass-and-play via GameKit

## Monetization

Hard paywall. $4.99/week or $39.99/year. Card-game scorekeepers historically convert strongly.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI canvas drawing; WatchKit; GameKit

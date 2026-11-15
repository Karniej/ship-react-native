---
rank: 59
name: "Volleyball Scorer"
slug: volleyball-scorer
status: DEAD
category: Sports
build_time: week
pricing_tier: premium
primary_keyword: "volleyball score"
keyword_popularity: 19
keyword_difficulty: 42
total_score: 20
top_competitor_reviews: 77
suggested_features: []
---

# Volleyball Scorer

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Volleyball-specific scoreboard with rotation tracking, serve tracking, and timeout management. Dedicated tool for volleyball coaches and players.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'volleyball scoreboard' is pop 19 / diff 42, with 233 App Store apps, 0 qualifying tracked keywords, and adjacent app-intent (72/100). Captured direct competitors are small at 77 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"volleyball score"** — popularity 19, difficulty 42
- Apps competing on the keyword: 233
- Total opportunity score: 20

## Target keywords (ASO)

- volleyball score
- volleyball scorer
- volleyball scoreboard
- volleyball app
- volleyball tracker

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                     | Reviews | Rating |
| ----------------------- | ------- | ------ |
| Volleyball Score Simple | 77      | 4.5    |

## MVP features

- Volleyball-specific scoreboard
- Rotation tracking
- Serve tracking
- Timeout management
- Set and match tracking
- Export game stats

## Monetization

Freemium — basic scoring free, premium for stats and rotation. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; SwiftData; Scorer engine

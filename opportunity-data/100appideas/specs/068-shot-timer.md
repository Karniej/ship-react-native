---
rank: 68
name: "Shot Timer"
slug: shot-timer
status: DEAD
category: Sports
build_time: week
pricing_tier: premium
primary_keyword: "shot timer"
keyword_popularity: 6
keyword_difficulty: 13
total_score: 17
top_competitor_reviews: 946
suggested_features: [imageIdentification]
---

# Shot Timer

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Precision shot timer for firearms training. Detect shots via microphone, display split times, record strings. Include par time mode, random start delay, and drill templates.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'shot timer' is pop 6 / diff 13, with 218 App Store apps, 0 qualifying tracked keywords, and exact app-intent (100/100). Captured direct competition is manageable at 946 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"shot timer"** — popularity 6, difficulty 13
- Apps competing on the keyword: 218
- Total opportunity score: 17

## Target keywords (ASO)

- shot timer
- par timer
- range timer
- firearms training
- shooting timer
- gun timer

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| ShootOnTime: Par Timer         | 946     | 4.9    |
| Range Timer AP                 | 11      | 3.3    |
| Par Timer Pro: Firearm Trainer | 341     | 4.6    |
| Gun Shot Timer                 | 197     | 2.0    |

## MVP features

- Shot detection via microphone
- Split time display
- Par time mode with random start delay
- Drill templates
- String recording and history
- Export session data

## Monetization

Hard paywall — basic timer free, premium for drills, history, export. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): AVAudioEngine for shot detection; High-precision timing; SwiftUI

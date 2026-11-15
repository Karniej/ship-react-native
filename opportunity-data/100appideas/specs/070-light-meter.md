---
rank: 70
name: "Light Meter"
slug: light-meter
status: DEAD
category: Photo & Video
build_time: week
pricing_tier: premium
primary_keyword: "light meter"
keyword_popularity: 54
keyword_difficulty: 46
total_score: 15
top_competitor_reviews: 2428
suggested_features: []
---

# Light Meter

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Professional light meter using your phone's camera sensor. Measure lux, EV, foot-candles for photography, cinematography, and interior design. Includes exposure calculator and color temperature reading.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'light meter' is pop 54 / diff 46, with 217 App Store apps, 0 qualifying tracked keywords, and adjacent app-intent (72/100). Competition is real at 2,428 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"light meter"** — popularity 54, difficulty 46
- Apps competing on the keyword: 217
- Total opportunity score: 15

## Target keywords (ASO)

- light meter
- lux meter
- exposure meter
- photography light
- foot candles
- ev meter

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| myLightMeter Pro             | 2,428   | 4.6    |
| Lux Light Meter Pro          | 312     | 4.3    |
| Light Meter - Exposure Guide | 156     | 4.4    |

## MVP features

- Lux, EV, and foot-candle measurements
- Exposure calculator
- Color temperature reading
- Incident and reflected modes
- Measurement history and logging
- Calibration settings

## Monetization

Hard paywall — basic readings free, premium for advanced modes. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): AVFoundation (camera sensor); Core Motion; SwiftUI; Measurement algorithms

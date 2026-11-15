---
rank: 39
name: "Heat Index Calculator"
slug: heat-index-calculator
status: WEAK
category: Weather
build_time: week
pricing_tier: premium
primary_keyword: "heat index"
keyword_popularity: 31
keyword_difficulty: 17
total_score: 30
top_competitor_reviews: 1600
suggested_features: []
---

# Heat Index Calculator

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Instant heat index calculation from temperature and humidity. Show risk levels, work-rest schedules per OSHA guidelines, and real-time weather integration. Target outdoor workers, coaches, and event planners.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'heat index' is pop 31 / diff 17, with 205 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (65/100). Competition is real at 1,600 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"heat index"** — popularity 31, difficulty 17
- Apps competing on the keyword: 205
- Total opportunity score: 30

## Target keywords (ASO)

- heat index
- heat safety
- osha heat
- wet bulb temperature
- heat stress
- weather safety

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| OSHA-NIOSH Heat Safety Tool  | 294     | 2.5    |
| Heat Safety                  | 1,600   | 4.6    |
| Heat Index: NIOSH Calculator | 0       | -      |

## MVP features

- Instant heat index calculation
- Color-coded risk levels
- OSHA work-rest schedules
- Real-time weather integration
- Push notifications for danger thresholds
- Historical heat data charts

## Monetization

Freemium — basic calc free, premium for weather integration, alerts, history. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; WeatherKit; Heat index formula; Notifications

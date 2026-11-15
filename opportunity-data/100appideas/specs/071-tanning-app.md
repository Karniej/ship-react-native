---
rank: 71
name: "Tanning App"
slug: tanning-app
status: DEAD
category: Health & Fitness
build_time: week
pricing_tier: premium
primary_keyword: "tanning app"
keyword_popularity: 48
keyword_difficulty: 45
total_score: 15
top_competitor_reviews: 10174
suggested_features: []
---

# Tanning App

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

UV-aware tanning timer with skin type assessment, real-time UV index, and safe exposure recommendations. Track your tan progress with photo comparison and get alerts to flip or reapply sunscreen.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'uv index' is pop 48 / diff 45, with 200 App Store apps, 0 qualifying tracked keywords, and adjacent app-intent (72/100). Competition is heavy at 10,174 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"tanning app"** — popularity 48, difficulty 45
- Apps competing on the keyword: 200
- Total opportunity score: 15

## Target keywords (ASO)

- tanning app
- tanning timer
- uv index
- sun exposure
- tan tracker
- sunburn timer

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| Tanify: Tanning & UV Tracker | 10,174  | 4.7    |
| Sun Timer - Tan & UV Tracker | 1,245   | 4.5    |
| My UV Index                  | 312     | 4.2    |

## MVP features

- UV-aware tanning timer
- Skin type assessment
- Real-time UV index
- Safe exposure calculator
- Photo progress tracking
- Flip and sunscreen alerts

## Monetization

Freemium — basic timer free, premium for tracking and alerts. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): WeatherKit (UV data); SwiftUI; Camera for progress photos; Notifications

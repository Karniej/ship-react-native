---
rank: 62
name: "Reptile Care Guide"
slug: reptile-care-guide
status: DEAD
category: Reference
build_time: week
pricing_tier: entry
primary_keyword: "reptile"
keyword_popularity: 9
keyword_difficulty: 19
total_score: 20
top_competitor_reviews: 56
suggested_features: []
---

# Reptile Care Guide

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Care guides for snakes, lizards, turtles. Feeding schedules, habitat setup, health symptoms. Target reptile owners and enthusiasts.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'reptile' is pop 9 / diff 19, with 196 App Store apps, 0 qualifying tracked keywords, and broad or fuzzy intent (52/100). Captured direct competitors are small at 56 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"reptile"** — popularity 9, difficulty 19
- Apps competing on the keyword: 196
- Total opportunity score: 20

## Target keywords (ASO)

- reptile
- reptile care
- snake care
- lizard care
- turtle care
- exotic pets

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                 | Reviews | Rating |
| ------------------- | ------- | ------ |
| MorphMarket         | 1,324   | 4.5    |
| Exotic Reptile Care | 56      | 4.2    |

## MVP features

- Comprehensive care guides per species
- Feeding schedules and reminders
- Habitat setup guides
- Health symptom checker
- Species database
- Offline access

## Monetization

Freemium — basic guides free, premium for full library. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Content database; Notifications for feeding schedules

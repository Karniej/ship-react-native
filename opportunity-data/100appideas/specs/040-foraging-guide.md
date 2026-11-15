---
rank: 40
name: "Foraging Guide"
slug: foraging-guide
status: WEAK
category: Education
build_time: complex
pricing_tier: premium
primary_keyword: "forager"
keyword_popularity: 31
keyword_difficulty: 21
total_score: 30
top_competitor_reviews: 50
suggested_features: [imageIdentification]
---

# Foraging Guide

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Field guide to edible wild plants, mushrooms, and berries. AI-powered camera identification, seasonal availability calendar, safe/toxic lookalike comparisons, GPS location pinning for productive foraging spots.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'forager' is pop 31 / diff 21, with 187 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Captured direct competitors are small at 50 reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"forager"** — popularity 31, difficulty 21
- Apps competing on the keyword: 187
- Total opportunity score: 30

## Target keywords (ASO)

- forager
- foraging
- wild plants
- mushroom identifier
- edible plants
- wildcrafting

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                      | Reviews | Rating |
| ------------------------ | ------- | ------ |
| Gather: The Foraging App | 50      | 4.8    |

## MVP features

- AI-powered camera identification
- Seasonal availability calendar
- Safe/toxic lookalike comparisons
- GPS location pinning for foraging spots
- Comprehensive field guide
- Offline content database

## Monetization

Freemium — 10 free species, premium for full guide + camera ID. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision framework; Core ML; MapKit; Offline content database

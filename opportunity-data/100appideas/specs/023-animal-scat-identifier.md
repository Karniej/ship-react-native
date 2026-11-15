---
rank: 23
name: "Animal Scat Identifier"
slug: animal-scat-identifier
status: MODERATE
category: Education
build_time: week
pricing_tier: entry
primary_keyword: "animal scat identifier"
keyword_popularity: 25
keyword_difficulty: 17
total_score: 40
top_competitor_reviews: 413
suggested_features: [imageIdentification]
---

# Animal Scat Identifier

> Decent signal — build it lean, validate fast.

## Concept

Point your camera at animal droppings to identify the species. Uses AI image recognition. Includes field guide with photos, animal range maps, and safety warnings. Great for hikers, hunters, nature enthusiasts.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'animal scat identifier' is pop 25 / diff 17, with 228 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Captured direct competition is manageable at 413 reviews. It survives, but no longer ranks as an obvious top build.

- Primary keyword: **"animal scat identifier"** — popularity 25, difficulty 17
- Apps competing on the keyword: 228
- Total opportunity score: 40

## Target keywords (ASO)

- animal scat identifier
- droppings identifier
- wildlife tracker
- poop identifier
- nature guide

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Droppings Identifier           | 90      | 4.8    |
| Animal Scat Identifier         | 413     | 3.9    |
| Animal Scat Identifier Poop ID | 37      | 4.4    |

## MVP features

- Camera-based scat identification
- AI image recognition
- Field guide with photos
- Animal range maps
- Safety warnings (bear scat = leave area)
- Offline field guide

## Monetization

Hard paywall — 3 free IDs, premium unlimited. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision framework; Core ML or Claude Vision API; Camera; Offline field guide

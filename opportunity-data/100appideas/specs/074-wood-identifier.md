---
rank: 74
name: "Wood Identifier"
slug: wood-identifier
status: DEAD
category: Reference
build_time: week
pricing_tier: premium
primary_keyword: "wood identifier"
keyword_popularity: 9
keyword_difficulty: 23
total_score: 15
top_competitor_reviews: 3354
suggested_features: [imageIdentification]
---

# Wood Identifier

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Point camera at wood grain to identify species, hardness, and best uses. Target woodworkers, furniture buyers, and lumber yard workers. Include wood hardness scale, price ranges, and project recommendations.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'wood identifier' is pop 9 / diff 23, with 241 App Store apps, 0 qualifying tracked keywords, and exact app-intent (100/100). Competition is real at 3,354 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"wood identifier"** — popularity 9, difficulty 23
- Apps competing on the keyword: 241
- Total opportunity score: 15

## Target keywords (ASO)

- wood identifier
- wood species
- lumber identifier
- wood scanner
- woodworking app

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Wood Identifier: Wuddy        | 208     | 4.7    |
| Wood Identifier: AI Scanner   | 36      | 4.0    |
| WoodSense: Craft & Identifier | 3,354   | 4.6    |

## MVP features

- Camera-based wood species identification
- Hardness scale and properties
- Best uses and project recommendations
- Price range estimates
- Wood species database
- Offline reference guide

## Monetization

Hard paywall — 3 free IDs, premium unlimited. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision framework; Core ML or Claude Vision; Wood species database

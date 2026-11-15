---
rank: 46
name: "Mineral Identifier"
slug: mineral-identifier
status: WEAK
category: Education
build_time: week
pricing_tier: premium
primary_keyword: "mineral identifier"
keyword_popularity: 27
keyword_difficulty: 23
total_score: 24
top_competitor_reviews: 70693
suggested_features: [imageIdentification]
---

# Mineral Identifier

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Pure mineral identifier for geology students and rockhounds: photo scan + Mohs hardness + streak test + magnetism guides. Field-collection log with GPS-tagged finds. Specializes in MINERALS (not gemstones, not raw rocks).

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'mineral identifier' is pop 27 / diff 23, with 242 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Competition is heavy at 70,693 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"mineral identifier"** — popularity 27, difficulty 23
- Apps competing on the keyword: 242
- Total opportunity score: 24

## Target keywords (ASO)

- mineral identifier
- geology
- rock
- crystal
- mohs
- streak
- hardness
- rockhound

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                       | Reviews | Rating |
| ------------------------- | ------- | ------ |
| Rock Identifier: Stone ID | 70,693  | 4.7    |
| Mineral Identifier AI     | 7       | 5      |
| Minerals Center           | 346     | 4.5    |
| Rock & Crystal Identifier | 2,319   | 4.6    |

## MVP features

- Photo-scan mineral identification
- Mohs hardness + streak test guides
- Magnetism reference
- GPS-tagged field collection log
- Geological terminology glossary
- Offline reference data

## Monetization

Hard paywall. $4.99/week or $39.99/year. Hobbyist collectors pay.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision Framework + Core ML; Core Location; SwiftUI; Bundled Mohs scale data

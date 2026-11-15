---
rank: 33
name: "Eye Color Identifier"
slug: eye-color-identifier
status: WEAK
category: Lifestyle
build_time: weekend
pricing_tier: entry
primary_keyword: "eye color identifier"
keyword_popularity: 21
keyword_difficulty: 15
total_score: 34
top_competitor_reviews: 2921
suggested_features: [imageIdentification]
---

# Eye Color Identifier

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Scan your eyes with the camera, get your exact eye color name (hazel, amber, etc.), rarity percentage, and closest celebrity match. Fun, viral, shareable results.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'eye color identifier' is pop 21 / diff 15, with 218 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Competition is real at 2,921 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"eye color identifier"** — popularity 21, difficulty 15
- Apps competing on the keyword: 218
- Total opportunity score: 34

## Target keywords (ASO)

- eye color identifier
- eye color
- eye scanner
- eye test
- eye analyzer

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Eye Color Analyzer & Scanner  | 291     | 4.7    |
| Eyepic: Eye Color Camera      | 2,921   | 4.6    |
| Eye Color Identifier Analyzer | 31      | 3.9    |

## MVP features

- Camera-based eye color scanning
- Exact color name identification
- Rarity percentage
- Celebrity match feature
- Shareable result cards
- Color analysis history

## Monetization

Hard paywall — 1 free scan, premium unlimited. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision framework; Color analysis; Camera macro mode

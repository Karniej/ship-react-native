---
rank: 43
name: "Cat Breed Identifier"
slug: cat-breed-identifier
status: WEAK
category: Reference
build_time: week
pricing_tier: premium
primary_keyword: "cat breed identifier"
keyword_popularity: 23
keyword_difficulty: 17
total_score: 29
top_competitor_reviews: 6846
suggested_features: [imageIdentification]
---

# Cat Breed Identifier

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Photo-scan cat breed identification + breed encyclopedia + cat-personality matchmaker. Differentiate by adding shareable cat profile cards for social, plus a daily cat-photo journal. Bundled local image classifier — no AI server cost.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'cat breed identifier' is pop 23 / diff 17, with 203 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Competition is real at 6,846 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"cat breed identifier"** — popularity 23, difficulty 17
- Apps competing on the keyword: 203
- Total opportunity score: 29

## Target keywords (ASO)

- cat breed identifier
- cat scanner
- kitten
- pet
- feline
- breed
- encyclopedia

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Cat Scanner                    | 6,846   | 4.6    |
| Cat Breed Identifier: Pet Scan | 828     | 4.4    |
| Cat Breed Identifier           | 19      | 4.7    |
| CatsPedia - Breed Identifier   | 60      | 4.4    |

## MVP features

- Camera breed identification
- Breed encyclopedia
- Personality matchmaker (which breed suits your lifestyle)
- Shareable cat profile cards
- Daily cat-photo journal
- Bundled offline classifier

## Monetization

Hard paywall. $4.99/week or $39.99/year. Pet category converts strongly.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision + Core ML; Photos picker; SwiftUI

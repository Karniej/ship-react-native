---
rank: 63
name: "Cat Pain Score"
slug: cat-pain-score
status: DEAD
category: Health & Fitness
build_time: week
pricing_tier: premium
primary_keyword: "feline grimace scale"
keyword_popularity: 9
keyword_difficulty: 19
total_score: 20
top_competitor_reviews: 14
suggested_features: [imageIdentification]
---

# Cat Pain Score

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Cat pain monitoring app for owners and vet techs. Compare ear position, eye narrowing, muzzle tension, whiskers, and head position from saved photos, then track changes over time for vet conversations.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'feline grimace scale' is pop 9 / diff 19, with 185 App Store apps, 0 qualifying tracked keywords, and adjacent app-intent (72/100). Captured direct competitors are small at 14 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"feline grimace scale"** — popularity 9, difficulty 19
- Apps competing on the keyword: 185
- Total opportunity score: 20

## Target keywords (ASO)

- feline grimace scale
- cat pain
- cat health
- pet pain tracker
- cat scanner
- vet tracker
- cat symptoms

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| Feline Grimace Scale         | 14      | 5.0    |
| Cat Pain Scan                | 4       | 4.0    |
| Cat Scanner                  | 6,856   | 4.6    |
| Helpurr - Cat Vitals Scanner | 0       | -      |

## MVP features

- Guided cat-face photo capture
- Manual pain-score checklist
- Photo comparison timeline
- Vet visit export PDF
- Medication and behavior notes
- Multi-cat household profiles

## Monetization

Hard paywall after one cat profile. $4.99/week or $39.99/year. Pet owners pay for tools that help them explain symptoms to vets.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; PhotosUI; Vision face/landmark assistance where possible; SwiftData; PDFKit export

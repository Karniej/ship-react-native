---
rank: 38
name: "Haiku Writer"
slug: haiku-writer
status: WEAK
category: Entertainment
build_time: week
pricing_tier: premium
primary_keyword: "haiku"
keyword_popularity: 51
keyword_difficulty: 21
total_score: 32
top_competitor_reviews: 948
suggested_features: [aiChat]
---

# Haiku Writer

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

AI-powered haiku writing assistant. Type a theme or take a photo, get a beautiful haiku. Save to a personal journal, share as images on social media. Include syllable counter, seasonal word suggestions, and daily prompts.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'haiku' is pop 51 / diff 21, with 221 App Store apps, 2 qualifying tracked keywords, and broad or fuzzy intent (52/100). Captured direct competition is manageable at 948 reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"haiku"** — popularity 51, difficulty 21
- Apps competing on the keyword: 221
- Total opportunity score: 32

## Target keywords (ASO)

- haiku
- poetry
- poem writer
- syllable counter
- japanese poetry
- creative writing

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                       | Reviews | Rating |
| ------------------------- | ------- | ------ |
| Epic Haiku & Limerick     | 948     | 2.5    |
| Haiku - Poems made simple | 55      | 4.2    |
| Haiku by BAF (Retired)    | 1,672   | -      |

## MVP features

- AI-powered haiku generation from themes or photos
- Personal haiku journal
- Share as beautiful images on social media
- Syllable counter
- Seasonal word suggestions (kigo)
- Daily haiku prompts

## Monetization

Freemium — 3 free haiku/day, premium for unlimited + AI themes. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: aiChat.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): OpenAI/Claude API for haiku generation; SwiftUI; Image export; ShareLink

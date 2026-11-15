---
rank: 36
name: "Bunco Scorekeeper"
slug: bunco-scorekeeper
status: WEAK
category: Games
build_time: weekend
pricing_tier: entry
primary_keyword: "bunco"
keyword_popularity: 22
keyword_difficulty: 41
total_score: 33
top_competitor_reviews: 30
suggested_features: []
---

# Bunco Scorekeeper

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Bunco night companion for in-person dice groups. Track tables, partners, wins, losses, buncos, mini buncos, prizes, and round rotation without paper score sheets.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'bunco' is pop 22 / diff 41, with 50 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (60/100). Captured direct competitors are small at 30 reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"bunco"** — popularity 22, difficulty 41
- Apps competing on the keyword: 50
- Total opportunity score: 33

## Target keywords (ASO)

- bunco
- bunco scorekeeper
- bunco score sheet
- bunco dice
- bunco party
- dice scorekeeper
- bunco calculator

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                | Reviews | Rating |
| ------------------ | ------- | ------ |
| Bunco Calc         | 30      | 4.9    |
| Bunco Buddy        | 0       | -      |
| Bunco Classic      | 2       | 5.0    |
| Dice Games For All | 0       | -      |

## MVP features

- Round and table rotation tracking
- Player and partner management
- Bunco and mini-bunco scoring
- Prize category summaries
- Shareable final results
- Printable score sheet export

## Monetization

Freemium - one game night free, premium for saved groups, exports, and custom prize rules. $2.99/week or $14.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $2.99  | $5.99   | $14.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $2.99 / monthly $5.99 / annual $14.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Local scoring engine; SwiftData; PDFKit; ShareLink

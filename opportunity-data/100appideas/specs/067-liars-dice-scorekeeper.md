---
rank: 67
name: "Liar's Dice Scorekeeper"
slug: liars-dice-scorekeeper
status: DEAD
category: Games
build_time: weekend
pricing_tier: entry
primary_keyword: "liars dice"
keyword_popularity: 46
keyword_difficulty: 59
total_score: 18
top_competitor_reviews: 1401
suggested_features: []
---

# Liar's Dice Scorekeeper

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Tabletop in-person Liar's Dice / Perudo companion: 5-dice cup roller with shake-to-roll, hidden-bid screen pass mode, score history, rules glossary, variant rules. Aimed at board game groups, pirate-themed parties.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'pirate' is pop 46 / diff 59, with 190 App Store apps, 0 qualifying tracked keywords, and broad or fuzzy intent (52/100). Captured direct competition is manageable at 1,401 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"liars dice"** — popularity 46, difficulty 59
- Apps competing on the keyword: 190
- Total opportunity score: 18

## Target keywords (ASO)

- liars dice
- perudo
- dudo
- bluff dice
- scorekeeper
- roller
- pirate
- tabletop

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Liars Dice Online Multiplayer | 1,401   | 4.6    |
| Western Liar's Dice           | 7       | 3.6    |
| VIP Liar's Dice               | 20      | 2.5    |
| Dice.                         | 1,605   | 4.6    |

## MVP features

- 5-dice cup roller with shake-to-roll
- Hidden-bid pass-the-phone mode
- Score history
- Rules glossary
- Variant rules (common, spot-on, palifico)
- Match history

## Monetization

Freemium — free scorekeeper + dice roller, paywall behind variant rules + match history. $2.99/week or $14.99/year (party-game tier).

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $2.99  | $5.99   | $14.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $2.99 / monthly $5.99 / annual $14.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; CMMotionManager (shake)

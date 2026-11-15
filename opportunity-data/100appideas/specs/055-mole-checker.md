---
rank: 55
name: "Mole Checker"
slug: mole-checker
status: DEAD
category: Medical
build_time: complex
pricing_tier: premium
primary_keyword: "mole checker"
keyword_popularity: 24
keyword_difficulty: 37
total_score: 20
top_competitor_reviews: 1278
suggested_features: [imageIdentification]
---

# Mole Checker

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Track moles over time with photo comparison, ABCDE rule assessment, and change detection. NOT a diagnostic tool (disclaimer required) but a tracking/monitoring aid.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'dermatology' is pop 24 / diff 37, with 191 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Captured direct competition is manageable at 1,278 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"mole checker"** — popularity 24, difficulty 37
- Apps competing on the keyword: 191
- Total opportunity score: 20

## Target keywords (ASO)

- mole checker
- skin cancer
- dermatology
- skin check
- mole tracker
- melanoma check

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                  | Reviews | Rating |
| -------------------- | ------- | ------ |
| scanoma - mole check | 1,278   | 4.7    |
| AI Mole Analyzer     | 0       | -      |
| Al Skin Scanner      | 456     | 4.3    |

## MVP features

- Photo comparison over time
- ABCDE rule assessment
- Change detection alerts
- Medical disclaimer and reminders
- Track multiple moles
- Professional skin check reminders

## Monetization

Hard paywall — track 3 moles free, premium unlimited. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Vision framework; Photo comparison; SwiftData; HealthKit integration

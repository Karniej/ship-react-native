---
rank: 54
name: "Knot Tying Guide"
slug: knot-tying-guide
status: DEAD
category: Reference
build_time: week
pricing_tier: entry
primary_keyword: "knot tying"
keyword_popularity: 26
keyword_difficulty: 45
total_score: 20
top_competitor_reviews: 62
suggested_features: []
---

# Knot Tying Guide

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Animated knot tying guide for camping, fishing, boating, climbing practice, scouting, and everyday utility. Show step-by-step loops, 3D/AR view, use cases, and offline favorites.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'knot tying' is pop 26 / diff 45, with 165 App Store apps, 0 qualifying tracked keywords, and adjacent app-intent (72/100). Captured direct competitors are small at 62 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"knot tying"** — popularity 26, difficulty 45
- Apps competing on the keyword: 165
- Total opportunity score: 20

## Target keywords (ASO)

- knot tying
- knot tying guide
- knots 3d
- fishing knots
- camping knots
- boating knots
- climbing knots

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Knots Tying Guide: KnotSmith  | 62      | 4.5    |
| Army Knots                    | 917     | 4.8    |
| Knot tying 3D - Knottie       | 7       | 4.1    |
| Knots 3D                      | 11,887  | 4.9    |
| Knot Tying 3D: Animated Guide | 293     | 4.0    |

## MVP features

- Step-by-step knot animations
- Use-case filters by activity
- Offline favorites
- 3D/AR knot view
- Practice checklist
- Printable quick-reference cards

## Monetization

Freemium - core knots free, premium for full library, 3D view, and printable cards. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; SceneKit or RealityKit for 3D knots; Offline content bundle; SwiftData favorites; PDFKit

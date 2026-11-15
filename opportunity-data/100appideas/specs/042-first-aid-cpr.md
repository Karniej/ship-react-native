---
rank: 42
name: "First Aid & CPR Guide"
slug: first-aid-cpr
status: WEAK
category: Health & Fitness
build_time: week
pricing_tier: premium
primary_keyword: "resuscitation skills"
keyword_popularity: 27
keyword_difficulty: 15
total_score: 30
top_competitor_reviews: 1902
suggested_features: []
---

# First Aid & CPR Guide

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Step-by-step first aid and CPR instructions with timer-guided chest compressions. Interactive scenarios, emergency contact quick-dial, offline access. Merges 'first aid' + 'resuscitation skills' keywords.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'resuscitation skills' is pop 27 / diff 15, with 190 App Store apps, 2 qualifying tracked keywords, and adjacent app-intent (72/100). Competition is real at 1,902 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"resuscitation skills"** — popularity 27, difficulty 15
- Apps competing on the keyword: 190
- Total opportunity score: 30

## Target keywords (ASO)

- first aid
- resuscitation skills
- cpr
- emergency guide
- first aid kit
- safety guide

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| First Aid: American Red Cross | 1,902   | 4.7    |
| First Aid - IFRC              | 28      | 4.2    |
| FirstAid for all Emergency    | 25      | 4.3    |

## MVP features

- Step-by-step CPR instructions
- Timer-guided chest compressions
- Interactive emergency scenarios
- Emergency contact quick-dial
- Offline access
- Certification prep resources

## Monetization

Freemium — basic CPR free, premium for full first aid library + certification prep. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Haptic-guided CPR rhythm; Offline content; Emergency dialer

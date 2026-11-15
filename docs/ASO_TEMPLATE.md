# [APP NAME] -- App Store Optimization

> Fill in the bracketed fields for your app. Based on the Fishify ASO document.

---

## App Store Listing

| Field                          | Value                                                   |
| ------------------------------ | ------------------------------------------------------- |
| **App Store Title** (30 chars) | `[Brand]: [Primary Keyword] & [Secondary]`              |
| **Subtitle** (30 chars)        | `[Action Verb], [Action Verb] & [Action Verb]`          |
| **Bundle ID**                  | `com.yourcompany.[appname]`                             |
| **Primary Category**           | [category]                                              |
| **Keywords** (100 chars)       | `[single,words,comma,separated,no,spaces,after,commas]` |
| **Pricing**                    | Weekly $7.99 / Annual $49.99 / Trial: 7 days on yearly  |
| **Support URL**                | `https://yourdomain.com/apps/[appname]`                 |
| **Privacy Policy URL**         | `https://yourdomain.com/apps/[appname]/privacy`         |
| **Terms of Use URL**           | `https://yourdomain.com/apps/[appname]/terms`           |

---

## Keyword Strategy

### Placement rules

Apple combines words from Title + Subtitle + Keywords field automatically. **Never duplicate a word across these three fields** -- it wastes precious character space.

| Location           | What goes here                                          | Example (Fishify)                                |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------ |
| **Title**          | Brand name + primary keywords                           | `Fish ID & Rules: Fishify`                       |
| **Subtitle**       | Action verbs that are also keywords                     | `Fish ID & Fishing Rules`                        |
| **Keywords field** | Remaining high-value single words NOT in title/subtitle | `fishing,regulations,size,limit,laws,this,legal` |

### Keyword selection criteria

- Popularity (pop) >= 25
- Difficulty (diff) < 40
- Single words only in the keywords field (Apple auto-combines with title/subtitle words)
- Target keywords where dedicated competitor count is low, even if top competitor is large

---

## Description Template

```
[App Name] gives you [primary value prop in one sentence].

[Expanded description -- 2-3 sentences explaining what the app does and who it's for].

Features include:
- [Feature 1 -- use action-oriented language]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

[App Name] subscription unlocks all features including [comma-separated list of premium features]. A weekly subscription is available at $[WEEKLY_PRICE]/week. An annual subscription is available at $[YEARLY_PRICE]/year with a 7-day free trial. Payment will be charged to your Apple ID account at confirmation of purchase. The subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.

[Optional disclaimer: e.g., "[App Name] is not a substitute for professional advice."]

Terms of Use: https://yourdomain.com/apps/[appname]/terms
Privacy Policy: https://yourdomain.com/apps/[appname]/privacy
```

---

## Screenshot Captions (6 screens)

Use the Fishify pattern: **VERB** (large) + descriptor (secondary text).

| #   | Headline                              | Shows                     |
| --- | ------------------------------------- | ------------------------- |
| 1   | `[PRIMARY ACTION VERB]. [OUTCOME].`   | Main feature in action    |
| 2   | `[SECONDARY ACTION VERB]. [OUTCOME].` | Second key feature        |
| 3   | `[THIRD FEATURE VERB]. [OUTCOME].`    | Third feature             |
| 4   | `[FOURTH FEATURE]. [DETAIL].`         | Supporting feature        |
| 5   | `[FIFTH FEATURE]. [DETAIL].`          | Settings or customization |
| 6   | `[SHARE/SOCIAL VERB]. [OUTCOME].`     | Sharing or export feature |

### Fishify example

| #   | Headline                                 |
| --- | ---------------------------------------- |
| 1   | SNAP A FISH. KNOW INSTANTLY.             |
| 2   | LEGAL TO KEEP? CHECK IN SECONDS.         |
| 3   | YOUR FISHING REGULATIONS. YOUR LOCATION. |

### Screenshot sizes required

- 6.7" display (iPhone 15 Pro Max): 1290 x 2796 px
- 6.5" display (iPhone 11 Pro Max): 1284 x 2778 px
- 5.5" display (iPhone 8 Plus): 1242 x 2208 px

---

## What's New

For v1.0.0:

```
Initial release.
```

For updates, keep it concise:

```
- [Main improvement or new feature]
- Bug fixes and performance improvements
```

---

## Promotional Text (170 chars)

Can be updated without submitting a new build. Use for seasonal promotions or feature highlights.

```
[Primary value prop in one compelling sentence. Include a call to action.]
```

---

## What NOT to Include in Metadata

- **No ChatGPT, OpenAI, GPT, Claude, Anthropic, Gemini references** -- causes rejection in China App Store
- **No "free" or "trial" in title/subtitle** -- misleading if the app has a hard paywall
- **No competitor brand names** -- trademark violations
- **No ALL CAPS in title/subtitle** -- Apple may reject
- **No pricing in screenshots** -- prices vary by territory; use "Start Free Trial" instead

---

## Brand Color

**[Color Name] #[HEX]**

Use consistently across: app icon, splash screen, screenshots background, feature graphic, paywall gradient.

---

## Target Audience

- [Primary audience -- who has the problem your app solves]
- [Secondary audience -- adjacent user group]
- [Tertiary audience -- aspirational or discovery users]

---

## Subscription Product IDs

| Plan   | Product ID                             | Price       | Trial  |
| ------ | -------------------------------------- | ----------- | ------ |
| Weekly | `com.yourcompany.[appname].ios.weekly` | $7.99/week  | None   |
| Yearly | `com.yourcompany.[appname].ios.yearly` | $49.99/year | 7 days |

---

## RevenueCat Config

| Setting        | Value           |
| -------------- | --------------- |
| Entitlement ID | `premium`       |
| Offering       | `default`       |
| Packages       | Weekly + Annual |

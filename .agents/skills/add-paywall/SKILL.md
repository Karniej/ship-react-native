---
name: add-paywall
description: Use when creating or modifying paywalls, premium gating, subscription products, or RevenueCat configuration in a Ship React Native app — gating a feature behind premium, adding/changing products or entitlements, editing the paywall screen, or adding a paywall placement. Trigger on "paywall", "premium", "subscription", "RevenueCat", "in-app purchase".
---

# Ship React Native — Paywalls & Premium

You are modifying premium/monetization code in a user's Ship React Native app. The patterns below
are production-tested across 8+ App Store apps — deviate from them and you inherit the rejection
risk yourself. Read the real file before editing it; this document tells you where truth lives.

## How premium works in this codebase

```
RevenueCat SDK (react-native-purchases v9)
  └─ src/services/purchases.service.ts   singleton wrapper; ONLY file that touches the SDK
       └─ src/store/usePremiumStore.ts   zustand: isSubscribed, offerings, selectedOffering, purchase/restore actions
            ├─ src/hooks/usePremiumStatus.ts   polls entitlement every 5 min, syncs store + useAuthStore
            ├─ src/hooks/usePremiumFeatures.ts requirePremium(cb) — runs cb or routes to /premium
            └─ src/app/(app)/_layout.tsx       hard-paywall guard: !isSubscribed → router.replace("/(app)/premium")
src/providers/ConvexClientProvider.tsx   RevenueCatIdentitySync — Purchases.logIn(profiles.userId) for signed-in users
convex/http.ts (/webhooks/revenuecat) → convex/subscriptions.ts handleWebhook → profiles.isPremium (server record)
```

Non-negotiable invariants:

- **Client truth is the RevenueCat entitlement.** `purchasesService.checkSubscriptionStatus()`
  reads `customerInfo.entitlements.active[APP_CONFIG.PREMIUM_ENTITLEMENT_ID]`. Gate ALL UI on this
  (via the store/hooks). The Convex `profiles.isPremium` field is webhook-fed server state for
  backend logic and analytics — never gate UI on it (webhooks lag purchases by seconds to minutes).
- **The SDK is optional at runtime.** `purchases.service.ts` loads `react-native-purchases` only
  outside Expo Go AND when keys pass validation (`EXPO_PUBLIC_REVENUECAT_IOS_KEY` starts with
  `appl_`, Android with `goog_`). Otherwise every call falls back to `MOCK_OFFERINGS` / simulated
  purchases. Never import `react-native-purchases` directly in UI code — go through the service.
- `purchasesService.initialize()` is called once from `src/app/_layout.tsx`. Don't re-configure.
- **User identity**: `RevenueCatIdentitySync` in `src/providers/ConvexClientProvider.tsx` calls
  `purchasesService.identifyUser(profile.userId)` for signed-in (non-anonymous) users and
  `logoutUser()` on sign-out, so webhook `app_user_id` matches `profiles.userId`. Anonymous users
  are deliberately never identified. The service no-ops repeated identical `logIn` calls. The sync
  uses Convex's `anyApi` — do NOT switch it to a `convex/_generated` import; that directory does
  not exist in expo-api-routes mode and a static import would break bundling.
- `getOfferings()` returns `offerings.current?.availablePackages` — only the offering marked
  **current** in the RevenueCat dashboard is ever shown.

## Job 1 — Gate a feature behind premium

- **Action-level** (button, generation, export): wrap with `usePremiumFeatures()` from
  `src/hooks/usePremiumFeatures.ts` — `requirePremium(() => doThing())` or
  `onPress={isPremiumFeature(doThing)}`. Non-subscribers get routed to `/premium`.
- **Render-level** (hide/badge UI): `usePremiumStore((s) => s.isSubscribed)` for cheap reads, or
  `useIsPremium()` from `src/hooks/usePremiumStatus.ts` when the component should also trigger a
  fresh entitlement check.
- **Server-level** (Convex functions): check `profile.isPremium` — correct place for the
  webhook-fed value. Fail closed.
- Note the whole `(app)` group is already behind the hard paywall in `src/app/(app)/_layout.tsx`.
  If the user wants freemium instead, remove that guard's `router.replace` effect and gate
  individual features — don't add per-screen redirects on top of it.

## Job 2 — Add or change products / entitlements

Before editing product constants, keep the config spine truthful: update `ship.config.ts` so
`monetization` is `"revenuecat"`, `modules` includes `"subscriptions"` (and `"credits"` if the
paywall sells usage credits), and required dependencies such as `"auth"` are present. Run
`npm run apply -- --force` so feature flags, route pruning, `PROJECT_SUMMARY.md`,
`REQUIRED_ENV.md`, and `.ship-rn-applied.json` match the monetization change.

1. `src/constants/config.ts`: update `PRODUCT_IDS` and (rarely) `PREMIUM_ENTITLEMENT_ID`. The
   entitlement string must match the RevenueCat dashboard **exactly** — a mismatch means purchases
   succeed but `hasActiveSubscription()` in `purchases.service.ts` never returns true.
2. RevenueCat dashboard: create products (matching App Store Connect / Play product IDs), attach
   them to the entitlement, add packages to an offering, and **mark that offering current**.
3. `packageType` comparisons must use the SDK's `PACKAGE_TYPE` enum (the yearly auto-select in
   `usePremiumStore.loadOfferings` uses `PACKAGE_TYPE.ANNUAL`) or `APP_CONFIG.SUBSCRIPTION_TYPES`
   (`"WEEKLY"`, `"MONTHLY"`, `"ANNUAL"`). RevenueCat says `ANNUAL`, not `YEARLY` — never compare
   against ad-hoc lowercase literals.
4. Update `MOCK_OFFERINGS` in `src/services/purchases.service.ts` to mirror the real products
   (IDs, prices, `introPrice` presence) so Expo Go/dev renders the same paywall the store will.
5. Plan slots in `src/app/(app)/premium.tsx`: `yearlyPack` matches `ANNUAL`; `weeklyPack` matches
   `WEEKLY` or `MONTHLY`. Adding a third simultaneous plan means extending that mapping.
6. Trials/intro offers are configured in App Store Connect on the product — the client reads
   `product.introPrice` at runtime. Never hard-code trial existence in the app.

## Job 3 — Modify the paywall UI

- Copy, benefits, toggles: `src/constants/paywall.ts` (`PAYWALL_BENEFITS`, `PAYWALL_CONFIG`,
  `FREE_TRIAL_CONFIG`). All strings are i18n keys — add them to `src/locales/en.ts` AND
  `es/fr/de/it.ts` or typecheck fails (that guard is deliberate).
- Layout/behavior: `src/app/(app)/premium.tsx`. Reusable pieces live in
  `src/components/premium/` (`SubscriptionPicker.tsx`, `PremiumFeatureList.tsx`).
- Background videos: drop `paywall-N.mp4` into `assets/videos/` and add `require()`s to the
  `paywallVideos` array at the top of `premium.tsx`. Empty array = themed static background.
- Keep the purchase flow intact: `handlePurchase` → `purchasePackage` (store rethrows on failure
  so the screen can `haptics.error()` + track) → `refreshPremiumStatus()` so the hard-paywall
  guard sees the new entitlement → confetti → `handleClose` after 2.5 s. Skipping the refresh
  causes the guard to bounce a paying user straight back to the paywall.
- Keep the restore flow's three outcomes: `usePremiumStore.restorePurchases` returns a
  `RestoreResult` — `"restored"` (close the paywall), `"no_purchases"` (show the
  `premium.restoreNoPurchases*` alert, do NOT close), and throws on failure (show
  `premium.restoreFailed*`). Collapsing these back into close-on-anything is a review risk.
- Preserve the PostHog calls (`trackPremiumScreenViewed`, `trackPurchaseStarted/Completed/Failed`,
  `trackRestorePurchases`) — paywall conversion is the one funnel every user asks about later.

## Job 4 — Add a second paywall placement

1. Create e.g. `src/app/(app)/premium-offer.tsx`, driven by the same `usePremiumStore` actions and
   `src/components/premium/` components. Register it in `src/app/(app)/_layout.tsx` as a
   `Stack.Screen` with `presentation: "modal"`, like `premium`.
2. **Update the hard-paywall guard** in the same file: `segments.some((s) => s === "premium")`
   must also allow the new route name, or non-subscribers get redirect-looped off your new screen.
3. Point entries at it via `router.push`, or generalize `usePremiumFeatures.requirePremium` to
   accept a target route. Give it its own PostHog event so variants are comparable.

## App Store review guardrails (Guideline 3.1 — the usual rejection set)

Already implemented — do not remove when restyling:

- **Restore Purchases** is a functional footer link in `premium.tsx` (`handleRestorePurchases` →
  `Purchases.restorePurchases()`). A paywall without it is a same-day rejection.
- **Graceful "no purchases found"**: restore distinguishes restored / nothing-to-restore / failed
  and shows a localized alert for the latter two instead of closing the paywall as if it
  succeeded. Reviewers tap Restore first and expect a visible response.
- **Full price before purchase**: plan cards show `product.priceString` per period, and
  `getTrialInfoText()` renders "X days free, then $Y per period" / "$Y per period" directly under
  the CTA. Any redesign must keep price + renewal period visible pre-tap.
- **No fake trial copy**: `hasFreeTrial` derives from `product.introPrice != null` at runtime; the
  CTA only says "No Payment Now" when a trial is actually configured in App Store Connect.
- **Terms + Privacy links** in the footer route to `/terms` and `/privacy`.
- **Platform-correct copy**: the security footer branches on `Platform.OS`
  (`premium.securedByApple` / `premium.securedByGoogle`) — keep both keys when editing copy.
- **Webhook fails closed**: `convex/http.ts` returns 401 (with a loud log) when
  `REVENUECAT_WEBHOOK_SECRET` is unset, and validates the `Bearer` header otherwise. Set the
  secret in the Convex dashboard and mirror it in the RevenueCat webhook Authorization header.
- **Real expiry from the event**: `handleWebhook` in `convex/subscriptions.ts` uses the payload's
  `expiration_at_ms` for `premiumExpiresAt` (30-day fallback only when absent), including on
  `CANCELLATION`, where access persists until expiry.
- The `__DEV__` skip button is compiled out of release builds; the hard paywall is Apple-legal as
  long as purchase and restore both work in the review sandbox.

Make sure you… (known review requirements NOT yet enforced by the code):

- **Real legal URLs.** `APP_CONFIG.PRIVACY_POLICY_URL` / `TERMS_URL` in `src/constants/config.ts`
  ship as `example.com` placeholders; `/terms` must contain the auto-renewal terms or link
  Apple's standard EULA.
- **English-only CTA/badge literals.** "No Payment Now" / "Subscribe Now" / "BEST VALUE" in
  `premium.tsx` are hard-coded English — route them through `t()` if the app ships localized
  store listings.

## Verification

- `npm run validate` after every edit (lint + typecheck + i18n sync + tests).
- Expo Go / missing keys: expect `[Purchases] Using mock offerings` in logs — UI-only testing.
- Real StoreKit needs a dev build (`npx expo run:ios`) with a real `appl_` key. Test with a
  sandbox Apple ID: purchase, relaunch (entitlement persists), Restore on a wiped install,
  cancel via Settings → subscriptions (sandbox renewals are minutes, not months).
- TestFlight also bills against sandbox — it is your closest proxy to what the reviewer sees.
  Verify the hard paywall unlocks after purchase and after restore, with no dev skip visible.
- Webhook: buy in sandbox, then check Convex logs and the `subscriptionEvents` table for the
  event with `environment: "SANDBOX"` and a matching `userId`.

## Common failure modes

- **Empty offerings on device**: offering not marked current in RevenueCat, products not "Ready to
  Submit" in App Store Connect, unsigned Paid Apps agreement, or bundle ID mismatch. The service
  silently falls back to `MOCK_OFFERINGS` — check logs before blaming the UI.
- **Purchase succeeds, app stays locked**: entitlement ID mismatch (dashboard vs
  `PREMIUM_ENTITLEMENT_ID`), or a custom purchase path that skipped `refreshPremiumStatus()`.
- **Webhook 401s**: `REVENUECAT_WEBHOOK_SECRET` unset (it fails closed by design — set it in the
  Convex dashboard) or mismatched with the Authorization header configured in RevenueCat.
- **Webhook logs "Profile not found"**: the purchase happened before the user was identified —
  `RevenueCatIdentitySync` only runs for signed-in users; anonymous purchases keep the RC
  anonymous ID, and only the client entitlement (not `profiles.isPremium`) reflects them.
- **Paywall shows mock $49.99/$7.99 prices in a release build**: placeholder env keys — the
  `appl_`/`goog_` prefix validation in `purchases.service.ts` rejected them.

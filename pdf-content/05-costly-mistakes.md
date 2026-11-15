# Part 5: 7 Costly Mistakes That Kill App Launches

Learn from others' failures so you don't repeat them.

---

## Mistake #1: Skipping Apple Sign-In

### The Problem

Apple requires Sign in with Apple if your app offers ANY third-party login (Google, Facebook, email, etc.). Miss this, and you're rejected.

### The Rejection

> **Guideline 4.8 - Sign in with Apple**
>
> Your app uses a third-party login service, but does not offer Sign in with Apple. Apps that use a third-party login service must offer Sign in with Apple to users as an equivalent option.

### The Fix

```bash
npx expo install expo-apple-authentication
```

```typescript
import * as AppleAuthentication from "expo-apple-authentication";

const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // Send credential.identityToken to your backend
  } catch (e) {
    if (e.code === "ERR_CANCELED") {
      // User cancelled
    }
  }
};
```

### Time Wasted: 2-5 days

(Implementing + resubmission)

---

## Mistake #2: Exposing API Keys in Client Code

### The Problem

API keys in your React Native code are visible to anyone who decompiles your app. This leads to:

- Stolen API keys
- Unexpected bills ($$$)
- Rate limit hits from abusers
- Security breaches

### The Bad Code

```typescript
// ❌ NEVER DO THIS
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    Authorization: `Bearer sk-1234567890abcdef`, // EXPOSED!
  },
});
```

### The Fix

Use Supabase Edge Functions (or any backend):

```typescript
// ✅ Client code - safe
const { data } = await supabase.functions.invoke("generate-text", {
  body: { prompt: userPrompt },
});
```

```typescript
// ✅ Edge Function - API key is server-side only
// supabase/functions/generate-text/index.ts
const apiKey = Deno.env.get("OPENAI_API_KEY"); // Set via secrets

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({ prompt }),
});
```

### Cost of This Mistake: $100 - $10,000+

(Depending on how fast you notice)

---

## Mistake #3: Forgetting Row Level Security

### The Problem

Without RLS, ANY authenticated user can read/modify ALL data in your database. One malicious user = entire database compromised.

### The Dangerous Default

```sql
-- Table without RLS
-- User A can query: SELECT * FROM generations (sees ALL user data!)
-- User A can run: DELETE FROM generations WHERE user_id != their_id
```

### The Fix

```sql
-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own generations"
ON generations FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own generations"
ON generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own generations"
ON generations FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own data
CREATE POLICY "Users can delete own generations"
ON generations FOR DELETE
USING (auth.uid() = user_id);
```

### Quick Check

```sql
-- Run this to see tables without RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

### Cost of This Mistake: Your entire business

(Data breach, legal liability, user trust destroyed)

---

## Mistake #4: Wrong In-App Purchase Implementation

### The Problem

Using Stripe or external payment links for digital goods = instant rejection on iOS. Apple requires their payment system for digital content.

### The Rejection

> **Guideline 3.1.1 - In-App Purchase**
>
> Your app includes content or features that must be purchased with in-app purchase.

### What Requires IAP

| Type             | IAP Required?   |
| ---------------- | --------------- |
| Premium features | Yes             |
| Subscriptions    | Yes             |
| Coins/credits    | Yes             |
| Digital content  | Yes             |
| Physical goods   | No (use Stripe) |
| Services (Uber)  | No              |

### The Fix

Use RevenueCat to handle both platforms:

```typescript
import Purchases from "react-native-purchases";

// Configure
await Purchases.configure({
  apiKey: Platform.OS === "ios" ? "appl_your_key" : "goog_your_key",
});

// Make purchase
const { customerInfo } = await Purchases.purchasePackage(package);

// Check entitlement
const isPro = customerInfo.entitlements.active["pro"];
```

### Time Wasted: 1-4 weeks

(Learning IAP, setting up products, testing)

---

## Mistake #5: No Privacy Policy

### The Problem

Both Apple and Google require a privacy policy URL that's accessible. No policy = no approval.

### The Rejection

> **Guideline 5.1.1 - Data Collection and Storage**
>
> Your app does not include a link to your Privacy Policy in the App Store Connect metadata.

### Minimum Privacy Policy Requirements

Must include:

- What data you collect
- How you use it
- Third-party services (analytics, auth, etc.)
- User rights (deletion, export)
- Contact information
- Last updated date

### Quick Solutions

1. **Free generators:**
   - [Termly](https://termly.io) (recommended)
   - [Iubenda](https://iubenda.com)
   - [PrivacyPolicies.com](https://privacypolicies.com)

2. **Where to host:**
   - Your website
   - Notion page (make public)
   - GitHub Pages
   - Supabase Edge Function returning HTML

3. **Where to link it:**
   - App Store Connect → App Information → Privacy Policy URL
   - Google Play Console → Store Listing → Privacy Policy
   - Inside your app (Settings screen)

### Time Wasted: 1-3 days

(Plus the embarrassment of rejection for something so basic)

---

## Mistake #6: Testing Only on Simulators

### The Problem

Simulators don't catch:

- Real-world performance issues
- Actual camera/microphone behavior
- In-app purchase flows
- Push notification delivery
- Touch responsiveness
- Memory constraints
- Network variability

### What Users Experience

| Issue       | Simulator   | Real Device       |
| ----------- | ----------- | ----------------- |
| Performance | Always fast | Varies by model   |
| Crashes     | Rare        | More common       |
| Camera      | Works       | Permission issues |
| IAP         | Can't test  | Must test         |
| Push        | Can't test  | Must test         |
| Memory      | Unlimited   | Can crash         |

### The Fix

**Minimum testing matrix:**

- [ ] iPhone (current or 1 year old)
- [ ] iPhone (3+ years old)
- [ ] Android phone (mid-range)
- [ ] iPad (if you support it)
- [ ] Test with slow network (throttle in dev tools)
- [ ] Test with no network

**TestFlight/Internal Testing:**

```bash
# Build and distribute
eas build --platform ios --profile preview
eas submit --platform ios --profile preview

# Or for Android
eas build --platform android --profile preview
# Upload to internal testing track
```

### Cost of This Mistake: 1-star reviews

(And potential rejection for crashes)

---

## Mistake #7: Launching Without Analytics

### The Problem

Without analytics, you're flying blind:

- Don't know which features users use
- Can't measure conversion rates
- No data for improvement
- Guessing instead of knowing

### The Minimum Setup

```typescript
import PostHog from "posthog-react-native";

// Initialize
const posthog = new PostHog("your-api-key", {
  host: "https://app.posthog.com",
});

// Track key events
posthog.capture("app_opened");
posthog.capture("feature_used", { feature: "image_generation" });
posthog.capture("purchase_completed", { product: "pro_yearly" });
posthog.capture("error_occurred", { error: "generation_failed" });
```

### Essential Events to Track

| Event              | Why                     |
| ------------------ | ----------------------- |
| app_opened         | Daily active users      |
| signup_completed   | Conversion from install |
| feature_used       | What's popular          |
| paywall_viewed     | Conversion funnel       |
| purchase_started   | Drop-off point          |
| purchase_completed | Revenue attribution     |
| error_occurred     | Bug discovery           |

### Free Tiers Worth Using

| Service   | Free Tier     | Best For       |
| --------- | ------------- | -------------- |
| PostHog   | 1M events/mo  | Full analytics |
| Mixpanel  | 100K users/mo | Funnels        |
| Amplitude | 10M events/mo | Enterprise     |
| Sentry    | 5K errors/mo  | Crash tracking |

### Cost of This Mistake: Months of wasted effort

(Building features nobody uses)

---

## Bonus Mistake: Scope Creep Before Launch

### The Problem

"Let me just add one more feature..." turns your 7-day launch into 7 months.

### Signs You're Falling Into This Trap

- [ ] Adding features not in original plan
- [ ] Redesigning "just one more screen"
- [ ] Waiting for "perfect" before launching
- [ ] Comparing to apps with 50-person teams
- [ ] Feature list keeps growing

### The Fix

**MVP Rule:** If a feature isn't needed for:

1. Users to sign up
2. Users to use core feature
3. Users to pay (if applicable)

...it can wait for v1.1.

### The Launch Mindset

| v1.0 (Now)         | v1.1+ (Later)        |
| ------------------ | -------------------- |
| Auth works         | Social login options |
| Core feature works | Additional features  |
| Can accept payment | Referral program     |
| Basic settings     | Advanced settings    |
| Works on phone     | Tablet optimization  |

### Real Talk

Your first 100 users don't care if you have dark mode. They care if your app solves their problem.

---

## Summary: The 7 Mistakes

| #   | Mistake           | Impact          | Fix                           |
| --- | ----------------- | --------------- | ----------------------------- |
| 1   | No Apple Sign-In  | Rejection       | Add expo-apple-authentication |
| 2   | Exposed API Keys  | $$$$ + security | Use Edge Functions            |
| 3   | No RLS            | Data breach     | Enable RLS on all tables      |
| 4   | Wrong payments    | Rejection       | Use RevenueCat                |
| 5   | No privacy policy | Rejection       | Use Termly/Iubenda            |
| 6   | Simulator only    | Bad reviews     | Test on real devices          |
| 7   | No analytics      | Wasted effort   | Add PostHog/Mixpanel          |

---

**Next:** Quick reference cards for commands, sizes, and configurations.

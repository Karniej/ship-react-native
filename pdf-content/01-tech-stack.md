# Part 1: The Modern React Native Tech Stack (2025)

Choosing the right tools before you start saves weeks of refactoring later. Here's what the best teams are using in 2025.

---

## Framework: Expo vs Bare React Native

| Factor         | Expo (Recommended)    | Bare React Native  |
| -------------- | --------------------- | ------------------ |
| Setup Time     | 5 minutes             | 30+ minutes        |
| Native Modules | Expo SDK + dev builds | Full access        |
| OTA Updates    | Built-in              | Manual setup       |
| Build Service  | EAS (cloud builds)    | Local or custom CI |
| Learning Curve | Gentle                | Steep              |

**Verdict:** Start with Expo. You can eject later if needed (but you probably won't).

**Current Version:** Expo SDK 54 (December 2024)

### Quick Start

```bash
# Create new Expo project
npx create-expo-app@latest my-app
cd my-app

# Start development
npx expo start
```

**Official Docs:** [docs.expo.dev](https://docs.expo.dev)

---

## Navigation: Expo Router vs React Navigation

| Factor       | Expo Router (Recommended) | React Navigation |
| ------------ | ------------------------- | ---------------- |
| Setup        | Zero config               | Manual setup     |
| Routing      | File-based (like Next.js) | Component-based  |
| Deep Linking | Automatic                 | Manual config    |
| Type Safety  | Built-in typed routes     | Manual typing    |
| Web Support  | Excellent                 | Good             |

**Verdict:** Expo Router. File-based routing is the future, and deep linking just works.

```
app/
├── index.tsx          → "/"
├── login.tsx          → "/login"
├── (tabs)/
│   ├── index.tsx      → "/tabs"
│   ├── profile.tsx    → "/tabs/profile"
│   └── settings.tsx   → "/tabs/settings"
└── [id].tsx           → "/123" (dynamic)
```

### Setup

```bash
npx expo install expo-router expo-linking expo-constants
```

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

```typescript
// Navigation in components
import { router } from "expo-router";

// Navigate
router.push("/profile");
router.replace("/login");
router.back();

// With params
router.push({ pathname: "/user/[id]", params: { id: "123" } });
```

**Official Docs:** [docs.expo.dev/router](https://docs.expo.dev/router/introduction/)

---

## State Management: The 2025 Landscape

| Solution       | Best For     | Bundle Size | Learning Curve |
| -------------- | ------------ | ----------- | -------------- |
| **Zustand**    | Most apps    | 1.1 kB      | Easy           |
| Redux Toolkit  | Large teams  | 11 kB       | Medium         |
| Jotai          | Atomic state | 2.4 kB      | Easy           |
| React Context  | Simple apps  | 0 kB        | Easy           |
| TanStack Query | Server state | 11 kB       | Medium         |

**Verdict:** Zustand for client state + TanStack Query for server state.

**Why Zustand?**

- Minimal boilerplate
- TypeScript-first
- Works with React Native perfectly
- Easy persistence with AsyncStorage

### Zustand Setup

```bash
npm install zustand
```

```typescript
// stores/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage in components
const { user, isAuthenticated, logout } = useAuthStore();
```

### TanStack Query Setup

```bash
npm install @tanstack/react-query
```

```typescript
// For server state (API calls)
import { useQuery, useMutation } from "@tanstack/react-query";

function useGenerations() {
  return useQuery({
    queryKey: ["generations"],
    queryFn: () => fetchGenerations(),
  });
}

function useCreateGeneration() {
  return useMutation({
    mutationFn: (prompt: string) => createGeneration(prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generations"] });
    },
  });
}
```

**Official Docs:**

- Zustand: [docs.pmnd.rs/zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- TanStack Query: [tanstack.com/query](https://tanstack.com/query/latest)

---

## Backend: Supabase vs Firebase vs Custom

| Factor         | Supabase           | Firebase           | Custom API  |
| -------------- | ------------------ | ------------------ | ----------- |
| Database       | PostgreSQL         | NoSQL (Firestore)  | Your choice |
| Auth           | Built-in           | Built-in           | Build it    |
| Real-time      | Yes                | Yes                | WebSockets  |
| Edge Functions | Deno               | Cloud Functions    | Your infra  |
| Pricing        | Generous free tier | Pay per read/write | Your costs  |
| Vendor Lock-in | Low (PostgreSQL)   | High               | None        |
| Open Source    | Yes                | No                 | N/A         |

**Verdict:** Supabase for most apps. PostgreSQL is battle-tested, and you can self-host if needed.

**Supabase Wins Because:**

- SQL is more flexible than NoSQL for most apps
- Row Level Security is powerful
- Edge Functions run on Deno (fast, secure)
- Easy migration path (it's just PostgreSQL)

### Supabase Setup

```bash
npm install @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

```typescript
// Database operations
// Select
const { data } = await supabase.from("posts").select("*").eq("user_id", userId);

// Insert
const { data } = await supabase
  .from("posts")
  .insert({ title: "Hello", user_id: userId })
  .select()
  .single();

// Update
await supabase.from("posts").update({ title: "Updated" }).eq("id", postId);

// Delete
await supabase.from("posts").delete().eq("id", postId);
```

**Official Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## Authentication Options

| Method         | User Experience  | Security | Implementation |
| -------------- | ---------------- | -------- | -------------- |
| Email/Password | Familiar         | Medium   | Easy           |
| Magic Link     | Passwordless     | High     | Easy           |
| Google Sign-In | One tap          | High     | Medium         |
| Apple Sign-In  | Required for iOS | High     | Medium         |
| Anonymous      | Zero friction    | Low      | Easy           |

**Recommended Stack:**

1. Apple Sign-In (required if you have any auth)
2. Google Sign-In (most users have Gmail)
3. Anonymous → upgrade later (for onboarding)

**Pro Tip:** Start users anonymously, let them use the app, then prompt to "save their data" by signing in.

### Authentication Implementation

```typescript
// Email/Password Sign Up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "secure-password",
});

// Email/Password Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secure-password",
});

// Sign Out
await supabase.auth.signOut();

// Get Current User
const {
  data: { user },
} = await supabase.auth.getUser();

// Listen to Auth Changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    // User signed in
  }
  if (event === "SIGNED_OUT") {
    // User signed out
  }
});
```

### Apple Sign-In (Required for iOS)

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

    // Send to Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken!,
    });
  } catch (e) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      // User cancelled
    }
  }
};
```

### Google Sign-In

```bash
npx expo install expo-auth-session expo-web-browser expo-crypto
```

```typescript
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: "YOUR_IOS_CLIENT_ID",
  androidClientId: "YOUR_ANDROID_CLIENT_ID",
});

useEffect(() => {
  if (response?.type === "success") {
    const { id_token } = response.params;
    // Send to Supabase
    supabase.auth.signInWithIdToken({
      provider: "google",
      token: id_token,
    });
  }
}, [response]);
```

**Official Docs:** [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

---

## Analytics & Error Tracking

### Analytics Options

| Service            | Free Tier     | Best For          |
| ------------------ | ------------- | ----------------- |
| **PostHog**        | 1M events/mo  | Product analytics |
| Mixpanel           | 100K users/mo | Detailed funnels  |
| Amplitude          | 10M events/mo | Enterprise        |
| Firebase Analytics | Unlimited     | Basic tracking    |

**Verdict:** PostHog. Open-source, generous free tier, and has feature flags built-in.

### Error Tracking

| Service              | Free Tier      | Best For              |
| -------------------- | -------------- | --------------------- |
| **Sentry**           | 5K errors/mo   | Detailed stack traces |
| Bugsnag              | 7.5K errors/mo | Stability scoring     |
| Firebase Crashlytics | Unlimited      | Basic crashes         |

**Verdict:** Sentry. Best stack traces and React Native support.

### PostHog Setup

```bash
npm install posthog-react-native
```

```typescript
// lib/posthog.ts
import PostHog from "posthog-react-native";

export const posthog = new PostHog("YOUR_API_KEY", {
  host: "https://app.posthog.com",
});

// Track events
posthog.capture("button_clicked", { button: "sign_up" });
posthog.capture("purchase_completed", { product: "pro_yearly", price: 29.99 });
posthog.capture("feature_used", { feature: "image_generation" });

// Identify users (after auth)
posthog.identify(userId, { email: user.email, plan: "pro" });
```

### Sentry Setup

```bash
npx expo install @sentry/react-native
```

```typescript
// App.tsx
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});

// Wrap your app
export default Sentry.wrap(App);

// Manual error capture
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

**Official Docs:**

- PostHog: [posthog.com/docs/libraries/react-native](https://posthog.com/docs/libraries/react-native)
- Sentry: [docs.sentry.io/platforms/react-native](https://docs.sentry.io/platforms/react-native/)

---

## Payments & Monetization

| Solution                  | Platforms           | Fee            | Best For          |
| ------------------------- | ------------------- | -------------- | ----------------- |
| **RevenueCat**            | iOS, Android, Web   | 1% > $2.5K MTR | Subscriptions     |
| Stripe                    | Web, limited mobile | 2.9% + 30¢     | One-time payments |
| In-App Purchases (direct) | iOS, Android        | 15-30%         | If you want pain  |

**Verdict:** RevenueCat. Handles both platforms, provides analytics, and saves months of work.

**Why Not Direct IAP?**

- Different APIs for iOS and Android
- Receipt validation is complex
- No cross-platform subscription sync
- No analytics out of the box

### RevenueCat Setup

```bash
npx expo install react-native-purchases
```

```typescript
// lib/purchases.ts
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export async function initializePurchases(userId?: string) {
  Purchases.configure({
    apiKey:
      Platform.OS === "ios"
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS!
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID!,
    appUserID: userId,
  });
}

// Get available products
export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages || [];
}

// Make a purchase
export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

// Check if user has premium
export async function isPremium(): Promise<boolean> {
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active["pro"] !== undefined;
}

// Restore purchases
export async function restorePurchases() {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}
```

```typescript
// Usage in Paywall component
const packages = await getOfferings();

// Display packages
packages.map(pkg => (
  <PurchaseButton
    key={pkg.identifier}
    title={pkg.product.title}
    price={pkg.product.priceString}
    onPress={() => purchasePackage(pkg)}
  />
));
```

**Official Docs:** [revenuecat.com/docs](https://www.revenuecat.com/docs)

---

## The Recommended Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Framework      | Expo SDK 54                    |
| Navigation     | Expo Router 4                  |
| State (Client) | Zustand                        |
| State (Server) | TanStack Query                 |
| Backend        | Supabase                       |
| Auth           | Supabase Auth (Google + Apple) |
| Payments       | RevenueCat                     |
| Analytics      | PostHog                        |
| Errors         | Sentry                         |
| Language       | TypeScript (strict mode)       |

**Total Setup Time:** 2-3 hours (or 5 minutes with a boilerplate)

---

## Quick Decision Tree

```
Need native modules not in Expo?
├── Yes → Expo with Development Builds
└── No → Expo Go for development

Complex state with many developers?
├── Yes → Redux Toolkit
└── No → Zustand

Need real-time features?
├── Yes → Supabase (built-in)
└── No → Supabase (still the best choice)

Selling digital goods?
├── Yes → RevenueCat (required by stores)
└── No → Stripe for physical goods
```

---

**Pro Tip:** All of these technologies are pre-configured in [ShipReactNative](https://shipreactnative.com) - ready to use out of the box.

---

**Next:** Now that you know what to use, let's plan your 7-day launch.

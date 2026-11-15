# Part 6: Quick Reference Cards

Print these. Keep them handy. Ship faster.

---

## EAS Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project (first time)
eas build:configure

# Development build (with dev client)
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (for testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production

# Check build status
eas build:list

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Expo Router Cheat Sheet

### File-Based Routing

```
app/
├── _layout.tsx        → Root layout
├── index.tsx          → "/" (home)
├── about.tsx          → "/about"
├── [id].tsx           → "/123" (dynamic)
├── [...rest].tsx      → "/a/b/c" (catch-all)
├── (auth)/            → Group (no URL segment)
│   ├── login.tsx      → "/login"
│   └── signup.tsx     → "/signup"
└── (tabs)/            → Tab navigator
    ├── _layout.tsx    → Tab layout
    ├── index.tsx      → "/tabs"
    └── profile.tsx    → "/tabs/profile"
```

### Navigation

```typescript
import { router, Link, useLocalSearchParams } from 'expo-router';

// Imperative navigation
router.push('/profile');           // Push to stack
router.replace('/home');           // Replace current
router.back();                     // Go back
router.navigate('/settings');      // Smart navigation

// With parameters
router.push({
  pathname: '/user/[id]',
  params: { id: '123' },
});

// Link component
<Link href="/about">About</Link>
<Link href={{ pathname: '/user/[id]', params: { id: '123' } }}>User</Link>

// Get parameters
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Screenshot Sizes

### iOS (Required)

| Device         | Size (pixels) | Required     |
| -------------- | ------------- | ------------ |
| iPhone 6.7"    | 1290 x 2796   | Yes          |
| iPhone 6.5"    | 1284 x 2778   | Yes          |
| iPhone 5.5"    | 1242 x 2208   | If targeting |
| iPad Pro 12.9" | 2048 x 2732   | If iPad app  |
| iPad Pro 11"   | 1668 x 2388   | If iPad app  |

### Android (Required)

| Type            | Size (pixels)   | Notes             |
| --------------- | --------------- | ----------------- |
| Phone           | 1080 x 1920 min | Up to 3840 x 2160 |
| Feature Graphic | 1024 x 500      | Required          |
| Hi-res Icon     | 512 x 512       | Required          |

---

## App Icon Sizes

### Required Export

| Size        | Use                    |
| ----------- | ---------------------- |
| 1024 x 1024 | App Store / Play Store |

### iOS Auto-Generated From 1024

| Size      | Use         |
| --------- | ----------- |
| 180 x 180 | iPhone (3x) |
| 120 x 120 | iPhone (2x) |
| 167 x 167 | iPad Pro    |
| 152 x 152 | iPad        |
| 76 x 76   | iPad (1x)   |
| 40 x 40   | Spotlight   |
| 29 x 29   | Settings    |

### Android Auto-Generated From 1024

| Size      | Density    |
| --------- | ---------- |
| 48 x 48   | mdpi       |
| 72 x 72   | hdpi       |
| 96 x 96   | xhdpi      |
| 144 x 144 | xxhdpi     |
| 192 x 192 | xxxhdpi    |
| 512 x 512 | Play Store |

---

## Supabase Quick Reference

### Client Setup

```typescript
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabase = createClient(
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

### Auth Operations

```typescript
// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Get session
const {
  data: { session },
} = await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    /* */
  }
  if (event === "SIGNED_OUT") {
    /* */
  }
});
```

### Database Operations

```typescript
// Select
const { data } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });

// Insert
const { data } = await supabase
  .from("posts")
  .insert({ title: "Hello", user_id: userId })
  .select()
  .single();

// Update
const { data } = await supabase
  .from("posts")
  .update({ title: "Updated" })
  .eq("id", postId)
  .select()
  .single();

// Delete
await supabase.from("posts").delete().eq("id", postId);
```

### Edge Functions

```typescript
// Call edge function
const { data, error } = await supabase.functions.invoke("my-function", {
  body: { key: "value" },
});
```

---

## RevenueCat Quick Reference

### Setup

```typescript
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

await Purchases.configure({
  apiKey: Platform.OS === "ios" ? "appl_xxxxx" : "goog_xxxxx",
  appUserID: userId, // optional
});
```

### Common Operations

```typescript
// Get offerings
const { current } = await Purchases.getOfferings();
const packages = current?.availablePackages;

// Purchase
const { customerInfo } = await Purchases.purchasePackage(package);

// Check entitlement
const { customerInfo } = await Purchases.getCustomerInfo();
const isPro = customerInfo.entitlements.active["pro"] !== undefined;

// Restore purchases
const { customerInfo } = await Purchases.restorePurchases();

// Set user ID (after auth)
await Purchases.logIn(userId);

// Logout (reset to anonymous)
await Purchases.logOut();
```

---

## Zustand Quick Reference

### Create Store

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BearStore {
  bears: number;
  increase: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>()(
  persist(
    (set) => ({
      bears: 0,
      increase: () => set((state) => ({ bears: state.bears + 1 })),
      reset: () => set({ bears: 0 }),
    }),
    {
      name: "bear-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Use Store

```typescript
// In component
const bears = useBearStore((state) => state.bears);
const increase = useBearStore((state) => state.increase);

// Or get all
const { bears, increase, reset } = useBearStore();

// Outside React
const bears = useBearStore.getState().bears;
useBearStore.setState({ bears: 10 });
```

---

## Environment Variables

### Setup (.env)

```bash
# .env (never commit)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_REVENUECAT_IOS=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID=goog_xxx
EXPO_PUBLIC_POSTHOG_KEY=phc_xxx
```

### Usage

```typescript
// In code
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;

// Note: Only EXPO_PUBLIC_ prefixed vars are available in client
```

### EAS Secrets

```bash
# Set for EAS builds
eas secret:create --name SENTRY_AUTH_TOKEN --value xxx

# List secrets
eas secret:list
```

---

## Version Numbering

### app.json

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### Rules

| Field       | When to Change                             |
| ----------- | ------------------------------------------ |
| version     | User-facing updates (1.0.0 → 1.1.0)        |
| buildNumber | Every iOS build (must always increase)     |
| versionCode | Every Android build (must always increase) |

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes (1.0.1)
  │     └──────── New features (1.1.0)
  └────────────── Breaking changes (2.0.0)
```

---

## Common TypeScript Patterns

### Component Props

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

function Button({ title, onPress, variant = "primary", disabled }: ButtonProps) {
  // ...
}
```

### API Response

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Usage
const [state, setState] = useState<ApiResponse<User>>({
  data: null,
  error: null,
  loading: true,
});
```

### Async Handler

```typescript
const handleSubmit = async () => {
  try {
    setLoading(true);
    const result = await api.submit(data);
    setSuccess(true);
  } catch (error) {
    setError(error instanceof Error ? error.message : "Unknown error");
  } finally {
    setLoading(false);
  }
};
```

---

## Useful Links

### Official Documentation

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [RevenueCat Docs](https://www.revenuecat.com/docs)

### App Store Guidelines

- [Apple App Store Review](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

### Tools

- [EAS Build](https://expo.dev/eas)
- [Coolors](https://coolors.co) - Color palettes
- [Canva](https://canva.com) - Screenshots
- [Remove.bg](https://remove.bg) - Background removal

### Community

- [Expo Discord](https://chat.expo.dev)
- [React Native Discord](https://reactnative.dev/community/overview)
- [r/reactnative](https://reddit.com/r/reactnative)

---

## The Final Checklist (Before You Submit)

- [ ] App works on real device
- [ ] Apple Sign-In implemented (if any auth)
- [ ] No API keys in client code
- [ ] RLS enabled on all tables
- [ ] Privacy policy link works
- [ ] All screenshots uploaded
- [ ] App icon looks good at small sizes
- [ ] Version/build numbers incremented
- [ ] Production environment configured
- [ ] Analytics tracking key events
- [ ] Error tracking enabled

---

**You're ready to ship. Go do it.**

---

**Next:** Your next steps and how to ship even faster.

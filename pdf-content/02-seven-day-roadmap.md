# Part 2: The 7-Day Launch Roadmap

A realistic day-by-day plan to go from idea to App Store.

---

## Before You Start

### Prerequisites Checklist

- [ ] Apple Developer Account ($99/year) - [developer.apple.com](https://developer.apple.com)
- [ ] Google Play Developer Account ($25 one-time) - [play.google.com/console](https://play.google.com/console)
- [ ] Node.js 18+ installed
- [ ] Expo account (free) - [expo.dev](https://expo.dev)
- [ ] Supabase account (free) - [supabase.com](https://supabase.com)

**Pro Tip:** Apple review can take 24-48 hours. Submit early, iterate later.

---

## Day 1: Foundation

### Morning (2-3 hours)

**1. Project Setup**

```bash
npx create-expo-app@latest my-app
cd my-app
npx expo install expo-router
```

**2. Configure Expo Router**

- Create `app/` directory
- Set up basic navigation structure
- Add `index.tsx` and `_layout.tsx`

**3. Set Up Supabase**

- Create new Supabase project
- Copy URL and anon key to `.env`
- Initialize Supabase client

```typescript
// .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

### Afternoon (2-3 hours)

**4. Design System Foundation**

- Choose color palette (use [coolors.co](https://coolors.co))
- Set up theme constants
- Create base UI components (Button, Input, Card)

```typescript
// constants/theme.ts
export const colors = {
  light: {
    primary: "#7C3AED",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    error: "#EF4444",
    success: "#22C55E",
  },
  dark: {
    primary: "#A78BFA",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    error: "#F87171",
    success: "#4ADE80",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};
```

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.light.primary,
  },
  secondary: {
    backgroundColor: colors.light.surface,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: colors.light.text,
  },
  outlineText: {
    color: colors.light.primary,
  },
});
```

**5. Plan Your Screens**

```
app/
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── index.tsx (home)
│   ├── settings.tsx
│   └── profile.tsx
└── _layout.tsx
```

### Day 1 Deliverable

✅ Running app with navigation and basic theming

---

## Day 2: Authentication

### Morning (2-3 hours)

**1. Supabase Auth Setup**

- Enable Email auth in Supabase dashboard
- Configure OAuth providers (Google, Apple)
- Set up redirect URLs

**2. Auth Components**

- Login screen with email/password
- Sign up screen
- Forgot password flow

### Afternoon (2-3 hours)

**3. Apple Sign-In** (Required if you have any auth)

```bash
npx expo install expo-apple-authentication
```

**4. Google Sign-In**

```bash
npx expo install expo-auth-session expo-web-browser
```

**5. Auth State Management**

- Create auth context or Zustand store
- Persist session with AsyncStorage
- Handle token refresh

```typescript
// stores/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,

      initialize: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        set({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null });
        });
      },

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },

      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, TextInput, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
});
```

### Day 2 Deliverable

✅ Users can sign up, log in, and log out

---

## Day 3: Core Feature

### Focus: Build Your Main Value Proposition

This is YOUR app's unique feature. Examples:

- AI image generation
- Habit tracking
- Expense logging
- Recipe saving

### Morning (3-4 hours)

**1. Data Model**

```sql
-- Example: AI generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  result_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
ON generations FOR SELECT
USING (auth.uid() = user_id);
```

**2. API Integration**

- Set up Edge Functions for API calls
- Never expose API keys in client code
- Implement error handling

### Afternoon (3-4 hours)

**3. Build the UI**

- Main feature screen
- Loading states
- Success/error feedback
- Results display

**4. Test the Flow**

- Happy path works
- Errors are handled gracefully
- Loading states are smooth

### Day 3 Deliverable

✅ Core feature is functional and testable

---

## Day 4: Monetization

### Morning (2-3 hours)

**1. RevenueCat Setup**

```bash
npx expo install react-native-purchases
```

- Create RevenueCat account
- Add app to RevenueCat
- Configure products in App Store Connect / Google Play Console

**2. Product Configuration**

```
Products to create:
├── Monthly subscription ($4.99/mo)
├── Yearly subscription ($29.99/yr)
└── Optional: Lifetime ($79.99)
```

### Afternoon (3-4 hours)

**3. Paywall Screen**

- Feature comparison (free vs pro)
- Price display with trial info
- Purchase buttons
- Restore purchases

```typescript
// app/paywall.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function PaywallScreen() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
        // Pre-select yearly (best value)
        const yearly = offerings.current.availablePackages.find(
          p => p.packageType === 'ANNUAL'
        );
        setSelectedPackage(yearly || offerings.current.availablePackages[0]);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (customerInfo.entitlements.active['pro']) {
        Alert.alert('Success!', 'Welcome to Pro!');
        router.back();
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const { customerInfo } = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['pro']) {
        Alert.alert('Restored!', 'Your Pro access has been restored.');
        router.back();
      } else {
        Alert.alert('No purchases found', 'No previous purchases to restore.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upgrade to Pro</Text>
      <Text style={styles.subtitle}>Unlock all features</Text>

      {/* Features */}
      <View style={styles.features}>
        <FeatureRow icon="✓" text="Unlimited generations" />
        <FeatureRow icon="✓" text="Priority processing" />
        <FeatureRow icon="✓" text="Advanced features" />
        <FeatureRow icon="✓" text="No ads" />
      </View>

      {/* Packages */}
      <View style={styles.packages}>
        {packages.map((pkg) => (
          <PackageOption
            key={pkg.identifier}
            package={pkg}
            selected={selectedPackage?.identifier === pkg.identifier}
            onSelect={() => setSelectedPackage(pkg)}
          />
        ))}
      </View>

      <Button
        title={`Subscribe ${selectedPackage?.product.priceString || ''}`}
        onPress={handlePurchase}
        loading={loading}
      />

      <TouchableOpacity onPress={handleRestore} style={styles.restore}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

**4. Entitlement Checks**

```typescript
// hooks/usePremium.ts
import { useState, useEffect } from "react";
import Purchases from "react-native-purchases";

export function usePremium() {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();

    // Listen for changes
    Purchases.addCustomerInfoUpdateListener((info) => {
      setIsPro(info.entitlements.active["pro"] !== undefined);
    });
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      setIsPro(customerInfo.entitlements.active["pro"] !== undefined);
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isPro, isLoading, refetch: checkPremiumStatus };
}

// Usage in components
const { isPro } = usePremium();

if (!isPro) {
  router.push("/paywall");
  return;
}
```

**5. Credit System (Optional)**

- Free tier: 5 generations/day
- Pro tier: Unlimited
- Track usage in database

```typescript
// hooks/useCredits.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePremium } from "./usePremium";

const FREE_DAILY_LIMIT = 5;

export function useCredits() {
  const { isPro } = usePremium();
  const [credits, setCredits] = useState(FREE_DAILY_LIMIT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPro) {
      fetchTodayUsage();
    }
  }, [isPro]);

  const fetchTodayUsage = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    setCredits(Math.max(0, FREE_DAILY_LIMIT - (count || 0)));
    setIsLoading(false);
  };

  const useCredit = () => {
    if (!isPro) {
      setCredits((prev) => Math.max(0, prev - 1));
    }
  };

  return {
    credits: isPro ? Infinity : credits,
    hasCredits: isPro || credits > 0,
    useCredit,
    isLoading,
    isPro,
  };
}
```

### Day 4 Deliverable

✅ Users can upgrade to premium

---

## Day 5: Polish & Settings

### Morning (2-3 hours)

**1. Settings Screen**

- Account management
- Theme toggle (dark/light)
- Notification preferences
- Language selection

**2. Profile Screen**

- User info display
- Edit profile
- Usage statistics

**3. Onboarding Flow**

- 3-4 screen walkthrough
- Explain key features
- End with soft paywall

### Afternoon (2-3 hours)

**4. Error Handling**

- Sentry setup for crash tracking
- User-friendly error messages
- Offline detection

**5. Performance Optimization**

- Image caching
- Lazy loading
- Reduce bundle size

**6. Haptic Feedback**

```bash
npx expo install expo-haptics
```

### Day 5 Deliverable

✅ App feels complete and polished

---

## Day 6: App Store Assets

### Morning (3-4 hours)

**1. App Icon** (See Part 4 for AI prompts)

- 1024x1024 PNG (no transparency)
- Simple, recognizable design
- Avoid text (too small to read)

**2. Screenshots**

- iPhone 6.7" (1290 x 2796) - Required
- iPhone 6.5" (1284 x 2778) - Required
- iPad Pro 12.9" (2048 x 2732) - If you support iPad

**3. Preview Video (Optional but recommended)**

- 15-30 seconds
- Show core features
- No hands in frame (App Store rule)

### Afternoon (2-3 hours)

**4. App Store Copy**

```
Name: [App Name] (30 chars max)
Subtitle: [One-liner value prop] (30 chars max)
Description: First 3 lines are crucial
Keywords: [100 chars, comma separated]
```

**5. Privacy Policy & Terms**

- Use a generator (Termly, iubenda)
- Host on your website or Notion
- Link in App Store listing

### Day 6 Deliverable

✅ All marketing assets ready

---

## Day 7: Submit & Launch

### Morning (2-3 hours)

**1. Final Testing**

- Fresh install test
- All user flows work
- No console errors/warnings
- TestFlight/Internal testing

**2. Build for Production**

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for both platforms
eas build --platform all --profile production
```

### Afternoon (2-3 hours)

**3. Submit to App Store**

```bash
eas submit --platform ios
```

- Fill in App Store Connect details
- Upload screenshots
- Set pricing
- Submit for review

**4. Submit to Google Play**

```bash
eas submit --platform android
```

- Complete store listing
- Set content rating
- Configure pricing
- Roll out to production

**5. Set Up Monitoring**

- RevenueCat for revenue
- Sentry for crashes
- PostHog for analytics

### Day 7 Deliverable

✅ App submitted to both stores!

---

## Post-Launch: Week 1

### What to Expect

| Platform | Review Time | First Action                   |
| -------- | ----------- | ------------------------------ |
| iOS      | 24-48 hours | Respond to any rejection notes |
| Android  | 1-3 days    | Check for policy warnings      |

### Common Rejection Reasons

1. **Incomplete metadata** → Fix and resubmit
2. **Broken links** → Update privacy policy URL
3. **Crasher bug** → Fix, test, rebuild
4. **Guideline 4.2** → Add more features or content

### First Week Priorities

1. Monitor crash reports
2. Respond to reviews
3. Fix critical bugs immediately
4. Gather user feedback
5. Plan first update

---

## The Reality Check

### Estimated Time Investment

| Day       | Focus          | Hours           |
| --------- | -------------- | --------------- |
| 1         | Foundation     | 5-6             |
| 2         | Authentication | 5-6             |
| 3         | Core Feature   | 6-8             |
| 4         | Monetization   | 5-6             |
| 5         | Polish         | 4-5             |
| 6         | Assets         | 5-6             |
| 7         | Submit         | 4-5             |
| **Total** |                | **35-42 hours** |

### What Can Go Wrong

- **Apple rejection:** Budget 2-3 extra days
- **Technical blockers:** Have backup plans
- **Scope creep:** MVP first, features later
- **Burnout:** Take breaks, don't rush

---

**Next:** The complete launch checklist to make sure you don't miss anything.

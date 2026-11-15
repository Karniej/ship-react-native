<!-- @format -->

# Mobile App Boilerplate Guide

## Overview

This document outlines a comprehensive boilerplate for React Native mobile apps using Expo, with a focus on authentication, onboarding, navigation, settings, and premium features. Based on the ColdExposureMastery app architecture.

## Tech Stack & Dependencies

### Core Framework

- **Expo** (~51.0.38) - React Native framework
- **React Native** (0.74.5) - Mobile app framework
- **TypeScript** (~5.3.3) - Type safety
- **Expo Router** (~3.5.24) - File-based routing

### State Management

- **Zustand** (^5.0.0-beta.0) - Lightweight state management
- **React Query** (^3.39.3) - Server state management
- **AsyncStorage** (1.23.1) - Local storage

### Navigation & UI

- **Expo Router** - File-based routing system
- **React Navigation** (^6.0.2) - Navigation library
- **Expo Vector Icons** (^14.0.3) - Icon library
- **React Native Reanimated** (~3.10.1) - Animations
- **React Native Gesture Handler** (~2.16.1) - Gestures

### Premium Features & Analytics

- **React Native Purchases** (^7.28.1) - RevenueCat integration
- **PostHog React Native** (^4.1.0) - Analytics
- **Expo Store Review** (~7.0.2) - App store reviews

### UI Components & Styling

- **Expo Linear Gradient** (~13.0.2) - Gradient backgrounds
- **React Native Calendars** (^1.1301.0) - Calendar components
- **React Native Chart Kit** (^6.12.0) - Charts
- **Expo Google Fonts** - Custom fonts (Poppins, Sedgwick Ave Display)

## Project Structure

```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx                # Entry point with routing logic
├── onboarding.tsx           # Onboarding screen
├── premium.tsx              # Paywall/subscription screen
├── privacy.tsx              # Privacy policy
├── terms.tsx                # Terms of service
├── [...missing].tsx         # 404 handler
├── +html.tsx                # Web HTML template
└── (tabs)/                  # Tab-based navigation
    ├── _layout.tsx          # Tab layout
    ├── index.tsx            # Home tab
    ├── profile.tsx          # Profile tab
    ├── settings.tsx         # Settings tab
    └── analytics.tsx        # Analytics tab

components/
├── OnboardingScreen.tsx     # Main onboarding component
├── PremiumIcon.tsx          # Premium status indicator
├── PrimaryButton.tsx        # Consistent button component
├── Themed.tsx               # Theme-aware components
├── NotificationSettings.tsx # Notification preferences
└── premiumComponents/       # Premium-specific components
    ├── PricingOption.tsx
    ├── PurchaseButton.tsx
    └── FeaturesList.tsx

store/
├── useUserStore.ts          # User authentication & profile
├── useOnboardingStore.ts    # Onboarding progress
├── useGeneralStore.ts       # Global app settings
├── useNotificationStore.ts  # Notification preferences
├── useSessionsStore.ts      # App-specific data
└── types.ts                 # TypeScript types

services/
├── RevenueCatService.ts     # Payment processing
├── PostHogService.ts        # Analytics service
└── WatchConnectivityService.ts # Device connectivity

hooks/
├── usePremiumStatus.ts      # Premium status management
├── useCountdownTimer.ts     # Timer functionality
└── useWatchIntegration.ts   # Device integration

constants/
├── theme.tsx                # Theme colors & styling
├── constants.ts             # App constants
├── onboardingData.ts        # Onboarding flow data
└── helpers.ts               # Utility functions
```

## 1. Navigation Structure

### File-Based Routing with Expo Router

**Root Layout (`app/_layout.tsx`)**

```typescript
export default function RootLayout() {
  // Font loading
  // RevenueCat initialization
  // PostHog provider setup
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const initializeStores = async () => {
    // Load user data
    // Initialize stores
    // Setup watch connectivity
  };

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="premium" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <Toast />
          </GestureHandlerRootView>
        </ThemeProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
```

**Tab Navigation (`app/(tabs)/_layout.tsx`)**

```typescript
export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
          headerRight: () => <PremiumIcon />,
        }}
      />
    </Tabs>
  );
}
```

## 2. Authentication System

### Social Authentication (Google & Apple)

The boilerplate includes a complete social authentication system using Supabase OAuth with Google and Apple providers.

**App Flow with Social Auth:**

```
Onboarding → Paywall → Login → Home
```

#### Auth Service (`services/auth.service.ts`)

```typescript
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/utils/supabase";

WebBrowser.maybeCompleteAuthSession();

class AuthService {
  private redirectUri: string;

  constructor() {
    this.redirectUri = getRedirectUri();
  }

  async signInWithGoogle(): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: this.redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { success: false, error: error.message };

    const result = await WebBrowser.openAuthSessionAsync(data.url, this.redirectUri);

    if (result.type === "success" && result.url) {
      return this.handleAuthCallback(result.url);
    }

    return { success: false, error: "Authentication failed" };
  }

  async signInWithApple(): Promise<AuthResult> {
    // Similar to Google, uses Supabase OAuth with Apple provider
  }
}

export const authService = new AuthService();
```

#### Auth Store Integration (`store/useAuthStore.ts`)

```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Social auth methods
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // ... state

  signInWithGoogle: async () => {
    set({ isLoading: true });
    const result = await authService.signInWithGoogle();

    if (!result.success && result.error !== "cancelled") {
      set({ isLoading: false });
      return { error: new Error(result.error) };
    }

    set({ isLoading: false });
    return { error: null };
  },

  signInWithApple: async () => {
    // Similar implementation
  },
}));
```

#### Onboarding Store Auth State (`store/useOnboardingStore.ts`)

```typescript
interface OnboardingStore {
  isOnboardingCompleted: boolean;
  hasSeenPremiumScreen: boolean;
  hasSeenAuthScreen: boolean; // NEW: tracks auth screen visibility

  markAuthScreenSeen: () => void;
  resetOnboarding: () => void;
}
```

#### Feature Flags (`constants/features.ts`)

```typescript
interface SocialAuthConfig {
  enabled: boolean;
  googleEnabled: boolean;
  appleEnabled: boolean;
  required: boolean; // If true, users must sign in
  premiumOnly: boolean;
  beta: boolean;
  comingSoon: boolean;
}

export const FEATURES: FeatureFlags = {
  socialAuth: {
    enabled: true,
    googleEnabled: true,
    appleEnabled: true,
    required: false, // Configurable via CLI setup
    premiumOnly: false,
    beta: false,
    comingSoon: false,
  },
  // ... other features
};
```

#### Login Screen (`app/login.tsx`)

The login screen appears after the paywall and provides:

- Google Sign In button
- Apple Sign In button
- Skip option (if auth is not required)
- Terms & Privacy links

```typescript
export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple, isAuthenticated } = useAuthStore();
  const { markAuthScreenSeen } = useOnboardingStore();

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (!error) {
      posthog?.capture("auth_success", { provider: "google" });
    }
  };

  const handleSkip = () => {
    markAuthScreenSeen();
    router.replace("/(app)/(tabs)");
  };

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      markAuthScreenSeen();
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView>
      {/* Google button */}
      {/* Apple button */}
      {/* Skip button (if auth not required) */}
    </SafeAreaView>
  );
}
```

#### Routing Logic (`app/index.tsx`)

```typescript
export default function IndexPage() {
  const { isOnboardingCompleted, hasSeenPremiumScreen, hasSeenAuthScreen } = useOnboardingStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(
    () => {
      if (!isOnboardingCompleted) {
        router.replace("/onboarding");
      } else if (!hasSeenPremiumScreen) {
        router.replace("/premium");
      } else if (socialAuthEnabled && !hasSeenAuthScreen) {
        // Show login if auth is required OR user hasn't seen it yet
        const authRequired = FEATURES.socialAuth?.required ?? false;
        if (authRequired || !isAuthenticated) {
          router.replace("/login");
        } else {
          router.replace("/(app)/(tabs)");
        }
      } else {
        router.replace("/(app)/(tabs)");
      }
    },
    [
      /* dependencies */
    ]
  );
}
```

#### CLI Setup Configuration

The `scripts/setup.js` includes an authentication configuration step:

```javascript
// Step 3: Authentication Configuration
const authChoices = [
  { name: "Enabled (optional) - Users can sign in or skip", value: "optional" },
  { name: "Enabled (required) - Users must sign in", value: "required" },
  { name: "Disabled - No social authentication", value: "disabled" },
];

// Updates features.ts based on selection
```

#### Supabase Setup Requirements

1. **Enable Google OAuth** in Supabase Dashboard:
   - Go to Authentication → Providers → Google
   - Add your Google Cloud OAuth credentials

2. **Enable Apple OAuth** in Supabase Dashboard:
   - Go to Authentication → Providers → Apple
   - Configure with your Apple Developer credentials

3. **Configure Redirect URLs** in Supabase:
   - Add your app's deep link scheme (e.g., `myapp://auth/callback`)
   - Add Expo Go redirect for development (`exp://...`)

4. **Update `app.json`**:
   ```json
   {
     "ios": {
       "usesAppleSignIn": true
     }
   }
   ```

### User Store (`store/useUserStore.ts`)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  createdAt: string;
  lastPremiumCheck: number;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  loadUser: () => Promise<void>;
  clearUser: () => void;
  checkPremiumStatus: () => Promise<void>;
}

export const useUserStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      loadUser: async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          const newUser = generateRandomUser();
          await AsyncStorage.setItem("user", JSON.stringify(newUser));
          set({ user: newUser });
        } else {
          set({ user: JSON.parse(storedUser) });
        }
      },
      clearUser: async () => {
        await AsyncStorage.removeItem("user");
        set({ user: null });
      },
      checkPremiumStatus: async () => {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = customerInfo.entitlements.active["pro"] !== undefined;

          const currentUser = get().user;
          if (currentUser && currentUser.isPremium !== isPremium) {
            const updatedUser = { ...currentUser, isPremium };
            set({ user: updatedUser });
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Failed to check premium status:", error);
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Entry Point Logic (`app/index.tsx`)

```typescript
export default function IndexPage() {
  const router = useRouter();
  const { isOnboardingCompleted, hasSeenPremiumScreen } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isOnboardingCompleted) {
      router.replace("/onboarding");
    } else if (!hasSeenPremiumScreen) {
      router.replace("/premium");
    } else {
      router.replace("/(tabs)");
    }
  }, [isOnboardingCompleted, hasSeenPremiumScreen, isLoading]);

  return <View style={styles.loadingContainer} />;
}
```

## 3. Onboarding System

### Onboarding Store (`store/useOnboardingStore.ts`)

```typescript
interface OnboardingStore {
  isOnboardingCompleted: boolean;
  hasSeenPremiumScreen: boolean;
  currentSlideIndex: number;
  userData: UserOnboardingData;

  setCurrentSlide: (index: number) => void;
  updateUserData: (key: string, value: any) => void;
  completeOnboarding: () => void;
  markPremiumScreenSeen: () => void;
  resetOnboarding: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      isOnboardingCompleted: false,
      hasSeenPremiumScreen: false,
      currentSlideIndex: 0,
      userData: {},

      setCurrentSlide: (index: number) => set({ currentSlideIndex: index }),

      updateUserData: (key: string, value: any) => {
        set((state) => ({
          userData: { ...state.userData, [key]: value },
        }));
      },

      completeOnboarding: () => {
        set({ isOnboardingCompleted: true });
      },

      markPremiumScreenSeen: () => {
        set({ hasSeenPremiumScreen: true });
      },

      resetOnboarding: () => {
        set({
          isOnboardingCompleted: false,
          hasSeenPremiumScreen: false,
          currentSlideIndex: 0,
          userData: {},
        });
      },

      nextSlide: () => {
        set((state) => ({
          currentSlideIndex: Math.min(state.currentSlideIndex + 1, onboardingSlides.length - 1),
        }));
      },

      previousSlide: () => {
        set((state) => ({
          currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0),
        }));
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Onboarding Data Structure (`constants/onboardingData.ts`)

```typescript
export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle?: string;
  type: "welcome" | "input" | "selection" | "permission" | "completion";
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean;
  optional?: boolean;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to Your App",
    subtitle: "Get started with your personalized experience",
    type: "welcome",
    component: WelcomeSlide,
  },
  {
    id: "name",
    title: "What should we call you?",
    type: "input",
    component: NameInputSlide,
    validation: (data) => data.name && data.name.trim().length > 0,
  },
  {
    id: "preferences",
    title: "Set your preferences",
    type: "selection",
    component: PreferencesSlide,
  },
  {
    id: "notifications",
    title: "Enable notifications",
    type: "permission",
    component: NotificationPermissionSlide,
    optional: true,
  },
];
```

### Onboarding Screen Component (`components/OnboardingScreen.tsx`)

```typescript
export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const {
    currentSlideIndex,
    userData,
    updateUserData,
    completeOnboarding,
    nextSlide,
    previousSlide,
  } = useOnboardingStore();

  const currentSlide = onboardingSlides[currentSlideIndex];
  const progress = (currentSlideIndex + 1) / onboardingSlides.length;

  const handleNext = () => {
    if (currentSlideIndex < onboardingSlides.length - 1) {
      nextSlide();
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    completeOnboarding();
    // Setup user based on onboarding data
    await setupUserFromOnboarding(userData);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <currentSlide.component
          data={userData}
          onUpdate={updateUserData}
          onNext={handleNext}
          onPrevious={currentSlideIndex > 0 ? previousSlide : undefined}
        />
      </View>
    </SafeAreaView>
  );
};
```

## 4. Premium/Paywall System

### RevenueCat Service (`services/RevenueCatService.ts`)

```typescript
export class RevenueCatService {
  static async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active["pro"] !== undefined;
    } catch (error) {
      console.error("Failed to check premium status:", error);
      return false;
    }
  }

  static async purchaseProduct(product: PurchasesStoreProduct): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchaseStoreProduct(product);
      if (customerInfo.entitlements.active["pro"]) {
        return true;
      } else {
        Alert.alert("Purchase Issue", "Please contact support if this persists.");
        return false;
      }
    } catch (error) {
      const purchasesError = error as PurchasesError;
      if (!purchasesError.userCancelled) {
        Alert.alert("Purchase Failed", purchasesError.message);
      }
      return false;
    }
  }

  static async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.entitlements.active["pro"] !== undefined;
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      return false;
    }
  }

  static async getProducts(productIds: string[]): Promise<PurchasesStoreProduct[]> {
    try {
      const products = await Purchases.getProducts(productIds);
      return products;
    } catch (error) {
      console.error("Failed to get products:", error);
      return [];
    }
  }
}
```

### Premium Status Hook (`hooks/usePremiumStatus.ts`)

```typescript
export function usePremiumStatus() {
  const { user, setUser } = useUserStore();
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: user?.isPremium || false,
    isLoading: true,
    error: null,
    lastChecked: null,
  });

  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active["pro"] !== undefined;

      setPremiumStatus({
        isPremium,
        isLoading: false,
        error: null,
        lastChecked: Date.now(),
      });

      if (user && user.isPremium !== isPremium) {
        const updatedUser = { ...user, isPremium };
        setUser(updatedUser);
      }
    } catch (error) {
      setPremiumStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    checkPremiumStatus();
    const interval = setInterval(checkPremiumStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return premiumStatus;
}

export function useIsPremium(): boolean {
  const { isPremium } = usePremiumStatus();
  return isPremium;
}
```

### Premium Screen (`app/premium.tsx`)

```typescript
export default function Premium() {
  const [selectedPlan, setSelectedPlan] =
    useState<PurchasesStoreProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { markPremiumScreenSeen } = useOnboardingStore();

  const { data: products, isLoading: productsLoading } = useQuery(
    "products",
    () => RevenueCatService.getProducts(["monthly_pro", "yearly_pro"]),
  );

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const success = await RevenueCatService.purchaseProduct(selectedPlan);
      if (success) {
        markPremiumScreenSeen();
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    markPremiumScreenSeen();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upgrade to Premium</Text>

        <View style={styles.features}>
          {premiumFeatures.map((feature, index) => (
            <FeatureItem key={index} icon={feature.icon} text={feature.text} />
          ))}
        </View>

        <View style={styles.plans}>
          {products?.map((product) => (
            <PricingOption
              key={product.identifier}
              product={product}
              selected={selectedPlan?.identifier === product.identifier}
              onSelect={() => setSelectedPlan(product)}
            />
          ))}
        </View>

        <PurchaseButton
          onPress={handlePurchase}
          loading={isLoading}
          disabled={!selectedPlan}
        />
      </View>
    </View>
  );
}
```

## 5. Settings System

### Settings Screen (`app/(tabs)/settings.tsx`)

```typescript
export default function SettingsScreen() {
  const { user, clearUser } = useUserStore();
  const { resetOnboarding } = useOnboardingStore();
  const { isCelsius, setIsCelsius } = useGeneralStore();
  const isPremium = useIsPremium();

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearUser();
              await clearSessions();
              resetOnboarding();
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
            }
          },
        },
      ],
    );
  };

  const SettingRow = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Feather name={icon} size={20} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Feather name="chevron-right" size={20} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingRow
          icon="user"
          title="Profile"
          subtitle={user?.name}
          onPress={() => router.push("/profile")}
        />
        {!isPremium && (
          <SettingRow
            icon="star"
            title="Upgrade to Premium"
            onPress={() => router.push("/premium")}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingRow
          icon="thermometer"
          title="Temperature Unit"
          subtitle={isCelsius ? "Celsius" : "Fahrenheit"}
          rightComponent={
            <Switch
              value={isCelsius}
              onValueChange={setIsCelsius}
              trackColor={{ false: "#767577", true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon="bell"
          title="Notifications"
          onPress={() => setShowNotificationSettings(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingRow
          icon="mail"
          title="Contact Support"
          onPress={handleContactSupport}
        />
        <SettingRow icon="star" title="Rate App" onPress={handleRateApp} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <SettingRow
          icon="download"
          title="Export Data"
          onPress={handleExportData}
        />
        <SettingRow
          icon="trash-2"
          title="Clear All Data"
          onPress={handleClearData}
        />
      </View>
    </ScrollView>
  );
}
```

## 6. Theme System

### Theme Configuration (`constants/theme.tsx`)

```typescript
export const colors = {
  primary: "#4facfe",
  secondary: "#DD0333",
  tertiary: "#011F3F",
  white: "#FFFFFF",
  black: "#000000",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  gray: "#808080",
  lightGray: "#D2D9D9",
  background: {
    light: "#ffffff",
    dark: "#1a1a2e",
  },
  text: {
    light: "#282828",
    dark: "#ffffff",
  },
  card: {
    light: "#ffffff",
    dark: "#2a2a3e",
  },
};

export const DefaultTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background.light,
    card: colors.card.light,
    text: colors.text.light,
    border: colors.text.light,
    notification: colors.secondary,
  },
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background.dark,
    card: colors.card.dark,
    text: colors.text.dark,
    border: colors.text.dark,
    notification: colors.secondary,
  },
};

export const fontSizes = {
  xsmall: 12,
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 32,
};

export const spacing = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};
```

### Themed Components (`components/Themed.tsx`)

```typescript
import { useTheme } from "@react-navigation/native";
import { Text as DefaultText, View as DefaultView } from "react-native";

export function Text(props: DefaultText["props"]) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return (
    <DefaultText
      style={[{ color: theme.colors.text }, style]}
      {...otherProps}
    />
  );
}

export function View(props: DefaultView["props"]) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return (
    <DefaultView
      style={[{ backgroundColor: theme.colors.background }, style]}
      {...otherProps}
    />
  );
}
```

## 7. Analytics Integration

### PostHog Service (`services/PostHogService.ts`)

```typescript
export const PostHogAnalytics = {
  // Onboarding Events
  trackOnboardingStarted: (posthog: any) => {
    posthog?.capture("onboarding_started", {
      timestamp: new Date().toISOString(),
    });
  },

  trackOnboardingStepCompleted: (posthog: any, stepNumber: number, stepId: string) => {
    posthog?.capture("onboarding_step_completed", {
      step_number: stepNumber,
      step_id: stepId,
      timestamp: new Date().toISOString(),
    });
  },

  // Premium Events
  trackPremiumScreenViewed: (posthog: any) => {
    posthog?.capture("premium_screen_viewed");
  },

  trackPurchaseStarted: (posthog: any, productId: string) => {
    posthog?.capture("purchase_started", {
      product_id: productId,
    });
  },

  trackPurchaseCompleted: (posthog: any, productId: string, revenue: number) => {
    posthog?.capture("purchase_completed", {
      product_id: productId,
      revenue: revenue,
    });
  },

  // User Events
  trackUserCreated: (posthog: any, userId: string) => {
    posthog?.capture("user_created", {
      user_id: userId,
    });
  },

  trackSettingsChanged: (posthog: any, setting: string, value: any) => {
    posthog?.capture("settings_changed", {
      setting: setting,
      value: value,
    });
  },
};
```

### Analytics Usage in Components

```typescript
import { usePostHog } from "posthog-react-native";
import { PostHogAnalytics } from "../services/PostHogService";

export const SomeComponent = () => {
  const posthog = usePostHog();

  const handleButtonPress = () => {
    PostHogAnalytics.trackButtonPressed(posthog, "some_button");
    // Handle button press
  };

  return (
    <TouchableOpacity onPress={handleButtonPress}>
      <Text>Press Me</Text>
    </TouchableOpacity>
  );
};
```

## 8. Environment Setup

### Required Environment Variables

```env
# RevenueCat API Keys
EXPO_PUBLIC_REVENUECAT_API_KEY=your_android_key_here
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_key_here

# PostHog Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### App Configuration (`app.json`)

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "yourapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.yourapp"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## 9. Key Components

### Primary Button (`components/PrimaryButton.tsx`)

```typescript
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  variant?: "primary" | "secondary" | "outline";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary",
}) => {
  const theme = useTheme();

  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.primary,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "outline" && { color: colors.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

### Premium Icon (`components/PremiumIcon.tsx`)

```typescript
export const PremiumIcon = () => {
  const isPremium = useIsPremium();
  const theme = useTheme();

  const handlePress = () => {
    if (!isPremium) {
      router.push("/premium");
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Feather
        name={isPremium ? "star" : "star"}
        size={24}
        color={isPremium ? colors.gold : theme.colors.text}
      />
    </TouchableOpacity>
  );
};
```

## 10. Implementation Steps

### Step 1: Initial Setup

1. Create new Expo app with TypeScript
2. Install required dependencies
3. Set up folder structure
4. Configure app.json

### Step 2: Core Infrastructure

1. Set up Zustand stores
2. Configure Expo Router
3. Create theme system
4. Set up AsyncStorage persistence

### Step 3: Authentication & User Management

1. Create user store
2. Implement user creation/loading
3. Set up routing logic in index.tsx

### Step 4: Onboarding System

1. Design onboarding flow
2. Create onboarding store
3. Build onboarding components
4. Implement progress tracking

### Step 5: Premium Features

1. Set up RevenueCat
2. Create premium hooks
3. Build paywall screen
4. Implement purchase flow

### Step 6: Settings & Preferences

1. Create settings store
2. Build settings screen
3. Implement data management
4. Add preference toggles

### Step 7: Analytics & Monitoring

1. Set up PostHog
2. Create analytics service
3. Add event tracking
4. Implement user identification

### Step 8: Polish & Testing

1. Add error handling
2. Implement loading states
3. Test all flows
4. Add accessibility features

## 11. AI Generations & Credits System

This boilerplate includes a comprehensive AI generation system with credit-based usage tracking and development mode support.

### Overview

The system manages:

- **Credit costs** for each AI generation type (image, video, speech, transcription, vision)
- **Free tier limits** for non-premium users
- **Premium access** with unlimited generations
- **Development mode** for testing without credit restrictions
- **Model configurations** for all AI providers

### Configuration File (`constants/generations.ts`)

All generation settings are centralized in one file for easy management:

```typescript
// Development Mode - UNLIMITED GENERATIONS
export const DEV_MODE = {
  enabled: __DEV__ || process.env.EXPO_PUBLIC_DEV_MODE === "true",
  showDevBanner: true,
  logGenerations: true,
};

// Credit Costs per Generation Type
export const CREDIT_COSTS = {
  image: {
    "dall-e-3": 2,
    "dall-e-2": 1,
    "flux-schnell": 1,
    sdxl: 2,
    default: 1,
  },
  video: { "runway-gen3": 5, pika: 4, "stable-video": 3, default: 4 },
  speech: { elevenlabs: 1, default: 1 },
  transcription: { "whisper-1": 1, "whisper-large-v3": 2, default: 1 },
  vision: { "gpt-4-vision": 2, "gpt-4o": 1, "claude-3-opus": 3, default: 1 },
};

// Free Tier Configuration
export const FREE_TIER = {
  initialCredits: 10, // Credits for new users
  dailyRefill: 0, // Daily credit refill (0 = disabled)
  maxCredits: 50, // Maximum accumulated credits
  showUpgradePrompts: true, // Show upgrade prompts when low
  lowCreditsThreshold: 3, // "Low credits" warning threshold
  restrictModels: false, // Restrict certain models for free users
  restrictedModels: ["dall-e-3", "runway-gen3", "claude-3-opus"],
};

// Premium Configuration
export const PREMIUM = {
  unlimitedGenerations: true,
  allModelsAccess: true,
  priorityProcessing: true,
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
  },
};
```

### Development Mode (Unlimited Generations)

**Development mode is AUTOMATICALLY enabled** when running the app in development (`__DEV__` is true). This means:

- All credit checks are bypassed
- Users have unlimited generations
- All models are available regardless of restrictions
- Generation attempts are logged to console

**To enable dev mode in production builds** (for testing):

```env
# In your .env file
EXPO_PUBLIC_DEV_MODE=true
```

**Console output in dev mode:**

```
╔══════════════════════════════════════════════════════════════╗
║  🧪 DEV MODE GENERATION                                      ║
╠══════════════════════════════════════════════════════════════╣
║  Type: image                                                 ║
║  Model: dall-e-3                                             ║
║  Prompt: A beautiful sunset over mountains                   ║
║  Credits: BYPASSED (Dev Mode)                                ║
╚══════════════════════════════════════════════════════════════╝
```

### Helper Functions

The configuration file exports useful helper functions:

```typescript
import {
  getCreditCost,
  canGenerate,
  isModelAvailable,
  getAvailableModels,
  logGeneration,
} from "@/constants/generations";

// Get cost for a specific generation
const cost = getCreditCost("image", "dall-e-3"); // Returns 2

// Check if user can generate
const { allowed, reason, cost } = canGenerate(
  userCredits, // Current credits
  isPremium, // Is user premium?
  "image", // Generation type
  "dall-e-3" // Model (optional)
);

// Check if model is available for user
const available = isModelAvailable("dall-e-3", "image", isPremium);

// Get all available models for user
const models = getAvailableModels("image", isPremium);
```

### Database Requirements

The credit system requires a `user_credits` table in Supabase:

```sql
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 10,
  credits_used_total INTEGER DEFAULT 0,
  last_refill_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own credits
CREATE POLICY "Users can read own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for service role to update credits
CREATE POLICY "Service can update credits" ON user_credits
  FOR UPDATE USING (true);
```

### Customizing for Your App

**1. Adjust Credit Costs:**

```typescript
// In constants/generations.ts
export const CREDIT_COSTS = {
  image: {
    "dall-e-3": 5, // Increase for expensive models
    "dall-e-2": 2,
    default: 1,
  },
  // ... customize other types
};
```

**2. Change Initial Credits:**

```typescript
export const FREE_TIER = {
  initialCredits: 20, // Give more credits to start
  // ...
};
```

**3. Enable Daily Refills:**

```typescript
export const FREE_TIER = {
  dailyRefill: 5, // Give 5 credits daily
  maxCredits: 30, // Cap at 30 accumulated
  // ...
};
```

**4. Restrict Premium Models:**

```typescript
export const FREE_TIER = {
  restrictModels: true, // Enable restrictions
  restrictedModels: ["dall-e-3", "runway-gen3", "gpt-4-vision"],
  // ...
};
```

### Production Checklist

Before going to production:

1. **Disable dev mode**: Ensure `EXPO_PUBLIC_DEV_MODE` is NOT set in production
2. **Set appropriate costs**: Adjust `CREDIT_COSTS` based on your API costs
3. **Configure free tier**: Set reasonable `initialCredits` and limits
4. **Test credit deduction**: Verify credits are properly deducted
5. **Set up monitoring**: Track credit usage in your analytics

## 12. Best Practices

### State Management

- Use separate stores for different concerns
- Persist important data with AsyncStorage
- Keep stores focused and small
- Use TypeScript for type safety

### Navigation

- Use file-based routing consistently
- Implement proper loading states
- Handle deep linking
- Test navigation flows

### Performance

- Lazy load heavy components
- Use React.memo for expensive renders
- Optimize images and assets
- Monitor bundle size

### Security

- Validate all user inputs
- Use secure storage for sensitive data
- Implement proper error handling
- Keep API keys secure

### User Experience

- Provide clear feedback
- Implement proper loading states
- Handle offline scenarios
- Test on different devices

This boilerplate provides a solid foundation for building mobile apps with authentication, onboarding, premium features, and comprehensive settings management. The architecture is scalable and follows React Native best practices.

## 13. Native UI Components (Expo UI) - COMING SOON

> **Status: Coming Soon**
>
> This feature is prepared but not yet active. The components are in the codebase at `components/native-ui/` and will be enabled once iOS 26 is publicly released (expected Fall 2025).

This boilerplate includes optional support for native platform UI components using `@expo/ui` and `expo-glass-effect` packages. These provide SwiftUI components on iOS and Jetpack Compose on Android.

### Why Not Active Yet?

- **Liquid Glass requires iOS 26** - Apple's new Liquid Glass design language is only available on iOS 26+, which is currently in beta
- **Xcode 26 required** - Building apps with Liquid Glass support requires Xcode 26 (beta)
- **Limited value without iOS 26** - The main visual benefit (Liquid Glass) isn't available on current iOS versions

### Future Roadmap

When iOS 26 is publicly released, this boilerplate will be updated to:

1. **Enable expo-ui components by default** on iOS
2. **Add glass tab bar** with Liquid Glass effect
3. **Add glass navigation** with translucent headers
4. **Web support** - Progressive Web App with responsive design

### Requirements (When Enabled)

**IMPORTANT:** These features require a **development build** and are NOT available in Expo Go.

- **Development build** (run `npx expo prebuild` and build locally or with EAS)
- **iOS 26+** for GlassView (Liquid Glass effect)
- **Xcode 26+** for building iOS apps with Liquid Glass
- Packages: `@expo/ui`, `expo-glass-effect` (already installed)

### Enabling Expo UI (Future)

To enable native UI components when iOS 26 is available, update the feature flag in `constants/features.ts`:

```typescript
expoUI: {
  enabled: true, // Set to true when iOS 26 is available
  premiumOnly: false,
  beta: true,
  comingSoon: false,
},
```

### Available Components

Import from `@/components/native-ui`:

```typescript
import {
  NativeButton,
  NativePicker,
  GlassView,
  NativeBottomSheet,
  NativeColorPicker,
  NativeCircularProgress,
} from "@/components/native-ui";
```

#### NativeButton

Native platform button with role-based styling.

```typescript
<NativeButton
  title="Submit"
  onPress={() => handleSubmit()}
  role="default" // "default" | "cancel" | "destructive"
  disabled={false}
/>
```

#### NativePicker

Native picker/dropdown selector.

```typescript
<NativePicker
  label="Select Model"
  options={[
    { label: "GPT-4", value: "gpt-4" },
    { label: "Claude", value: "claude" },
  ]}
  selectedValue={selectedModel}
  onValueChange={(value) => setSelectedModel(value)}
/>
```

#### GlassView (iOS 26+ Liquid Glass)

iOS Liquid Glass effect container. Falls back to BlurView on older iOS/semi-transparent view on Android.

```typescript
<GlassView
  style={{ padding: 20 }}
  intensity={50} // Blur intensity for fallback
  cornerRadius={16}
>
  <Text>Content with glass effect</Text>
</GlassView>
```

#### NativeBottomSheet

Native bottom sheet modal.

```typescript
<NativeBottomSheet
  visible={isSheetVisible}
  onDismiss={() => setIsSheetVisible(false)}
>
  <Text>Bottom sheet content</Text>
</NativeBottomSheet>
```

#### NativeColorPicker

Native color picker.

```typescript
<NativeColorPicker
  label="Choose Color"
  selectedColor={color}
  onColorChange={(newColor) => setColor(newColor)}
  presetColors={["#FF6B6B", "#4D96FF", "#6BCB77"]} // Optional custom palette
/>
```

#### NativeCircularProgress

Native circular progress indicator.

```typescript
<NativeCircularProgress
  progress={0.75} // 0 to 1
  size={48}
  strokeWidth={4}
  color="#4D96FF"
/>
```

### Fallback Behavior

When `expoUI` feature is disabled or on unsupported platforms:

| Component              | Fallback                                    |
| ---------------------- | ------------------------------------------- |
| NativeButton           | Standard Button component                   |
| NativePicker           | Segmented button-style selector             |
| GlassView              | BlurView (iOS) / Semi-transparent (Android) |
| NativeBottomSheet      | Custom modal with gesture handling          |
| NativeColorPicker      | Color grid with presets                     |
| NativeCircularProgress | SVG-based animated progress                 |

### Building with Expo UI

1. **Create a development build:**

   ```bash
   npx expo prebuild
   cd ios && pod install && cd ..
   npx expo run:ios
   ```

2. **Or use EAS Build:**

   ```bash
   eas build --profile development --platform ios
   ```

3. **Enable the feature:**
   Set `FEATURES.expoUI.enabled = true` in `constants/features.ts`

### Platform Support

| Component              | iOS          | Android  | Web      |
| ---------------------- | ------------ | -------- | -------- |
| NativeButton           | ✅           | ✅       | Fallback |
| NativePicker           | ✅           | ✅       | Fallback |
| GlassView              | ✅ (iOS 26+) | Fallback | Fallback |
| NativeBottomSheet      | ✅           | ✅       | Fallback |
| NativeColorPicker      | ✅           | ✅       | Fallback |
| NativeCircularProgress | ✅           | ✅       | Fallback |

### Note on iOS 26 and Liquid Glass

The Liquid Glass (GlassView) effect is only available on iOS 26 and later with Xcode 26. On older iOS versions, it falls back to a standard blur effect. This is a brand new iOS design language introduced at WWDC 2025, so adoption will grow over time as users update their devices.

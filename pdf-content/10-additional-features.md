# Appendix C: Essential Feature Implementations

Ready-to-use code for common app features.

---

## Dark Mode

### Theme Context Setup

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  primary: '#7C3AED',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceSecondary: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
};

const darkColors = {
  primary: '#A78BFA',
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    const saved = await AsyncStorage.getItem('themeMode');
    if (saved) {
      setThemeModeState(saved as ThemeMode);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const theme =
    themeMode === 'system'
      ? systemColorScheme || 'light'
      : themeMode;

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Theme Toggle Component

```typescript
// components/ThemeToggle.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const options = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'system', label: '⚙️ System' },
] as const;

export function ThemeToggle() {
  const { themeMode, setThemeMode, colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
      <View style={[styles.options, { backgroundColor: colors.surface }]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              themeMode === option.value && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setThemeMode(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    themeMode === option.value ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### Using Theme in Components

```typescript
// Example component with theme
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemedCard({ title, children }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
```

---

## Deep Linking

### Configure app.json

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp",
      "associatedDomains": ["applinks:yourdomain.com"]
    },
    "android": {
      "package": "com.yourcompany.myapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "yourdomain.com",
              "pathPrefix": "/app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Handle Deep Links

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // Handle deep links
    const handleDeepLink = (event: { url: string }) => {
      handleUrl(event.url);
    };

    // Get initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Listen for URL events (app already open)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, [navigationState?.key]);

  const handleUrl = (url: string) => {
    const { hostname, pathname, searchParams } = new URL(url);

    // Handle different deep link paths
    if (pathname.startsWith('/profile/')) {
      const userId = pathname.split('/')[2];
      router.push(`/profile/${userId}`);
    } else if (pathname.startsWith('/post/')) {
      const postId = pathname.split('/')[2];
      router.push(`/post/${postId}`);
    } else if (pathname === '/premium') {
      router.push('/paywall');
    }
  };

  return <Stack />;
}
```

### Generate Deep Links

```typescript
// utils/deepLinks.ts
import * as Linking from "expo-linking";

export function createDeepLink(path: string): string {
  return Linking.createURL(path);
}

export function createWebLink(path: string): string {
  return `https://yourdomain.com/app${path}`;
}

// Usage
const profileLink = createDeepLink("/profile/123");
// => "myapp://profile/123"

const shareableLink = createWebLink("/post/456");
// => "https://yourdomain.com/app/post/456"
```

### Share with Deep Links

```typescript
import { Share } from "react-native";
import { createWebLink } from "@/utils/deepLinks";

async function sharePost(postId: string, title: string) {
  const url = createWebLink(`/post/${postId}`);

  await Share.share({
    message: `Check out "${title}" on MyApp`,
    url,
  });
}
```

---

## Push Notifications

### Setup

```bash
npx expo install expo-notifications expo-device expo-constants
```

### Request Permission & Get Token

```typescript
// lib/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Android-specific channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7C3AED",
    });
  }

  return token;
}

export async function savePushToken(userId: string, token: string) {
  await supabase.from("push_tokens").upsert({
    user_id: userId,
    token,
    platform: Platform.OS,
    updated_at: new Date().toISOString(),
  });
}
```

### Listen for Notifications

```typescript
// hooks/useNotifications.ts
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // User tapped on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      // Handle navigation based on notification data
      if (data.type === "new_message") {
        router.push(`/chat/${data.chatId}`);
      } else if (data.type === "generation_complete") {
        router.push(`/generation/${data.generationId}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}
```

### Send Notifications (Edge Function)

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
  badge?: number;
}

serve(async (req) => {
  try {
    const { userId, title, body, data } = await req.json();

    // Get user's push token from database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokenData } = await supabaseClient
      .from("push_tokens")
      .select("token")
      .eq("user_id", userId)
      .single();

    if (!tokenData?.token) {
      return new Response(JSON.stringify({ error: "No push token" }), {
        status: 404,
      });
    }

    // Send via Expo Push API
    const message: PushMessage = {
      to: tokenData.token,
      title,
      body,
      data,
      sound: "default",
    };

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
```

---

## Onboarding Flow

### Onboarding Screen

```typescript
// app/onboarding.tsx
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to MyApp',
    description: 'The best way to do amazing things with AI',
    image: require('@/assets/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Create Anything',
    description: 'Generate images, text, and more in seconds',
    image: require('@/assets/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Save & Share',
    description: 'Keep your creations and share with friends',
    image: require('@/assets/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
  },
  image: {
    width: width * 0.8,
    height: 300,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#7C3AED',
    width: 24,
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  skip: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
```

### Check Onboarding Status

```typescript
// app/_layout.tsx
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
    }

    setIsReady(true);
  };

  if (!isReady) {
    return null; // Or splash screen
  }

  return <Stack />;
}
```

---

## Haptic Feedback

### Setup

```bash
npx expo install expo-haptics
```

### Haptic Utility

```typescript
// utils/haptics.ts
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const haptics = {
  // Light tap - button press
  light: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Medium tap - toggle, selection
  medium: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // Heavy tap - important action
  heavy: () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // Success - task completed
  success: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // Warning - attention needed
  warning: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // Error - something went wrong
  error: () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // Selection change
  selection: () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  },
};
```

### Usage

```typescript
import { haptics } from '@/utils/haptics';

// Button press
<TouchableOpacity onPress={() => {
  haptics.light();
  handlePress();
}}>

// Toggle switch
<Switch onChange={(value) => {
  haptics.medium();
  setEnabled(value);
}} />

// Success state
const handleSubmit = async () => {
  try {
    await submitForm();
    haptics.success();
    Alert.alert('Success!');
  } catch (error) {
    haptics.error();
    Alert.alert('Error', error.message);
  }
};
```

---

## Offline Detection

### Offline Hook

```typescript
// hooks/useOffline.ts
import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return isOffline;
}
```

### Offline Banner

```typescript
// components/OfflineBanner.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '@/hooks/useOffline';

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    alignItems: 'center',
  },
  text: {
    color: '#92400E',
    fontWeight: '500',
  },
});
```

---

## Image Caching

### Setup

```bash
npx expo install expo-image
```

### Cached Image Component

```typescript
// components/CachedImage.tsx
import { Image, ImageProps } from 'expo-image';

const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
}

export function CachedImage({ uri, style, ...props }: CachedImageProps) {
  return (
    <Image
      source={{ uri }}
      placeholder={blurhash}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      style={style}
      {...props}
    />
  );
}

// Usage
<CachedImage
  uri="https://example.com/image.jpg"
  style={{ width: 200, height: 200, borderRadius: 12 }}
/>
```

---

## Localization (i18n)

### Setup

```bash
npm install i18next react-i18next
```

### Translation Files

```typescript
// locales/en.ts
export default {
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
  },
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    version: "Version",
  },
  paywall: {
    title: "Upgrade to Pro",
    subtitle: "Unlock all features",
    monthly: "Monthly",
    yearly: "Yearly",
    restore: "Restore Purchases",
    freeTrial: "7-day free trial",
  },
};

// locales/es.ts
export default {
  common: {
    loading: "Cargando...",
    error: "Algo salió mal",
    retry: "Intentar de nuevo",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    confirm: "Confirmar",
  },
  auth: {
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    signOut: "Cerrar Sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
  },
  // ... more translations
};
```

### i18n Setup

```typescript
// lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "@/locales/en";
import es from "@/locales/es";
import de from "@/locales/de";
import fr from "@/locales/fr";

const resources = {
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
};

const LANGUAGE_KEY = "user_language";

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLanguage = Localization.locale.split("-")[0];

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage || deviceLanguage || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export default i18n;
```

### Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('common.loading')}</Text>
      <Button title={t('auth.signIn')} onPress={handleSignIn} />
    </View>
  );
}
```

### Language Picker

```typescript
// components/LanguagePicker.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage } from '@/lib/i18n';

export function LanguagePicker() {
  const { i18n, t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('settings.language')}</Text>
      <View style={styles.options}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              i18n.language === lang.code && styles.selected,
            ]}
            onPress={() => changeLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={styles.name}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
```

---

## OTA Updates (EAS Update)

### Setup

```bash
npx expo install expo-updates
eas update:configure
```

### app.json Configuration

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### Publish an Update

```bash
# Publish to all users
eas update --branch production --message "Bug fixes"

# Publish to preview channel
eas update --branch preview --message "New feature testing"
```

### Check for Updates in App

```typescript
// hooks/useAppUpdate.ts
import { useEffect } from "react";
import * as Updates from "expo-updates";
import { Alert } from "react-native";

export function useAppUpdate() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    if (__DEV__) return; // Skip in development

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();

        Alert.alert("Update Available", "A new version is ready. Restart to apply?", [
          { text: "Later", style: "cancel" },
          {
            text: "Restart",
            onPress: () => Updates.reloadAsync(),
          },
        ]);
      }
    } catch (error) {
      console.log("Error checking for updates:", error);
    }
  };
}
```

---

## Form Validation

### Setup

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Validation Schema

```typescript
// schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### Form Component

```typescript
// components/LoginForm.tsx
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="password"
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <Button
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 4,
  },
});
```

---

## App Review Request

### Setup

```bash
npx expo install expo-store-review
```

### Smart Review Prompt

```typescript
// lib/reviewPrompt.ts
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEW_KEY = "app_review_status";
const MIN_ACTIONS = 5; // Show after 5 successful actions
const MIN_DAYS = 3; // Wait at least 3 days after install

interface ReviewStatus {
  hasAsked: boolean;
  actionCount: number;
  installDate: string;
}

export async function trackAction() {
  const status = await getReviewStatus();
  status.actionCount++;
  await saveReviewStatus(status);

  // Check if we should ask for review
  if (shouldAskForReview(status)) {
    await requestReview();
  }
}

function shouldAskForReview(status: ReviewStatus): boolean {
  if (status.hasAsked) return false;
  if (status.actionCount < MIN_ACTIONS) return false;

  const daysSinceInstall = getDaysSince(status.installDate);
  if (daysSinceInstall < MIN_DAYS) return false;

  return true;
}

async function requestReview() {
  const isAvailable = await StoreReview.isAvailableAsync();

  if (isAvailable) {
    await StoreReview.requestReview();

    const status = await getReviewStatus();
    status.hasAsked = true;
    await saveReviewStatus(status);
  }
}

async function getReviewStatus(): Promise<ReviewStatus> {
  const stored = await AsyncStorage.getItem(REVIEW_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    hasAsked: false,
    actionCount: 0,
    installDate: new Date().toISOString(),
  };
}

async function saveReviewStatus(status: ReviewStatus) {
  await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(status));
}

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

### Usage

```typescript
// After successful generation, purchase, or positive action
import { trackAction } from "@/lib/reviewPrompt";

const handleGenerationSuccess = async () => {
  // ... generation logic
  await trackAction(); // May trigger review prompt
};
```

---

## Testing

### Setup

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo
```

### jest.config.js

```javascript
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.config.js",
  ],
};
```

### Testing Components

```typescript
// __tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Press me" onPress={() => {}} />);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} />);

    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Press me" onPress={() => {}} loading />
    );
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('is disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press me" onPress={onPress} loading />
    );

    fireEvent.press(getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Testing Hooks

```typescript
// __tests__/useCredits.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCredits } from '@/hooks/useCredits';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCredits', () => {
  it('returns initial credit count', async () => {
    const { result } = renderHook(() => useCredits(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.credits).toBeDefined();
    });
  });

  it('decrements credits after use', async () => {
    const { result } = renderHook(() => useCredits(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.credits).toBeGreaterThan(0);
    });

    const initialCredits = result.current.credits;

    await act(async () => {
      await result.current.useCredit();
    });

    expect(result.current.credits).toBe(initialCredits - 1);
  });
});
```

### Testing Zustand Stores

```typescript
// __tests__/authStore.test.ts
import { useAuthStore } from "@/stores/authStore";
import { act } from "@testing-library/react-native";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it("sets user correctly", () => {
    const mockUser = { id: "123", email: "test@example.com" };

    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("clears state on signOut", () => {
    const mockUser = { id: "123", email: "test@example.com" };

    act(() => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().signOut();
    });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
```

### Mocking Supabase

```typescript
// __mocks__/supabase.ts
export const supabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- Button.test.tsx
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Splash Screen

### Design Requirements

| Platform  | Size        | Format                          |
| --------- | ----------- | ------------------------------- |
| iOS       | 2732 x 2732 | PNG (centered, will be cropped) |
| Android   | 1284 x 2778 | PNG                             |
| Universal | 1284 x 2778 | PNG (recommended)               |

**Canva Template:** [canva.com/templates/search/mobile-app-splash-screen](https://www.canva.com/templates/search/mobile-app-splash-screen/)

Search for "App Splash Screen 1284x2778" or create custom dimensions.

### Setup

```bash
npx expo install expo-splash-screen
```

### app.json Configuration

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#7C3AED"
    },
    "ios": {
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#7C3AED",
        "dark": {
          "image": "./assets/splash-dark.png",
          "backgroundColor": "#1F2937"
        }
      }
    },
    "android": {
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#7C3AED",
        "dark": {
          "image": "./assets/splash-dark.png",
          "backgroundColor": "#1F2937"
        }
      }
    }
  }
}
```

### Keep Splash Visible During Loading

```typescript
// app/_layout.tsx
import { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { View } from 'react-native';

// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts, fetch initial data, etc.
        await Font.loadAsync({
          'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
        });

        // Artificial delay for branding (optional)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack />
    </View>
  );
}
```

### Splash Screen Best Practices

- Keep it simple - logo + background color
- Match your app's primary brand color
- Don't add text (localization issues)
- Test on different device sizes
- Keep loading time under 3 seconds
- Support dark mode variant

---

## App Initialization

### Complete Loading Pattern

```typescript
// app/_layout.tsx
import { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { View } from 'react-native';
import { initI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
        });

        // 2. Preload critical images
        await Asset.loadAsync([
          require('@/assets/images/logo.png'),
          require('@/assets/images/onboarding-1.png'),
          require('@/assets/images/onboarding-2.png'),
          require('@/assets/images/onboarding-3.png'),
        ]);

        // 3. Initialize i18n
        await initI18n();

        // 4. Check existing auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
        }

        // 5. Any other initialization...

      } catch (e) {
        console.warn('App initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Providers>
        <Stack />
      </Providers>
    </View>
  );
}
```

### Font Loading Hook

```typescript
// hooks/useFonts.ts
import * as Font from "expo-font";
import { useEffect, useState } from "react";

const customFonts = {
  "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
  "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
  "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
};

export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync(customFonts);
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  return fontsLoaded;
}
```

### Asset Preloading Utility

```typescript
// utils/preloadAssets.ts
import { Asset } from "expo-asset";
import * as Font from "expo-font";

const images = [require("@/assets/images/logo.png"), require("@/assets/images/placeholder.png")];

const fonts = {
  "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
  "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
};

export async function preloadAssets(): Promise<void> {
  const imageAssets = images.map((image) => Asset.loadAsync(image));
  const fontAssets = Font.loadAsync(fonts);

  await Promise.all([...imageAssets, fontAssets]);
}
```

---

## Keyboard Handling

### KeyboardAvoidingView Setup

```typescript
// components/KeyboardAvoidingWrapper.tsx
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

interface Props {
  children: ReactNode;
}

export function KeyboardAvoidingWrapper({ children }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Usage in Forms

```typescript
// screens/LoginScreen.tsx
import { View, TextInput, StyleSheet } from 'react-native';
import { KeyboardAvoidingWrapper } from '@/components/KeyboardAvoidingWrapper';
import { Button } from '@/components/ui/Button';

export function LoginScreen() {
  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            returnKeyType="done"
          />
          <Button title="Sign In" onPress={handleSubmit} />
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
});
```

### Keyboard Hook

```typescript
// hooks/useKeyboard.ts
import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible, dismiss: Keyboard.dismiss };
}
```

### ScrollView with Keyboard

```typescript
// For longer forms, use ScrollView
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

function LongFormScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form fields */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

---

## Safe Area Handling

### Setup

```bash
npx expo install react-native-safe-area-context
```

### Provider Setup

```typescript
// app/_layout.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
```

### Using SafeAreaView

```typescript
// screens/HomeScreen.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text>Content safe from notches and home indicators</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
```

### Using useSafeAreaInsets Hook

```typescript
// components/CustomHeader.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
```

### Bottom Tab Bar with Safe Area

```typescript
// components/CustomTabBar.tsx
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ tabs, activeTab, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => onTabPress(tab.key)}
        >
          {tab.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // active styles
  },
});
```

### Common Inset Values

```typescript
// Reference for common device insets
const commonInsets = {
  // iPhone 14 Pro / 15 Pro (Dynamic Island)
  top: 59,
  bottom: 34,

  // iPhone 14 / 13 / 12 (Notch)
  top: 47,
  bottom: 34,

  // iPhone SE / older
  top: 20,
  bottom: 0,

  // Most Android phones
  top: 24, // status bar
  bottom: 0, // or gesture nav height
};
```

### Full Screen Modal with Safe Area

```typescript
// components/FullScreenModal.tsx
import { Modal, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FullScreenModal({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
```

---

**Official Docs:**

- Dark Mode: [reactnative.dev/docs/usecolorscheme](https://reactnative.dev/docs/usecolorscheme)
- Deep Linking: [docs.expo.dev/guides/deep-linking](https://docs.expo.dev/guides/deep-linking/)
- Push Notifications: [docs.expo.dev/push-notifications](https://docs.expo.dev/push-notifications/overview/)
- Expo Image: [docs.expo.dev/versions/latest/sdk/image](https://docs.expo.dev/versions/latest/sdk/image/)
- EAS Update: [docs.expo.dev/eas-update](https://docs.expo.dev/eas-update/introduction/)
- i18next: [react.i18next.com](https://react.i18next.com/)
- React Hook Form: [react-hook-form.com](https://react-hook-form.com/)
- Store Review: [docs.expo.dev/versions/latest/sdk/storereview](https://docs.expo.dev/versions/latest/sdk/storereview/)
- Jest Expo: [docs.expo.dev/guides/testing-with-jest](https://docs.expo.dev/guides/testing-with-jest/)
- React Native Testing Library: [callstack.github.io/react-native-testing-library](https://callstack.github.io/react-native-testing-library/)
- Splash Screen: [docs.expo.dev/versions/latest/sdk/splash-screen](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- Safe Area Context: [docs.expo.dev/versions/latest/sdk/safe-area-context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/)
- Keyboard Avoiding View: [reactnative.dev/docs/keyboardavoidingview](https://reactnative.dev/docs/keyboardavoidingview)

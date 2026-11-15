import { useEffect } from "react";

import { useColorScheme, LogBox } from "react-native";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ErrorBoundary } from "@components/ErrorBoundary";
import { QueryProvider } from "@components/QueryProvider";
import { API_MODE } from "@constants/api";
import { isFeatureEnabled } from "@constants/features";
import { lightTheme, darkTheme } from "@constants/theme";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
  DMSans_900Black,
} from "@expo-google-fonts/dm-sans";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from "@expo-google-fonts/montserrat";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import * as Sentry from "@sentry/react-native";
import { purchasesService } from "@services/purchases.service";
import { useAuthStore } from "@store/useAuthStore";
import { useGeneralStore } from "@store/useGeneralStore";
import { ThemeProvider } from "expo-router/react-navigation";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

// Suppress known warnings that don't affect functionality
LogBox.ignoreLogs([
  // React Native Fabric architecture warnings
  "Unable to find viewState",
  "surface stopped",
  "getViewState",
]);

// Initialize Sentry (only with valid DSN)
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const isValidSentryDsn =
  SENTRY_DSN &&
  SENTRY_DSN !== "undefined" &&
  !SENTRY_DSN.includes("your-dsn") &&
  !SENTRY_DSN.includes("project-id") &&
  SENTRY_DSN.startsWith("https://") &&
  SENTRY_DSN.includes("@");

if (isValidSentryDsn) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    debug: false, // Disable debug logs
  });
}

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const signInAnonymously = useAuthStore((state) => state.signInAnonymously);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    DMSans_900Black,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  useEffect(() => {
    // Initialize RevenueCat
    purchasesService.initialize();

    // Initialize auth state (mode-specific initialization happens inside the store)
    const initAuth = async () => {
      await initializeAuth();

      // If social auth is disabled and user is not authenticated, sign in anonymously
      // This ensures users can still use AI features
      const socialAuthEnabled = isFeatureEnabled("socialAuth");

      if (!socialAuthEnabled && API_MODE !== "convex") {
        // In Expo API Routes mode, anonymous sign-in is handled differently
        await signInAnonymously();
      }
    };

    initAuth();
  }, [initializeAuth, signInAnonymously]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const systemColorScheme = useColorScheme();
  const themePreference = useGeneralStore((state) => state.theme);

  // Determine actual theme based on preference
  const isDark =
    themePreference === "dark" || (themePreference === "system" && systemColorScheme === "dark");

  const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  const content = (
    <ThemeProvider value={isDark ? darkTheme : lightTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          {isFeatureEnabled("onboarding") && <Stack.Screen name="onboarding" />}
          {isFeatureEnabled("auth") && <Stack.Screen name="login" />}
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="reset-onboarding" />
          <Stack.Screen name="(app)" />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );

  return (
    <ErrorBoundary>
      <ConvexClientProvider>
        <QueryProvider>
          {posthogApiKey && posthogApiKey !== "test" ? (
            <PostHogProvider apiKey={posthogApiKey} options={{ host: posthogHost }}>
              {content}
            </PostHogProvider>
          ) : (
            content
          )}
        </QueryProvider>
      </ConvexClientProvider>
    </ErrorBoundary>
  );
}

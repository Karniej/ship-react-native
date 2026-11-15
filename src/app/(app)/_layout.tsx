import { useEffect } from "react";

import { Stack, useRouter, useSegments } from "expo-router";

import { APP_CONFIG } from "@constants/config";
import { isFeatureEnabled } from "@constants/features";
import { usePremiumStatus } from "@hooks/usePremiumStatus";
import { usePremiumStore } from "@store/usePremiumStore";

// iOS 26 features (available when iOS 26 launches):
// - Stack.Toolbar placement="bottom" - Bottom toolbar with liquid glass
// - sheetDetents: ["medium", "large"] - Form sheet sizing options

export default function AppLayout() {
  // Bootstrap RevenueCat status check on launch
  const { isLoading: isStatusLoading } = usePremiumStatus();
  // Read shared subscription state — updated immediately after purchase
  const isSubscribed = usePremiumStore((s) => s.isSubscribed);
  const router = useRouter();
  const segments = useSegments();
  const premiumEnabled = isFeatureEnabled("premiumSubscription");

  // Hard paywall — bounce to /premium if not subscribed
  useEffect(() => {
    if (!premiumEnabled || !APP_CONFIG.HARD_PAYWALL) return;
    if (isStatusLoading) return;
    const onPremium = segments.some((s) => s === "premium");
    if (!isSubscribed && !onPremium) {
      router.replace("/(app)/premium");
    }
  }, [isSubscribed, isStatusLoading, premiumEnabled, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {premiumEnabled && (
        <Stack.Screen
          name="premium"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      )}
      {/* AI Feature Screens */}
      {isFeatureEnabled("imageGeneration") && (
        <Stack.Screen
          name="generate"
          options={{
            headerShown: true,
            title: "Generate Image",
          }}
        />
      )}
      {isFeatureEnabled("videoGeneration") && (
        <Stack.Screen
          name="video-generation"
          options={{
            headerShown: true,
            title: "Generate Video",
          }}
        />
      )}
      {isFeatureEnabled("textToSpeech") && (
        <Stack.Screen
          name="speech"
          options={{
            headerShown: true,
            title: "Text to Speech",
          }}
        />
      )}
      {isFeatureEnabled("transcription") && (
        <Stack.Screen
          name="transcription"
          options={{
            headerShown: true,
            title: "Transcribe Audio",
          }}
        />
      )}
      {isFeatureEnabled("imageIdentification") && (
        <Stack.Screen
          name="image-identify"
          options={{
            headerShown: true,
            title: "Analyze Image",
          }}
        />
      )}
      {isFeatureEnabled("aiChat") && (
        <Stack.Screen
          name="chat"
          options={{
            headerShown: true,
            title: "AI Chat",
          }}
        />
      )}
      {isFeatureEnabled("gallery") && (
        <Stack.Screen
          name="generations"
          options={{
            headerShown: true,
            title: "My Generations",
          }}
        />
      )}
      {isFeatureEnabled("analytics") && (
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

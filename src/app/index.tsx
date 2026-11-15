import { useEffect, useState } from "react";

import { View, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { NativeProgress } from "@components/ui/native";
import { isFeatureEnabled } from "@constants/features";
import { useAppTheme } from "@hooks/useAppTheme";
import { usePremiumStatus } from "@hooks/usePremiumStatus";
import { useOnboardingStore } from "@store/useOnboardingStore";
import { usePremiumStore } from "@store/usePremiumStore";

export default function IndexPage() {
  const router = useRouter();
  const { colors: tc } = useAppTheme();
  const { isOnboardingCompleted } = useOnboardingStore();
  const { isLoading: isPremiumLoading } = usePremiumStatus();
  const isPremium = usePremiumStore((s) => s.isSubscribed);
  const [isLoading, setIsLoading] = useState(true);
  const onboardingEnabled = isFeatureEnabled("onboarding");
  const premiumEnabled = isFeatureEnabled("premiumSubscription");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || isPremiumLoading) return;

    if (onboardingEnabled && !isOnboardingCompleted) {
      router.replace("/onboarding" as never);
    } else if (premiumEnabled && !isPremium) {
      // Hard paywall — must subscribe to access the app
      router.replace("/(app)/premium" as never);
    } else {
      router.replace("/(app)/(tabs)");
    }
  }, [
    isOnboardingCompleted,
    isPremium,
    isPremiumLoading,
    isLoading,
    onboardingEnabled,
    premiumEnabled,
    router,
  ]);

  return (
    <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
      <NativeProgress color={tc.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
